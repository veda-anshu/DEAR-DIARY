import React, { useState, useEffect } from 'react';
import { Calendar, Image, Save, Trash2, Plus, Search, Clock, History } from 'lucide-react';

export default function DiaryApp() {
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
    loadEntries();
    const timer = setInterval(() => setCurrentDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDateToDDMMYYYY = (date) => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatTimeToHHMM = (date) => {
    const d = new Date(date);
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const ddmmyyyyToYYYYMMDD = (ddmmyyyy) => {
    const parts = ddmmyyyy.split('/');
    if (parts.length === 3 && parts[0].length === 2 && parts[1].length === 2 && parts[2].length === 4) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return '';
  };

  const yyyymmddToDDMMYYYY = (yyyymmdd) => {
    if (!yyyymmdd) return '';
    const parts = yyyymmdd.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return yyyymmdd;
  };

  const loadEntries = () => {
    try {
      const stored = localStorage.getItem('diaryEntries');
      if (stored) {
        const loadedEntries = JSON.parse(stored);
        setEntries(loadedEntries.sort((a, b) => 
          new Date(b.date + ' ' + b.time) - new Date(a.date + ' ' + a.time)
        ));
      }
    } catch (error) {
      console.log('No existing entries found');
    }
    setIsLoading(false);
  };

  const saveEntry = () => {
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

    try {
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

      let updatedEntries;
      if (currentEntry.id) {
        updatedEntries = entries.map(e => 
          e.id === currentEntry.id ? entryToSave : e
        );
      } else {
        updatedEntries = [...entries, entryToSave];
      }
      
      localStorage.setItem('diaryEntries', JSON.stringify(updatedEntries));
      
      setEntries(updatedEntries.sort((a, b) => 
        new Date(b.date + ' ' + b.time) - new Date(a.date + ' ' + a.time)
      ));
      setCurrentEntry({ id: '', date: '', time: '', text: '', images: [], isPastEntry: false });
      setDateInput('');
      alert('Entry saved successfully!');
    } catch (error) {
      alert('Failed to save entry. Please try again.');
      console.error('Save error:', error);
    }
  };

  const deleteEntry = (id) => {
    if (!confirm('Are you sure you want to delete this entry?')) return;

    try {
      const updatedEntries = entries.filter(e => e.id !== id);
      localStorage.setItem('diaryEntries', JSON.stringify(updatedEntries));
      
      setEntries(updatedEntries);
      if (currentEntry.id === id) {
        setCurrentEntry({ id: '', date: '', time: '', text: '', images: [], isPastEntry: false });
        setDateInput('');
      }
      alert('Entry deleted successfully!');
    } catch (error) {
      alert('Failed to delete entry.');
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
      console.error('Image upload error:', error);
    });
  };

  const removeImage = (index) => {
    setCurrentEntry(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const loadEntry = (entry) => {
    setCurrentEntry(entry);
    if (entry.isPastEntry) {
      setDateInput(yyyymmddToDDMMYYYY(entry.date));
    }
  };

  const createNewEntry = () => {
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

  const createPastEntry = () => {
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

  const filteredEntries = entries.filter(entry => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const entryDate = yyyymmddToDDMMYYYY(entry.date).toLowerCase();
    return entry.text.toLowerCase().includes(query) || 
           entryDate.includes(query) ||
           entry.date.includes(query);
  });

  const exportData = () => {
    const dataStr = JSON.stringify(entries, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `diary-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const importData = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target.result);
        localStorage.setItem('diaryEntries', JSON.stringify(imported));
        setEntries(imported.sort((a, b) => 
          new Date(b.date + ' ' + b.time) - new Date(a.date + ' ' + a.time)
        ));
        alert('Data imported successfully!');
      } catch (error) {
        alert('Failed to import data. Invalid file format.');
      }
    };
    reader.readAsText(file);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading your diary...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4">
      <div className="max-w-6xl mx-auto">
        <header className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 flex items-center gap-3">
                <Calendar className="text-purple-600" />
                My Daily Diary
              </h1>
              <p className="text-gray-600 mt-2">Capture your thoughts and memories</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-semibold text-gray-800 flex items-center gap-2 justify-end">
                <Calendar size={24} className="text-purple-600" />
                {formatDateToDDMMYYYY(currentDateTime)}
              </div>
              <div className="text-lg text-gray-600 flex items-center gap-2 justify-end mt-1">
                <Clock size={20} className="text-blue-600" />
                {formatTimeToHHMM(currentDateTime)}
              </div>
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button
              onClick={exportData}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
            >
              Export
            </button>
            <label className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition cursor-pointer text-sm">
              Import
              <input
                type="file"
                accept=".json"
                onChange={importData}
                className="hidden"
              />
            </label>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Editor Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold text-gray-800">
                  {currentEntry.id ? 'Edit Entry' : (currentEntry.isPastEntry ? 'Past Entry' : 'Write Now')}
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={createNewEntry}
                    className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition"
                  >
                    <Plus size={20} />
                    Write Now
                  </button>
                  <button
                    onClick={createPastEntry}
                    className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition"
                  >
                    <History size={20} />
                    Past Entry
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {currentEntry.isPastEntry && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Date (DD/MM/YYYY) *
                        </label>
                        <input
                          type="text"
                          placeholder="e.g., 25/12/2024"
                          value={dateInput}
                          onChange={(e) => setDateInput(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Time (Optional)
                        </label>
                        <input
                          type="time"
                          value={currentEntry.time}
                          onChange={(e) => setCurrentEntry({ ...currentEntry, time: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {!currentEntry.isPastEntry && !currentEntry.id && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-green-800">
                      <Clock size={20} />
                      <span className="font-medium">
                        Writing at: {formatDateToDDMMYYYY(currentDateTime)} • {formatTimeToHHMM(currentDateTime)}
                      </span>
                    </div>
                    <p className="text-sm text-green-700 mt-1">
                      Current date and time will be saved automatically
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your thoughts...
                  </label>
                  <textarea
                    value={currentEntry.text}
                    onChange={(e) => setCurrentEntry({ ...currentEntry, text: e.target.value })}
                    placeholder="Write about your day..."
                    rows={12}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Add Photos (Max 5)
                  </label>
                  <label className="flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 rounded-lg p-4 cursor-pointer hover:border-purple-500 transition">
                    <Image className="text-gray-400" />
                    <span className="text-gray-600">Click to upload images</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {currentEntry.images.length > 0 && (
                  <div className="grid grid-cols-3 gap-4">
                    {currentEntry.images.map((img, idx) => (
                      <div key={idx} className="relative group">
                        <img
                          src={img}
                          alt={`Upload ${idx + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <button
                          onClick={() => removeImage(idx)}
                          className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <button
                  onClick={saveEntry}
                  className="w-full flex items-center justify-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition font-semibold"
                >
                  <Save size={20} />
                  Save Entry
                </button>
              </div>
            </div>
          </div>

          {/* Entries List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                Past Entries ({entries.length})
              </h2>
              
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search by date or keyword..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              {filteredEntries.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  {searchQuery ? 'No entries found' : 'No entries yet. Start writing!'}
                </p>
              ) : (
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {filteredEntries.map((entry) => (
                    <div
                      key={entry.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition cursor-pointer"
                      onClick={() => loadEntry(entry)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="font-semibold text-purple-600">
                            {yyyymmddToDDMMYYYY(entry.date)}
                          </div>
                          <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                            <Clock size={12} />
                            {entry.time}
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteEntry(entry.id);
                          }}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <p className="text-gray-700 text-sm line-clamp-3">
                        {entry.text}
                      </p>
                      {entry.images.length > 0 && (
                        <div className="flex items-center gap-1 mt-2 text-gray-500 text-xs">
                          <Image size={14} />
                          {entry.images.length} photo{entry.images.length > 1 ? 's' : ''}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}