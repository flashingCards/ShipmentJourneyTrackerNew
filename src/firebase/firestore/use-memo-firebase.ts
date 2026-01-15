
'use client';
import {useMemo, useRef, type DependencyList} from 'react';

/**
 * A custom hook that memoizes a value, but uses a custom comparison function
 * to determine if the dependencies have changed.
 *
 * This is useful for memoizing Firebase queries and references, which are
 * objects and will not be equal by reference if they are created on each
 * render.
 *
 * @param factory A function that returns the value to memoize.
 * @param dependencies The dependencies to check for changes.
 * @param areEqual A function that compares two values and returns true if they
 *   are equal.
 * @returns The memoized value.
 */
export function useMemoFirebase<T>(
  factory: () => T,
  dependencies: DependencyList,
): T {
  const ref = useRef<{
    value: T;
    dependencies: DependencyList;
  }>();

  if (
    !ref.current ||
    dependencies.some((dep, i) => dep !== ref.current?.dependencies[i])
  ) {
    ref.current = {
      value: factory(),
      dependencies: dependencies,
    };
  }

  return ref.current.value;
}
