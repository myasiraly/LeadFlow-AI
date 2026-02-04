import React, { useState, useEffect, useRef, useCallback } from 'react';
import { initializeApp, getApp, getApps, FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  Auth as FirebaseAuth,
  browserLocalPersistence,
  setPersistence,
  onAuthStateChanged
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyA9PjQeDp2IMy6MEB_gyFZ7VfTaOdaVNbo",
  authDomain: "leadgen-ai-f44d5.firebaseapp.com",
  projectId: "leadgen-ai-f44d5",
  storageBucket: "leadgen-ai-f44d5.firebasestorage.app",
  messagingSenderId: "802312999592",
  appId: "1:802312999592:web:236b6eef90f9c2aca1289d"
};

interface AuthProps {
  onLogin: (email: string) => void;
}

type AuthMode = 'login' | 'signup' | 'forgot' | 'verify';

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [auth, setAuth] = useState<FirebaseAuth | null>(null);
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  
  const [verificationCode, setVerificationCode] = useState('');
  const [enteredCode, setEnteredCode] = useState('');
  const [showSimulatedEmail, setShowSimulatedEmail] = useState(false);

  const isMounted = useRef(true);

  const getFriendlyErrorMessage = useCallback((err: any): string => {
    const code = err.code || '';
    const msg = err.message || '';
    
    switch (code) {
      case 'auth/invalid-email': return "The email address is invalid.";
      case 'auth/user-not-found': return "No account found with this email.";
      case 'auth/wrong-password': return "Incorrect password. Please try again.";
      case 'auth/email-already-in-use': return "An account with this email already exists.";
      case 'auth/weak-password': return "Password is too weak (minimum 6 characters).";
      case 'auth/too-many-requests': return "Security lock: Too many failed attempts. Try again later.";
      case 'auth/unauthorized-domain': return "This domain is not authorized for login.";
      case 'auth/popup-closed-by-user': return "Login popup closed. Please try again.";
      default: return msg || "An unexpected security error occurred.";
    }
  }, []);

  useEffect(() => {
    isMounted.current = true;
    
    const initFirebase = async () => {
      try {
        const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
        const authInstance = getAuth(app);
        
        // Ensure persistence is set before we do anything else
        await setPersistence(authInstance, browserLocalPersistence);
        
        // Listen for existing session
        onAuthStateChanged(authInstance, (user) => {
          if (user?.email && isMounted.current) {
            onLogin(user.email);
          }
        });

        if (isMounted.current) {
          setAuth(authInstance);
          setIsInitializing(false);
        }
      } catch (err: any) {
        if (isMounted.current) {
          setError("Connection Error: " + getFriendlyErrorMessage(err));
          setIsInitializing(false);
        }
      }
    };

    initFirebase();
    return () => { isMounted.current = false; };
  }, [getFriendlyErrorMessage, onLogin]);

  useEffect(() => {
    setError('');
    setSuccessMessage('');
  }, [mode]);

  const handleGoogleSignIn = async () => {
    if (!auth) return;
    setError('');
    setIsGoogleLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      // Use local popup login
      const result = await signInWithPopup(auth, provider);
      if (result.user?.email) {
        onLogin(result.user.email);
      }
    } catch (err: any) {
      setError(getFriendlyErrorMessage(err));
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) return;
    setError('');
    setIsLoading(true);

    try {
      if (mode === 'login') {
        const result = await signInWithEmailAndPassword(auth, email, password);
        if (result.user?.email) {
          onLogin(result.user.email);
        }
      } else if (mode === 'signup') {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        // Simulate a verification step for UX
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        setVerificationCode(code);
        setMode('verify');
        setShowSimulatedEmail(true);
        setSuccessMessage("Account created. Please verify your identity code.");
      }
    } catch (err: any) {
      setError(getFriendlyErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (enteredCode === verificationCode) {
      if (auth?.currentUser?.email) {
        onLogin(auth.currentUser.email);
      } else {
        onLogin(email);
      }
    } else {
      setError('Invalid verification code. Please check the simulated notification.');
    }
  };

  const handleForgotRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) return;
    setError('');
    setIsLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setSuccessMessage(`Recovery protocol dispatched to ${email}.`);
    } catch (err: any) {
      setError(getFriendlyErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f9fc]">
        <div className="flex flex-col items-center gap-6">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 border-4 border-indigo-100 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] animate-pulse">Initializing Security Core...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f9fc] p-6 font-['Inter'] relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-50 rounded-full blur-3xl opacity-50" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-purple-50 rounded-full blur-3xl opacity-50" />

      {showSimulatedEmail && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-4 animate-slide-up">
          <div className="bg-indigo-950 text-white p-6 rounded-[2rem] shadow-2xl border border-indigo-700/50 backdrop-blur-xl flex items-center gap-5">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-2xl shadow-inner">🔒</div>
            <div className="flex-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-0.5">Secure Intercept</p>
              <p className="text-sm font-bold">Verification Token: <span className="text-yellow-400 font-black text-xl tracking-widest ml-2">{verificationCode}</span></p>
            </div>
            <button onClick={() => setShowSimulatedEmail(false)} className="text-white/50 hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>
        </div>
      )}

      <div className="max-w-md w-full animate-slide-up relative z-10">
        <div className="bg-white rounded-[3.5rem] shadow-2xl shadow-indigo-100/50 border border-gray-100 p-10 md:p-14">
          <div className="flex flex-col items-center mb-10">
            <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-200 mb-6 transition-transform hover:scale-110 duration-300">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight text-center">LeadGen AI</h1>
            <p className="text-gray-500 font-medium text-sm text-center leading-relaxed mt-3 px-4">
              {mode === 'login' ? 'Authentication required for scraper systems.' : 
               mode === 'signup' ? 'Create your professional scraper identity.' :
               mode === 'forgot' ? 'Initiate account recovery sequence.' :
               'Identity verification protocol active.'}
            </p>
          </div>

          {(error || successMessage) && (
            <div className={`p-5 mb-8 rounded-2xl text-xs font-bold border flex items-start gap-3 transition-all animate-slide-up ${
              error ? 'bg-red-50 border-red-100 text-red-600' : 'bg-emerald-50 border-emerald-100 text-emerald-600'
            }`}>
              <span className="text-lg mt-[-2px]">{error ? '⚠️' : '✅'}</span>
              <p className="flex-1 leading-relaxed">{error || successMessage}</p>
            </div>
          )}

          {mode === 'verify' ? (
            <form onSubmit={handleVerifyCode} className="space-y-8">
              <div className="space-y-3 text-center">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Access Token</label>
                <input
                  type="text"
                  required
                  autoFocus
                  maxLength={6}
                  value={enteredCode}
                  onChange={(e) => setEnteredCode(e.target.value.replace(/\D/g, ''))}
                  className="w-full bg-gray-50 border border-transparent rounded-3xl py-6 text-center text-5xl font-black text-indigo-600 focus:ring-4 focus:ring-indigo-100 focus:bg-white transition-all outline-none shadow-inner tracking-[0.2em]"
                  placeholder="000000"
                />
              </div>
              <button type="submit" className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-lg shadow-xl shadow-indigo-100 active:scale-95 transition-all">
                Verify Identity
              </button>
            </form>
          ) : mode !== 'forgot' ? (
            <div className="space-y-6">
              <button
                onClick={handleGoogleSignIn}
                disabled={isGoogleLoading || isLoading}
                className="group w-full flex items-center justify-center gap-4 py-4 px-6 bg-white border-2 border-gray-100 rounded-2xl hover:border-indigo-100 hover:bg-gray-50 transition-all font-bold text-gray-700 shadow-sm disabled:opacity-50"
              >
                {isGoogleLoading ? (
                  <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                )}
                Continue with Google
              </button>
              
              <div className="flex items-center gap-4">
                <div className="flex-1 h-px bg-gray-100" />
                <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">or email entry</span>
                <div className="flex-1 h-px bg-gray-100" />
              </div>

              <form onSubmit={handleAuthSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email</label>
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl text-gray-900 font-medium focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none shadow-inner disabled:opacity-50"
                    placeholder="name@company.com"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Password</label>
                  <input
                    type="password"
                    required
                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl text-gray-900 font-medium focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none shadow-inner disabled:opacity-50"
                    placeholder="••••••••••••"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-lg transition-all shadow-xl shadow-indigo-100 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
                >
                  {isLoading && <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                  {mode === 'login' ? 'Sign In' : 'Register Operative'}
                </button>
                {mode === 'login' && (
                  <button type="button" onClick={() => setMode('forgot')} className="w-full text-xs font-bold text-indigo-600 hover:underline">
                    Reset access credentials
                  </button>
                )}
              </form>
            </div>
          ) : (
            <form onSubmit={handleForgotRequest} className="space-y-6">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Target Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 shadow-inner"
                  placeholder="name@company.com"
                />
              </div>
              <button type="submit" disabled={isLoading} className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black shadow-lg flex items-center justify-center gap-3 disabled:opacity-50 transition-all">
                {isLoading && <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                Reset Identity
              </button>
              <button type="button" onClick={() => setMode('login')} className="w-full text-xs font-bold text-indigo-600 hover:underline">
                Back to sign in
              </button>
            </form>
          )}

          <div className="mt-12 text-center border-t border-gray-50 pt-8">
            <button
              onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
              className="text-sm font-bold text-gray-400 hover:text-indigo-600 transition-colors"
            >
              {mode === 'login' ? "New operative? Register account" : "Existing operative? Sign in"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;