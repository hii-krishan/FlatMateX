
'use client';

import { useState, useEffect } from 'react';
import { onSnapshot, type Query, type DocumentData, type QuerySnapshot } from 'firebase/firestore';
import type { FirestoreDocument } from '@/lib/types';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

interface UseCollectionOptions {
  orderBy?: string;
  direction?: 'asc' | 'desc';
}

export function useCollection<T extends DocumentData>(
  query: Query<T> | null,
  options?: UseCollectionOptions
) {
  const [data, setData] = useState<FirestoreDocument<T>[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!query) {
      setLoading(false);
      setData(null);
      return;
    }
    setLoading(true);

    const unsubscribe = onSnapshot(
      query,
      (snapshot: QuerySnapshot<T>) => {
        const docs = snapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id,
        }));
        setData(docs);
        setLoading(false);
      },
      (err) => {
        const permissionError = new FirestorePermissionError({
            path: query.path,
            operation: 'list',
        });
        errorEmitter.emit('permission-error', permissionError);
        setError(permissionError);
        setLoading(false);
      }
    );

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [JSON.stringify(query)]); // Simple serialization for dependency array

  return { data, loading, error };
}
