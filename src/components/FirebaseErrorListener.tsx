'use client';

import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import type { FirestorePermissionError } from '@/firebase/errors';
import { ToastAction } from './ui/toast';

function formatError(error: FirestorePermissionError) {
  const details = {
    operation: error.context.operation,
    path: error.context.path,
    ...(error.context.requestResourceData && {
      resource: error.context.requestResourceData,
    }),
  };

  return `The following request was denied by Firestore security rules:\n${JSON.stringify(details, null, 2)}`;
}

export function FirebaseErrorListener() {
  const { toast } = useToast();

  useEffect(() => {
    const showErrorToast = (error: FirestorePermissionError) => {
      // Only show toasts in development to avoid exposing internal details in production.
      if (process.env.NODE_ENV === 'development') {
        toast({
          variant: 'destructive',
          title: 'Firestore: Permission Denied',
          description: (
            <pre className="mt-2 w-full rounded-md bg-slate-950 p-4">
              <code className="text-white">{formatError(error)}</code>
            </pre>
          ),
          duration: 20000,
          action: <ToastAction altText="copy">Copy</ToastAction>,
        });
      }
      // You can add production-ready error handling here (e.g., logging to a service).
      console.error(error.message, error.context);
    };

    errorEmitter.on('permission-error', showErrorToast);

    return () => {
      errorEmitter.off('permission-error', showErrorToast);
    };
  }, [toast]);

  return null;
}
