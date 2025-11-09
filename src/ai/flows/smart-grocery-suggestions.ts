'use server';

/**
 * @fileOverview Provides AI-generated smart grocery suggestions based on past purchases.
 *
 * - getSmartGrocerySuggestions - A function that returns smart grocery suggestions.
 * - SmartGrocerySuggestionsInput - The input type for the getSmartGrocerySuggestions function.
 * - SmartGrocerySuggestionsOutput - The return type for the getSmartGrocerySuggestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SmartGrocerySuggestionsInputSchema = z.object({
  pastPurchases: z.array(z.string()).describe('A list of past grocery purchases.'),
});
export type SmartGrocerySuggestionsInput = z.infer<typeof SmartGrocerySuggestionsInputSchema>;

const SmartGrocerySuggestionsOutputSchema = z.object({
  suggestions: z.array(z.string()).describe('A list of AI-generated smart grocery suggestions.'),
});
export type SmartGrocerySuggestionsOutput = z.infer<typeof SmartGrocerySuggestionsOutputSchema>;

export async function getSmartGrocerySuggestions(input: SmartGrocerySuggestionsInput): Promise<SmartGrocerySuggestionsOutput> {
  return smartGrocerySuggestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'smartGrocerySuggestionsPrompt',
  input: {schema: SmartGrocerySuggestionsInputSchema},
  output: {schema: SmartGrocerySuggestionsOutputSchema},
  prompt: `You are a helpful AI assistant that provides smart grocery suggestions based on past purchases.

  Given the following list of past grocery purchases:
  {{#each pastPurchases}}
  - {{{this}}}
  {{/each}}

  Suggest additional items that the user might want to add to their grocery list. The suggestions should be relevant to the past purchases and should help the user save time and money.
  Return the suggestions as a list of strings.
  `,
});

const smartGrocerySuggestionsFlow = ai.defineFlow(
  {
    name: 'smartGrocerySuggestionsFlow',
    inputSchema: SmartGrocerySuggestionsInputSchema,
    outputSchema: SmartGrocerySuggestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
