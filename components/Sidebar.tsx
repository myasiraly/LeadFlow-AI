import React from 'react';
import { ToolType, ToolConfig, UserProfile, PlanType } from '../types';
import { TOOLS } from '../constants';
import { auth } from '../services/firebaseService';
import { signOut } from 'firebase/auth';

interface SidebarProps {
  activeTool: ToolType;
  onToolSelect: (tool: ToolType) => void;
  userProfile?: UserProfile | null;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTool, onToolSelect, userProfile }) => {
  const handleLogout = () => {
    if (confirm("Are you sure you want to log out of your account?")) {
      signOut(auth);
    }
  };

  const leadLimit = 1000;
  const totalLeads = userProfile?.totalLeadsExtracted || 0;
  const leadPercentage = Math.min((totalLeads / leadLimit) * 100, 100);

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
            <p className="text-[10px] text-indigo-500 font-bold uppercase tracking-widest mt-1">Intelligence Core</p>
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
              </button>
            ))}
          </div>
        </div>
      </nav>

      <div className="p-6 mt-auto">
        <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-black shadow-md uppercase">
              {userProfile?.email?.charAt(0) || 'U'}
            </div>
            <div className="truncate">
              <p className="text-xs font-black text-gray-900 truncate">{userProfile?.email}</p>
              <p className="text-[9px] text-indigo-600 font-black uppercase tracking-widest">{userProfile?.plan || 'Free'} Plan</p>
            </div>
          </div>
          
          <div className="space-y-3">
             <div className="flex justify-between items-center text-[10px] font-black uppercase text-gray-400">
               <span>Daily Runs</span>
               <span className="text-gray-900">{userProfile?.searchesToday || 0} / 3</span>
             </div>
             <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-indigo-500 transition-all duration-500" 
                  style={{ width: `${Math.min(((userProfile?.searchesToday || 0) / 3) * 100, 100)}%` }} 
                />
             </div>

             {userProfile?.plan === PlanType.FREE && (
               <>
                 <div className="flex justify-between items-center text-[10px] font-black uppercase text-gray-400 pt-1">
                   <span>Lead Cap</span>
                   <span className="text-gray-900">{totalLeads.toLocaleString()} / 1,000</span>
                 </div>
                 <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-emerald-500 transition-all duration-500" 
                      style={{ width: `${leadPercentage}%` }} 
                    />
                 </div>
               </>
             )}
             
             <button 
              onClick={handleLogout}
              className="w-full py-3 mt-2 bg-white border border-gray-200 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-red-500 hover:border-red-100 hover:bg-red-50/50 transition-all rounded-xl flex items-center justify-center gap-2"
             >
               <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
               </svg>
               Logout Account
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;