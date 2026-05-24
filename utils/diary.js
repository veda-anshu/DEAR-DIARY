// A safety net to prevent any bad dates from crashing the app
const safeGetTime = (entry) => {
  try {
    if (!entry || !entry.date) return 0;
    const timeStr = entry.time || '00:00';
    const parsed = new Date(`${entry.date}T${timeStr}:00`).getTime();
    return isNaN(parsed) ? 0 : parsed;
  } catch (e) {
    return 0;
  }
};

export const loadEntries = (username) => {
  try {
    const userEntriesKey = `diaryEntries_${username}`;
    const stored = localStorage.getItem(userEntriesKey);
    
    if (stored) {
      const loadedEntries = JSON.parse(stored);
      if (!Array.isArray(loadedEntries)) return [];
      return loadedEntries.sort((a, b) => safeGetTime(b) - safeGetTime(a));
    }
    return [];
  } catch (error) {
    console.error('Failed to load entries:', error);
    return [];
  }
};

export const saveEntry = (entry, entries, username) => {
  try {
    const safeEntries = Array.isArray(entries) ? entries : [];
    let updatedEntries;
    
    // THE FIX: We actually check if the entry exists in our list first
    const exists = safeEntries.some(e => e.id === entry.id);
    
    if (exists) {
      // It exists, so we update the old entry
      updatedEntries = safeEntries.map(e => e.id === entry.id ? entry : e);
    } else {
      // It does not exist, so we append the brand-new entry
      updatedEntries = [...safeEntries, entry];
    }
    
    const sortedEntries = updatedEntries.sort((a, b) => safeGetTime(b) - safeGetTime(a));
    
    const userEntriesKey = `diaryEntries_${username}`;
    localStorage.setItem(userEntriesKey, JSON.stringify(sortedEntries));
    
    return { success: true, entries: sortedEntries };
  } catch (error) {
    console.error('Save failed:', error);
    return { success: false, message: 'Failed to save entry.' };
  }
};

export const deleteEntry = (entryId, entries, username) => {
  try {
    const safeEntries = Array.isArray(entries) ? entries : [];
    const updatedEntries = safeEntries.filter(e => e.id !== entryId);
    
    const userEntriesKey = `diaryEntries_${username}`;
    localStorage.setItem(userEntriesKey, JSON.stringify(updatedEntries));
    
    return { success: true, entries: updatedEntries };
  } catch (error) {
    return { success: false, message: 'Failed to delete entry.' };
  }
};

export const exportEntries = (entriesToExport, username, format = 'json') => {
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `Volume-I-${username}-${timestamp}`;

  if (format === 'json') {
    const dataStr = JSON.stringify(entriesToExport, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    triggerDownload(dataBlob, `${filename}.json`);
    
  } else if (format === 'txt') {
    let textContent = `VOLUME I. - Author: ${username}\n`;
    textContent += `Exported on: ${new Date().toLocaleDateString()}\n`;
    textContent += `=========================================\n\n`;

    entriesToExport.forEach(entry => {
      const displayDate = entry.date ? entry.date.split('-').reverse().join('/') : 'Unknown';
      textContent += `Date: ${displayDate} at ${entry.time || '12:00'}\n`;
      textContent += `-----------------------------------------\n`;
      textContent += `${entry.text}\n\n`;
      if (entry.images && entry.images.length > 0) {
         textContent += `[Contains ${entry.images.length} attached photo(s)]\n\n`;
      }
      textContent += `=========================================\n\n`;
    });

    const dataBlob = new Blob([textContent], { type: 'text/plain' });
    triggerDownload(dataBlob, `${filename}.txt`);

  } else if (format === 'html') {
    // Generates a beautiful HTML document with embedded Base64 images
    let htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Volume I. - ${username}</title>
        <style>
          body { font-family: Georgia, serif; background-color: #FDFCF8; color: #333333; max-width: 800px; margin: 0 auto; padding: 40px 20px; line-height: 1.8; }
          .header { text-align: center; border-bottom: 2px solid #EBE6DF; padding-bottom: 30px; margin-bottom: 50px; }
          h1 { text-transform: uppercase; letter-spacing: 4px; font-size: 28px; font-weight: normal; margin-bottom: 10px; }
          .meta { color: #8C8173; font-family: -apple-system, sans-serif; font-size: 14px; font-style: italic; }
          .entry { margin-bottom: 60px; padding-bottom: 40px; border-bottom: 1px solid #EBE6DF; }
          .entry-date { font-family: -apple-system, sans-serif; font-size: 14px; font-weight: bold; color: #8C8173; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 15px; }
          .entry-text { font-size: 18px; white-space: pre-wrap; margin-bottom: 25px; }
          .image-grid { display: flex; flex-wrap: wrap; gap: 15px; }
          .image-grid img { max-width: 300px; max-height: 300px; object-fit: cover; border-radius: 8px; border: 1px solid #EBE6DF; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Volume I.</h1>
          <div class="meta">Author: ${username} &nbsp;&nbsp;|&nbsp;&nbsp; Exported on: ${new Date().toLocaleDateString()}</div>
        </div>
    `;

    entriesToExport.forEach(entry => {
      const displayDate = entry.date ? entry.date.split('-').reverse().join('/') : 'Unknown';
      htmlContent += `
        <div class="entry">
          <div class="entry-date">${displayDate} at ${entry.time || '12:00'}</div>
          <div class="entry-text">${entry.text}</div>
      `;
      
      if (entry.images && entry.images.length > 0) {
        htmlContent += `<div class="image-grid">`;
        entry.images.forEach(img => {
          htmlContent += `<img src="${img}" alt="Diary photo" />`;
        });
        htmlContent += `</div>`;
      }
      htmlContent += `</div>`;
    });

    htmlContent += `</body></html>`;

    const dataBlob = new Blob([htmlContent], { type: 'text/html' });
    triggerDownload(dataBlob, `${filename}.html`);
  }
};

// Helper function to trigger the browser download
const triggerDownload = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

export const importEntries = (file, username, callback) => {
  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const imported = JSON.parse(event.target.result);
      if (!Array.isArray(imported)) throw new Error("Not a valid array");
      
      const userEntriesKey = `diaryEntries_${username}`;
      const currentStored = localStorage.getItem(userEntriesKey);
      let currentEntries = currentStored ? JSON.parse(currentStored) : [];
      if (!Array.isArray(currentEntries)) currentEntries = [];

      // Create a Map to merge entries without duplicating IDs
      const entryMap = new Map();
      
      // Load current entries first
      currentEntries.forEach(entry => entryMap.set(entry.id, entry));
      
      // Load imported entries (this will harmlessly overwrite exact duplicates)
      imported.forEach(entry => entryMap.set(entry.id, entry));
      
      const mergedEntries = Array.from(entryMap.values());

      // Re-sort everything to keep the timeline perfect
      const safeGetTime = (entry) => {
        try {
          if (!entry || !entry.date) return 0;
          const timeStr = entry.time || '00:00';
          const parsed = new Date(`${entry.date}T${timeStr}:00`).getTime();
          return isNaN(parsed) ? 0 : parsed;
        } catch (e) {
          return 0;
        }
      };

      const sortedEntries = mergedEntries.sort((a, b) => safeGetTime(b) - safeGetTime(a));
      
      localStorage.setItem(userEntriesKey, JSON.stringify(sortedEntries));
      callback({ success: true, entries: sortedEntries });
    } catch (error) {
      callback({ success: false, message: 'Invalid file format. Could not import.' });
    }
  };
  reader.readAsText(file);
};