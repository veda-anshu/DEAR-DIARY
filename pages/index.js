import React, { useState, useEffect } from 'react';
import Auth from '../components/Auth';
import Header from '../components/Header';
import DiaryEditor from '../components/DiaryEditor';
import DiaryList from '../components/DiaryList';
import ExportModal from '../components/ExportModal';
import { checkAuth, logoutUser } from '../utils/auth';
import { loadEntries, saveEntry, deleteEntry, exportEntries, importEntries } from '../utils/diary';
import { formatTimeToHHMM, ddmmyyyyToYYYYMMDD, yyyymmddToDDMMYYYY } from '../utils/dateUtils';

const CustomModal = ({ config }) => {
  if (!config) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-[#FDFCF8] rounded-xl shadow-2xl p-8 max-w-sm w-full border border-[#EBE6DF] text-center transition-colors">
        <h3 className="text-lg font-serif font-semibold text-[#333333] mb-4 uppercase tracking-widest">{config.title}</h3>
        <p className="text-[#5C554B] text-sm mb-8">{config.message}</p>
        <div className="flex justify-center space-x-4">
          {config.type === 'confirm' && <button onClick={config.onCancel} type="button" className="text-xs uppercase tracking-widest text-[#8C8173] hover:text-[#333333] transition-colors">Cancel</button>}
          <button onClick={config.onConfirm} type="button" className="text-xs uppercase tracking-widest bg-[#333333] text-[#FDFCF8] px-6 py-2 rounded hover:bg-black transition-colors font-semibold">
            {config.type === 'alert' ? 'OK' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
};

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
  
  const [modalConfig, setModalConfig] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileList, setShowMobileList] = useState(false);

  const showAlert = (message, title = "Notice") => setModalConfig({ type: 'alert', title, message, onConfirm: () => setModalConfig(null) });
  const showConfirm = (message, onConfirm, title = "Confirm") => setModalConfig({ type: 'confirm', title, message, onConfirm: () => { onConfirm(); setModalConfig(null); }, onCancel: () => setModalConfig(null) });

  useEffect(() => {
    setIsClient(true);
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);

    setCurrentDateTime(new Date());
    const timer = setInterval(() => setCurrentDateTime(new Date()), 1000);
    const user = checkAuth();
    if (user) {
      setCurrentUser(user);
      setIsAuthenticated(true);
      loadEntries(user).then(data => setEntries(data));
    }
    
    return () => {
      clearInterval(timer);
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  useEffect(() => {
    const savedTheme = localStorage.getItem('diary_theme');
    if (savedTheme === 'dark') {
      document.body.classList.add('dark-mode');
    }
  }, []);

  if (!isClient) return null;

  const handleLogin = async (username) => {
    setCurrentUser(username);
    setIsAuthenticated(true);
    const data = await loadEntries(username);
    setEntries(data);
  };

  const handleLogout = () => {
    showConfirm('Close your diary?', () => {
      logoutUser();
      setCurrentUser(null);
      setIsAuthenticated(false);
      setEntries([]);
      handleNewEntry();
    }, "Logout");
  };

  const handleSaveEntry = async () => {
    if (!currentEntry.text || !currentEntry.text.trim()) return showAlert("You need to write something before saving!", "Empty Page");

    let entryDate = new Date().toISOString().split('T')[0];
    let entryTime = formatTimeToHHMM(new Date());

    if (currentEntry.isPastEntry) {
      if (!/^([01]\d|2[0-3]):([0-5]\d)$/.test(currentEntry.time)) return showAlert("Please enter a valid time (HH:MM).", "Format Error");
      entryTime = currentEntry.time;
      if (!/^(0[1-9]|[12]\d|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/.test(dateInput)) return showAlert("Please enter a valid date in DD/MM/YYYY format.", "Format Error");

      const [d, m, y] = dateInput.split('/').map(Number);
      const checkDate = new Date(y, m - 1, d);
      if (checkDate.getFullYear() !== y || checkDate.getMonth() !== m - 1 || checkDate.getDate() !== d || checkDate > new Date()) return showAlert("That date does not exist or is in the future.", "Format Error");
      entryDate = ddmmyyyyToYYYYMMDD(dateInput);
    }

    const entryToSave = { ...currentEntry, id: currentEntry.id || Date.now().toString(), date: entryDate, time: entryTime, text: currentEntry.text.trim() };
    const result = await saveEntry(entryToSave, entries, currentUser);
    
    if (result.success) {
      setEntries(result.entries);
      handleNewEntry();
      showAlert("Entry secured.", "Saved");
    } else {
      showAlert("Failed to save your entry to the cloud.", "Cloud Error");
    }
  };

  const handleDeleteEntry = async (id) => {
    const result = await deleteEntry(id, entries, currentUser);
    if (result.success) {
      setEntries(result.entries);
      if (currentEntry.id === id) handleNewEntry();
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + currentEntry.images.length > 5) return showAlert('Max 5 photos allowed per entry.', 'Limit Reached');
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
    <div className="min-h-screen flex flex-col bg-[#FDFCF8] text-[#333333] font-serif selection:bg-[#EAE4D9] transition-colors">
      <Header currentUser={currentUser} onLogout={handleLogout} onExport={() => setShowExportModal(true)} onImport={(e) => importEntries(e.target.files[0], currentUser, (res) => res.success ? setEntries(res.entries) : showAlert(res.message, "Import Error"))} />
      
      <div className="w-full max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-8 flex flex-col md:flex-row relative flex-1 transition-all" style={{ gap: sidebarWidth > 0 && !isMobile ? '2rem' : '0rem' }}>
        
        <div className={`${isMobile ? (showMobileList ? 'fixed inset-0 z-50 bg-[#FDFCF8] p-4 h-full overflow-hidden' : 'hidden') : 'relative h-full'}`}>
          <DiaryList 
            entries={entries} searchQuery={searchQuery} setSearchQuery={setSearchQuery} 
            onLoadEntry={handleLoadEntry} onDeleteEntry={handleDeleteEntry} 
            width={isMobile ? '100%' : sidebarWidth} onResize={setSidebarWidth} showConfirm={showConfirm}
            isMobile={isMobile} onCloseMobile={() => setShowMobileList(false)}
          />
        </div>
        
        <main className="flex-1 min-w-0 h-full flex flex-col transition-all overflow-y-auto pr-0 md:pr-4">
          {isMobile && (
            <button 
              onClick={() => setShowMobileList(true)} 
              className="w-full mb-6 py-3 text-xs tracking-widest uppercase font-semibold border border-[#EBE6DF] rounded-md text-[#5C554B] hover:bg-[#F4F1EA] transition-colors"
            >
              Open Archive
            </button>
          )}
          <DiaryEditor
            currentEntry={currentEntry} setCurrentEntry={setCurrentEntry} dateInput={dateInput} setDateInput={setDateInput} currentDateTime={currentDateTime}
            onSave={handleSaveEntry} onNewEntry={handleNewEntry} onPastEntry={handlePastEntry}
            onImageUpload={handleImageUpload} onRemoveImage={handleRemoveImage} showConfirm={showConfirm}
          />
        </main>
      </div>
      {showExportModal && <ExportModal entries={entries} onClose={() => setShowExportModal(false)} onExport={(e, f) => exportEntries(e, currentUser, f)} />}
      <CustomModal config={modalConfig} />
    </div>
  );
}
