'use client';
import {useEffect, useState} from 'react';
import {
  onSnapshot,
  type Query,
  type DocumentData,
  type QueryDocumentSnapshot,
} from 'firebase/firestore';

import {useFirestore} from '@/firebase/provider';
import {type InternalQuery} from '@/firebase/firestore-internal';
import {errorEmitter} from '@/firebase/error-emitter';
import {FirestorePermissionError} from '@/firebase/errors';

import {useMemoFirebase} from './use-memo-firebase';

export interface CollectionResult<T> {
  data: Array<QueryDocumentSnapshot<T>> | undefined;
  loading: boolean;
  error: Error | undefined;
}

export function useCollection<T>(
  targetRefOrQuery: Query<T> | null
): CollectionResult<T> {
  const [data, setData] = useState<Array<QueryDocumentSnapshot<T>> | undefined>(
    undefined
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | undefined>(undefined);
  const firestore = useFirestore();

  const memoizedTargetRefOrQuery = useMemoFirebase(
    () => targetRefOrQuery,
    [targetRefOrQuery]
  );

  useEffect(() => {
    if (!memoizedTargetRefOrQuery) {
      setLoading(false);
      setData(undefined);
      setError(undefined);
      return;
    }

    const unsubscribe = onSnapshot(
      memoizedTargetRefOrQuery,
      (snapshot) => {
        setLoading(false);
        setData(snapshot.docs);
        setError(undefined);
      },
      (err) => {
        setLoading(false);
        setData(undefined);
        setError(err);
        const path =
          'path' in memoizedTargetRefOrQuery
            ? memoizedTargetRefOrQuery.path
            : (memoizedTargetRefOrQuery as unknown as InternalQuery)._query.path.canonicalString()

        const contextualError = new FirestorePermissionError({
          operation: 'list',
          path,
        })
        errorEmitter.emit('permission-error', contextualError);
      }
    );

    return () => unsubscribe();
  }, [memoizedTargetRefOrQuery, firestore]);

  return {data, loading, error};
}
