import React from 'react';
import { Search, Clock, Image, Trash2 } from 'lucide-react';
import { yyyymmddToDDMMYYYY } from '../utils/dateUtils';
import styles from '../styles/diary.module.css';

export default function DiaryList({
  entries,
  searchQuery,
  setSearchQuery,
  onLoadEntry,
  onDeleteEntry
}) {
  const filteredEntries = entries.filter(entry => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const entryDate = yyyymmddToDDMMYYYY(entry.date).toLowerCase();
    return entry.text.toLowerCase().includes(query) || 
           entryDate.includes(query) ||
           entry.date.includes(query);
  });

  return (
    <div className={styles.listCard}>
      <h2 className={styles.listTitle}>
        Past Entries ({entries.length})
      </h2>
      
      <div className={styles.searchContainer}>
        <div className={styles.searchWrapper}>
          <Search className={styles.searchIcon} size={20} />
          <input
            type="text"
            placeholder="Search by date or keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>
      </div>

      {filteredEntries.length === 0 ? (
        <p className={styles.emptyMessage}>
          {searchQuery ? 'No entries found' : 'No entries yet. Start writing!'}
        </p>
      ) : (
        <div className={styles.entriesList}>
          {filteredEntries.map((entry) => (
            <div
              key={entry.id}
              className={styles.entryCard}
              onClick={() => onLoadEntry(entry)}
            >
              <div className={styles.entryHeader}>
                <div>
                  <div className={styles.entryDate}>
                    {yyyymmddToDDMMYYYY(entry.date)}
                  </div>
                  <div className={styles.entryTime}>
                    <Clock size={12} />
                    {entry.time}
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteEntry(entry.id);
                  }}
                  className={styles.deleteButton}
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <p className={styles.entryPreview}>
                {entry.text}
              </p>
              {entry.images.length > 0 && (
                <div className={styles.imageCount}>
                  <Image size={14} />
                  {entry.images.length} photo{entry.images.length > 1 ? 's' : ''}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}