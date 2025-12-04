// Authentication utilities
export const checkAuth = () => {
  const user = localStorage.getItem('currentUser');
  return user;
};

export const registerUser = (username, password, confirmPassword) => {
  if (!username || !password) {
    return { success: false, message: 'Please enter username and password!' };
  }

  if (username.length < 3) {
    return { success: false, message: 'Username must be at least 3 characters!' };
  }

  if (password.length < 6) {
    return { success: false, message: 'Password must be at least 6 characters!' };
  }

  if (password !== confirmPassword) {
    return { success: false, message: 'Passwords do not match!' };
  }

  const users = JSON.parse(localStorage.getItem('diaryUsers') || '{}');
  
  if (users[username]) {
    return { success: false, message: 'Username already exists! Please choose another.' };
  }

  users[username] = {
    password: btoa(password),
    createdAt: new Date().toISOString()
  };

  localStorage.setItem('diaryUsers', JSON.stringify(users));
  return { success: true, message: 'Registration successful!' };
};

export const loginUser = (username, password) => {
  if (!username || !password) {
    return { success: false, message: 'Please enter username and password!' };
  }

  const users = JSON.parse(localStorage.getItem('diaryUsers') || '{}');
  const user = users[username];

  if (!user || atob(user.password) !== password) {
    return { success: false, message: 'Invalid username or password!' };
  }

  localStorage.setItem('currentUser', username);
  return { success: true, message: 'Login successful!', username };
};

export const logoutUser = () => {
  localStorage.removeItem('currentUser');
};