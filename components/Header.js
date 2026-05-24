import React from 'react';
import { BookOpen } from 'lucide-react';

export default function Header({ currentUser, onLogout, onExport, onImport }) {
  return (
    <header className="px-6 py-4 flex justify-between items-center bg-[#FDFCF8] border-b border-[#EBE6DF]">
      <div className="flex items-center space-x-3">
        <BookOpen className="text-[#8C8173]" size={20} />
        <span className="text-lg tracking-widest uppercase font-semibold text-[#333333]">Volume I.</span>
      </div>
      
      <div className="flex items-center space-x-6 text-sm font-sans text-[#8C8173]">
        <span className="hidden md:inline">Author: <span className="text-[#333333] font-serif italic">{currentUser}</span></span>
        
        <div className="flex space-x-4 uppercase tracking-widest text-xs">
          <button onClick={onExport} className="hover:text-[#333333] transition-colors">Export</button>
          <label className="hover:text-[#333333] cursor-pointer transition-colors">
            Import
            <input type="file" accept=".json" onChange={onImport} className="hidden" />
          </label>
          <button onClick={onLogout} className="hover:text-black transition-colors">Close</button>
        </div>
      </div>
    </header>
  );
}