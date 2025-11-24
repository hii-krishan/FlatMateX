'use client';

import { ReactNode } from 'react';
import { initializeFirebase } from './index';
import { FirebaseProvider, type FirebaseContextValue } from './provider';

// Initialize Firebase on the client. This happens once per browser session.
const firebaseInstance = initializeFirebase();

export function FirebaseClientProvider({ children }: { children: ReactNode }) {
  // The value is effectively memoized by being defined at the module level.
  return (
    <FirebaseProvider value={firebaseInstance as FirebaseContextValue}>
      {children}
    </FirebaseProvider>
  );
}
