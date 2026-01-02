'use client';

import { useState, useEffect } from 'react';
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
import { useFirebase } from '@/firebase/provider'; // Import useFirebase

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
 * A type guard to check if a query object has the internal _query structure.
 * This helps in safely accessing nested properties for path extraction.
 */
function isQueryWithInternalPath(
  query: any
): query is { _query: { path: { toSegments: () => string[] } } } {
  return query && typeof query === 'object' && '_query' in query && 'path' in query._query && typeof query._query.path.toSegments === 'function';
}


/**
 * React hook to subscribe to a Firestore collection or query in real-time.
 * Handles nullable references/queries and waits for user authentication to complete.
 * 
 * IMPORTANT! YOU MUST MEMOIZE the inputted memoizedTargetRefOrQuery or BAD THINGS WILL HAPPEN
 * use useMemoFirebase to memoize it per React guidance.
 *  
 * @template T Optional type for document data. Defaults to any.
 * @param {CollectionReference<DocumentData> | Query<DocumentData> | null | undefined} memoizedTargetRefOrQuery -
 * The Firestore CollectionReference or Query. Waits if null/undefined.
 * @returns {UseCollectionResult<T>} Object with data, isLoading, error.
 */
export function useCollection<T = any>(
    memoizedTargetRefOrQuery: ((CollectionReference<DocumentData> | Query<DocumentData>) & {__memo?: boolean})  | null | undefined,
): UseCollectionResult<T> {
  type ResultItemType = WithId<T>;
  type StateDataType = ResultItemType[] | null;

  const [data, setData] = useState<StateDataType>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<FirestoreError | Error | null>(null);
  const { isUserLoading } = useFirebase(); // Get auth loading state

  useEffect(() => {
    // If the query/ref is not ready OR if the user is still loading,
    // set loading to true and wait. This prevents premature queries.
    if (!memoizedTargetRefOrQuery || isUserLoading) {
      setIsLoading(true);
      setData(null);
      setError(null);
      return;
    }

    // When the query/ref is ready AND the user is loaded, proceed.
    setIsLoading(true);
    setError(null);

    const unsubscribe = onSnapshot(
      memoizedTargetRefOrQuery,
      (snapshot: QuerySnapshot<DocumentData>) => {
        const results: ResultItemType[] = [];
        for (const doc of snapshot.docs) {
          results.push({ ...(doc.data() as T), id: doc.id });
        }
        setData(results);
        setError(null);
        setIsLoading(false);
      },
      (error: FirestoreError) => {
        let path = 'unknown/path';
        try {
           if ('path' in memoizedTargetRefOrQuery) {
              path = (memoizedTargetRefOrQuery as CollectionReference).path;
           } else if (isQueryWithInternalPath(memoizedTargetRefOrQuery)) {
              // For queries, extract path from internal _query property
              path = memoizedTargetRefOrQuery._query.path.toSegments().join('/');
           }
        } catch (e) {
            console.error("Could not determine path for Firestore error reporting:", e);
        }

        const contextualError = new FirestorePermissionError({
          operation: 'list',
          path,
        })

        setError(contextualError)
        setData(null)
        setIsLoading(false)

        // trigger global error propagation
        errorEmitter.emit('permission-error', contextualError);
      }
    );

    return () => unsubscribe();
  }, [memoizedTargetRefOrQuery, isUserLoading]); // Re-run if the query OR user loading state changes.

  if(memoizedTargetRefOrQuery && !memoizedTargetRefOrQuery.__memo) {
    throw new Error('A non-memoized query was passed to useCollection. Use useMemoFirebase to memoize the query.');
  }

  return { data, isLoading: isLoading || isUserLoading, error };
}
