'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Query,
  onSnapshot,
  DocumentData,
  FirestoreError,
  QuerySnapshot,
  CollectionReference,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { useFirebase } from '@/firebase/provider';

/** Utility type to add an 'id' field to a given type T. */
export type WithId<T> = T & { id: string };

/**
 * Interface for the return value of the useCollection hook.
 * @template T Type of the document data.
 */
export interface UseCollectionResult<T> {
  data: WithId<T>[] | null; // Document data with ID, or null.
  isLoading: boolean;       // True if loading.
  error: FirestoreError | Error | null; // Error object, or null.
}

/**
 * A type guard to check if an object is a Query.
 */
function isQuery(obj: any): obj is Query {
    return obj && typeof obj.ref === 'object' && typeof obj.ref.path === 'string';
}

/**
 * React hook to subscribe to a Firestore collection or query in real-time.
 * Handles nullable references/queries and waits for user authentication to complete.
 *
 * IMPORTANT! The query/reference passed to this hook MUST be memoized with React.useMemo.
 *
 * @template T Optional type for document data. Defaults to any.
 * @param {CollectionReference<DocumentData> | Query<DocumentData> | null | undefined} memoizedTargetRefOrQuery -
 * The memoized Firestore CollectionReference or Query. Hook waits if this is null/undefined.
 * @returns {UseCollectionResult<T>} Object with data, isLoading, error.
 */
export function useCollection<T = any>(
    memoizedTargetRefOrQuery: (CollectionReference<DocumentData> | Query<DocumentData>) | null | undefined,
): UseCollectionResult<T> {
  type ResultItemType = WithId<T>;
  type StateDataType = ResultItemType[] | null;

  const [data, setData] = useState<StateDataType>(null);
  const [error, setError] = useState<FirestoreError | Error | null>(null);
  const { isUserLoading } = useFirebase();

  // isLoading is true if we are waiting for auth or if the query is not ready yet.
  const isLoading = isUserLoading || !memoizedTargetRefOrQuery;

  useEffect(() => {
    // Do not proceed if the query is not ready or auth is in progress.
    if (!memoizedTargetRefOrQuery || isUserLoading) {
      // Reset state when query/auth changes and is not ready.
      setData(null);
      setError(null);
      return;
    }

    const unsubscribe = onSnapshot(
      memoizedTargetRefOrQuery,
      (snapshot: QuerySnapshot<DocumentData>) => {
        const results: ResultItemType[] = [];
        for (const doc of snapshot.docs) {
          results.push({ ...(doc.data() as T), id: doc.id });
        }
        setData(results);
        setError(null);
      },
      (snapshotError: FirestoreError) => {
        let path = 'unknown/path';
        try {
            if (isQuery(memoizedTargetRefOrQuery)) {
                path = memoizedTargetRefOrQuery.ref.path;
            } else if ('path' in memoizedTargetRefOrQuery) {
                path = (memoizedTargetRefOrQuery as CollectionReference).path;
            }
        } catch (e) {
            console.error("useCollection: Could not determine path for Firestore error reporting:", e);
        }

        const contextualError = new FirestorePermissionError({
          operation: 'list',
          path,
        })

        setError(contextualError);
        setData(null);

        // trigger global error propagation
        errorEmitter.emit('permission-error', contextualError);
      }
    );

    // Cleanup subscription on unmount or when dependencies change.
    return () => unsubscribe();
  }, [memoizedTargetRefOrQuery, isUserLoading]); // Re-run effect if query or user loading state changes.

  return { data, isLoading, error };
}
