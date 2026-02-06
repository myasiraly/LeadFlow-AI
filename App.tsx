
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import DataTable from './components/DataTable';
import Auth from './components/Auth';
import { ToolType, Lead, ToolConfig, UserProfile, PlanType } from './types';
import { TOOLS } from './constants';
import { scrapeLeads } from './services/geminiService';
import { downloadLeadsCSV } from './utils/csv';
import { getUserProfile, incrementSearchCount, auth } from './services/firebaseService';
import { onAuthStateChanged, sendEmailVerification, signOut, User } from 'firebase/auth';

const ITEMS_PER_PAGE = 12;

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isEmailVerified, setIsEmailVerified] = useState<boolean>(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [activeToolId, setActiveToolId] = useState<ToolType>(ToolType.APOLLO);
  const [inputValue, setInputValue] = useState('');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  
  const loadingSteps = [
    "Spinning up Extraction Cluster...",
    "Crawling Search Directories...",
    "Validating Verified Emails...",
    "Building Lead Database..."
  ];

  // Auth listener to handle session state and profile loading
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Handle verification status from both Google and Password providers
        const verified = currentUser.emailVerified || !!currentUser.providerData.find(p => p.providerId === 'google.com');
        setIsEmailVerified(verified);
        
        if (verified) {
          try {
            const profile = await getUserProfile(currentUser.email!);
            setUserProfile(profile);
          } catch (e) {
            console.error("Profile load failed", e);
          }
        }
      } else {
        setIsEmailVerified(true);
        setUserProfile(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // Loading animation sequence
  useEffect(() => {
    let interval: any;
    if (isLoading) {
      interval = setInterval(() => {
        setLoadingStep(s => (s < loadingSteps.length - 1 ? s + 1 : 0));
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  const activeTool = useMemo(() => 
    TOOLS.find(t => t.id === activeToolId) as ToolConfig
  , [activeToolId]);

  const handleRun = useCallback(async () => {
    if (!inputValue.trim() || !user?.email || !userProfile) return;

    // Check usage limits for free users
    if (userProfile.plan === PlanType.FREE && userProfile.searchesToday >= 3) {
      setError("Daily search limit reached for Free plan. Upgrade for more!");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setLeads([]);
    setCurrentPage(1);

    try {
      // Trigger Gemini-powered extraction
      const batch = await scrapeLeads(activeToolId, inputValue, 0);
      setLeads(batch);

      // Log usage in Firebase
      await incrementSearchCount(user.email, batch.length);
      const updatedProfile = await getUserProfile(user.email);
      setUserProfile(updatedProfile);
    } catch (err: any) {
      setError('Extraction failed. Please try again or check your input.');
    } finally {
      setIsLoading(false);
    }
  }, [activeToolId, inputValue, user, userProfile]);

  const handleResendVerification = async () => {
    if (auth.currentUser) {
      setVerificationLoading(true);
      try {
        await sendEmailVerification(auth.currentUser);
        alert("Verification link resent to your email.");
      } catch (e: any) {
        setError(e.message);
      } finally {
        setVerificationLoading(false);
      }
    }
  };

  const checkVerificationStatus = async () => {
    if (auth.currentUser) {
      setVerificationLoading(true);
      try {
        await auth.currentUser.reload();
        const verified = auth.currentUser.emailVerified || !!auth.currentUser.providerData.find(p => p.providerId === 'google.com');
        setIsEmailVerified(verified);
        if (verified) {
          const profile = await getUserProfile(auth.currentUser.email!);
          setUserProfile(profile);
        } else {
          alert("Your email is still not verified. Please check your inbox.");
        }
      } catch (e: any) {
        setError(e.message);
      } finally {
        setVerificationLoading(false);
      }
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  const totalPages = Math.ceil(leads.length / ITEMS_PER_PAGE);
  const paginatedLeads = leads.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  // Auth gate
  if (!user) {
    return <Auth onLogin={() => {}} />;
  }

  // Verification gate
  if (!isEmailVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f9fc] p-6">
        <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 p-12 text-center animate-slide-up">
          <div className="w-20 h-20 bg-amber-50 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-amber-100">
            <svg className="w-10 h-10 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-2">Verify your email</h2>
          <p className="text-gray-500 mb-8 text-sm">We've sent a link to <span className="font-bold text-gray-900">{user.email}</span>. Please click it to activate your account.</p>
          
          <div className="space-y-4">
            <button 
              onClick={checkVerificationStatus}
              disabled={verificationLoading}
              className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-xl hover:bg-indigo-700 transition-all disabled:opacity-50"
            >
              {verificationLoading ? 'Checking...' : "I've Verified It"}
            </button>
            <button 
              onClick={handleResendVerification}
              disabled={verificationLoading}
              className="w-full py-4 bg-white border-2 border-gray-100 text-gray-600 rounded-2xl font-bold hover:bg-gray-50 transition-all disabled:opacity-50"
            >
              Resend Link
            </button>
            <button 
              onClick={handleLogout}
              className="w-full py-4 text-xs font-black uppercase tracking-widest text-gray-400 hover:text-red-500 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Final rendering for verified users
  return (
    <div className="min-h-screen bg-[#f8f9fc] flex">
      <Sidebar activeTool={activeToolId} onToolSelect={setActiveToolId} userProfile={userProfile} />
      
      <main className="flex-1 ml-72 p-12 max-w-7xl mx-auto">
        <div className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">{activeTool.icon}</span>
                <h2 className="text-3xl font-black text-gray-900 tracking-tight">{activeTool.id}</h2>
              </div>
              <p className="text-gray-500 font-medium">{activeTool.description}</p>
            </div>
            
            <div className="flex gap-3">
              <button 
                onClick={() => downloadLeadsCSV(leads)}
                disabled={leads.length === 0}
                className="flex items-center gap-2 px-6 py-3.5 bg-white border border-gray-200 rounded-2xl text-sm font-bold text-gray-600 hover:border-indigo-200 hover:text-indigo-600 transition-all shadow-sm disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Export CSV
              </button>
              <button 
                onClick={handleRun}
                disabled={isLoading || !inputValue.trim()}
                className="flex items-center gap-2 px-8 py-3.5 bg-indigo-600 text-white rounded-2xl text-sm font-black shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Extracting...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Start Extraction
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="relative group">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={activeTool.placeholder}
              className="w-full px-8 py-6 bg-white border-2 border-gray-100 rounded-[2.5rem] focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 outline-none text-lg font-medium transition-all shadow-sm group-hover:shadow-md"
            />
            {isLoading && (
              <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-3">
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500 animate-pulse">
                  {loadingSteps[loadingStep]}
                </span>
              </div>
            )}
          </div>
          
          <div className="mt-4 flex flex-wrap gap-2">
            {activeTool.suggestedPrompts.map((prompt, i) => (
              <button
                key={i}
                onClick={() => setInputValue(prompt)}
                className="px-4 py-2 bg-indigo-50/50 hover:bg-indigo-100 text-indigo-600 rounded-full text-xs font-bold transition-colors border border-indigo-100/50"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-8 p-6 bg-red-50 border border-red-100 rounded-3xl flex items-center gap-4 animate-fade-in">
            <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center text-red-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <p className="font-bold text-red-900">Extraction Error</p>
              <p className="text-red-600 text-sm font-medium">{error}</p>
            </div>
          </div>
        )}

        <DataTable leads={paginatedLeads} isLoading={isLoading} columns={activeTool.fields} />

        {leads.length > ITEMS_PER_PAGE && (
          <div className="mt-8 flex items-center justify-center gap-4">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-3 bg-white border border-gray-100 rounded-xl disabled:opacity-30 hover:bg-gray-50 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="text-sm font-bold text-gray-400">
              Page <span className="text-gray-900">{currentPage}</span> of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-3 bg-white border border-gray-100 rounded-xl disabled:opacity-30 hover:bg-gray-50 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
