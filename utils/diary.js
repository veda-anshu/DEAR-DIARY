// Diary operations
export const loadEntries = (username) => {
  try {
    const userEntriesKey = `diaryEntries_${username}`;
    const stored = localStorage.getItem(userEntriesKey);
    if (stored) {
      const loadedEntries = JSON.parse(stored);
      return loadedEntries.sort((a, b) => 
        new Date(b.date + ' ' + b.time) - new Date(a.date + ' ' + a.time)
      );
    }
    return [];
  } catch (error) {
    console.log('No existing entries found');
    return [];
  }
};

export const saveEntry = (entry, entries, username) => {
  try {
    let updatedEntries;
    if (entry.id) {
      updatedEntries = entries.map(e => 
        e.id === entry.id ? entry : e
      );
    } else {
      updatedEntries = [...entries, entry];
    }
    
    const userEntriesKey = `diaryEntries_${username}`;
    localStorage.setItem(userEntriesKey, JSON.stringify(updatedEntries));
    
    return {
      success: true,
      entries: updatedEntries.sort((a, b) => 
        new Date(b.date + ' ' + b.time) - new Date(a.date + ' ' + a.time)
      )
    };
  } catch (error) {
    return { success: false, message: 'Failed to save entry' };
  }
};

export const deleteEntry = (entryId, entries, username) => {
  try {
    const updatedEntries = entries.filter(e => e.id !== entryId);
    const userEntriesKey = `diaryEntries_${username}`;
    localStorage.setItem(userEntriesKey, JSON.stringify(updatedEntries));
    
    return { success: true, entries: updatedEntries };
  } catch (error) {
    return { success: false, message: 'Failed to delete entry' };
  }
};

export const exportEntries = (entries, username) => {
  const dataStr = JSON.stringify(entries, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `diary-backup-${username}-${new Date().toISOString().split('T')[0]}.json`;
  link.click();
  URL.revokeObjectURL(url);
};

export const importEntries = (file, username, callback) => {
  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const imported = JSON.parse(event.target.result);
      const userEntriesKey = `diaryEntries_${username}`;
      localStorage.setItem(userEntriesKey, JSON.stringify(imported));
      callback({ success: true, entries: imported });
    } catch (error) {
      callback({ success: false, message: 'Invalid file format' });
    }
  };
  reader.readAsText(file);
};