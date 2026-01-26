
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import DataTable from './components/DataTable';
import { ToolType, Lead, ToolConfig } from './types';
import { TOOLS } from './constants';
import { scrapeLeads } from './services/geminiService';
import { downloadLeadsCSV } from './utils/csv';

const ITEMS_PER_PAGE = 12;

const App: React.FC = () => {
  const [activeToolId, setActiveToolId] = useState<ToolType>(ToolType.APOLLO);
  const [inputValue, setInputValue] = useState('');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingStep, setLoadingStep] = useState(0);
  
  const loadingSteps = [
    "Initializing Scraper Engine...",
    "Scanning Data Sources...",
    "Extracting Potential Entities...",
    "Verifying Contact Details...",
    "Finalizing Lead Table..."
  ];

  useEffect(() => {
    let interval: any;
    if (isLoading) {
      setLoadingStep(0);
      interval = setInterval(() => {
        setLoadingStep(s => (s < loadingSteps.length - 1 ? s + 1 : s));
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  // Table state: Filter and Pagination
  const [filterText, setFilterText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const activeTool = useMemo(() => 
    TOOLS.find(t => t.id === activeToolId) as ToolConfig
  , [activeToolId]);

  const handleRun = useCallback(async () => {
    if (!inputValue.trim()) return;
    
    setIsLoading(true);
    setError(null);
    setFilterText('');
    setCurrentPage(1);
    try {
      const results = await scrapeLeads(activeToolId, inputValue);
      setLeads(results);
    } catch (err: any) {
      console.error(err);
      setError('Connection timeout or scraping failed. Please refine your query.');
    } finally {
      setIsLoading(false);
    }
  }, [activeToolId, inputValue]);

  const handleDownload = () => {
    downloadLeadsCSV(leads, `${activeToolId.toLowerCase().replace(/\s/g, '_')}_leads.csv`);
  };

  const filteredLeads = useMemo(() => {
    if (!filterText.trim()) return leads;
    const lowerFilter = filterText.toLowerCase();
    return leads.filter(lead => 
      lead.name?.toLowerCase().includes(lowerFilter) ||
      lead.email?.toLowerCase().includes(lowerFilter) ||
      lead.company?.toLowerCase().includes(lowerFilter) ||
      lead.location?.toLowerCase().includes(lowerFilter)
    );
  }, [leads, filterText]);

  const totalPages = Math.ceil(filteredLeads.length / ITEMS_PER_PAGE);
  const paginatedLeads = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredLeads.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredLeads, currentPage]);

  return (
    <div className="min-h-screen flex bg-[#fbfbfd] text-gray-900 selection:bg-indigo-100 selection:text-indigo-900">
      <Sidebar 
        activeTool={activeToolId} 
        onToolSelect={(id) => {
          setActiveToolId(id);
          setInputValue('');
          setLeads([]);
          setFilterText('');
          setCurrentPage(1);
          setError(null);
        }} 
      />

      <main className="ml-72 flex-1 flex flex-col relative">
        <header className="sticky top-0 z-20 bg-white/70 backdrop-blur-xl border-b border-gray-100 px-12 py-6">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-5">
              <div className="text-4xl filter drop-shadow-sm">{activeTool.icon}</div>
              <div>
                <h2 className="text-2xl font-black text-gray-900 tracking-tight">{activeTool.id}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">{activeTool.description}</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              {leads.length > 0 && (
                <>
                  <div className="hidden lg:block text-right">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Total Intelligence</p>
                    <p className="text-xl font-black text-indigo-600 leading-none">{leads.length} leads</p>
                  </div>
                  <button
                    onClick={handleDownload}
                    className="group relative flex items-center gap-2 px-6 py-3 bg-gray-900 hover:bg-black text-white rounded-2xl font-bold text-sm transition-all shadow-xl shadow-gray-200 active:scale-95 overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-0 group-hover:opacity-10 transition-opacity" />
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Export Full CSV
                  </button>
                </>
              )}
            </div>
          </div>
        </header>

        <div className="flex-1 p-12">
          <div className="max-w-7xl mx-auto space-y-12">
            
            {/* Input Section - Hero Style */}
            <section className="relative">
              <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-indigo-100/20 border border-gray-100 p-10 overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -mr-32 -mt-32 opacity-40" />
                
                <div className="relative flex flex-col space-y-8">
                  <div className="max-w-2xl">
                    <h3 className="text-xl font-black text-gray-900 mb-2">Identify New Prospects</h3>
                    <p className="text-gray-500 font-medium">Provide a specific source URL or a natural language search query. Gemini will handle the extraction logic.</p>
                  </div>

                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1 group">
                      <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                      <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleRun()}
                        placeholder={activeTool.placeholder}
                        className="w-full pl-16 pr-6 py-5 bg-gray-50 border border-transparent rounded-[1.5rem] text-gray-900 font-medium placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all shadow-inner"
                      />
                    </div>
                    <button
                      onClick={handleRun}
                      disabled={isLoading || !inputValue.trim()}
                      className={`
                        px-10 py-5 rounded-[1.5rem] font-black text-sm flex items-center justify-center gap-3 transition-all min-w-[200px]
                        ${isLoading || !inputValue.trim() 
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                          : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-200 active:scale-95'}
                      `}
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-3">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Processing...</span>
                        </div>
                      ) : (
                        <>
                          <span>Run Intelligence</span>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                          </svg>
                        </>
                      )}
                    </button>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-gray-50">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Available Fields</span>
                    <div className="flex gap-2">
                      {activeTool.fields.map(field => (
                        <span key={field} className="px-3 py-1 bg-white border border-gray-100 text-gray-600 rounded-lg text-[10px] font-black uppercase tracking-wider shadow-sm">
                          {field}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {isLoading && (
              <div className="flex flex-col items-center justify-center py-12 space-y-6">
                <div className="relative w-full max-w-md h-2 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                  <div 
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 bg-[length:200%_100%] animate-[shimmer_2s_infinite_linear] transition-all duration-1000 ease-out" 
                    style={{ width: `${((loadingStep + 1) / loadingSteps.length) * 100}%` }}
                  />
                </div>
                <div className="text-center animate-bounce">
                  <p className="text-indigo-600 font-black text-lg">{loadingSteps[loadingStep]}</p>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Harnessing Gemini-3 Reasoning</p>
                </div>
              </div>
            )}

            {error && (
              <div className="p-6 bg-red-50 border border-red-100 rounded-3xl flex items-center gap-4 text-red-700 font-bold shadow-sm animate-[shake_0.5s_ease-in-out]">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm">{error}</p>
                  <button onClick={() => setError(null)} className="text-xs underline mt-1 opacity-70">Dismiss</button>
                </div>
              </div>
            )}

            {/* Results Section */}
            {!isLoading && (leads.length > 0 || !leads.length) && (
              <div className="space-y-6">
                {leads.length > 0 && (
                  <div className="flex flex-col md:flex-row items-center justify-between gap-6 px-4">
                    <div className="flex items-center gap-3">
                      <h3 className="text-2xl font-black text-gray-900 tracking-tight">Intelligence Feed</h3>
                      <div className="px-3 py-1 bg-indigo-600 text-white text-[10px] font-black rounded-lg uppercase tracking-widest shadow-lg shadow-indigo-100">
                        {filteredLeads.length} Results
                      </div>
                    </div>
                    <div className="relative w-full md:w-80 group">
                      <input
                        type="text"
                        placeholder="Filter database..."
                        value={filterText}
                        onChange={(e) => {
                          setFilterText(e.target.value);
                          setCurrentPage(1);
                        }}
                        className="w-full pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-50 focus:outline-none transition-all shadow-sm group-hover:border-gray-200"
                      />
                      <svg className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </div>
                )}

                <DataTable leads={paginatedLeads} isLoading={isLoading} />

                {/* Pagination */}
                {leads.length > 0 && totalPages > 1 && (
                  <div className="flex items-center justify-between bg-white px-8 py-6 rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-200/40">
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">
                      Displaying <span className="text-gray-900">{((currentPage - 1) * ITEMS_PER_PAGE) + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, filteredLeads.length)}</span> of {filteredLeads.length}
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="p-3 border border-gray-100 rounded-xl hover:bg-gray-50 disabled:opacity-20 transition-all active:scale-95"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      <div className="flex items-center gap-1">
                        {[...Array(totalPages)].map((_, i) => {
                          const pageNum = i + 1;
                          if (totalPages > 5 && Math.abs(pageNum - currentPage) > 1 && pageNum !== 1 && pageNum !== totalPages) {
                             if (pageNum === 2 || pageNum === totalPages - 1) return <span key={pageNum} className="px-1 text-gray-300">...</span>;
                             return null;
                          }
                          return (
                            <button
                              key={pageNum}
                              onClick={() => setCurrentPage(pageNum)}
                              className={`w-10 h-10 rounded-xl text-sm font-black transition-all ${
                                currentPage === pageNum 
                                  ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200' 
                                  : 'text-gray-400 hover:text-gray-900 border border-transparent'
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
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
            )}
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="fixed bottom-0 right-0 w-96 h-96 bg-indigo-50 rounded-full blur-[100px] -mb-48 -mr-48 opacity-30 pointer-events-none" />
        <div className="fixed top-1/2 left-0 w-64 h-64 bg-purple-50 rounded-full blur-[100px] -ml-32 opacity-20 pointer-events-none" />
      </main>

      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
      `}</style>
    </div>
  );
};

export default App;
