import {useFirebase} from '../provider';

/**
 * Returns the current user from the Firebase context.
 *
 * This hook is a convenience wrapper around {@link useFirebase} to get the
 * current user.
 *
 * @returns The current user.
 */
export function useUser() {
  return useFirebase().currentUser;
}
