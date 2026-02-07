import React, { useState, useEffect } from 'react';
import { 
  signInWithPopup, 
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail
} from 'firebase/auth';
import { auth } from '../services/firebaseService';

interface AuthProps {
  onLogin: (email: string) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot-password'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user?.email) {
        const isVerified = user.emailVerified || !!user.providerData.find(p => p.providerId === 'google.com');
        if (isVerified) onLogin(user.email);
      }
    });
    return () => unsubscribe();
  }, [onLogin]);

  const handleGoogle = async () => {
    setError(''); setInfo('');
    try {
      const result = await signInWithPopup(auth, new GoogleAuthProvider());
      if (result.user.email) onLogin(result.user.email);
    } catch (err) {
      setError("Sign-in popup blocked or closed.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setInfo(''); setLoading(true);
    try {
      if (mode === 'login') {
        const res = await signInWithEmailAndPassword(auth, email, password);
        const verified = res.user.emailVerified || !!res.user.providerData.find(p => p.providerId === 'google.com');
        if (res.user.email && verified) onLogin(res.user.email);
        else if (!verified) setInfo("Check email for verification link.");
      } else if (mode === 'signup') {
        const res = await createUserWithEmailAndPassword(auth, email, password);
        if (res.user) {
          await sendEmailVerification(res.user);
          setInfo("Verification email sent.");
          setMode('login');
        }
      } else {
        await sendPasswordResetEmail(auth, email);
        setInfo("Reset email sent.");
        setMode('login');
      }
    } catch (err: any) {
      setError(err.message.replace('Firebase: ', ''));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB] p-6">
      <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.05)] border border-gray-100 p-12 animate-slide-up">
        <div className="flex flex-col items-center mb-10">
          <svg className="w-16 h-auto mb-6" viewBox="0 0 100 85" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 10V55H50V43H27V10H15Z" fill="#1D4E89" />
            <path d="M55 10H95V22H67V65H95V48H78V36H107V77H55V10Z" fill="#76BC21" />
            <path d="M42 42L55 25L68 42H42Z" fill="#1D4E89" />
          </svg>
          <div className="text-center">
            <h2 className="text-3xl font-black text-[#1D4E89] tracking-tighter uppercase italic leading-none">LeadGen AI</h2>
            <p className="text-[9px] font-bold text-gray-400 tracking-[0.4em] uppercase mt-3">Access Enterprise Terminal</p>
          </div>
        </div>

        {error && <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-[10px] font-bold uppercase border border-red-100">{error}</div>}
        {info && <div className="mb-6 p-4 bg-blue-50 text-[#1D4E89] rounded-xl text-[10px] font-bold uppercase border border-blue-100">{info}</div>}

        <div className="space-y-6">
          {mode !== 'forgot-password' && (
            <button onClick={handleGoogle} className="w-full py-4 flex items-center justify-center gap-3 bg-white border border-gray-200 rounded-2xl font-bold text-gray-700 hover:bg-gray-50 transition-all text-xs shadow-sm">
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Google Workspace
            </button>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-4">Terminal ID</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="name@company.com" className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-[#1D4E89] outline-none font-semibold text-gray-900 transition-all text-sm" />
            </div>
            
            {mode !== 'forgot-password' && (
              <div className="space-y-1.5">
                <div className="flex justify-between items-center ml-4">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Passkey</label>
                  {mode === 'login' && <button type="button" onClick={() => setMode('forgot-password')} className="text-[10px] font-bold text-[#1D4E89] hover:underline uppercase tracking-widest">Lost?</button>}
                </div>
                <input type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-[#1D4E89] outline-none font-semibold text-gray-900 transition-all text-sm" />
              </div>
            )}
            
            <button type="submit" disabled={loading} className="w-full py-5 bg-[#1D4E89] text-white rounded-2xl font-bold text-[10px] uppercase tracking-widest shadow-xl shadow-blue-100 hover:bg-blue-900 transition-all disabled:opacity-50">
              {loading ? 'Processing...' : mode === 'login' ? 'Login' : mode === 'signup' ? 'Create Account' : 'Reset'}
            </button>
          </form>

          <button onClick={() => setMode(mode === 'login' ? 'signup' : 'login')} className="w-full text-[10px] font-bold text-gray-400 hover:text-gray-900 transition-all uppercase tracking-widest">
            {mode === 'login' ? "Register New identity" : "Existing Identity login"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;