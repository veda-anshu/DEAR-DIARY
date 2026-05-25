import React, { useState } from 'react';
import { PenLine } from 'lucide-react';
import { registerUser, loginUser } from '../utils/auth';

export default function Auth({ onLogin }) {
  const [authMode, setAuthMode] = useState('login');
  const [credentials, setCredentials] = useState({ username: '', password: '', confirmPassword: '' });
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleAuth = (e) => {
    if (e) e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (credentials.username.length < 3) {
      setErrorMsg("Your Name must be at least 3 characters.");
      return;
    }
    if (credentials.password.length < 6) {
      setErrorMsg("Your Secret Key must be at least 6 characters.");
      return;
    }

    if (authMode === 'register' && credentials.password !== credentials.confirmPassword) {
      setErrorMsg("Secret Keys do not match.");
      return;
    }

    const action = authMode === 'login' 
      ? loginUser(credentials.username, credentials.password) 
      : registerUser(credentials.username, credentials.password, credentials.confirmPassword);
    
    if (action.success) {
      if (authMode === 'login') {
        onLogin(action.username); 
      } else {
        setSuccessMsg('Welcome. You may now open your diary.');
        setAuthMode('login');
        setCredentials({ username: credentials.username, password: '', confirmPassword: '' });
      }
    } else {
      setErrorMsg(action.message);
    }
  };

  const handleModeSwitch = (mode) => {
    setAuthMode(mode);
    setErrorMsg('');
    setSuccessMsg('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDFCF8] p-4 font-serif text-[#333333] transition-colors">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-12">
          <PenLine size={32} className="text-[#8C8173] mb-4" />
          <h1 className="text-3xl tracking-widest uppercase font-semibold mb-2">My Diary</h1>
          <p className="text-[#8C8173] italic">Put your thoughts to paper.</p>
        </div>

        <div className="flex space-x-6 justify-center mb-8 border-b border-[#EBE6DF] pb-2">
          <button type="button" onClick={() => handleModeSwitch('login')} className={`uppercase tracking-widest text-sm transition-colors ${authMode === 'login' ? 'text-[#333333] font-semibold' : 'text-[#D1CBC3] hover:text-[#8C8173]'}`}>Read</button>
          <button type="button" onClick={() => handleModeSwitch('register')} className={`uppercase tracking-widest text-sm transition-colors ${authMode === 'register' ? 'text-[#333333] font-semibold' : 'text-[#D1CBC3] hover:text-[#8C8173]'}`}>Begin</button>
        </div>

        <form onSubmit={handleAuth} className="space-y-6 font-sans">
          <input 
            type="text" 
            placeholder="Your Name" 
            value={credentials.username} 
            onChange={(e) => { setCredentials({ ...credentials, username: e.target.value }); setErrorMsg(''); }} 
            className="w-full bg-transparent border-b border-[#EBE6DF] focus:border-[#8C8173] outline-none py-2 text-[#333333] placeholder:text-[#D1CBC3] placeholder:font-serif placeholder:italic transition-colors" 
          />

          <input 
            type="password" 
            placeholder="Secret Key" 
            value={credentials.password} 
            onChange={(e) => { setCredentials({ ...credentials, password: e.target.value }); setErrorMsg(''); }} 
            className="w-full bg-transparent border-b border-[#EBE6DF] focus:border-[#8C8173] outline-none py-2 text-[#333333] placeholder:text-[#D1CBC3] placeholder:font-serif placeholder:italic transition-colors" 
          />

          {authMode === 'register' && (
            <input 
              type="password" 
              placeholder="Confirm Secret Key" 
              value={credentials.confirmPassword} 
              onChange={(e) => { setCredentials({ ...credentials, confirmPassword: e.target.value }); setErrorMsg(''); }} 
              className="w-full bg-transparent border-b border-[#EBE6DF] focus:border-[#8C8173] outline-none py-2 text-[#333333] placeholder:text-[#D1CBC3] placeholder:font-serif placeholder:italic transition-colors" 
            />
          )}

          <button type="submit" className="w-full pt-8 font-serif uppercase tracking-widest text-sm text-[#5C554B] hover:text-[#333333] transition-colors">
            {authMode === 'login' ? 'Unlock Diary' : 'Inscribe Name'}
          </button>

          {errorMsg && (
            <div className="text-[#8C8173] text-[10px] tracking-widest uppercase text-center mt-6 p-3 bg-[#F4F1EA] rounded-md border border-[#EBE6DF]">
              {errorMsg}
            </div>
          )}
          {successMsg && (
            <div className="text-[#5C554B] font-semibold text-[10px] tracking-widest uppercase text-center mt-6 p-3 bg-[#EAE4D9] rounded-md border border-[#EBE6DF]">
              {successMsg}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}