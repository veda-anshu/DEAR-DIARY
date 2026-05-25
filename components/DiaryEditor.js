import React, { useState, useEffect, useRef } from 'react';
import { PenTool, Clock, Trash2, Image as ImageIcon, X, Download, CheckCircle2 } from 'lucide-react';
import { formatDateToDDMMYYYY, formatTimeToHHMM } from '../utils/dateUtils';

export default function DiaryEditor({ currentEntry, setCurrentEntry, dateInput, setDateInput, currentDateTime, onSave, onNewEntry, onPastEntry, onImageUpload, onRemoveImage, showConfirm }) {
  const [expandedImage, setExpandedImage] = useState(null);
  const [saveStatus, setSaveStatus] = useState('');
  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [currentEntry.text]);

  useEffect(() => {
    if (!currentEntry.id && currentEntry.text) {
      const timer = setTimeout(() => {
        localStorage.setItem('diary_draft', JSON.stringify(currentEntry));
        setSaveStatus('Draft saved');
        setTimeout(() => setSaveStatus(''), 3000);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [currentEntry.text, currentEntry.id]);

  useEffect(() => {
    if (!currentEntry.id && !currentEntry.text) {
      const draft = localStorage.getItem('diary_draft');
      if (draft) setCurrentEntry(JSON.parse(draft));
    }
  }, []);

  const handleDownloadImage = (e, imageSrc) => {
    e.stopPropagation();
    const link = document.createElement('a');
    link.href = imageSrc;
    link.download = `diary-photo-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDateChange = (e) => {
    let input = e.target.value.replace(/\D/g, '');
    if (input.length > 8) input = input.substring(0, 8);
    let formattedDate = '';
    if (input.length > 0) formattedDate = input.substring(0, 2);
    if (input.length > 2) formattedDate += '/' + input.substring(2, 4);
    if (input.length > 4) formattedDate += '/' + input.substring(4, 8);
    setDateInput(formattedDate);
  };

  const handleTimeChange = (e) => {
    let input = e.target.value.replace(/\D/g, '');
    if (input.length > 4) input = input.substring(0, 4);
    let formattedTime = '';
    if (input.length > 0) formattedTime = input.substring(0, 2);
    if (input.length > 2) formattedTime += ':' + input.substring(2, 4);
    setCurrentEntry({ ...currentEntry, time: formattedTime });
  };

  return (
    <div className="h-full flex flex-col relative">
      <div className="flex items-center justify-between border-b border-[#EBE6DF] pb-4 mb-4 md:mb-6">
        <div className="flex space-x-4">
          <button type="button" onClick={onNewEntry} className={`text-sm italic tracking-wide transition-colors ${!currentEntry.isPastEntry && !currentEntry.id ? 'text-[#333333] font-semibold' : 'text-[#8C8173] hover:text-[#333333]'}`}>Today</button>
          <button type="button" onClick={onPastEntry} className={`text-sm italic tracking-wide transition-colors ${currentEntry.isPastEntry ? 'text-[#333333] font-semibold' : 'text-[#8C8173] hover:text-[#333333]'}`}>Past Date</button>
        </div>
        <div className="flex items-center space-x-4">
          {saveStatus && <span className="text-[10px] md:text-xs italic text-[#8C8173] flex items-center space-x-1 animate-pulse"><CheckCircle2 size={12} /> <span className="hidden md:inline">{saveStatus}</span></span>}
          <button type="button" onClick={() => { onSave(); localStorage.removeItem('diary_draft'); }} className="flex items-center space-x-2 text-sm uppercase tracking-widest text-[#5C554B] hover:text-[#333333] transition-colors"><PenTool size={14} /> <span>Save</span></button>
        </div>
      </div>
      <div className="flex-1 flex flex-col space-y-6">
        {currentEntry.id ? (
          <div className="flex items-center space-x-2 text-[#8C8173] italic text-sm md:text-base">
            <Clock size={14} />
            <span> {currentEntry.date ? currentEntry.date.split('-').reverse().join('/') : ''}{' '} at {currentEntry.time || ''} </span>
          </div>
        ) : currentEntry.isPastEntry ? (
          <div className="flex flex-wrap gap-4 text-[#8C8173] font-sans">
            <input type="text" placeholder="DD/MM/YYYY" value={dateInput} onChange={handleDateChange} className="bg-transparent border-b border-[#EBE6DF] focus:border-[#8C8173] outline-none py-1 text-base md:text-lg w-28 transition-colors" />
            <input type="text" placeholder="HH:MM" value={currentEntry.time || ''} onChange={handleTimeChange} className="bg-transparent border-b border-[#EBE6DF] focus:border-[#8C8173] outline-none py-1 text-base md:text-lg w-16 transition-colors" />
          </div>
        ) : (
          <div className="flex items-center space-x-2 text-[#8C8173] italic text-sm md:text-base">
            <Clock size={14} />
            <span>{currentDateTime ? formatDateToDDMMYYYY(currentDateTime) : ''}{' '}at{' '}{currentDateTime ? formatTimeToHHMM(currentDateTime) : ''} </span>
          </div>
        )}

        <textarea ref={textareaRef} value={currentEntry.text} onChange={(e) => setCurrentEntry({ ...currentEntry, text: e.target.value })} placeholder="Dear diary..." className="w-full bg-transparent resize-none outline-none text-lg md:text-xl leading-relaxed text-[#333333] placeholder:text-[#D1CBC3] overflow-hidden min-h-[200px] md:min-h-[300px]" />
        <div className="pt-4 border-t border-[#EBE6DF]">
          <label className="block text-[10px] md:text-xs uppercase tracking-widest text-[#8C8173] mb-3">Tags (Separate with space)</label>
          <input type="text" placeholder="#academics #badminton" value={currentEntry.tags || ''} onChange={(e) => setCurrentEntry({ ...currentEntry, tags: e.target.value })} className="w-full bg-transparent border-b border-[#EBE6DF] focus:border-[#8C8173] outline-none py-1 text-sm text-[#333333] transition-colors" />
        </div>

        {currentEntry.images?.length > 0 && (
          <div className="flex gap-4 overflow-x-auto pb-4">{currentEntry.images.map((img, idx) => (
            <div key={idx} className="relative group shrink-0">
              <img src={img} alt="Attached memory" onClick={() => setExpandedImage(img)} className="w-20 h-20 md:w-24 md:h-24 object-cover rounded-md border border-[#EBE6DF] shadow-sm cursor-pointer hover:opacity-80 transition-opacity" />
              <button type="button" onClick={(e) => { e.stopPropagation(); showConfirm('Remove this photo from entry?', () => onRemoveImage(idx), 'Delete Photo'); }} className="absolute -top-2 -right-2 p-1.5 bg-[#FDFCF8] text-[#8C8173] hover:text-red-700 rounded-full shadow-md transition-opacity"><Trash2 size={12} /></button>
            </div>
          ))}</div>
        )}

        <div className="pt-4 border-t border-[#EBE6DF] pb-8 md:pb-0">
          <label className="inline-flex items-center space-x-2 text-[#8C8173] hover:text-[#333333] cursor-pointer transition-colors text-xs md:text-sm uppercase tracking-widest"><ImageIcon size={16} /> <span>Attach Photo</span><input type="file" accept="image/*" multiple onChange={onImageUpload} className="hidden" /></label>
        </div>
      </div>

      {expandedImage && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 cursor-pointer" onClick={() => setExpandedImage(null)}>
          <div className="absolute top-6 right-6 flex space-x-4">
            <button className="p-3 bg-black/40 text-white/80 hover:text-white hover:bg-black/60 rounded-full transition-all backdrop-blur-md" onClick={(e) => handleDownloadImage(e, expandedImage)} title="Download"><Download size={24} /></button>
            <button className="p-3 bg-black/40 text-white/80 hover:text-white hover:bg-black/60 rounded-full transition-all backdrop-blur-md" onClick={() => setExpandedImage(null)} title="Close"><X size={24} /></button>
          </div>
          <img src={expandedImage} alt="Expanded memory" className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl cursor-default" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </div>
  );
}