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
      <div className="w-full bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="animate-pulse">
          <div className="h-16 bg-gray-50 border-b border-gray-100" />
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex px-6 py-5 border-b border-gray-50 space-x-4">
              {columns.map((_, j) => (
                <div key={j} className="h-4 bg-gray-100 rounded flex-1" />
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (leads.length === 0) {
    return (
      <div className="w-full bg-white rounded-3xl shadow-sm border border-gray-100 p-24 flex flex-col items-center justify-center text-center">
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-indigo-100 rounded-full blur-2xl opacity-50 scale-150 animate-pulse" />
          <div className="relative w-24 h-24 bg-indigo-50 rounded-3xl flex items-center justify-center rotate-12 shadow-sm border border-indigo-100">
            <svg className="w-12 h-12 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Ready to scrape intelligence?</h3>
        <p className="text-gray-500 max-w-sm">
          Enter a domain, social link, or keywords to extract verified contact details instantly.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden bg-white rounded-3xl shadow-sm border border-gray-100 transition-all duration-500 hover:shadow-xl hover:shadow-indigo-500/5">
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50">
              {columns.map(col => (
                <th key={col} className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] border-b border-gray-100">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {leads.map((lead, idx) => (
              <tr key={lead.id || idx} className="group hover:bg-indigo-50/30 transition-colors duration-200">
                {columns.map(col => (
                  <td key={col} className="px-8 py-5 text-sm">
                    {col === 'name' ? (
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs">
                          {lead.name?.charAt(0)}
                        </div>
                        <span className="font-bold text-gray-900">{lead.name}</span>
                      </div>
                    ) : col === 'email' ? (
                      <span className="text-indigo-600 font-medium">{lead.email || '—'}</span>
                    ) : col === 'handle' ? (
                      <span className="text-purple-600 font-bold">{lead.handle || '—'}</span>
                    ) : col === 'engagement' ? (
                      <span className="px-2 py-1 bg-emerald-50 text-emerald-600 rounded-md font-black text-[10px] uppercase">
                        {lead.engagement || '—'}
                      </span>
                    ) : (
                      <span className="text-gray-600 truncate max-w-[200px] block">{(lead as any)[col] || '—'}</span>
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