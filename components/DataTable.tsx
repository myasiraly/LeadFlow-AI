import React from 'react';
import { Lead } from '../types';

interface DataTableProps {
  leads: Lead[];
  isLoading: boolean;
  columns: string[];
}

const DataTable: React.FC<DataTableProps> = ({ leads, isLoading, columns }) => {
  if (isLoading && leads.length === 0) {
    return (
      <div className="w-full bg-white rounded-2xl md:rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="animate-pulse p-6 md:p-10 space-y-6">
          <div className="h-4 bg-gray-50 w-1/4 rounded-full" />
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex gap-4 md:gap-8">
                <div className="h-3 bg-gray-50 flex-1 rounded-full" />
                <div className="h-3 bg-gray-50 flex-1 rounded-full" />
                <div className="h-3 bg-gray-50 flex-1 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (leads.length === 0) {
    return (
      <div className="w-full bg-white rounded-[1.5rem] md:rounded-[2rem] border border-gray-100 p-12 md:p-24 flex flex-col items-center justify-center text-center shadow-sm">
        <div className="w-16 h-16 md:w-20 md:h-20 bg-blue-50 text-[#1D4E89] rounded-2xl md:rounded-3xl flex items-center justify-center mb-6 md:mb-8 rotate-3 shadow-sm border border-blue-100/50">
          <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <h3 className="text-xs md:text-sm font-bold text-gray-400 uppercase tracking-[0.3em] mb-3">System Idle</h3>
        <p className="text-xl md:text-2xl font-black text-gray-900 tracking-tight max-w-sm px-4">Search for targets to populate your prospect list.</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-[1.5rem] md:rounded-[2rem] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-collapse min-w-[600px] md:min-w-0">
          <thead>
            <tr className="bg-gray-50/50">
              {columns.map(col => (
                <th key={col} className="px-6 md:px-8 py-4 md:py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {leads.map((lead, idx) => (
              <tr key={lead.id || idx} className="group hover:bg-blue-50/20 transition-all">
                {columns.map(col => (
                  <td key={col} className="px-6 md:px-8 py-4 md:py-5">
                    {col === 'name' ? (
                      <div className="flex items-center gap-3 md:gap-4">
                        <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-gray-900 flex items-center justify-center text-white font-bold text-[9px] md:text-[10px] shadow-sm group-hover:bg-[#1D4E89] transition-colors">
                          {lead.name?.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-bold text-gray-900 text-sm tracking-tight whitespace-nowrap">{lead.name}</span>
                      </div>
                    ) : col === 'email' ? (
                      <span className="text-[#1D4E89] font-medium text-sm hover:underline cursor-pointer whitespace-nowrap">{lead.email || '—'}</span>
                    ) : (
                      <span className="text-gray-500 text-sm font-medium whitespace-nowrap">{(lead as any)[col] || '—'}</span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;
