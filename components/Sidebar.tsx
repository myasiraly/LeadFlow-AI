import React from 'react';
import { ToolType, UserProfile, PlanType } from '../types';
import { TOOLS } from '../constants';
import { auth } from '../services/firebaseService';
import { signOut } from 'firebase/auth';

interface SidebarProps {
  activeTool: ToolType;
  onToolSelect: (tool: ToolType) => void;
  userProfile?: UserProfile | null;
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTool, onToolSelect, userProfile, isOpen, onClose }) => {
  const handleLogout = () => {
    if (confirm("Sign out of your session?")) {
      signOut(auth);
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={`fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
        onClick={onClose}
      />
      
      {/* Sidebar Container */}
      <div className={`fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-100 z-50 shadow-2xl lg:shadow-[4px_0_24px_rgba(0,0,0,0.02)] transition-transform duration-300 transform ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} flex flex-col`}>
        <div className="p-6 pt-10 flex flex-col items-center">
          <div className="flex items-center gap-3 mb-1">
            <svg className="w-10 h-auto" viewBox="0 0 100 85" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 10V55H50V43H27V10H15Z" fill="#1D4E89" />
              <path d="M55 10H95V22H67V65H95V48H78V36H107V77H55V10Z" fill="#76BC21" />
              <path d="M42 42L55 25L68 42H42Z" fill="#1D4E89" />
            </svg>
            <div className="flex flex-col">
              <h1 className="text-xl font-black text-[#1D4E89] tracking-tighter leading-none">LEAD<span className="text-[#76BC21]">GEN</span></h1>
              <p className="text-[7px] font-bold text-gray-400 tracking-[0.3em] uppercase">AI Prospecting</p>
            </div>
          </div>
        </div>
        
        <div className="flex-1 px-4 overflow-y-auto custom-scrollbar mt-4 space-y-6 pb-6">
          <div>
            <p className="px-3 mb-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Platforms</p>
            <div className="space-y-1">
              {TOOLS.map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => {
                    onToolSelect(tool.id);
                    if (window.innerWidth < 1024) onClose();
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 group ${
                    activeTool === tool.id
                      ? 'bg-blue-50 text-[#1D4E89]'
                      : 'text-gray-500 hover:bg-gray-50 hover:text-[#1D4E89]'
                  }`}
                >
                  <span className={`text-lg transition-transform ${activeTool === tool.id ? 'scale-110' : 'opacity-60 grayscale group-hover:opacity-100 group-hover:grayscale-0'}`}>
                    {tool.icon}
                  </span>
                  <span className="truncate">{tool.id}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-gray-50 bg-gray-50/30">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#1D4E89] flex items-center justify-center text-white text-xs font-bold shadow-md">
                {userProfile?.email?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="truncate flex-1">
                <p className="text-[11px] font-bold text-gray-900 truncate">{userProfile?.email}</p>
                <span className="text-[9px] font-bold text-[#76BC21] uppercase tracking-wider">{userProfile?.plan || 'Free'} Plan</span>
              </div>
            </div>
            
            <div className="space-y-1.5">
               <div className="flex justify-between text-[9px] font-bold text-gray-400 uppercase tracking-wide">
                 <span>Daily Capacity</span>
                 <span className="text-gray-900">{userProfile?.searchesToday || 0}/3</span>
               </div>
               <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-[#1D4E89] to-[#76BC21] rounded-full transition-all duration-700" 
                    style={{ width: `${Math.min(((userProfile?.searchesToday || 0) / 3) * 100, 100)}%` }} 
                  />
               </div>
            </div>

            <button 
              onClick={handleLogout}
              className="w-full py-2.5 text-[10px] font-bold text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all rounded-lg uppercase tracking-widest border border-transparent hover:border-red-100"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
