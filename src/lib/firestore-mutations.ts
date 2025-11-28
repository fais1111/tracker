'use client';

import {
  doc,
  updateDoc,
  deleteDoc,
  type Firestore,
  setDoc,
} from 'firebase/firestore';
import type { Module } from '@/lib/types';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';


// Helper function to create a new module
export const createModule = (firestore: Firestore, moduleData: Omit<Module, 'id'>) => {
  // Use moduleNo as the document ID for easy lookup and to prevent duplicates
  const moduleRef = doc(firestore, 'modules', moduleData.moduleNo);

  const fullModuleData: Omit<Module, 'id'> = {
    yard: '',
    location: '',
    moduleNo: '',
    shipmentDate: '',
    shipmentNo: '',
    rfloDateStatus: '',
    yardReport: '',
    islandReport: '',
    combinedReport: '',
    signed: '',
    ...moduleData
  };
  
  setDoc(moduleRef, fullModuleData).catch(error => {
    console.error("Error creating module: ", error);
    const permissionError = new FirestorePermissionError({
        path: moduleRef.path,
        operation: 'create',
        requestResourceData: fullModuleData,
    });
    errorEmitter.emit('permission-error', permissionError);
    // Re-throw or handle as needed, for example, show a toast to the user
    throw error;
  });
};

// Helper function to update an existing module
export const updateModule = (
  firestore: Firestore,
  moduleId: string, // moduleId is the moduleNo
  moduleData: Partial<Module>
) => {
  const moduleRef = doc(firestore, 'modules', moduleId);

  updateDoc(moduleRef, {
    ...moduleData,
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


// Helper function to delete a module
export const deleteModule = (firestore: Firestore, moduleId: string) => { // moduleId is the moduleNo
    const moduleRef = doc(firestore, 'modules', moduleId);

    deleteDoc(moduleRef).catch(error => {
        console.error("Error deleting module: ", error);
        const permissionError = new FirestorePermissionError({
            path: moduleRef.path,
            operation: 'delete',
        });
        errorEmitter.emit('permission-error', permissionError);
        throw error;
    });
};
