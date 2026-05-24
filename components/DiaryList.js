import React from 'react';
import { Search, Trash2, Image as ImageIcon } from 'lucide-react';
import { yyyymmddToDDMMYYYY } from '../utils/dateUtils';

export default function DiaryList({ entries, searchQuery, setSearchQuery, onLoadEntry, onDeleteEntry }) {
  const filteredEntries = entries.filter(entry => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const textMatch = (entry.text || '').toLowerCase().includes(query);
    const dateMatch = entry.date ? yyyymmddToDDMMYYYY(entry.date).includes(query) : false;
    // Now searches across all tags
    const tagMatch = (entry.tags || '').toLowerCase().split(' ').some(tag => tag.includes(query));
    return textMatch || dateMatch || tagMatch;
  });

  return (
    <div className="h-full flex flex-col border-r border-[#EBE6DF] pr-4 md:pr-8">
      <div className="mb-6 relative">
        <Search className="absolute left-0 top-1/2 -translate-y-1/2 text-[#D1CBC3]" size={16} />
        <input type="text" placeholder="Search entries or tags or date..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-6 py-2 bg-transparent border-b border-[#EBE6DF] focus:border-[#8C8173] outline-none text-sm placeholder:text-[#D1CBC3] font-sans transition-colors" />
      </div>

      <div className="flex-1 overflow-y-auto space-y-1 pr-2 scrollbar-thin">
        {filteredEntries.length === 0 ? (
          <p className="text-[#8C8173] italic mt-8 text-center text-sm">No pages written yet.</p>
        ) : (
          filteredEntries.map((entry) => (
            <div key={entry.id} onClick={() => onLoadEntry(entry)} className="group flex flex-col p-4 rounded-lg hover:bg-[#F4F1EA] cursor-pointer transition-colors">
              <div className="flex justify-between items-baseline mb-1">
                <h3 className="font-semibold text-[#333333] tracking-wide text-sm uppercase">{entry.date ? yyyymmddToDDMMYYYY(entry.date) : 'Unknown Date'}</h3>
                <div className="flex items-center space-x-3">
                  {entry.images?.length > 0 && <span className="text-[#8C8173]"><ImageIcon size={12} /></span>}
                  <span className="text-xs text-[#8C8173] font-sans">{entry.time || ''}</span>
                  <button type="button" onClick={(e) => { e.stopPropagation(); if (window.confirm('Delete this page?')) onDeleteEntry(entry.id); }} className="text-[#D1CBC3] hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={14} /></button>
                </div>
              </div>
              <p className="text-[#5C554B] text-sm line-clamp-2 leading-relaxed">{entry.text}</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {(entry.tags || '').split(' ').map((tag, i) => tag ? <span key={i} className="text-[#8C8173] text-[10px] font-sans italic border border-[#EBE6DF] px-1 rounded">{tag}</span> : null)}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}