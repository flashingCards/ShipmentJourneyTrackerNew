'use client';

import { Auth, signInAnonymously } from 'firebase/auth';

/**
 * Initiates anonymous sign-in. This is a non-blocking operation.
 * The auth state change will be handled by the onAuthStateChanged listener
 * in the FirebaseProvider.
 * @param authInstance The Firebase Auth instance.
 */
export function initiateAnonymousSignIn(authInstance: Auth): void {
  signInAnonymously(authInstance).catch((error) => {
    // Although we don't block on this, we should still handle/log sign-in errors.
    console.error('Anonymous sign-in failed:', error);
  });
}
