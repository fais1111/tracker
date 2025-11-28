'use server';
/**
 * @fileOverview Anomaly detection AI agent for module tracking data.
 *
 * - detectAnomalies - A function that detects anomalies in module tracking data.
 * - AnomalyDetectionInput - The input type for the detectAnomalies function.
 * - AnomalyDetectionOutput - The return type for the detectAnomalies function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnomalyDetectionInputSchema = z.object({
  yard: z.string().describe('The yard where the module is located.'),
  location: z.string().describe('The location of the module within the yard.'),
  moduleNo: z.string().describe('The unique identifier for the module.'),
  rfloDateStatus: z.string().describe('The RFLO date status of the module.'),
  progressNotes: z.string().describe('Notes on the progress of the module.'),
});
export type AnomalyDetectionInput = z.infer<typeof AnomalyDetectionInputSchema>;

const AnomalyDetectionOutputSchema = z.object({
  isAnomaly: z.boolean().describe('Whether or not an anomaly is detected.'),
  anomalyExplanation: z.string().describe('Explanation of the anomaly, if any.'),
});
export type AnomalyDetectionOutput = z.infer<typeof AnomalyDetectionOutputSchema>;

export async function detectAnomalies(input: AnomalyDetectionInput): Promise<AnomalyDetectionOutput> {
  return anomalyDetectionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'anomalyDetectionPrompt',
  input: {schema: AnomalyDetectionInputSchema},
  output: {schema: AnomalyDetectionOutputSchema},
  prompt: `You are an expert data analyst specializing in detecting anomalies in module tracking data.

You will use the provided information to determine if there are any anomalies, such as unexpected delays or inconsistencies in the progress notes.

Yard: {{{yard}}}
Location: {{{location}}}
Module No: {{{moduleNo}}}
RFLO Date Status: {{{rfloDateStatus}}}
Progress Notes: {{{progressNotes}}}

Based on this information, determine if there is an anomaly and provide an explanation. Consider that inconsistencies, delays and unexpected events should be flagged as anomalies. If everything looks normal, set isAnomaly to false and provide a short explanation.`,
});

const anomalyDetectionFlow = ai.defineFlow(
  {
    name: 'anomalyDetectionFlow',
    inputSchema: AnomalyDetectionInputSchema,
    outputSchema: AnomalyDetectionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
