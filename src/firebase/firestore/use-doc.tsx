
'use client';
    
import { useState, useEffect } from 'react';
import {
  DocumentReference,
  onSnapshot,
  DocumentData,
  FirestoreError,
  DocumentSnapshot,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { useFirebase } from '@/firebase/provider';

/** Utility type to add an 'id' field to a given type T. */
type WithId<T> = T & { id: string };

/**
 * Interface for the return value of the useDoc hook.
 * @template T Type of the document data.
 */
export interface UseDocResult<T> {
  data: WithId<T> | null; // Document data with ID, or null.
  isLoading: boolean;       // True if loading.
  error: FirestoreError | Error | null; // Error object, or null.
}

/**
 * React hook to subscribe to a single Firestore document in real-time.
 * Handles nullable references.
 *
 * IMPORTANT! The docRef passed to this hook MUST be memoized with React.useMemo.
 *
 * @template T Optional type for document data. Defaults to any.
 * @param {DocumentReference<DocumentData> | null | undefined} memoizedDocRef -
 * The memoized Firestore DocumentReference. Waits if null/undefined.
 * @returns {UseDocResult<T>} Object with data, isLoading, error.
 */
export function useDoc<T = any>(
  memoizedDocRef: DocumentReference<DocumentData> | null | undefined,
): UseDocResult<T> {
  type StateDataType = WithId<T> | null;

  const [data, setData] = useState<StateDataType>(null);
  const [error, setError] = useState<FirestoreError | Error | null>(null);
  const { isUserLoading } = useFirebase();

  // isLoading is true if we are waiting for auth or if the doc ref is not ready.
  const isLoading = isUserLoading || !memoizedDocRef;

  useEffect(() => {
    // Do not proceed if the doc ref is not ready or auth is in progress.
    if (!memoizedDocRef || isUserLoading) {
      setData(null);
      setError(null);
      return;
    }
    
    // Create a stable reference to the doc for use inside the callbacks.
    const stableDocRef = memoizedDocRef;

    const unsubscribe = onSnapshot(
      stableDocRef,
      (snapshot: DocumentSnapshot<DocumentData>) => {
        if (snapshot.exists()) {
          setData({ ...(snapshot.data() as T), id: snapshot.id });
        } else {
          // Document does not exist
          setData(null);
        }
        setError(null); // Clear any previous error on successful snapshot
      },
      (snapshotError: FirestoreError) => {
        const contextualError = new FirestorePermissionError({
          operation: 'get',
          path: stableDocRef.path, // Safely access path from the stable reference
        })

        setError(contextualError);
        setData(null);

        // trigger global error propagation
        errorEmitter.emit('permission-error', contextualError);
      }
    );

    // Cleanup subscription on unmount or when dependencies change.
    return () => unsubscribe();
  }, [memoizedDocRef, isUserLoading]); // Re-run effect if docRef or user loading state changes.

  return { data, isLoading, error };
}
