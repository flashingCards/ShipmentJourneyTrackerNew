'use client';
import { useMemo, type DependencyList } from 'react';

type MemoFirebase<T> = T & { __memo?: boolean };

/**
 * A custom hook that memoizes a value, but uses a custom comparison function
 * to determine if the dependencies have changed. It also tags the object
 * with a `__memo` property to ensure it's used correctly with `useCollection` and `useDoc`.
 *
 * This is useful for memoizing Firebase queries and references, which are
 * objects and will not be equal by reference if they are created on each
 * render.
 *
 * @param factory A function that returns the value to memoize.
 * @param dependencies The dependencies to check for changes.
 * @returns The memoized value.
 */
export function useMemoFirebase<T>(factory: () => T, deps: DependencyList): T {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const memoized = useMemo(factory, deps);

  if (typeof memoized !== 'object' || memoized === null) {
    return memoized;
  }

  // Tag the object to mark it as memoized for our hooks
  (memoized as MemoFirebase<T>).__memo = true;

  return memoized;
}
