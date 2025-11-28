'use client';

import {
  collection,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  type Firestore,
} from 'firebase/firestore';
import type { Module } from '@/lib/types';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';


// Helper function to create a new module
export const createModule = (firestore: Firestore, moduleData: Omit<Module, 'id'>) => {
  const modulesCollection = collection(firestore, 'modules');
  
  addDoc(modulesCollection, {
    ...moduleData,
    createdAt: serverTimestamp(),
  }).catch(error => {
    console.error("Error creating module: ", error);
    const permissionError = new FirestorePermissionError({
        path: modulesCollection.path,
        operation: 'create',
        requestResourceData: moduleData,
    });
    errorEmitter.emit('permission-error', permissionError);
    // Re-throw or handle as needed, for example, show a toast to the user
    throw error;
  });
};

// Helper function to update an existing module
export const updateModule = (
  firestore: Firestore,
  moduleId: string,
  moduleData: Partial<Module>
) => {
  const moduleRef = doc(firestore, 'modules', moduleId);

  updateDoc(moduleRef, {
    ...moduleData,
    updatedAt: serverTimestamp(),
  }).catch(error => {
    console.error("Error updating module: ", error);
    const permissionError = new FirestorePermissionError({
        path: moduleRef.path,
        operation: 'update',
        requestResourceData: moduleData,
    });
    errorEmitter.emit('permission-error', permissionError);
    // Re-throw or handle as needed
    throw error;
  });
};
