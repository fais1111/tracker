'use server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { initializeFirebase } from '@/firebase';
import { collection, addDoc, doc, updateDoc } from 'firebase/firestore';
import type { Module } from './types';

const moduleSchema = z.object({
  id: z.string(),
  yard: z.string().min(1, 'Yard is required.'),
  location: z.string().min(1, 'Location is required.'),
  moduleNo: z.string().min(1, 'Module No. is required.'),
  rfloDate: z.string().optional(),
  shipmentNo: z.string().optional(),
  rfloDateStatus: z.enum(['Date Confirmed', '1st Quarter-2026', 'Pending']),
  yardReport: z.string().optional(),
  islandReport: z.string().optional(),
  signedReport: z.boolean().optional(),
});

const moduleUpdateSchema = moduleSchema.partial().required({ id: true });


export async function updateModule(data: z.infer<typeof moduleUpdateSchema>) {
  const validation = moduleUpdateSchema.safeParse(data);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.flatten().fieldErrors,
    };
  }

  try {
    const { firestore } = initializeFirebase();
    const { id, ...moduleData } = validation.data;
    const moduleRef = doc(firestore, 'modules', id);
    await updateDoc(moduleRef, moduleData);
    revalidatePath('/');
    return { success: true, data: { id, ...moduleData } };
  } catch (e: any) {
    return { success: false, error: { _form: [e.message] } };
  }
}

export async function addModule(
  data: Omit<z.infer<typeof moduleSchema>, 'id'>
) {
  const validation = moduleSchema.omit({ id: true }).safeParse(data);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.flatten().fieldErrors,
    };
  }

  try {
    const { firestore } = initializeFirebase();
    const newModuleData = validation.data;
    const docRef = await addDoc(collection(firestore, 'modules'), {
        ...newModuleData,
        signedReport: newModuleData.signedReport || false,
    });
    revalidatePath('/');
    return { success: true, data: { id: docRef.id, ...newModuleData } };
  } catch (e: any) {
    return { success: false, error: { _form: [e.message] } };
  }
}
