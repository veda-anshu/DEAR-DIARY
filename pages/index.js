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
  const [sidebarWidth, setSidebarWidth] = useState(350);
  const [currentEntry, setCurrentEntry] = useState({ id: '', date: '', time: '', text: '', images: [], isPastEntry: false, tags: '' });
  
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
    if (window.confirm('Close your diary?')) {
      logoutUser();
      setCurrentUser(null);
      setIsAuthenticated(false);
      setEntries([]);
      handleNewEntry();
    }
  };

  const handleSaveEntry = () => {
    if (!currentEntry.text || !currentEntry.text.trim()) return window.alert("You need to write something before saving!");

    let entryDate = new Date().toISOString().split('T')[0];
    let entryTime = formatTimeToHHMM(new Date());

    if (currentEntry.isPastEntry) {
      if (!/^([01]\d|2[0-3]):([0-5]\d)$/.test(currentEntry.time)) return window.alert("Please enter a valid time (HH:MM).");
      entryTime = currentEntry.time;
      if (!/^(0[1-9]|[12]\d|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/.test(dateInput)) return window.alert("Please enter a valid date in DD/MM/YYYY format.");

      const [d, m, y] = dateInput.split('/').map(Number);
      const checkDate = new Date(y, m - 1, d);
      if (checkDate.getFullYear() !== y || checkDate.getMonth() !== m - 1 || checkDate.getDate() !== d || checkDate > new Date()) return window.alert("That date does not exist or is in the future.");
      entryDate = ddmmyyyyToYYYYMMDD(dateInput);
    }

    const entryToSave = { ...currentEntry, id: currentEntry.id || Date.now().toString(), date: entryDate, time: entryTime, text: currentEntry.text.trim() };
    const result = saveEntry(entryToSave, entries, currentUser);
    
    if (result.success) {
      setEntries(result.entries);
      handleNewEntry();
    } else {
      window.alert("Failed to save your entry.");
    }
  };

  const handleDeleteEntry = (id) => {
    const result = deleteEntry(id, entries, currentUser);
    if (result.success) {
      setEntries(result.entries);
      if (currentEntry.id === id) handleNewEntry();
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + currentEntry.images.length > 5) return window.alert('Max 5 photos allowed per entry.');
    Promise.all(files.map(file => new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(file);
    }))).then(images => setCurrentEntry(prev => ({ ...prev, images: [...prev.images, ...images] })));
  };

  const handleRemoveImage = (index) => setCurrentEntry(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));

  const handleLoadEntry = (entry) => {
    setCurrentEntry({ ...entry, images: entry.images || [], tags: entry.tags || '' });
    if (entry.isPastEntry || entry.date !== new Date().toISOString().split('T')[0]) {
      setDateInput(yyyymmddToDDMMYYYY(entry.date));
      setCurrentEntry(prev => ({ ...prev, isPastEntry: true }));
    } else setDateInput('');
  };

  const handleNewEntry = () => { setCurrentEntry({ id: '', date: '', time: '', text: '', images: [], isPastEntry: false, tags: '' }); setDateInput(''); };
  const handlePastEntry = () => { setCurrentEntry({ id: '', date: '', time: '', text: '', images: [], isPastEntry: true, tags: '' }); setDateInput(''); };

  if (!isAuthenticated) return <Auth onLogin={handleLogin} />;

  return (
    <div className="min-h-screen bg-[#FDFCF8] text-[#333333] font-serif selection:bg-[#EAE4D9] transition-colors">
      <Header currentUser={currentUser} onLogout={handleLogout} onExport={() => setShowExportModal(true)} onImport={(e) => importEntries(e.target.files[0], currentUser, (res) => res.success ? setEntries(loadEntries(currentUser)) : window.alert(res.message))} />
      
      <div className="max-w-7xl mx-auto px-4 py-8 flex relative h-[calc(100vh-80px)] transition-all" style={{ gap: sidebarWidth > 0 ? '2rem' : '0rem' }}>
        <DiaryList 
          entries={entries} searchQuery={searchQuery} setSearchQuery={setSearchQuery} 
          onLoadEntry={handleLoadEntry} onDeleteEntry={handleDeleteEntry} 
          width={sidebarWidth} onResize={setSidebarWidth} showConfirm={(msg, action) => { if(window.confirm(msg)) action(); }}
        />
        <main className="flex-1 min-w-0 transition-all overflow-y-auto pr-4">
          <DiaryEditor
            currentEntry={currentEntry} setCurrentEntry={setCurrentEntry} dateInput={dateInput} setDateInput={setDateInput} currentDateTime={currentDateTime}
            onSave={handleSaveEntry} onNewEntry={handleNewEntry} onPastEntry={handlePastEntry}
            onImageUpload={handleImageUpload} onRemoveImage={handleRemoveImage} showConfirm={(msg, action) => { if(window.confirm(msg)) action(); }}
          />
        </main>
      </div>
      {showExportModal && <ExportModal entries={entries} onClose={() => setShowExportModal(false)} onExport={(e, f) => exportEntries(e, currentUser, f)} />}
    </div>
  );
}