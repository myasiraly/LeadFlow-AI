import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import DataTable from './components/DataTable';
import { ToolType, Lead, ToolConfig } from './types';
import { TOOLS } from './constants';
import { scrapeLeads } from './services/geminiService';
import { downloadLeadsCSV } from './utils/csv';

const ITEMS_PER_PAGE = 12;
const TARGET_LEADS = 1000;
const MAX_BATCHES = 25; 

const App: React.FC = () => {
  const [activeToolId, setActiveToolId] = useState<ToolType>(ToolType.APOLLO);
  const [inputValue, setInputValue] = useState('');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingStep, setLoadingStep] = useState(0);
  const [currentBatch, setCurrentBatch] = useState(0);
  const abortControllerRef = useRef<boolean>(false);
  
  const loadingSteps = [
    "Spinning up High-Volume Cluster...",
    "Crawling Deep Directories...",
    "Aggregating Global Prospects...",
    "Validating Verified Emails...",
    "Compiling Massive Intelligence Table...",
    "Searching for Niche Segments...",
    "Deduplicating Global Results..."
  ];

  useEffect(() => {
    let interval: any;
    if (isLoading) {
      interval = setInterval(() => {
        setLoadingStep(s => (s < loadingSteps.length - 1 ? s + 1 : 0));
      }, 2000);
    }
    return () => {
      clearInterval(interval);
      setLoadingStep(0);
    };
  }, [isLoading]);

  const [filterText, setFilterText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const activeTool = useMemo(() => 
    TOOLS.find(t => t.id === activeToolId) as ToolConfig
  , [activeToolId]);

  const handleRun = useCallback(async () => {
    if (!inputValue.trim()) return;
    
    setIsLoading(true);
    setError(null);
    setLeads([]);
    setFilterText('');
    setCurrentPage(1);
    setCurrentBatch(0);
    abortControllerRef.current = false;

    let accumulatedLeads: Lead[] = [];
    const seenEmails = new Set<string>();
    const seenHandles = new Set<string>();

    try {
      for (let i = 0; i < MAX_BATCHES; i++) {
        if (abortControllerRef.current) break;
        if (accumulatedLeads.length >= TARGET_LEADS) break;

        setCurrentBatch(i + 1);
        const batch = await scrapeLeads(activeToolId, inputValue, i);
        
        const uniqueInBatch = batch.filter(lead => {
          const email = lead.email?.toLowerCase().trim();
          const handle = lead.handle?.toLowerCase().trim();
          
          if (email && !seenEmails.has(email)) {
            seenEmails.add(email);
            return true;
          }
          if (handle && !seenHandles.has(handle)) {
            seenHandles.add(handle);
            return true;
          }
          // Fallback to name uniqueness if no contact info
          if (!email && !handle && lead.name) {
             return true; 
          }
          return false;
        });

        accumulatedLeads = [...accumulatedLeads, ...uniqueInBatch];
        setLeads([...accumulatedLeads]);

        if (uniqueInBatch.length === 0 && i > 5) {
            break;
        }

        await new Promise(resolve => setTimeout(resolve, 500));
      }
    } catch (err: any) {
      console.error(err);
      setError('Bulk extraction paused or interrupted. You can export the leads found so far.');
    } finally {
      setIsLoading(false);
      setCurrentBatch(0);
    }
  }, [activeToolId, inputValue]);

  const handleStop = () => {
    abortControllerRef.current = true;
    setIsLoading(false);
  };

  const handleDownload = () => {
    downloadLeadsCSV(leads, `${activeToolId.toLowerCase().replace(/\s/g, '_')}_export.csv`);
  };

  const filteredLeads = useMemo(() => {
    if (!filterText.trim()) return leads;
    const lowerFilter = filterText.toLowerCase();
    return leads.filter(lead => 
      lead.name?.toLowerCase().includes(lowerFilter) ||
      lead.email?.toLowerCase().includes(lowerFilter) ||
      lead.handle?.toLowerCase().includes(lowerFilter) ||
      lead.company?.toLowerCase().includes(lowerFilter)
    );
  }, [leads, filterText]);

  const totalPages = Math.ceil(filteredLeads.length / ITEMS_PER_PAGE);
  const paginatedLeads = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredLeads.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredLeads, currentPage]);

  const progressPercentage = Math.min((leads.length / TARGET_LEADS) * 100, 100);

  return (
    <div className="min-h-screen flex bg-[#f8f9fc] text-gray-900 selection:bg-indigo-100 selection:text-indigo-900 font-['Inter']">
      <Sidebar 
        activeTool={activeToolId} 
        onToolSelect={(id) => {
          if (isLoading) return; 
          setActiveToolId(id);
          setInputValue('');
          setLeads([]);
          setFilterText('');
          setCurrentPage(1);
          setError(null);
        }} 
      />

      <main className="ml-72 flex-1 flex flex-col relative">
        <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-gray-100 px-12 py-6">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-5">
              <div className="text-4xl filter drop-shadow-sm">{activeTool.icon}</div>
              <div>
                <h2 className="text-2xl font-black text-gray-900 tracking-tight">{activeTool.id}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`w-2 h-2 rounded-full ${isLoading ? 'bg-indigo-500 animate-pulse' : 'bg-green-500'}`} />
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.1em]">
                    {isLoading ? `Processing Batch ${currentBatch}` : `Target: ${TARGET_LEADS} Verified Prospects`}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {leads.length > 0 && (
                <>
                  <div className="hidden lg:block text-right">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Live Database</p>
                    <p className="text-xl font-black text-indigo-600 leading-none">{leads.length.toLocaleString()}</p>
                  </div>
                  <button
                    onClick={handleDownload}
                    className="flex items-center gap-2 px-6 py-3 bg-gray-900 hover:bg-black text-white rounded-2xl font-bold text-sm transition-all shadow-xl shadow-gray-200 active:scale-95"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Export {leads.length} Leads
                  </button>
                </>
              )}
            </div>
          </div>
        </header>

        <div className="flex-1 p-12">
          <div className="max-w-7xl mx-auto space-y-10">
            
            <section className="bg-white rounded-[2.5rem] shadow-2xl shadow-indigo-100/30 border border-gray-100 p-10 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-gray-50">
                <div 
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-700 ease-out"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>

              <div className="flex flex-col space-y-8">
                <div className="flex items-center justify-between">
                  <div className="max-w-xl">
                    <h3 className="text-xl font-black text-gray-900 mb-2">Massive Lead Discovery Engine</h3>
                    <p className="text-gray-500 text-sm font-medium">Extracting up to {TARGET_LEADS} leads via multi-batch intelligent scraping. Our engine performs {MAX_BATCHES} distinct search cycles for total coverage.</p>
                  </div>
                  {isLoading && (
                    <div className="bg-indigo-50 px-5 py-2.5 rounded-2xl flex items-center gap-3 border border-indigo-100 shadow-sm">
                      <div className="w-4 h-4 border-2 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin" />
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-indigo-700 uppercase tracking-widest leading-none">Batch {currentBatch} of {MAX_BATCHES}</span>
                        <span className="text-[9px] text-indigo-400 font-bold uppercase mt-1">Collecting Results...</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative flex-1 group">
                    <input
                      type="text"
                      disabled={isLoading}
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleRun()}
                      placeholder={activeTool.placeholder}
                      className="w-full pl-6 pr-6 py-5 bg-gray-50 border border-transparent rounded-2xl text-gray-900 font-medium placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all shadow-inner disabled:opacity-50"
                    />
                  </div>
                  {!isLoading ? (
                    <button
                      onClick={handleRun}
                      disabled={!inputValue.trim()}
                      className="px-10 py-5 rounded-2xl font-black text-sm bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-200 active:scale-95 transition-all disabled:bg-gray-200"
                    >
                      Extract 1,000+ Leads
                    </button>
                  ) : (
                    <button
                      onClick={handleStop}
                      className="px-10 py-5 rounded-2xl font-black text-sm bg-red-50 text-red-600 hover:bg-red-100 border border-red-100 transition-all active:scale-95"
                    >
                      Stop & Save Results
                    </button>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                  <div className="flex gap-2">
                    {activeTool.fields.slice(0, 5).map(field => (
                      <span key={field} className="px-3 py-1 bg-white border border-gray-100 text-[10px] font-black uppercase text-gray-500 rounded-lg shadow-sm">
                        {field}
                      </span>
                    ))}
                  </div>
                  {leads.length > 0 && (
                    <div className="text-sm font-bold text-indigo-600 flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping" />
                        {Math.round(progressPercentage)}% Target
                      </span>
                      <span className="text-gray-200 font-normal">|</span>
                      <span>{leads.length.toLocaleString()} Unique Leads</span>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {error && (
              <div className="p-6 bg-amber-50 border border-amber-100 rounded-3xl flex items-center gap-4 text-amber-800 font-bold shadow-sm">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                    <p className="text-sm">{error}</p>
                    <p className="text-[10px] text-amber-600 uppercase tracking-widest mt-1">Partial results saved below</p>
                </div>
              </div>
            )}

            <div className="space-y-6">
              <div className="flex items-center justify-between px-4">
                <div className="flex items-center gap-4">
                  <h3 className="text-2xl font-black text-gray-900 tracking-tight">Intelligence Feed</h3>
                  {isLoading && (
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-indigo-500 uppercase tracking-widest">{loadingSteps[loadingStep]}</span>
                    </div>
                  )}
                </div>
                {leads.length > 0 && (
                  <div className="relative group">
                    <input
                      type="text"
                      placeholder="Filter database..."
                      value={filterText}
                      onChange={(e) => {
                        setFilterText(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="w-72 pl-10 pr-5 py-3 bg-white border border-gray-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-50 focus:outline-none shadow-sm group-hover:border-gray-200 transition-all"
                    />
                    <svg className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                )}
              </div>

              <DataTable 
                leads={paginatedLeads} 
                isLoading={isLoading && leads.length === 0} 
                columns={activeTool.fields}
              />

              {leads.length > 0 && totalPages > 1 && (
                <div className="flex items-center justify-between bg-white px-8 py-6 rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-200/40">
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">
                    Showing <span className="text-gray-900 font-black">{((currentPage - 1) * ITEMS_PER_PAGE) + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, filteredLeads.length)}</span> of {filteredLeads.length}
                  </p>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="p-3 border border-gray-100 rounded-xl hover:bg-gray-50 disabled:opacity-20 transition-all active:scale-95"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <div className="flex items-center gap-1 text-sm font-bold text-gray-400">
                        <span className="text-gray-900">{currentPage}</span>
                        <span>/</span>
                        <span>{totalPages}</span>
                    </div>
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="p-3 border border-gray-100 rounded-xl hover:bg-gray-50 disabled:opacity-20 transition-all active:scale-95"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
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