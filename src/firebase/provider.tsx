'use client';

import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from 'react';
import {type FirebaseApp} from 'firebase/app';
import {type Firestore} from 'firebase/firestore';

import {FirebaseErrorListener} from '@/components/FirebaseErrorListener';

interface FirebaseContextValue {
  app: FirebaseApp;
  firestore: Firestore;
}

const FirebaseContext = createContext<FirebaseContextValue | undefined>(
  undefined
);

interface Props {
  children: ReactNode;
  app: FirebaseApp;
  firestore: Firestore;
}

/**
 * Provides the Firebase context to its children.
 *
 * @param props The component props.
 * @param props.children The children to render.
 * @param props.app The Firebase app instance.
 * @param props.firestore The Firestore instance.
 * @returns The rendered component.
 */
export function FirebaseProvider({children, app, firestore}: Props) {

  const contextValue = useMemo(
    () => ({
      app,
      firestore,
    }),
    [app, firestore]
  );

  return (
    <FirebaseContext.Provider value={contextValue}>
      {children}
      <FirebaseErrorListener />
    </FirebaseContext.Provider>
  );
}

/**
 * Returns the Firebase context value.
 *
 * @returns The Firebase context value.
 * @throws if the hook is used outside of a {@link FirebaseProvider}.
 */
export function useFirebase() {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
}

/**
 * Returns the Firebase app instance.
 *
 * @returns The Firebase app instance.
 * @throws if the hook is used outside of a {@link FirebaseProvider}.
 */
export function useFirebaseApp() {
  return useFirebase().app;
}

/**
 * Returns the Firestore instance.
 *

 * @returns The Firestore instance.
 * @throws if the hook is used outside of a {@link FirebaseProvider}.
 */
export function useFirestore() {
  return useFirebase().firestore;
}
