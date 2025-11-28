'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { initializeFirebase } from '@/firebase';
import { collection, addDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import type { Module } from '@/lib/types';

// This schema defines the shape of the data for both creating and updating modules.
const moduleSchema = z.object({
  id: z.string().optional(),
  moduleNo: z.string().min(1, 'Module No. is required.'),
  yard: z.string().min(1, 'Yard is required.'),
  location: z.string().min(1, 'Location is required.'),
  rfloDate: z.string().optional(),
  shipmentNo: z.string().optional(),
  rfloDateStatus: z.enum(['Date Confirmed', '1st Quarter-2026', 'Pending']),
  yardReport: z.string().optional(),
  islandReport: z.string().optional(),
  signedReport: z.boolean().default(false),
});

type SaveModuleResult = {
  success: boolean;
  errors?: z.ZodError['errors'];
};

export async function saveModule(
  prevState: any,
  formData: FormData
): Promise<SaveModuleResult> {

  const rawData = Object.fromEntries(formData.entries());
  
  // Convert checkbox value
  rawData.signedReport = rawData.signedReport === 'on';

  const validatedFields = moduleSchema.safeParse(rawData);

  // If validation fails, return the errors.
  if (!validatedFields.success) {
    return {
      success: false,
      errors: validatedFields.error.errors,
    };
  }
  
  try {
    const { firestore } = initializeFirebase();
    const { id, ...dataToSave } = validatedFields.data;

    if (id) {
      // If an ID is present, update the existing document.
      const moduleRef = doc(firestore, 'modules', id);
      await updateDoc(moduleRef, {
        ...dataToSave,
        lastUpdatedAt: serverTimestamp(),
      });
    } else {
      // If no ID is present, create a new document.
      const modulesCollection = collection(firestore, 'modules');
      await addDoc(modulesCollection, {
        ...dataToSave,
        createdAt: serverTimestamp(),
      });
    }

    // Revalidate the page to show the new/updated data.
    revalidatePath('/');
    return { success: true };

  } catch (e) {
    console.error('Error saving module:', e);
    // In case of a server error, return a generic error message.
    return {
      success: false,
      errors: [{
        code: "custom",
        path: ["form"],
        message: 'Something went wrong on the server. Please try again.',
      }],
    };
  }
}
