'use client';
    
import {
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  CollectionReference,
  DocumentReference,
  SetOptions,
  serverTimestamp,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import {FirestorePermissionError} from '@/firebase/errors';

/**
 * Initiates a setDoc operation for a document reference.
 * Does NOT await the write operation internally.
 */
export function setDocumentNonBlocking(docRef: DocumentReference, data: any, options: SetOptions) {
  setDoc(docRef, data, options).catch(error => {
    errorEmitter.emit(
      'permission-error',
      new FirestorePermissionError({
        path: docRef.path,
        operation: 'write', // or 'create'/'update' based on options
        requestResourceData: data,
      })
    )
    // Re-throw the original error to be caught by the calling function's catch block
    throw error;
  })
  // Execution continues immediately
}


/**
 * Initiates an addDoc operation for a collection reference.
 * Does NOT await the write operation internally.
 * Returns the Promise for the new doc ref, but typically not awaited by caller.
 */
export function addDocumentNonBlocking(colRef: CollectionReference, data: any) {
  const promise = addDoc(colRef, data)
    .catch(error => {
      errorEmitter.emit(
        'permission-error',
        new FirestorePermissionError({
          path: colRef.path,
          operation: 'create',
          requestResourceData: data,
        })
      )
       // Re-throw the original error to be caught by the calling function's catch block
      throw error;
    });
  return promise;
}


/**
 * Initiates an updateDoc operation for a document reference.
 * Does NOT await the write operation internally.
 */
export function updateDocumentNonBlocking(docRef: DocumentReference, data: any) {
  updateDoc(docRef, data)
    .catch(error => {
      errorEmitter.emit(
        'permission-error',
        new FirestorePermissionError({
          path: docRef.path,
          operation: 'update',
          requestResourceData: data,
        })
      )
       // Re-throw the original error to be caught by the calling function's catch block
      throw error;
    });
}


/**
 * Initiates a deleteDoc operation for a document reference.
 * Does NOT await the write operation internally.
 */
export function deleteDocumentNonBlocking(docRef: DocumentReference) {
  deleteDoc(docRef)
    .catch(error => {
      errorEmitter.emit(
        'permission-error',
        new FirestorePermissionError({
          path: docRef.path,
          operation: 'delete',
        })
      )
       // Re-throw the original error to be caught by the calling function's catch block
      throw error;
    });
}

// A wrapper for addDoc that includes a server timestamp
export async function addComment(collectionRef: CollectionReference, authorName: string, message: string, nodeName: string) {
    const newComment = {
        authorName,
        message,
        nodeName,
        createdAt: serverTimestamp(),
    };
    
    try {
        await addDoc(collectionRef, newComment);
    } catch (error) {
        console.error("Error adding document: ", error);
        
        // Emit a permission error for the UI to catch and display
        errorEmitter.emit(
            'permission-error',
            new FirestorePermissionError({
                path: collectionRef.path,
                operation: 'create',
                requestResourceData: { authorName, message, nodeName },
            })
        );
        
        // Re-throw the error to be caught by the calling function
        throw error;
    }
}
