import React from 'react';
import { Calendar, Clock, User, LogOut } from 'lucide-react';
import { formatDateToDDMMYYYY, formatTimeToHHMM } from '../utils/dateUtils';
import styles from '../styles/diary.module.css';

export default function Header({ currentUser, currentDateTime, onLogout, onExport, onImport }) {
  return (
    <header className={styles.header}>
      <div className={styles.headerTop}>
        <div>
          <h1 className={styles.headerTitle}>
            <Calendar className={styles.headerIcon} />
            My Daily Diary
          </h1>
          <p className={styles.headerSubtitle}>
            <User size={16} />
            Welcome, {currentUser}!
          </p>
        </div>
        <div className={styles.dateTimeDisplay}>
          <div className={styles.dateDisplay}>
            <Calendar size={24} />
            {formatDateToDDMMYYYY(currentDateTime)}
          </div>
          <div className={styles.timeDisplay}>
            <Clock size={20} />
            {formatTimeToHHMM(currentDateTime)}
          </div>
        </div>
      </div>
      <div className={styles.headerActions}>
        <button onClick={onExport} className={styles.exportButton}>
          Export
        </button>
        <label className={styles.importButton}>
          Import
          <input
            type="file"
            accept=".json"
            onChange={onImport}
            className={styles.fileInput}
          />
        </label>
        <button onClick={onLogout} className={styles.logoutButton}>
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </header>
  );
}