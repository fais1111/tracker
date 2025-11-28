"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { detectAnomalies } from "@/ai/flows/anomaly-detection";
import type { Module } from "./types";
import { initialModules } from "./data"; // In a real app, this would be a database client.

const moduleSchema = z.object({
  id: z.string(),
  yard: z.string().min(1, "Yard is required."),
  location: z.string().min(1, "Location is required."),
  moduleNo: z.string().min(1, "Module No. is required."),
  rfloDate: z.string().optional(),
  shipmentNo: z.string().optional(),
  rfloDateStatus: z.enum(["Date Confirmed", "1st Quarter-2026", "Pending"]),
  yardReport: z.string().optional(),
  islandReport: z.string().optional(),
  byWhom: z.string().optional(),
});

// This is a mock database. In a real application, you would use a real database.
let modules: Module[] = [...initialModules];

export async function getModules(): Promise<Module[]> {
  // In a real app, you'd fetch from a database.
  // We add a delay to simulate network latency.
  await new Promise(resolve => setTimeout(resolve, 1000));
  return modules;
}

export async function updateModule(data: z.infer<typeof moduleSchema>) {
  const validation = moduleSchema.safeParse(data);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.flatten().fieldErrors,
    };
  }

  const { id, ...moduleData } = validation.data;
  
  const moduleIndex = modules.findIndex((m) => m.id === id);

  if (moduleIndex === -1) {
    return { success: false, error: { _form: ["Module not found."] } };
  }

  const existingModule = modules[moduleIndex];
  
  const combinedProgressNotes = [
    moduleData.yardReport,
    moduleData.islandReport,
    `Updated by: ${moduleData.byWhom || "N/A"}`,
  ]
    .filter(Boolean)
    .join(" | ");

  const anomalyResult = await detectAnomalies({
    yard: moduleData.yard,
    location: moduleData.location,
    moduleNo: moduleData.moduleNo,
    rfloDateStatus: moduleData.rfloDateStatus,
    progressNotes: combinedProgressNotes,
  });

  const updatedModule: Module = {
    ...existingModule,
    ...moduleData,
    rfloDate: moduleData.rfloDate || existingModule.rfloDate,
    isAnomaly: anomalyResult.isAnomaly,
    anomalyExplanation: anomalyResult.anomalyExplanation,
  };

  modules[moduleIndex] = updatedModule;
  
  revalidatePath("/dashboard");

  return { success: true, data: updatedModule };
}

export async function addModule(data: Omit<z.infer<typeof moduleSchema>, "id">) {
  const validation = moduleSchema.omit({ id: true }).safeParse(data);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.flatten().fieldErrors,
    };
  }
  
  const newModuleData = validation.data;
  const newModule: Module = {
    id: (modules.length + 1).toString(),
    ...newModuleData,
    rfloDate: newModuleData.rfloDate || '',
    isAnomaly: false,
    anomalyExplanation: '',
  };

  modules.unshift(newModule); // Add to the beginning of the array
  revalidatePath("/dashboard");
  return { success: true, data: newModule };
}
