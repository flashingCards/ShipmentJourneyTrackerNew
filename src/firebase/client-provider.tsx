'use client';
import {useEffect, useState} from 'react';
import {type FirebaseApp} from 'firebase/app';
import {Firestore, getFirestore} from 'firebase/firestore';
import {Auth, getAuth} from 'firebase/auth'; 

import {initializeFirebase} from '@/firebase';

import {FirebaseProvider} from './provider';
import {Spinner} from './Spinner';

let app: FirebaseApp;
let firestore: Firestore;
let auth: Auth; 

/**
 * Initializes Firebase on the client side and provides the Firebase context.
 *
 * It is a wrapper around {@link FirebaseProvider} that initializes Firebase
 * on the client side and renders a loading spinner until Firebase is initialized.
 *
 * This component should be used at the root of the application to ensure that
 * Firebase is initialized only once.
 *
 * @param props The component props.
 * @param props.children The children to render.
 * @returns The rendered component.
 */
export function FirebaseClientProvider({children}: {children: React.ReactNode}) {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (isInitialized) {
      return;
    }
    const result = initializeFirebase();
    app = result.app;
    firestore = getFirestore(app);
    auth = getAuth(app); 
    setIsInitialized(true);
  }, [isInitialized]);

  if (!isInitialized) {
    return <Spinner />;
  }

  return (
    <FirebaseProvider app={app} firestore={firestore} auth={auth}>
      {children}
    </FirebaseProvider>
  );
}
