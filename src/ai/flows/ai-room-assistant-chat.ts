'use server';
/**
 * @fileOverview This file defines the AI Room Assistant chat flow.
 *
 * - aiRoomAssistantChat - A function to chat with the AI Room Assistant.
 * - AIRoomAssistantChatInput - The input type for the aiRoomAssistantChat function.
 * - AIRoomAssistantChatOutput - The output type for the aiRoomAssistantChat function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AIRoomAssistantChatInputSchema = z.object({
  message: z.string().describe('The message from the user to the AI Room Assistant.'),
});
export type AIRoomAssistantChatInput = z.infer<typeof AIRoomAssistantChatInputSchema>;

const AIRoomAssistantChatOutputSchema = z.object({
  response: z.string().describe('The response from the AI Room Assistant.'),
});
export type AIRoomAssistantChatOutput = z.infer<typeof AIRoomAssistantChatOutputSchema>;

export async function aiRoomAssistantChat(input: AIRoomAssistantChatInput): Promise<AIRoomAssistantChatOutput> {
  return aiRoomAssistantChatFlow(input);
}

const aiRoomAssistantChatPrompt = ai.definePrompt({
  name: 'aiRoomAssistantChatPrompt',
  input: {schema: AIRoomAssistantChatInputSchema},
  output: {schema: AIRoomAssistantChatOutputSchema},
  prompt: `You are an AI Room Assistant helping students manage their flatmate responsibilities and expenses.

  Respond to the user message below. You can provide reminders, generate to-do lists, and suggest budget insights.

  Message: {{{message}}}`,
});

const aiRoomAssistantChatFlow = ai.defineFlow(
  {
    name: 'aiRoomAssistantChatFlow',
    inputSchema: AIRoomAssistantChatInputSchema,
    outputSchema: AIRoomAssistantChatOutputSchema,
  },
  async input => {
    const {output} = await aiRoomAssistantChatPrompt(input);
    return output!;
  }
);
