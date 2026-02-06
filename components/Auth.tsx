import React, { useState, useEffect } from 'react';
import { 
  signInWithPopup, 
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged
} from 'firebase/auth';
import { auth } from '../services/firebaseService';

interface AuthProps {
  onLogin: (email: string) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user?.email) onLogin(user.email);
    });
    return () => unsubscribe();
  }, [onLogin]);

  const handleGoogle = async () => {
    setError('');
    try {
      const result = await signInWithPopup(auth, new GoogleAuthProvider());
      if (result.user.email) onLogin(result.user.email);
    } catch (err: any) {
      console.error(err);
      setError("Google login failed. Please ensure popup is allowed.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'login') {
        const res = await signInWithEmailAndPassword(auth, email, password);
        if (res.user.email) onLogin(res.user.email);
      } else {
        const res = await createUserWithEmailAndPassword(auth, email, password);
        if (res.user.email) onLogin(res.user.email);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f9fc] p-6">
      <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 p-12 animate-slide-up">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-xl mx-auto mb-6">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">LeadGen AI</h1>
          <p className="text-gray-400 text-sm font-bold uppercase tracking-widest mt-2">Authentication</p>
        </div>

        {error && <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl text-[11px] font-bold border border-red-100">{error}</div>}

        <div className="space-y-6">
          <button onClick={handleGoogle} className="w-full flex items-center justify-center gap-3 py-4 bg-white border-2 border-gray-100 rounded-2xl hover:bg-gray-50 transition-all font-bold text-gray-700">
            <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
            Google Login
          </button>

          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100"></div></div>
            <div className="relative flex justify-center"><span className="bg-white px-4 text-[10px] font-black text-gray-300 uppercase tracking-widest">or email</span></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none" />
            <input type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none" />
            <button type="submit" disabled={loading} className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black shadow-xl transition-all active:scale-95 disabled:opacity-50">
              {loading ? 'Processing...' : mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <button onClick={() => setMode(mode === 'login' ? 'signup' : 'login')} className="w-full text-xs font-bold text-gray-400 hover:text-indigo-600 transition-colors">
            {mode === 'login' ? "New here? Create an account" : "Already have an account? Sign In"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;