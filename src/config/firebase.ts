import { initializeApp } from 'firebase/app';
import { getDatabase, connectDatabaseEmulator } from 'firebase/database';
import { getAnalytics } from 'firebase/analytics';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCq_Y1NlXxCUPl1S__I_lzuCwl6hbFU5Ig",
  authDomain: "dtx-dandiya-70009.firebaseapp.com",
  projectId: "dtx-dandiya-70009",
  storageBucket: "dtx-dandiya-70009.firebasestorage.app",
  messagingSenderId: "1076264572586",
  appId: "1:1076264572586:web:2584848166107a1470a2d3",
  measurementId: "G-TTLSG9PW7W",
  databaseURL: "https://dtx-dandiya-70009-default-rtdb.firebaseio.com"
};

let app;
let database;
let analyticsInstance;
let authInstance;

try {
  // Initialize Firebase
  app = initializeApp(firebaseConfig);
  
  // Initialize Realtime Database
  database = getDatabase(app);
  authInstance = getAuth(app);
  
  // Initialize Analytics only in browser environment
  if (typeof window !== 'undefined') {
    analyticsInstance = getAnalytics(app);
  }

  // Use the local emulator only when it has been explicitly enabled.
  // Normal local development connects to the configured Firebase database.
  if (import.meta.env.DEV && import.meta.env.VITE_USE_FIREBASE_EMULATOR === 'true') {
    connectDatabaseEmulator(database, 'localhost', 9000);
  }
} catch (error) {
  console.error('Error initializing Firebase:', error);
  throw error;
}

// Export instances
export const db = database;
export const analytics = analyticsInstance;
export const auth = authInstance;
