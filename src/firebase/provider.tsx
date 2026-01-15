'use client';

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {type FirebaseApp} from 'firebase/app';
import {onIdTokenChanged, type Auth, type User} from 'firebase/auth';
import {type Firestore} from 'firebase/firestore';

import {FirebaseErrorListener} from '@/components/FirebaseErrorListener';

interface FirebaseContextValue {
  app: FirebaseApp;
  firestore: Firestore;
  auth: Auth;
  currentUser: User | null | undefined;
}

const FirebaseContext = createContext<FirebaseContextValue | undefined>(
  undefined
);

interface Props {
  children: ReactNode;
  app: FirebaseApp;
  firestore: Firestore;
  auth: Auth;
}

/**
 * Provides the Firebase context to its children.
 *
 * @param props The component props.
 * @param props.children The children to render.
 * @param props.app The Firebase app instance.
 * @param props.firestore The Firestore instance.
 * @param props.auth The Auth instance.
 * @returns The rendered component.
 */
export function FirebaseProvider({children, app, firestore, auth}: Props) {
  const [user, setUser] = useState<User | null>();

  const contextValue = useMemo(
    () => ({
      app,
      firestore,
      auth,
      currentUser: user,
    }),
    [app, firestore, auth, user]
  );

  useEffect(() => {
    return onIdTokenChanged(auth, setUser);
  }, [auth]);

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

/**
 * Returns the Auth instance.
 *
 * @returns The Auth instance.
 * @throws if the hook is used outside of a {@link FirebaseProvider}.
 */
export function useAuth() {
  return useFirebase().auth;
}
