import { db } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export const checkAuth = () => {
  return localStorage.getItem('diaryAuthSession');
};

export const registerUser = async (username, password, confirmPassword) => {
  if (!username || !password) return { success: false, message: 'Please enter a name and secret key.' };
  if (username.length < 3) return { success: false, message: 'Name must be at least 3 characters.' };
  if (password.length < 6) return { success: false, message: 'Secret key must be at least 6 characters.' };
  if (password !== confirmPassword) return { success: false, message: 'Secret keys do not match.' };

  try {
    const userRef = doc(db, "users", username);
    const docSnap = await getDoc(userRef);

    if (docSnap.exists()) return { success: false, message: 'This name is already inscribed. Choose another.' };

    await setDoc(userRef, { password: btoa(password), createdAt: new Date().toISOString() });
    return { success: true, message: 'Registration successful!' };
  } catch (error) {
    return { success: false, message: 'Failed to connect to the cloud.' };
  }
};

export const loginUser = async (username, password) => {
  if (!username || !password) return { success: false, message: 'Please enter name and key.' };

  try {
    const userRef = doc(db, "users", username);
    const docSnap = await getDoc(userRef);

    if (!docSnap.exists()) return { success: false, message: 'This name is not inscribed yet.' };

    const userData = docSnap.data();
    let isValid = false;

    try { isValid = (atob(userData.password) === password); } 
    catch(e) { isValid = (userData.password === password); }

    if (!isValid) return { success: false, message: 'Incorrect secret key.' };

    localStorage.setItem('diaryAuthSession', username);
    return { success: true, message: 'Login successful!', username };
  } catch (error) {
    return { success: false, message: 'Failed to connect to the cloud.' };
  }
};

export const logoutUser = () => {
  localStorage.removeItem('diaryAuthSession');
};