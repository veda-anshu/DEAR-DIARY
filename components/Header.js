import React, { useState, useEffect } from 'react';
import { BookOpen } from 'lucide-react';

export default function Header({ currentUser, onLogout, onExport, onImport }) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('diary_theme');
    if (savedTheme === 'dark') {
      document.body.classList.add('dark-mode');
      setIsDark(true);
    } else {
      document.body.classList.remove('dark-mode');
      setIsDark(false);
    }
  }, []);

  const toggleMode = () => {
    const isDarkMode = document.body.classList.toggle('dark-mode');
    setIsDark(isDarkMode);
    localStorage.setItem('diary_theme', isDarkMode ? 'dark' : 'light');
  };

  return (
    <header className="px-4 md:px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4 md:gap-0 bg-[#FDFCF8] border-b border-[#EBE6DF] transition-colors">
      <div className="flex items-center justify-between w-full md:w-auto">
        <div className="flex items-center space-x-3">
          <BookOpen className="text-[#8C8173]" size={20} />
          <span className="text-lg tracking-widest uppercase font-semibold text-[#333333]">Volume I.</span>
        </div>
        <span className="md:hidden text-xs text-[#8C8173] font-serif italic">{currentUser}</span>
      </div>
      
      <div className="flex items-center justify-end space-x-4 md:space-x-6 text-sm font-sans text-[#8C8173] w-full md:w-auto overflow-x-auto hide-scrollbar pb-1 md:pb-0">
        <span className="hidden md:inline shrink-0">Author: <span className="text-[#333333] font-serif italic">{currentUser}</span></span>
        
        <div className="flex space-x-5 md:space-x-4 uppercase tracking-widest text-[10px] md:text-xs items-center shrink-0 ml-auto">
          <button onClick={toggleMode} className="hover:text-[#333333] transition-colors font-semibold">
            {isDark ? 'Light Mode' : 'Dark Mode'}
          </button>
          <button onClick={onExport} className="hover:text-[#333333] transition-colors">Export</button>
          <label className="hover:text-[#333333] cursor-pointer transition-colors">
            Import
            <input type="file" accept=".json" onChange={onImport} className="hidden" />
          </label>
          <button onClick={onLogout} className="hover:text-[#333333] transition-colors">Close</button>
        </div>
      </div>
    </header>
  );
}
