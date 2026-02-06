import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import DataTable from './components/DataTable';
import Auth from './components/Auth';
import { ToolType, Lead, ToolConfig, UserProfile, PlanType } from './types';
import { TOOLS } from './constants';
import { scrapeLeads } from './services/geminiService';
import { downloadLeadsCSV } from './utils/csv';
import { getUserProfile, incrementSearchCount } from './services/firebaseService';

const ITEMS_PER_PAGE = 12;
const TARGET_LEADS = 100; // Adjusted for demo stability

const App: React.FC = () => {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [activeToolId, setActiveToolId] = useState<ToolType>(ToolType.APOLLO);
  const [inputValue, setInputValue] = useState('');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingStep, setLoadingStep] = useState(0);
  const [currentBatch, setCurrentBatch] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const abortControllerRef = useRef<boolean>(false);
  
  const loadingSteps = [
    "Spinning up Extraction Cluster...",
    "Crawling Search Directories...",
    "Validating Verified Emails...",
    "Building Lead Database..."
  ];

  // Load profile when user logs in
  useEffect(() => {
    if (userEmail) {
      getUserProfile(userEmail).then(setUserProfile).catch(console.error);
    } else {
      setUserProfile(null);
    }
  }, [userEmail]);

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
    if (!inputValue.trim() || !userEmail || !userProfile) return;

    // Check usage limit for free plan
    if (userProfile.plan === PlanType.FREE && userProfile.searchesToday >= 3) {
      setError("Daily search limit reached for Free plan.");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setLeads([]);
    setCurrentPage(1);
    setCurrentBatch(0);
    abortControllerRef.current = false;

    let accumulatedLeads: Lead[] = [];
    const seenEmails = new Set<string>();

    try {
      const batch = await scrapeLeads(activeToolId, inputValue, 0);
      accumulatedLeads = batch;
      setLeads(accumulatedLeads);

      await incrementSearchCount(userEmail, accumulatedLeads.length);
      const updatedProfile = await getUserProfile(userEmail);
      setUserProfile(updatedProfile);

    } catch (err: any) {
      setError('Extraction failed. Check your API key and input.');
    } finally {
      setIsLoading(false);
      setCurrentBatch(0);
    }
  }, [activeToolId, inputValue, userEmail, userProfile]);

  const totalPages = Math.ceil(leads.length / ITEMS_PER_PAGE);
  const paginatedLeads = leads.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  if (!userEmail) {
    return <Auth onLogin={setUserEmail} />;
  }

  return (
    <div className="min-h-screen flex bg-[#f8f9fc] text-gray-900 font-['Inter']">
      <Sidebar 
        activeTool={activeToolId} 
        onToolSelect={(id) => {
          if (isLoading) return; 
          setActiveToolId(id);
          setInputValue('');
          setLeads([]);
          setCurrentPage(1);
          setError(null);
        }} 
        userProfile={userProfile}
      />

      <main className="ml-72 flex-1 flex flex-col relative">
        <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-gray-100 px-12 py-6">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-5">
              <div className="text-4xl">{activeTool.icon}</div>
              <div>
                <h2 className="text-2xl font-black text-gray-900 tracking-tight">{activeTool.id}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`w-2 h-2 rounded-full ${isLoading ? 'bg-indigo-500 animate-pulse' : 'bg-green-500'}`} />
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                    {isLoading ? "System Running" : "Standby Mode"}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {leads.length > 0 && (
                <button
                  onClick={() => downloadLeadsCSV(leads)}
                  className="px-6 py-3 bg-gray-900 text-white rounded-2xl font-bold text-sm shadow-xl active:scale-95 transition-all"
                >
                  Export {leads.length} Leads
                </button>
              )}
            </div>
          </div>
        </header>

        <div className="flex-1 p-12">
          <div className="max-w-7xl mx-auto space-y-10">
            <section className="bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 p-10 relative overflow-hidden">
              <div className="flex flex-col space-y-8">
                <div>
                  <h3 className="text-xl font-black text-gray-900 mb-2">Lead Discovery Engine</h3>
                  <p className="text-gray-500 text-sm font-medium">Extracting prospects for your {activeTool.id} pipeline.</p>
                </div>

                <div className="space-y-4">
                  <div className="flex gap-4">
                    <input
                      type="text"
                      disabled={isLoading}
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleRun()}
                      placeholder={activeTool.placeholder}
                      className="flex-1 px-6 py-5 bg-gray-50 border border-transparent rounded-2xl text-gray-900 font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                    <button
                      onClick={handleRun}
                      disabled={!inputValue.trim() || isLoading}
                      className="px-10 py-5 bg-indigo-600 text-white rounded-2xl font-black text-sm shadow-xl active:scale-95 transition-all disabled:opacity-50"
                    >
                      {isLoading ? "Scraping..." : "Start Engine"}
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {error && (
              <div className="p-6 bg-red-50 border border-red-100 rounded-3xl text-red-700 font-bold">
                {error}
              </div>
            )}

            <div className="space-y-6">
              <h3 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                Live Feed {isLoading && <span className="text-xs font-bold text-indigo-500 uppercase animate-pulse">{loadingSteps[loadingStep]}</span>}
              </h3>
              
              <DataTable 
                leads={paginatedLeads} 
                isLoading={isLoading && leads.length === 0} 
                columns={activeTool.fields}
              />

              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-8 pb-12">
                  <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} className="px-6 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold shadow-sm">Prev</button>
                  <span className="text-xs font-bold">{currentPage} / {totalPages}</span>
                  <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} className="px-6 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold shadow-sm">Next</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;