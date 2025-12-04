import React, { useState, useEffect } from 'react';
import Auth from '../components/Auth';
import Header from '../components/Header';
import DiaryEditor from '../components/DiaryEditor';
import DiaryList from '../components/DiaryList';
import { checkAuth, logoutUser } from '../utils/auth';
import { loadEntries, saveEntry, deleteEntry, exportEntries, importEntries } from '../utils/diary';
import { formatTimeToHHMM, ddmmyyyyToYYYYMMDD, yyyymmddToDDMMYYYY } from '../utils/dateUtils';
import styles from '../styles/diary.module.css';

export default function DiaryApp() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [entries, setEntries] = useState([]);
  const [currentEntry, setCurrentEntry] = useState({ 
    id: '', 
    date: '', 
    time: '',
    text: '', 
    images: [],
    isPastEntry: false
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [dateInput, setDateInput] = useState('');

  useEffect(() => {
    const user = checkAuth();
    if (user) {
      setCurrentUser(user);
      setIsAuthenticated(true);
    }
    setIsLoading(false);

    const timer = setInterval(() => setCurrentDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (isAuthenticated && currentUser) {
      const loaded = loadEntries(currentUser);
      setEntries(loaded);
    }
  }, [isAuthenticated, currentUser]);

  const handleLogin = (username) => {
    setCurrentUser(username);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      logoutUser();
      setCurrentUser(null);
      setIsAuthenticated(false);
      setEntries([]);
      setCurrentEntry({ id: '', date: '', time: '', text: '', images: [], isPastEntry: false });
    }
  };

  const handleSaveEntry = () => {
    if (!currentEntry.text) {
      alert('Please write something!');
      return;
    }

    if (currentEntry.isPastEntry && !dateInput) {
      alert('Please enter a date in DD/MM/YYYY format!');
      return;
    }

    if (currentEntry.isPastEntry) {
      const convertedDate = ddmmyyyyToYYYYMMDD(dateInput);
      if (!convertedDate) {
        alert('Invalid date format! Please use DD/MM/YYYY (e.g., 25/12/2024)');
        return;
      }
    }

    const now = new Date();
    let entryDate, entryTime;

    if (currentEntry.isPastEntry) {
      entryDate = ddmmyyyyToYYYYMMDD(dateInput);
      entryTime = currentEntry.time || '00:00';
    } else {
      entryDate = now.toISOString().split('T')[0];
      entryTime = formatTimeToHHMM(now);
    }

    const entryToSave = {
      ...currentEntry,
      id: currentEntry.id || `${Date.now()}-${Math.random()}`,
      date: entryDate,
      time: entryTime
    };

    const result = saveEntry(entryToSave, entries, currentUser);
    if (result.success) {
      setEntries(result.entries);
      setCurrentEntry({ id: '', date: '', time: '', text: '', images: [], isPastEntry: false });
      setDateInput('');
      alert('Entry saved successfully!');
    } else {
      alert(result.message);
    }
  };

  const handleDeleteEntry = (id) => {
    if (!confirm('Are you sure you want to delete this entry?')) return;

    const result = deleteEntry(id, entries, currentUser);
    if (result.success) {
      setEntries(result.entries);
      if (currentEntry.id === id) {
        setCurrentEntry({ id: '', date: '', time: '', text: '', images: '', isPastEntry: false });
        setDateInput('');
      }
      alert('Entry deleted successfully!');
    } else {
      alert(result.message);
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length + currentEntry.images.length > 5) {
      alert('Maximum 5 images per entry!');
      return;
    }

    const readers = files.map(file => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    });

    Promise.all(readers).then(images => {
      setCurrentEntry(prev => ({
        ...prev,
        images: [...prev.images, ...images]
      }));
    }).catch(error => {
      alert('Failed to upload images');
    });
  };

  const handleRemoveImage = (index) => {
    setCurrentEntry(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleLoadEntry = (entry) => {
    setCurrentEntry(entry);
    if (entry.isPastEntry) {
      setDateInput(yyyymmddToDDMMYYYY(entry.date));
    }
  };

  const handleNewEntry = () => {
    setCurrentEntry({ 
      id: '', 
      date: '', 
      time: '',
      text: '', 
      images: [],
      isPastEntry: false
    });
    setDateInput('');
  };

  const handlePastEntry = () => {
    setCurrentEntry({ 
      id: '', 
      date: '', 
      time: '12:00',
      text: '', 
      images: [],
      isPastEntry: true
    });
    setDateInput('');
  };

  const handleExport = () => {
    exportEntries(entries, currentUser);
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    importEntries(file, currentUser, (result) => {
      if (result.success) {
        const loaded = loadEntries(currentUser);
        setEntries(loaded);
        alert('Data imported successfully!');
      } else {
        alert(result.message);
      }
    });
  };

  if (isLoading) {
    return (
      <div className={styles.diaryContainer}>
        <div style={{ textAlign: 'center', paddingTop: '20vh' }}>
          <div style={{ fontSize: '1.25rem', color: '#6b7280' }}>Loading...</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Auth onLogin={handleLogin} />;
  }

  return (
    <div className={styles.diaryContainer}>
      <div className={styles.mainContent}>
        <Header
          currentUser={currentUser}
          currentDateTime={currentDateTime}
          onLogout={handleLogout}
          onExport={handleExport}
          onImport={handleImport}
        />

        <div className={styles.gridContainer}>
          <DiaryEditor
            currentEntry={currentEntry}
            setCurrentEntry={setCurrentEntry}
            dateInput={dateInput}
            setDateInput={setDateInput}
            currentDateTime={currentDateTime}
            onSave={handleSaveEntry}
            onNewEntry={handleNewEntry}
            onPastEntry={handlePastEntry}
            onImageUpload={handleImageUpload}
            onRemoveImage={handleRemoveImage}
          />

          <DiaryList
            entries={entries}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onLoadEntry={handleLoadEntry}
            onDeleteEntry={handleDeleteEntry}
          />
        </div>
      </div>
    </div>
  );
}
