import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyBDgnBJQpV8yPUz2iF-eQNKbeO5He4VhvI",
  authDomain: "war-clash-f339c.firebaseapp.com",
  projectId: "war-clash-f339c",
  storageBucket: "war-clash-f339c.firebasestorage.app",
  messagingSenderId: "288462814307",
  appId: "1:288462814307:web:d7c5e116ddf2274fa54c56",
  measurementId: "G-P44QEN5R0D"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Initialize Cloud Storage and get a reference to the service
export const storage = getStorage(app);

// Enable offline persistence for better reliability
try {
  // Esta línea ayuda con algunos errores de Firestore
  console.log('Firebase initialized successfully');
} catch (error) {
  console.error('Error initializing Firebase:', error);
}

// Import utility for handling Firestore errors
import('../utils/firebaseUtils');

export default app;
