
import React from 'react';
import { ToolType, ToolConfig } from '../types';
import { TOOLS } from '../constants';

interface SidebarProps {
  activeTool: ToolType;
  onToolSelect: (tool: ToolType) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTool, onToolSelect }) => {
  return (
    <div className="w-72 bg-white border-r border-gray-100 h-screen flex flex-col fixed left-0 top-0 overflow-y-auto custom-scrollbar z-30">
      <div className="p-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-gray-900 tracking-tight leading-none">LeadGen AI</h1>
            <p className="text-[10px] text-indigo-500 font-bold uppercase tracking-widest mt-1">Instant Prospect Lists</p>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 px-4 pb-4 space-y-6">
        <div>
          <p className="px-4 mb-3 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Scraper Engines</p>
          <div className="space-y-1">
            {TOOLS.map((tool) => (
              <button
                key={tool.id}
                onClick={() => onToolSelect(tool.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 group ${
                  activeTool === tool.id
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <span className={`text-lg transition-transform duration-300 group-hover:scale-110 ${activeTool === tool.id ? '' : 'filter grayscale'}`}>
                  {tool.icon}
                </span>
                <span className="truncate">{tool.id}</span>
                {activeTool === tool.id && (
                  <div className="ml-auto">
                    <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <div className="p-6 mt-auto">
        <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-[10px] font-bold shadow-sm">
              AI
            </div>
            <div>
              <p className="text-xs font-bold text-gray-800">Gemini 3 Flash</p>
              <p className="text-[10px] text-green-600 font-bold uppercase tracking-tighter">Unlimited Access</p>
            </div>
          </div>
          <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
            <div className="w-full h-full bg-indigo-500" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
