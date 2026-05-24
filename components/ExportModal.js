import React, { useState } from 'react';
import { X, CheckSquare, Square, Download, FileText, Database, BookOpen, Search } from 'lucide-react';
import { yyyymmddToDDMMYYYY } from '../utils/dateUtils';

export default function ExportModal({ entries, onClose, onExport }) {
  const [mode, setMode] = useState('all');
  const [format, setFormat] = useState('html'); 
  const [selectedIds, setSelectedIds] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const handleToggleSelect = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleExport = () => {
    const entriesToExport = mode === 'all'
      ? entries
      : entries.filter(e => selectedIds.includes(e.id));

    if (entriesToExport.length === 0) {
      alert('Please select at least one entry to export.');
      return;
    }

    onExport(entriesToExport, format);
    onClose();
  };

  // Filter entries based on the search query
  const filteredEntries = entries.filter(entry => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const textMatch = (entry.text || '').toLowerCase().includes(query);
    const dateMatch = entry.date ? yyyymmddToDDMMYYYY(entry.date).includes(query) : false;
    return textMatch || dateMatch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#FDFCF8] rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] font-sans text-[#333333]">
        
        <div className="flex justify-between items-center p-6 border-b border-[#EBE6DF]">
          <h2 className="text-xl font-serif font-semibold tracking-wide uppercase text-[#333333]">Export Pages</h2>
          <button onClick={onClose} className="text-[#8C8173] hover:text-[#333333] transition-colors"><X size={24} /></button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          <div className="mb-8">
            <label className="block text-xs font-semibold uppercase tracking-widest text-[#8C8173] mb-3">What to export?</label>
            <div className="flex space-x-4">
              <button onClick={() => setMode('all')} className={`flex-1 py-2.5 rounded-md border text-sm font-medium transition-colors ${mode === 'all' ? 'border-[#8C8173] bg-[#EBE6DF] text-[#333333]' : 'border-[#EBE6DF] text-[#8C8173] hover:border-[#8C8173]'}`}>All Entries ({entries.length})</button>
              <button onClick={() => setMode('select')} className={`flex-1 py-2.5 rounded-md border text-sm font-medium transition-colors ${mode === 'select' ? 'border-[#8C8173] bg-[#EBE6DF] text-[#333333]' : 'border-[#EBE6DF] text-[#8C8173] hover:border-[#8C8173]'}`}>Selected Entries</button>
            </div>
          </div>

          {mode === 'select' && (
            <div className="mb-8">
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#D1CBC3]" size={16} />
                <input
                  type="text"
                  placeholder="Search to select specific entries..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white border border-[#EBE6DF] rounded-md focus:border-[#8C8173] outline-none text-sm placeholder:text-[#D1CBC3] transition-colors"
                />
              </div>
              <div className="border border-[#EBE6DF] rounded-md h-56 overflow-y-auto p-2 bg-white shadow-inner scrollbar-thin">
                {filteredEntries.map(entry => (
                  <div key={entry.id} onClick={() => handleToggleSelect(entry.id)} className="flex items-start space-x-3 p-3 hover:bg-[#FDFCF8] cursor-pointer rounded border-b border-[#EBE6DF] last:border-0 transition-colors">
                    <div className="mt-0.5 text-[#8C8173]">
                      {selectedIds.includes(entry.id) ? <CheckSquare size={18} className="text-[#333333]" /> : <Square size={18} />}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-[#333333]">
                        {entry.date ? yyyymmddToDDMMYYYY(entry.date) : 'Unknown Date'}
                        {entry.images?.length > 0 && <span className="ml-2 text-[#8C8173] text-xs font-normal">({entry.images.length} photos)</span>}
                      </div>
                      <div className="text-xs text-[#8C8173] line-clamp-1 mt-1">{entry.text}</div>
                    </div>
                  </div>
                ))}
                {filteredEntries.length === 0 && <p className="text-center text-[#8C8173] italic mt-20 text-sm">No entries match your search.</p>}
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest text-[#8C8173] mb-3">Format</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button onClick={() => setFormat('html')} className={`py-4 flex flex-col items-center justify-center rounded-md border transition-colors ${format === 'html' ? 'border-[#8C8173] bg-[#EBE6DF] text-[#333333]' : 'border-[#EBE6DF] text-[#8C8173] hover:border-[#8C8173]'}`}>
                <BookOpen size={24} className="mb-2" />
                <span className="text-sm font-medium">Visual Diary</span>
                <span className="text-xs mt-1 text-center px-2 opacity-80">(Includes Photos)</span>
              </button>
              <button onClick={() => setFormat('txt')} className={`py-4 flex flex-col items-center justify-center rounded-md border transition-colors ${format === 'txt' ? 'border-[#8C8173] bg-[#EBE6DF] text-[#333333]' : 'border-[#EBE6DF] text-[#8C8173] hover:border-[#8C8173]'}`}>
                <FileText size={24} className="mb-2" />
                <span className="text-sm font-medium">Text File</span>
                <span className="text-xs mt-1 text-center px-2 opacity-80">(Text Only)</span>
              </button>
              <button onClick={() => setFormat('json')} className={`py-4 flex flex-col items-center justify-center rounded-md border transition-colors ${format === 'json' ? 'border-[#8C8173] bg-[#EBE6DF] text-[#333333]' : 'border-[#EBE6DF] text-[#8C8173] hover:border-[#8C8173]'}`}>
                <Database size={24} className="mb-2" />
                <span className="text-sm font-medium">Data Backup</span>
                <span className="text-xs mt-1 text-center px-2 opacity-80">(For Importing)</span>
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-[#EBE6DF] bg-[#FDFCF8]">
          <button onClick={handleExport} className="w-full flex items-center justify-center space-x-2 bg-[#333333] text-[#FDFCF8] py-3.5 rounded-md hover:bg-black transition-colors uppercase tracking-widest text-sm font-semibold shadow-md">
            <Download size={18} />
            <span>Download {mode === 'select' && selectedIds.length > 0 ? `(${selectedIds.length} items)` : ''}</span>
          </button>
        </div>
      </div>
    </div>
  );
}