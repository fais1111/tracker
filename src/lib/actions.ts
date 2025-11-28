'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeServerApp } from '@/firebase/server';
import { FieldValue } from 'firebase-admin/firestore';

// Initialize the server-side Firebase app
initializeServerApp();
const db = getFirestore();

// Schema for creating a module (ID is not present)
const createModuleSchema = z.object({
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

// Schema for updating a module (ID is required)
const updateModuleSchema = createModuleSchema.extend({
  id: z.string().min(1, 'ID is required.'),
});


type ActionState = {
  success: boolean;
  errors?: z.ZodError['errors'];
  message?: string;
};

export async function createModule(
  prevState: any,
  formData: FormData
): Promise<ActionState> {
  const rawData = Object.fromEntries(formData.entries());
  rawData.signedReport = rawData.signedReport === 'on';

  const validatedFields = createModuleSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      success: false,
      errors: validatedFields.error.errors,
    };
  }

  try {
    const modulesCollection = db.collection('modules');
    await modulesCollection.add({
      ...validatedFields.data,
      createdAt: FieldValue.serverTimestamp(),
    });

    revalidatePath('/');
    return { success: true };
  } catch (e) {
    console.error('Error creating module:', e);
    return {
      success: false,
      message: 'Something went wrong on the server. Please try again.',
    };
  }
}


export async function updateModule(
  prevState: any,
  formData: FormData
): Promise<ActionState> {
  const rawData = Object.fromEntries(formData.entries());
   rawData.signedReport = rawData.signedReport === 'on';

  const validatedFields = updateModuleSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      success: false,
      errors: validatedFields.error.errors,
    };
  }

  try {
    const { id, ...dataToUpdate } = validatedFields.data;
    
    const moduleRef = db.collection('modules').doc(id);
    await moduleRef.update({
      ...dataToUpdate,
      lastUpdatedAt: FieldValue.serverTimestamp(),
    });

    revalidatePath('/');
    return { success: true };

  } catch (e) {
    console.error('Error updating module:', e);
    return {
      success: false,
      message: 'Something went wrong on the server. Please try again.',
    };
  }
}
