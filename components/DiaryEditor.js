import React, { useState } from 'react';
import { PenTool, Clock, Trash2, Image as ImageIcon, X, Download } from 'lucide-react';
import { formatDateToDDMMYYYY, formatTimeToHHMM } from '../utils/dateUtils';

export default function DiaryEditor({ currentEntry, setCurrentEntry, dateInput, setDateInput, currentDateTime, onSave, onNewEntry, onPastEntry, onImageUpload, onRemoveImage }) {
  const [expandedImage, setExpandedImage] = useState(null);

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

  // NEW: Auto-formats the time input to add the colon as you type
  const handleTimeChange = (e) => {
    let input = e.target.value.replace(/\D/g, ''); // Remove non-numeric characters
    if (input.length > 4) input = input.substring(0, 4); // Max 4 digits
    
    let formattedTime = '';
    if (input.length > 0) formattedTime = input.substring(0, 2);
    if (input.length > 2) formattedTime += ':' + input.substring(2, 4);
    
    setCurrentEntry({ ...currentEntry, time: formattedTime });
  };

  return (
    <div className="h-full flex flex-col relative">
      <div className="flex items-center justify-between border-b border-[#EBE6DF] pb-4 mb-6">
        <div className="flex space-x-4">
          <button type="button" onClick={onNewEntry} className={`text-sm italic tracking-wide transition-colors ${!currentEntry.isPastEntry && !currentEntry.id ? 'text-[#333333] font-semibold' : 'text-[#8C8173] hover:text-[#333333]'}`}>
            Today
          </button>
          <button type="button" onClick={onPastEntry} className={`text-sm italic tracking-wide transition-colors ${currentEntry.isPastEntry ? 'text-[#333333] font-semibold' : 'text-[#8C8173] hover:text-[#333333]'}`}>
            Past Date
          </button>
        </div>
        <button type="button" onClick={onSave} className="flex items-center space-x-2 text-sm uppercase tracking-widest text-[#5C554B] hover:text-black transition-colors px-3 py-1">
          <PenTool size={14} /> <span>Save</span>
        </button>
      </div>

      <div className="flex-1 flex flex-col space-y-6">
        {currentEntry.isPastEntry ? (
          <div className="flex space-x-6 text-[#8C8173] font-sans">
            <input 
              type="text" 
              placeholder="DD/MM/YYYY" 
              value={dateInput} 
              onChange={handleDateChange} 
              className="bg-transparent border-b border-[#EBE6DF] focus:border-[#8C8173] outline-none py-1 text-lg w-32 transition-colors" 
            />
            {/* CHANGED: Swapped native time picker for clean text input */}
            <input 
              type="text" 
              placeholder="HH:MM" 
              value={currentEntry.time || ''} 
              onChange={handleTimeChange} 
              className="bg-transparent border-b border-[#EBE6DF] focus:border-[#8C8173] outline-none py-1 text-lg w-20 transition-colors" 
            />
          </div>
        ) : !currentEntry.id && (
          <div className="flex items-center space-x-2 text-[#8C8173] italic">
            <Clock size={14} />
            <span>{currentDateTime ? formatDateToDDMMYYYY(currentDateTime) : ''} at {currentDateTime ? formatTimeToHHMM(currentDateTime) : ''}</span>
          </div>
        )}

        <textarea
          value={currentEntry.text}
          onChange={(e) => setCurrentEntry({ ...currentEntry, text: e.target.value })}
          placeholder="Dear diary..."
          className="w-full flex-1 bg-transparent resize-none outline-none text-lg md:text-xl leading-relaxed text-[#333333] placeholder:text-[#D1CBC3]"
        />

        {currentEntry.images?.length > 0 && (
          <div className="flex gap-4 overflow-x-auto pb-4">
            {currentEntry.images.map((img, idx) => (
              <div key={idx} className="relative group shrink-0">
                <img 
                  src={img} 
                  alt="Attached memory" 
                  onClick={() => setExpandedImage(img)}
                  className="w-24 h-24 object-cover rounded-md border border-[#EBE6DF] shadow-sm cursor-pointer hover:opacity-80 transition-opacity" 
                />
                <button 
                  type="button" 
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm('Are you sure you want to remove this photo from the entry?')) {
                      onRemoveImage(idx);
                    }
                  }} 
                  className="absolute -top-2 -right-2 p-1.5 bg-white text-[#8C8173] hover:text-red-800 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="pt-4 border-t border-[#EBE6DF]">
          <label className="inline-flex items-center space-x-2 text-[#8C8173] hover:text-[#333333] cursor-pointer transition-colors text-sm uppercase tracking-widest">
            <ImageIcon size={16} />
            <span>Attach Photo</span>
            <input type="file" accept="image/*" multiple onChange={onImageUpload} className="hidden" />
          </label>
        </div>
      </div>

      {expandedImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 cursor-pointer"
          onClick={() => setExpandedImage(null)}
        >
          <div className="absolute top-6 right-6 flex space-x-4">
            <button 
              className="p-3 bg-black/40 text-white/80 hover:text-white hover:bg-black/60 rounded-full transition-all backdrop-blur-md"
              onClick={(e) => handleDownloadImage(e, expandedImage)}
              title="Download Image"
            >
              <Download size={24} />
            </button>
            <button 
              className="p-3 bg-black/40 text-white/80 hover:text-white hover:bg-black/60 rounded-full transition-all backdrop-blur-md"
              onClick={() => setExpandedImage(null)}
              title="Close"
            >
              <X size={24} />
            </button>
          </div>
          
          <img 
            src={expandedImage} 
            alt="Expanded memory" 
            className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl cursor-default"
            onClick={(e) => e.stopPropagation()} 
          />
        </div>
      )}
    </div>
  );
}