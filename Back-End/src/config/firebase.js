const { initializeApp } = require('firebase/app');
const { getStorage } = require('firebase/storage');

// Validate required environment variables
const requiredEnvVars = [
  'FIREBASE_API_KEY',
  'FIREBASE_AUTH_DOMAIN',
  'FIREBASE_PROJECT_ID',
  'FIREBASE_STORAGE_BUCKET',
  'FIREBASE_MESSAGING_SENDER_ID',
  'FIREBASE_APP_ID'
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

// Ensure storage bucket has the correct format
const storageBucket = process.env.FIREBASE_STORAGE_BUCKET.includes('appspot.com') 
  ? process.env.FIREBASE_STORAGE_BUCKET 
  : `${process.env.FIREBASE_PROJECT_ID}.appspot.com`;

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: storageBucket,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID || undefined
};

console.log('Firebase Config:', {
  ...firebaseConfig,
  apiKey: '***' // Hide sensitive data in logs
});

let app;
let storage;

try {
  // Initialize Firebase
  app = initializeApp(firebaseConfig);
  storage = getStorage(app);
  
  // Test storage connection
  console.log('Firebase Storage initialized with bucket:', storage.bucket);
} catch (error) {
  console.error('Error initializing Firebase:', error);
  throw error;
}

module.exports = { storage, app };
