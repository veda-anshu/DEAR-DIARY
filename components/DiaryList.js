import React, { useState } from 'react';
import { Search, Trash2, Image as ImageIcon, Sparkles, BarChart3 } from 'lucide-react';
import { yyyymmddToDDMMYYYY } from '../utils/dateUtils';

export default function DiaryList({ entries, searchQuery, setSearchQuery, onLoadEntry, onDeleteEntry, width, onResize, showConfirm }) {
  const [showStats, setShowStats] = useState(false);

  const filteredEntries = entries.filter(entry => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const textMatch = (entry.text || '').toLowerCase().includes(query);
    const dateMatch = entry.date ? yyyymmddToDDMMYYYY(entry.date).includes(query) : false;
    const tagMatch = (entry.tags || '').toLowerCase().split(' ').some(tag => tag.includes(query));
    return textMatch || dateMatch || tagMatch;
  });

  const handleMouseDown = (e) => {
    e.preventDefault();
    const handleMouseMove = (moveEvent) => {
      let newWidth = moveEvent.clientX;
      if (newWidth < 100) newWidth = 0; // Snap to completely closed (Zen Mode)
      if (newWidth > window.innerWidth / 2) newWidth = window.innerWidth / 2;
      onResize(newWidth);
    };
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const isHidden = width === 0;

  return (
    <div 
      className={`h-full flex flex-col relative shrink-0 transition-opacity ${isHidden ? 'border-r-0' : 'border-r border-[#EBE6DF] pr-4'}`} 
      style={{ width: `${width}px` }}
    >
      {/* Draggable Handle - Stays visible even when width is 0 */}
      <div 
        onMouseDown={handleMouseDown}
        className="absolute -right-2 top-0 w-4 h-full cursor-col-resize hover:bg-[#8C8173]/20 transition-colors z-20"
      />
      
      {!isHidden && (
        <>
          <div className="flex justify-between mb-4 border-b border-[#EBE6DF] pb-4 overflow-hidden whitespace-nowrap">
            <button onClick={() => entries.length > 0 && onLoadEntry(entries[Math.floor(Math.random() * entries.length)])} className="flex items-center space-x-2 text-[#5C554B] hover:text-[#333333] transition-colors text-xs uppercase tracking-widest font-semibold">
              <Sparkles size={14} /> <span>Flashback</span>
            </button>
            <button onClick={() => setShowStats(!showStats)} className="flex items-center space-x-2 text-[#5C554B] hover:text-[#333333] transition-colors text-xs uppercase tracking-widest font-semibold">
              <BarChart3 size={14} /> <span>Stats</span>
            </button>
          </div>

          {showStats && (
            <div className="mb-6 p-4 bg-[#F4F1EA] rounded-lg text-xs text-[#5C554B]">
              <p className="mb-2 font-bold uppercase tracking-widest text-[10px]">Top Tags</p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(entries.reduce((acc, e) => { (e.tags || '').split(' ').filter(t => t).forEach(t => acc[t] = (acc[t] || 0) + 1); return acc; }, {}))
                  .sort((a, b) => b[1] - a[1]).slice(0, 5).map(([tag, count]) => (
                    <button key={tag} onClick={() => setSearchQuery(tag)} className="bg-[#EBE6DF] px-2 py-1 rounded hover:bg-[#D1CBC3] transition-colors">{tag} ({count})</button>
                ))}
              </div>
            </div>
          )}

          <div className="mb-6 relative">
            <Search className="absolute left-0 top-1/2 -translate-y-1/2 text-[#D1CBC3]" size={16} />
            <input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-6 py-2 bg-transparent border-b border-[#EBE6DF] focus:border-[#8C8173] outline-none text-sm placeholder:text-[#D1CBC3] font-sans" />
          </div>
          
          <div className="flex-1 overflow-y-auto space-y-1">
            {filteredEntries.map((entry) => (
              <div key={entry.id} onClick={() => onLoadEntry(entry)} className="p-4 rounded-lg hover:bg-[#F4F1EA] cursor-pointer transition-colors group">
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="font-semibold text-[#333333] text-sm uppercase">{entry.date ? yyyymmddToDDMMYYYY(entry.date) : 'Unknown'}</h3>
                  <div className="flex items-center space-x-2">
                     {entry.images?.length > 0 && <span className="text-[#8C8173]"><ImageIcon size={12} /></span>}
                     <button type="button" onClick={(e) => { e.stopPropagation(); showConfirm('Permanently delete this entry?', () => onDeleteEntry(entry.id), 'Delete Page'); }} className="text-[#D1CBC3] hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={14} /></button>
                  </div>
                </div>
                <p className="text-[#5C554B] text-sm line-clamp-2">{entry.text}</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {(entry.tags || '').split(' ').map((tag, i) => tag ? <span key={i} className="text-[#8C8173] text-[10px] font-sans italic border border-[#EBE6DF] px-1 rounded">{tag}</span> : null)}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}