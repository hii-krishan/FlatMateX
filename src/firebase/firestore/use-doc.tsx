'use client';

import { useState, useEffect } from 'react';
import { onSnapshot, type DocumentReference, type DocumentData } from 'firebase/firestore';
import type { FirestoreDocument } from '@/lib/types';

export function useDoc<T extends DocumentData>(
  docRef: DocumentReference<T> | null
) {
  const [data, setData] = useState<FirestoreDocument<T> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!docRef) {
      setLoading(false);
      setData(null);
      return;
    }
    setLoading(true);

    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          setData({ ...snapshot.data(), id: snapshot.id });
        } else {
          setData(null);
        }
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching document:", err);
        setError(err);
        setLoading(false);
      }
    );

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [docRef]);

  return { data, loading, error };
}
