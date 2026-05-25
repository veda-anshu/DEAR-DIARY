export const checkAuth = () => {
  return localStorage.getItem('diaryAuthSession');
};

export const registerUser = (username, password, confirmPassword) => {
  if (!username || !password) return { success: false, message: 'Please enter a name and secret key.' };
  if (username.length < 3) return { success: false, message: 'Name must be at least 3 characters.' };
  if (password.length < 6) return { success: false, message: 'Secret key must be at least 6 characters.' };
  if (password !== confirmPassword) return { success: false, message: 'Secret keys do not match.' };

  const users = JSON.parse(localStorage.getItem('diaryUsers') || '{}');
  if (users[username]) return { success: false, message: 'This name is already inscribed. Choose another.' };

  users[username] = {
    password: btoa(password),
    createdAt: new Date().toISOString()
  };
  localStorage.setItem('diaryUsers', JSON.stringify(users));
  return { success: true, message: 'Registration successful!' };
};

export const loginUser = (username, password) => {
  if (!username || !password) return { success: false, message: 'Please enter name and key.' };

  const users = JSON.parse(localStorage.getItem('diaryUsers') || '{}');
  const user = users[username];

  if (!user) return { success: false, message: 'This name is not inscribed yet.' };

  let isValid = false;
  if (typeof user === 'string') {
     isValid = (user === password);
  } else if (user.password) {
     try { isValid = (atob(user.password) === password); } 
     catch(e) { isValid = (user.password === password); }
  }

  if (!isValid) return { success: false, message: 'Incorrect secret key.' };

  localStorage.setItem('diaryAuthSession', username);
  return { success: true, message: 'Login successful!', username };
};

export const logoutUser = () => {
  localStorage.removeItem('diaryAuthSession');
};