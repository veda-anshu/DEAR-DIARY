import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAHSFUnCMlYBlmTL-2QMq-fuIQ_cASGeSA",
  authDomain: "dear-diary-dd01a.firebaseapp.com",
  projectId: "dear-diary-dd01a",
  storageBucket: "dear-diary-dd01a.firebasestorage.app",
  messagingSenderId: "301223856182",
  appId: "1:301223856182:web:86c82db0377a443f5b3097",
  measurementId: "G-9HQJWKPWDE"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);