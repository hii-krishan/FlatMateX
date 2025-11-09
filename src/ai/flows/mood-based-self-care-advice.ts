'use server';
/**
 * @fileOverview Provides self-care advice based on the user's mood, sleep, and productivity data.
 *
 * - getSelfCareAdvice - A function that generates self-care advice based on mood, sleep, and productivity.
 * - MoodBasedSelfCareAdviceInput - The input type for the getSelfCareAdvice function.
 * - MoodBasedSelfCareAdviceOutput - The return type for the getSelfCareAdvice function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MoodBasedSelfCareAdviceInputSchema = z.object({
  mood: z.string().describe('The current mood of the user (e.g., happy, stressed, sad).'),
  sleepHours: z.number().describe('The number of hours the user slept last night.'),
  productivityLevel: z
    .string()
    .describe('The productivity level of the user today (e.g., high, medium, low).'),
});
export type MoodBasedSelfCareAdviceInput = z.infer<typeof MoodBasedSelfCareAdviceInputSchema>;

const MoodBasedSelfCareAdviceOutputSchema = z.object({
  selfCareAdvice: z.string().describe('AI-generated self-care advice based on the input data.'),
});
export type MoodBasedSelfCareAdviceOutput = z.infer<typeof MoodBasedSelfCareAdviceOutputSchema>;

export async function getSelfCareAdvice(
  input: MoodBasedSelfCareAdviceInput
): Promise<MoodBasedSelfCareAdviceOutput> {
  return moodBasedSelfCareAdviceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'moodBasedSelfCareAdvicePrompt',
  input: {schema: MoodBasedSelfCareAdviceInputSchema},
  output: {schema: MoodBasedSelfCareAdviceOutputSchema},
  prompt: `You are a self-care advisor. Based on the user's mood, sleep hours, and productivity level, provide personalized self-care advice.

Mood: {{{mood}}}
Sleep Hours: {{{sleepHours}}}
Productivity Level: {{{productivityLevel}}}

Self-Care Advice:`,
});

const moodBasedSelfCareAdviceFlow = ai.defineFlow(
  {
    name: 'moodBasedSelfCareAdviceFlow',
    inputSchema: MoodBasedSelfCareAdviceInputSchema,
    outputSchema: MoodBasedSelfCareAdviceOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
