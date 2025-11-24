
'use client';

import { initializeApp, getApp, getApps, type FirebaseOptions } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

// Explicitly import the hooks and providers to be re-exported
import { FirebaseProvider, useFirebase, useFirebaseApp, useAuth, useFirestore } from './provider';
import { FirebaseClientProvider } from './client-provider';
import { useUser } from './auth/use-user';
import { useCollection } from './firestore/use-collection';
import { useDoc } from './firestore/use-doc';

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

function initializeFirebase() {
  if (getApps().length) {
    const app = getApp();
    const auth = getAuth(app);
    const firestore = getFirestore(app);
    return { firebaseApp: app, auth, firestore };
  }

  const firebaseApp = initializeApp(firebaseConfig);
  const auth = getAuth(firebaseApp);
  const firestore = getFirestore(firebaseApp);

  // In a development environment, you might want to connect to emulators
  if (process.env.NODE_ENV === 'development') {
    // It's often better to check if a specific env var is set for emulators
    // e.g., if (process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true')
    // connectAuthEmulator(auth, 'http://localhost:9099');
    // connectFirestoreEmulator(firestore, 'localhost', 8080);
  }

  return { firebaseApp, auth, firestore };
}

// Re-export everything
export {
  initializeFirebase,
  FirebaseProvider,
  FirebaseClientProvider,
  useFirebase,
  useFirebaseApp,
  useAuth,
  useFirestore,
  useUser,
  useCollection,
  useDoc,
  firebaseConfig,
};
