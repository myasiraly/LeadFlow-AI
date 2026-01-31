import React, { useState } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup
} from 'firebase/auth';
import { auth, googleProvider } from '../services/firebase';

const AuthScreen: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const getFriendlyErrorMessage = (errorCode: string) => {
    switch (errorCode) {
      case 'auth/invalid-email':
        return 'Invalid email format. Please check for typos (e.g., name@company.com).';
      case 'auth/user-not-found':
        return 'No account found with this email. Please sign up first.';
      case 'auth/wrong-password':
        return 'Incorrect password. Please try again or reset your password.';
      case 'auth/email-already-in-use':
        return 'An account with this email already exists. Try signing in.';
      case 'auth/weak-password':
        return 'Password is too weak. Please use at least 6 characters.';
      case 'auth/invalid-credential':
        return 'Incorrect email or password. Please verify your credentials.';
      case 'auth/popup-closed-by-user':
        return 'Sign-in window closed. Please try again.';
      case 'auth/network-request-failed':
        return 'Network error. Please check your internet connection.';
      default:
        return 'Authentication failed. Please try again later.';
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      console.error('Auth Error:', err.code, err.message);
      setError(getFriendlyErrorMessage(err.code));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.error('Google Auth Error:', err.code, err.message);
      setError(getFriendlyErrorMessage(err.code));
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fc] flex items-center justify-center p-6 font-['Inter'] relative overflow-hidden">
      {/* Decorative background depth */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-48 -left-48 w-full max-w-[600px] h-[600px] bg-indigo-100 rounded-full blur-[120px] opacity-40 animate-pulse" />
        <div className="absolute -bottom-48 -right-48 w-full max-w-[600px] h-[600px] bg-purple-100 rounded-full blur-[120px] opacity-40 animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative w-full max-w-md transition-all duration-500">
        <div className="bg-white rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(79,70,229,0.15)] border border-gray-100 p-10 md:p-12">
          <div className="flex flex-col items-center mb-10">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-200 mb-6 group transition-all duration-300 hover:rotate-6">
              <svg className="w-8 h-8 text-white transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight text-center">LeadGen AI</h1>
            <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] mt-3">Enterprise Intelligence Portal</p>
          </div>

          <form onSubmit={handleAuth} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Work Email</label>
              <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.206" />
                  </svg>
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full pl-14 pr-6 py-4 bg-gray-50/50 border border-transparent rounded-2xl text-gray-900 font-semibold placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all border-gray-100 hover:border-gray-200"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Secure Password</label>
              <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-14 pr-6 py-4 bg-gray-50/50 border border-transparent rounded-2xl text-gray-900 font-semibold placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all border-gray-100 hover:border-gray-200"
                />
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-xs font-bold animate-shake flex items-center gap-3">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="flex-1">{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || isGoogleLoading}
              className="w-full py-5 bg-gray-900 hover:bg-black text-white rounded-2xl font-black text-sm shadow-xl shadow-gray-200 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3 relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                isLogin ? 'Sign In to Access Data' : 'Initialize Intelligence Account'
              )}
            </button>
          </form>

          <div className="relative my-10">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-100"></div>
            </div>
            <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest">
              <span className="px-6 bg-white text-gray-400">Enterprise Single Sign-On</span>
            </div>
          </div>

          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading || isGoogleLoading}
            className="w-full py-4 bg-white border-2 border-gray-100 text-gray-700 rounded-2xl font-bold text-sm shadow-sm hover:border-indigo-100 hover:bg-indigo-50/30 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-4 group"
          >
            {isGoogleLoading ? (
              <div className="w-5 h-5 border-2 border-gray-200 border-t-indigo-600 rounded-full animate-spin" />
            ) : (
              <>
                <svg className="w-6 h-6 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                  <path
                    fill="#EA4335"
                    d="M12 5.04c1.61 0 3.05.55 4.19 1.63l3.14-3.14C17.43 1.68 14.94 1 12 1 7.24 1 3.2 3.84 1.41 7.92l3.66 2.84C5.9 7.7 8.74 5.04 12 5.04z"
                  />
                  <path
                    fill="#4285F4"
                    d="M23.49 12.27c0-.79-.07-1.54-.19-2.27h-11.3v4.51h6.35c-.27 1.45-1.09 2.68-2.31 3.5l3.59 2.78c2.1-1.94 3.31-4.79 3.31-8.52z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.07 14.76c-.24-.71-.37-1.47-.37-2.26s.13-1.55.37-2.26L1.41 7.42C.51 9.21 0 11.04 0 12.5s.51 3.29 1.41 5.08l3.66-2.82z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c3.11 0 5.71-1.03 7.62-2.78l-3.59-2.78c-1.05.7-2.4 1.11-4.03 1.11-3.1 0-5.74-2.1-6.68-4.92L1.41 16.45C3.2 20.53 7.24 23 12 23z"
                  />
                </svg>
                Continue with Google
              </>
            )}
          </button>

          <div className="mt-10 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="px-4 py-2 rounded-xl text-sm font-bold text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
            >
              {isLogin ? (
                <span>New here? <span className="text-indigo-600">Initialize Access</span></span>
              ) : (
                <span>Already registered? <span className="text-indigo-600">Sign In</span></span>
              )}
            </button>
          </div>
        </div>
        
        <p className="mt-10 text-center text-[10px] text-gray-400 font-black uppercase tracking-[0.25em] opacity-60">
          Powered by Gemini 3 Flash & Google Cloud
        </p>
      </div>
    </div>
  );
};

export default AuthScreen;