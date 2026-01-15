'use client';
import {useEffect, useState} from 'react';
import {
  onSnapshot,
  type DocumentReference,
  type DocumentData,
} from 'firebase/firestore';

import {useFirestore} from '@/firebase/provider';
import {FirestorePermissionError} from '@/firebase/errors';
import {errorEmitter} from '@/firebase/error-emitter';

import {useMemoFirebase} from './use-memo-firebase';

export interface DocResult<T> {
  data: T | undefined;
  loading: boolean;
  error: Error | undefined;
}

export function useDoc<T>(
  targetRef: DocumentReference<T> | null
): DocResult<T> {
  const [data, setData] = useState<T | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | undefined>(undefined);
  const firestore = useFirestore();

  const memoizedTargetRef = useMemoFirebase(() => targetRef, [targetRef]);

  useEffect(() => {
    if (!memoizedTargetRef) {
      setLoading(false);
      setData(undefined);
      setError(undefined);
      return;
    }

    const unsubscribe = onSnapshot(
      memoizedTargetRef,
      (snapshot) => {
        setLoading(false);
        setData(snapshot.data());
        setError(undefined);
      },
      (err) => {
        setLoading(false);
        setData(undefined);
        setError(err);
        const contextualError = new FirestorePermissionError({
          operation: 'get',
          path: memoizedTargetRef.path,
        });
        errorEmitter.emit('permission-error', contextualError);
      }
    );

    return () => unsubscribe();
  }, [memoizedTargetRef, firestore]);

  return {data, loading, error};
}
