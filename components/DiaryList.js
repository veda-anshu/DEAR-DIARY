import React, { useState } from 'react';
import { Search, Trash2, Image as ImageIcon, Sparkles, BarChart3 } from 'lucide-react';
import { yyyymmddToDDMMYYYY } from '../utils/dateUtils';

export default function DiaryList({ entries, searchQuery, setSearchQuery, onLoadEntry, onDeleteEntry }) {
  const [showStats, setShowStats] = useState(false);

  const filteredEntries = entries.filter(entry => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const textMatch = (entry.text || '').toLowerCase().includes(query);
    const dateMatch = entry.date ? yyyymmddToDDMMYYYY(entry.date).includes(query) : false;
    const tagMatch = (entry.tags || '').toLowerCase().split(' ').some(tag => tag.includes(query));
    return textMatch || dateMatch || tagMatch;
  });

  const handleFlashback = () => {
    if (entries.length > 0) {
      const randomEntry = entries[Math.floor(Math.random() * entries.length)];
      onLoadEntry(randomEntry);
    }
  };

  return (
    <div className="h-full flex flex-col border-r border-[#EBE6DF] pr-4 md:pr-8">
      {/* New Top Bar for Flashback & Stats */}
      <div className="flex justify-between mb-4 border-b border-[#EBE6DF] pb-4">
        <button onClick={handleFlashback} className="flex items-center space-x-2 text-[#5C554B] hover:text-[#333333] transition-colors text-xs uppercase tracking-widest font-semibold">
          <Sparkles size={14} /> <span>Flashback</span>
        </button>
        <button onClick={() => setShowStats(!showStats)} className="flex items-center space-x-2 text-[#5C554B] hover:text-[#333333] transition-colors text-xs uppercase tracking-widest font-semibold">
          <BarChart3 size={14} /> <span>Summary</span>
        </button>
      </div>

      {showStats && (
        <div className="mb-6 p-4 bg-[#F4F1EA] rounded-lg text-xs text-[#5C554B] space-y-2 animate-in fade-in">
          <p>Total Entries: <span className="font-bold">{entries.length}</span></p>
          <p>Photos Stored: <span className="font-bold">{entries.reduce((acc, e) => acc + (e.images?.length || 0), 0)}</span></p>
        </div>
      )}

      <div className="mb-6 relative">
        <Search className="absolute left-0 top-1/2 -translate-y-1/2 text-[#D1CBC3]" size={16} />
        <input type="text" placeholder="Search entries..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-6 py-2 bg-transparent border-b border-[#EBE6DF] focus:border-[#8C8173] outline-none text-sm placeholder:text-[#D1CBC3] font-sans transition-colors" />
      </div>
      
      {/* ... keep the rest of the list map logic the same ... */}
      <div className="flex-1 overflow-y-auto space-y-1 pr-2 scrollbar-thin">
        {filteredEntries.map((entry) => (
            <div key={entry.id} onClick={() => onLoadEntry(entry)} className="group flex flex-col p-4 rounded-lg hover:bg-[#F4F1EA] cursor-pointer transition-colors">
              <div className="flex justify-between items-baseline mb-1">
                <h3 className="font-semibold text-[#333333] tracking-wide text-sm uppercase">{entry.date ? yyyymmddToDDMMYYYY(entry.date) : 'Unknown Date'}</h3>
                <div className="flex items-center space-x-3">
                  {entry.images?.length > 0 && <span className="text-[#8C8173]"><ImageIcon size={12} /></span>}
                  <span className="text-xs text-[#8C8173] font-sans">{entry.time || ''}</span>
                  <button type="button" onClick={(e) => { e.stopPropagation(); if (window.confirm('Delete?')) onDeleteEntry(entry.id); }} className="text-[#D1CBC3] hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={14} /></button>
                </div>
              </div>
              <p className="text-[#5C554B] text-sm line-clamp-2 leading-relaxed">{entry.text}</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {(entry.tags || '').split(' ').map((tag, i) => tag ? <span key={i} className="text-[#8C8173] text-[10px] font-sans italic border border-[#EBE6DF] px-1 rounded">{tag}</span> : null)}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}