'use client';

import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
  useState,
  useEffect,
} from 'react';
import {type FirebaseApp} from 'firebase/app';
import {type Firestore} from 'firebase/firestore';
import { type Auth, type User, onAuthStateChanged } from 'firebase/auth';

import {FirebaseErrorListener} from '@/components/FirebaseErrorListener';

interface FirebaseContextValue {
  app: FirebaseApp;
  firestore: Firestore;
  auth: Auth;
  currentUser: User | null;
  isUserLoading: boolean;
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

export function FirebaseProvider({children, app, firestore, auth}: Props) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isUserLoading, setIsUserLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setIsUserLoading(false);
    });
    return () => unsubscribe();
  }, [auth]);

  const contextValue = useMemo(
    () => ({
      app,
      firestore,
      auth,
      currentUser,
      isUserLoading,
    }),
    [app, firestore, auth, currentUser, isUserLoading]
  );

  return (
    <FirebaseContext.Provider value={contextValue}>
      {children}
      <FirebaseErrorListener />
    </FirebaseContext.Provider>
  );
}

export function useFirebase() {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
}

export function useFirebaseApp() {
  return useFirebase().app;
}

export function useFirestore() {
  return useFirebase().firestore;
}

export function useAuth() {
  return useFirebase().auth;
}

export function useUser() {
  const { currentUser, isUserLoading } = useFirebase();
  return { user: currentUser, isLoading: isUserLoading };
}
