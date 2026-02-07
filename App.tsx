import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import DataTable from './components/DataTable';
import Auth from './components/Auth';
import { ToolType, Lead, ToolConfig, UserProfile, PlanType } from './types';
import { TOOLS } from './constants';
import { scrapeLeads } from './services/geminiService';
import { downloadLeadsCSV } from './utils/csv';
import { getUserProfile, incrementSearchCount, auth } from './services/firebaseService';
import { onAuthStateChanged, User } from 'firebase/auth';

const ITEMS_PER_PAGE = 10;
const BATCHES_PER_RUN = 3; 

interface ExtractionProgress {
  currentBatch: number;
  totalBatches: number;
  leadsFound: number;
  status: string;
}

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isEmailVerified, setIsEmailVerified] = useState<boolean>(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [activeToolId, setActiveToolId] = useState<ToolType>(ToolType.APOLLO);
  const [inputValue, setInputValue] = useState('');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isStopping, setIsStopping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [progress, setProgress] = useState<ExtractionProgress | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const stopRequested = useRef(false);

  const loadProfile = async (currentUser: User) => {
    if (!currentUser.email) return;
    try {
      const profile = await getUserProfile(currentUser.email);
      setUserProfile(profile);
    } catch (e) {
      console.error("Sync error", e);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser && currentUser.email) {
        const verified = currentUser.emailVerified || !!currentUser.providerData.find(p => p.providerId === 'google.com');
        setIsEmailVerified(verified);
        if (verified) await loadProfile(currentUser);
      } else {
        setIsEmailVerified(true);
        setUserProfile(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const activeTool = useMemo(() => TOOLS.find(t => t.id === activeToolId) as ToolConfig, [activeToolId]);

  const handleStop = useCallback(() => {
    stopRequested.current = true;
    setIsStopping(true);
  }, []);

  const handleRun = useCallback(async () => {
    if (!inputValue.trim() || !user?.email || !userProfile) return;
    if (userProfile.plan === PlanType.FREE && userProfile.searchesToday >= 3) {
      setError("Quota exceeded. Upgrade to Pro for unlimited searches.");
      return;
    }
    
    setIsLoading(true);
    setIsStopping(false);
    stopRequested.current = false;
    setError(null);
    setLeads([]);
    setCurrentPage(1);
    setProgress({ currentBatch: 1, totalBatches: BATCHES_PER_RUN, leadsFound: 0, status: "Initializing..." });

    try {
      let accumulatedLeads: Lead[] = [];
      for (let i = 0; i < BATCHES_PER_RUN; i++) {
        if (stopRequested.current) break;
        setProgress(p => ({ ...p!, currentBatch: i + 1, status: `Extracting Batch ${i + 1}...` }));
        const batch = await scrapeLeads(activeToolId, inputValue, i);
        if (batch.length > 0) {
          accumulatedLeads = [...accumulatedLeads, ...batch.filter(b => !accumulatedLeads.some(a => a.id === b.id))];
          setLeads([...accumulatedLeads]);
          setProgress(p => ({ ...p!, leadsFound: accumulatedLeads.length }));
        }
        if (i < BATCHES_PER_RUN - 1 && !stopRequested.current) await new Promise(r => setTimeout(r, 1200));
      }
      if (accumulatedLeads.length > 0) {
        await incrementSearchCount(user.email, accumulatedLeads.length);
        const updated = await getUserProfile(user.email);
        setUserProfile(updated);
      } else if (!stopRequested.current) {
        setError("No leads found. Try a different query.");
      }
    } catch (err) {
      setError('Connection interrupted.');
    } finally {
      setIsLoading(false);
      setIsStopping(false);
      setProgress(null);
    }
  }, [activeToolId, inputValue, user, userProfile]);

  const totalPages = Math.ceil(leads.length / ITEMS_PER_PAGE);
  const paginatedLeads = leads.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  if (!user || !isEmailVerified) return <Auth onLogin={() => {}} />;

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex">
      <Sidebar 
        activeTool={activeToolId} 
        onToolSelect={(id) => { setActiveToolId(id); setLeads([]); setError(null); }} 
        userProfile={userProfile} 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      
      <main className="flex-1 lg:ml-64 p-4 md:p-8 w-full min-h-screen flex flex-col">
        {/* Mobile Header Bar */}
        <div className="lg:hidden flex items-center justify-between mb-6 p-3 bg-white rounded-2xl shadow-sm border border-gray-100">
           <button onClick={() => setIsSidebarOpen(true)} className="p-3 text-gray-500 hover:bg-gray-50 rounded-xl transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
           </button>
           <div className="flex items-center gap-2 pr-4">
              <svg className="w-6 h-auto" viewBox="0 0 100 85" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 10V55H50V43H27V10H15Z" fill="#1D4E89" />
                <path d="M55 10H95V22H67V65H95V48H78V36H107V77H55V10Z" fill="#76BC21" />
              </svg>
              <h1 className="text-sm font-black text-[#1D4E89] tracking-tighter">LEAD<span className="text-[#76BC21]">GEN</span></h1>
           </div>
        </div>

        <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6 animate-slide-up">
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-2">
              <span className="text-3xl md:text-4xl">{activeTool.icon}</span>
              <h2 className="text-2xl md:text-4xl font-black text-gray-900 tracking-tighter uppercase italic">{activeTool.id}</h2>
            </div>
            <p className="text-gray-400 font-medium text-base md:text-lg leading-relaxed max-w-2xl">{activeTool.description}</p>
          </div>
          <div className="flex gap-3 shrink-0">
            <button 
              onClick={() => downloadLeadsCSV(leads, `leads_${activeToolId.toLowerCase()}.csv`)} 
              disabled={leads.length === 0 || isLoading}
              className="flex-1 md:flex-none px-6 py-3 bg-white border border-gray-200 rounded-xl text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:border-[#1D4E89] hover:text-[#1D4E89] transition-all disabled:opacity-30 shadow-sm"
            >
              Export CSV
            </button>
            {isLoading ? (
              <button onClick={handleStop} className="flex-1 md:flex-none px-8 py-3 bg-red-50 text-red-600 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-red-100 transition-all">
                {isStopping ? 'Stopping...' : 'Cancel'}
              </button>
            ) : (
              <button onClick={handleRun} disabled={!inputValue.trim()} className="flex-1 md:flex-none px-8 py-3 bg-[#1D4E89] text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-blue-900 transition-all shadow-lg shadow-blue-100/50 disabled:opacity-30">
                Scrape
              </button>
            )}
          </div>
        </header>

        <section className="mb-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="relative group">
            <input 
              type="text" 
              value={inputValue} 
              onChange={(e) => setInputValue(e.target.value)} 
              placeholder={activeTool.placeholder} 
              className="w-full px-6 md:px-8 py-5 md:py-6 bg-white border border-gray-100 rounded-2xl md:rounded-3xl focus:border-[#1D4E89] outline-none text-lg md:text-xl font-semibold tracking-tight text-gray-900 transition-all shadow-sm placeholder:text-gray-300" 
              onKeyDown={(e) => e.key === 'Enter' && !isLoading && inputValue.trim() && handleRun()} 
            />
            {error && <p className="absolute -bottom-7 left-4 text-xs font-bold text-red-500 uppercase tracking-wider">{error}</p>}
          </div>
          
          <div className="mt-4 flex flex-wrap gap-2">
            {activeTool.suggestedPrompts.map((p, i) => (
              <button key={i} onClick={() => setInputValue(p)} className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-500 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all whitespace-nowrap">
                {p}
              </button>
            ))}
          </div>

          {isLoading && progress && (
            <div className="mt-8 p-6 md:p-8 bg-white border border-gray-100 rounded-2xl md:rounded-[2rem] shadow-sm animate-slide-up">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-[10px] font-bold text-[#1D4E89] uppercase tracking-[0.3em] mb-1">{progress.status}</h4>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                    {progress.leadsFound} items detected • Batch {progress.currentBatch}/{progress.totalBatches}
                  </p>
                </div>
                <div className="w-8 h-8 md:w-10 md:h-10 border-4 border-blue-50 border-t-[#1D4E89] rounded-full animate-spin" />
              </div>
              <div className="w-full h-1.5 bg-gray-50 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#1D4E89] to-[#76BC21] transition-all duration-700" style={{ width: `${(progress.currentBatch / progress.totalBatches) * 100}%` }} />
              </div>
            </div>
          )}
        </section>

        <div className="animate-slide-up flex-1 flex flex-col" style={{ animationDelay: '0.2s' }}>
          <DataTable leads={paginatedLeads} isLoading={isLoading} columns={activeTool.fields} />
          
          {leads.length > ITEMS_PER_PAGE && (
            <div className="mt-8 mb-4 flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8">
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} className="text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-gray-900 transition-all disabled:opacity-20" disabled={currentPage === 1}>
                Previous
              </button>
              <span className="text-[10px] font-bold text-gray-900 uppercase tracking-widest bg-white px-5 py-2.5 rounded-xl border border-gray-100 shadow-sm order-first md:order-none">
                Page {currentPage} of {totalPages}
              </span>
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} className="text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-gray-900 transition-all disabled:opacity-20" disabled={currentPage === totalPages}>
                Next
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;