
'use client';
    
import { useState, useEffect, useCallback } from 'react';
import {
  DocumentReference,
  onSnapshot,
  DocumentData,
  FirestoreError,
  DocumentSnapshot,
  getDoc,
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
  refetch: () => void; // Function to manually refetch the document
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
 * @returns {UseDocResult<T>} Object with data, isLoading, error, and refetch function.
 */
export function useDoc<T = any>(
  memoizedDocRef: DocumentReference<DocumentData> | null | undefined,
): UseDocResult<T> {
  type StateDataType = WithId<T> | null;

  const [data, setData] = useState<StateDataType>(null);
  const [error, setError] = useState<FirestoreError | Error | null>(null);
  const { isUserLoading } = useFirebase();
  const [isLoading, setIsLoading] = useState(true);

  const fetchDoc = useCallback(async (ref: DocumentReference<DocumentData>) => {
    try {
        const docSnap = await getDoc(ref);
        if (docSnap.exists()) {
            setData({ ...(docSnap.data() as T), id: docSnap.id });
        } else {
            setData(null);
        }
    } catch (e) {
        // Error handling will be managed by the onSnapshot listener
    }
  }, []);

  useEffect(() => {
    // Do not proceed if the doc ref is not ready or auth is in progress.
    if (!memoizedDocRef || isUserLoading) {
      setIsLoading(true);
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
        setIsLoading(false);
      },
      (snapshotError: FirestoreError) => {
        let path = 'unknown/path';
        try {
            if (stableDocRef && 'path' in stableDocRef) {
                path = stableDocRef.path;
            }
        } catch (e) {
            console.error("useDoc: Could not determine path for Firestore error reporting:", e);
        }
        
        const contextualError = new FirestorePermissionError({
          operation: 'get',
          path,
        })

        setError(contextualError);
        setData(null);
        setIsLoading(false);

        // trigger global error propagation
        errorEmitter.emit('permission-error', contextualError);
      }
    );

    // Cleanup subscription on unmount or when dependencies change.
    return () => unsubscribe();
  }, [memoizedDocRef, isUserLoading]); // Re-run effect if docRef or user loading state changes.

  const refetch = useCallback(() => {
    if(memoizedDocRef) {
      fetchDoc(memoizedDocRef);
    }
  }, [memoizedDocRef, fetchDoc]);

  return { data, isLoading: isLoading || isUserLoading, error, refetch };
}
