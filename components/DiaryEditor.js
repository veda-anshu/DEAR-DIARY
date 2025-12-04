import React from 'react';
import { Plus, History, Clock, Image, Save, Trash2 } from 'lucide-react';
import { formatDateToDDMMYYYY, formatTimeToHHMM } from '../utils/dateUtils';
import styles from '../styles/diary.module.css';

export default function DiaryEditor({
  currentEntry,
  setCurrentEntry,
  dateInput,
  setDateInput,
  currentDateTime,
  onSave,
  onNewEntry,
  onPastEntry,
  onImageUpload,
  onRemoveImage
}) {
  return (
    <div className={styles.editorCard}>
      <div className={styles.editorHeader}>
        <h2 className={styles.editorTitle}>
          {currentEntry.id ? 'Edit Entry' : (currentEntry.isPastEntry ? 'Past Entry' : 'Write Now')}
        </h2>
        <div className={styles.editorActions}>
          <button onClick={onNewEntry} className={styles.writeNowButton}>
            <Plus size={20} />
            Write Now
          </button>
          <button onClick={onPastEntry} className={styles.pastEntryButton}>
            <History size={20} />
            Past Entry
          </button>
        </div>
      </div>

      <div className={styles.editorContent}>
        {currentEntry.isPastEntry && (
          <div className={styles.pastEntryBanner}>
            <div className={styles.dateTimeInputs}>
              <div className={styles.inputGroup}>
                <label className={styles.label}>Date (DD/MM/YYYY) *</label>
                <input
                  type="text"
                  placeholder="e.g., 25/12/2024"
                  value={dateInput}
                  onChange={(e) => setDateInput(e.target.value)}
                  className={styles.input}
                />
              </div>
              <div className={styles.inputGroup}>
                <label className={styles.label}>Time (Optional)</label>
                <input
                  type="time"
                  value={currentEntry.time}
                  onChange={(e) => setCurrentEntry({ ...currentEntry, time: e.target.value })}
                  className={styles.input}
                />
              </div>
            </div>
          </div>
        )}

        {!currentEntry.isPastEntry && !currentEntry.id && (
          <div className={styles.currentTimeBanner}>
            <div className={styles.currentTimeInfo}>
              <Clock size={20} />
              <span>
                Writing at: {formatDateToDDMMYYYY(currentDateTime)} • {formatTimeToHHMM(currentDateTime)}
              </span>
            </div>
            <p className={styles.currentTimeHint}>
              Current date and time will be saved automatically
            </p>
          </div>
        )}

        <div className={styles.inputGroup}>
          <label className={styles.label}>Your thoughts...</label>
          <textarea
            value={currentEntry.text}
            onChange={(e) => setCurrentEntry({ ...currentEntry, text: e.target.value })}
            placeholder="Write about your day..."
            rows={12}
            className={styles.textarea}
          />
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.label}>Add Photos (Max 5)</label>
          <label className={styles.imageUploadArea}>
            <Image className={styles.uploadIcon} />
            <span>Click to upload images</span>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={onImageUpload}
              className={styles.fileInput}
            />
          </label>
        </div>

        {currentEntry.images.length > 0 && (
          <div className={styles.imageGrid}>
            {currentEntry.images.map((img, idx) => (
              <div key={idx} className={styles.imagePreview}>
                <img src={img} alt={`Upload ${idx + 1}`} className={styles.previewImage} />
                <button
                  onClick={() => onRemoveImage(idx)}
                  className={styles.removeImageButton}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}

        <button onClick={onSave} className={styles.saveButton}>
          <Save size={20} />
          Save Entry
        </button>
      </div>
    </div>
  );
}