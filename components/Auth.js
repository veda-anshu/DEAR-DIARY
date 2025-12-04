import React, { useState } from 'react';
import { Lock, User, Eye, EyeOff } from 'lucide-react';
import { registerUser, loginUser } from '../utils/auth';
import styles from '../styles/auth.module.css';

export default function Auth({ onLogin }) {
  const [authMode, setAuthMode] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const [credentials, setCredentials] = useState({ 
    username: '', 
    password: '', 
    confirmPassword: '' 
  });

  const handleRegister = () => {
    const result = registerUser(
      credentials.username, 
      credentials.password, 
      credentials.confirmPassword
    );
    
    if (result.success) {
      alert(result.message);
      setAuthMode('login');
      setCredentials({ username: credentials.username, password: '', confirmPassword: '' });
    } else {
      alert(result.message);
    }
  };

  const handleLogin = () => {
    const result = loginUser(credentials.username, credentials.password);
    
    if (result.success) {
      onLogin(result.username);
    } else {
      alert(result.message);
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <div className={styles.authHeader}>
          <div className={styles.iconWrapper}>
            <Lock size={40} />
          </div>
          <h1 className={styles.title}>My Private Diary</h1>
          <p className={styles.subtitle}>Your thoughts, securely stored</p>
        </div>

        <div className={styles.tabContainer}>
          <button
            onClick={() => setAuthMode('login')}
            className={`${styles.tab} ${authMode === 'login' ? styles.activeTab : ''}`}
          >
            Login
          </button>
          <button
            onClick={() => setAuthMode('register')}
            className={`${styles.tab} ${authMode === 'register' ? styles.activeTab : ''}`}
          >
            Register
          </button>
        </div>

        <div className={styles.formContainer}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Username</label>
            <div className={styles.inputWrapper}>
              <User className={styles.inputIcon} size={20} />
              <input
                type="text"
                value={credentials.username}
                onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                placeholder="Enter username"
                className={styles.input}
                onKeyPress={(e) => e.key === 'Enter' && (authMode === 'login' ? handleLogin() : handleRegister())}
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Password</label>
            <div className={styles.inputWrapper}>
              <Lock className={styles.inputIcon} size={20} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={credentials.password}
                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                placeholder="Enter password"
                className={styles.input}
                onKeyPress={(e) => e.key === 'Enter' && (authMode === 'login' ? handleLogin() : handleRegister())}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={styles.eyeButton}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {authMode === 'register' && (
            <div className={styles.inputGroup}>
              <label className={styles.label}>Confirm Password</label>
              <div className={styles.inputWrapper}>
                <Lock className={styles.inputIcon} size={20} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={credentials.confirmPassword}
                  onChange={(e) => setCredentials({ ...credentials, confirmPassword: e.target.value })}
                  placeholder="Confirm password"
                  className={styles.input}
                  onKeyPress={(e) => e.key === 'Enter' && handleRegister()}
                />
              </div>
            </div>
          )}

          <button
            onClick={authMode === 'login' ? handleLogin : handleRegister}
            className={styles.submitButton}
          >
            {authMode === 'login' ? 'Login' : 'Create Account'}
          </button>

          {authMode === 'register' && (
            <p className={styles.hint}>
              Password must be at least 6 characters long
            </p>
          )}
        </div>
      </div>
    </div>
  );
}