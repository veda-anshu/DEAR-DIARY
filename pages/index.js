import React, { useState, useEffect } from 'react';
import Auth from '../components/Auth';
import Header from '../components/Header';
import DiaryEditor from '../components/DiaryEditor';
import DiaryList from '../components/DiaryList';
import ExportModal from '../components/ExportModal';
import { checkAuth, logoutUser } from '../utils/auth';
import { loadEntries, saveEntry, deleteEntry, exportEntries, importEntries } from '../utils/diary';
import { formatTimeToHHMM, ddmmyyyyToYYYYMMDD, yyyymmddToDDMMYYYY } from '../utils/dateUtils';

export default function DiaryApp() {
  const [isClient, setIsClient] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [entries, setEntries] = useState([]);
  const [currentEntry, setCurrentEntry] = useState({ 
    id: '', date: '', time: '', text: '', images: [], isPastEntry: false, 
    mood: 'neutral', tags: '' // Added Mood and Tags
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [currentDateTime, setCurrentDateTime] = useState(null);
  const [dateInput, setDateInput] = useState('');
  const [showExportModal, setShowExportModal] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setCurrentDateTime(new Date());
    const timer = setInterval(() => setCurrentDateTime(new Date()), 1000);
    
    const user = checkAuth();
    if (user) {
      setCurrentUser(user);
      setIsAuthenticated(true);
      setEntries(loadEntries(user));
    }
    return () => clearInterval(timer);
  }, []);

  if (!isClient) return null;

  const handleLogin = (username) => {
    setCurrentUser(username);
    setIsAuthenticated(true);
    setEntries(loadEntries(username));
  };

  const handleLogout = () => {
    if (confirm('Close your diary?')) {
      logoutUser();
      setCurrentUser(null);
      setIsAuthenticated(false);
      setEntries([]);
      handleNewEntry();
    }
  };

  const handleSaveEntry = () => {
    // 1. Check if the entry is empty
    if (!currentEntry.text || !currentEntry.text.trim()) {
      alert("You need to write something before saving!");
      return;
    }

    let entryDate = new Date().toISOString().split('T')[0];
    let entryTime = formatTimeToHHMM(new Date());

    // 2. Perform Strict Validation if it's a Past Entry
    if (currentEntry.isPastEntry) {
      const timeValue = currentEntry.time || '12:00';
      
      // Validate Time (HH:MM format, max 23:59)
      const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
      if (!timeRegex.test(timeValue)) {
        alert("Please enter a valid time between 00:00 and 23:59.");
        return;
      }
      entryTime = timeValue;

      // Validate Date Format (DD/MM/YYYY)
      const dateRegex = /^(0[1-9]|[12]\d|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;
      if (!dateRegex.test(dateInput)) {
        alert("Please enter a valid date in DD/MM/YYYY format.");
        return;
      }

      // Validate Real Calendar Dates (e.g. Catch February 30th)
      const parts = dateInput.split('/');
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1; // JS months are 0-11
      const year = parseInt(parts[2], 10);
      const checkDate = new Date(year, month, day);
      
      if (checkDate.getFullYear() !== year || checkDate.getMonth() !== month || checkDate.getDate() !== day) {
         alert("That date does not exist on the calendar.");
         return;
      }

      // Prevent Future Dates
      if (checkDate > new Date()) {
         alert("You cannot log a diary entry for the future!");
         return;
      }

      entryDate = ddmmyyyyToYYYYMMDD(dateInput);
    }

    const entryToSave = {
      ...currentEntry,
      id: currentEntry.id || Date.now().toString(),
      date: entryDate,
      time: entryTime,
      text: currentEntry.text.trim()
    };

    const result = saveEntry(entryToSave, entries, currentUser);
    if (result.success) {
      setEntries(result.entries);
      handleNewEntry();
    } else {
      alert("Failed to save: " + result.message);
    }
  };

  const handleDeleteEntry = (id) => {
    if (!confirm('Discard this entry?')) return;
    const result = deleteEntry(id, entries, currentUser);
    if (result.success) {
      setEntries(result.entries);
      if (currentEntry.id === id) handleNewEntry();
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + currentEntry.images.length > 5) return alert('Max 5 photos allowed.');

    Promise.all(files.map(file => new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(file);
    }))).then(images => {
      setCurrentEntry(prev => ({ ...prev, images: [...prev.images, ...images] }));
    });
  };

  const handleRemoveImage = (index) => {
    setCurrentEntry(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
  };

  const handleLoadEntry = (entry) => {
    setCurrentEntry({ ...entry, images: entry.images || [] });
    if (entry.isPastEntry || entry.date !== new Date().toISOString().split('T')[0]) {
      setDateInput(yyyymmddToDDMMYYYY(entry.date));
      setCurrentEntry(prev => ({ ...prev, isPastEntry: true }));
    } else {
      setDateInput('');
    }
  };

  const handleNewEntry = () => {
    setCurrentEntry({ id: '', date: '', time: '', text: '', images: [], isPastEntry: false });
    setDateInput('');
  };

  const handlePastEntry = () => {
    setCurrentEntry({ id: '', date: '', time: '', text: '', images: [], isPastEntry: true });
    setDateInput('');
  };

  const executeExport = (entriesToExport, format) => {
    exportEntries(entriesToExport, currentUser, format);
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    importEntries(file, currentUser, (result) => {
      if (result.success) setEntries(loadEntries(currentUser));
      else alert(result.message);
    });
  };

  if (!isAuthenticated) return <Auth onLogin={handleLogin} />;

  return (
    <div className="min-h-screen bg-[#FDFCF8] text-[#333333] font-serif selection:bg-[#EAE4D9]">
      <Header 
        currentUser={currentUser} 
        currentDateTime={currentDateTime} 
        onLogout={handleLogout} 
        onExport={() => setShowExportModal(true)} 
        onImport={handleImport} 
      />
      
      <div className="max-w-6xl mx-auto px-4 py-8 md:py-12 flex flex-col md:flex-row gap-12">
        <aside className="md:w-1/3 shrink-0 h-[600px] md:h-[calc(100vh-8rem)]">
          <DiaryList entries={entries} searchQuery={searchQuery} setSearchQuery={setSearchQuery} onLoadEntry={handleLoadEntry} onDeleteEntry={handleDeleteEntry} />
        </aside>
        
        <main className="md:w-2/3 flex-1">
          <DiaryEditor
            currentEntry={currentEntry} setCurrentEntry={setCurrentEntry}
            dateInput={dateInput} setDateInput={setDateInput}
            currentDateTime={currentDateTime}
            onSave={handleSaveEntry} 
            onNewEntry={handleNewEntry}
            onPastEntry={handlePastEntry}
            onImageUpload={handleImageUpload} onRemoveImage={handleRemoveImage}
          />
        </main>
      </div>

      {showExportModal && (
        <ExportModal 
          entries={entries} 
          onClose={() => setShowExportModal(false)} 
          onExport={executeExport} 
        />
      )}
    </div>
  );
}