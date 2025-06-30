// use server'

/**
 * @fileOverview This file defines a Genkit flow to suggest productive alternative apps to the user.
 *
 * - suggestProductiveAlternatives - A function that suggests productive alternative apps.
 * - SuggestProductiveAlternativesInput - The input type for the suggestProductiveAlternatives function.
 * - SuggestProductiveAlternativesOutput - The return type for the suggestProductiveAlternatives function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestProductiveAlternativesInputSchema = z.object({
  distractingAppName: z
    .string()
    .describe('The name of the distracting application the user was just nudged from.'),
  userProfile: z
    .string()
    .optional()
    .describe('Optional user profile information to tailor suggestions.'),
});
export type SuggestProductiveAlternativesInput = z.infer<
  typeof SuggestProductiveAlternativesInputSchema
>;

const SuggestProductiveAlternativesOutputSchema = z.object({
  suggestedAppName: z.string().describe('The name of the suggested app.'),
  reason: z.string().describe('Why the app is a good alternative.'),
});
export type SuggestProductiveAlternativesOutput = z.infer<
  typeof SuggestProductiveAlternativesOutputSchema
>;

export async function suggestProductiveAlternatives(
  input: SuggestProductiveAlternativesInput
): Promise<SuggestProductiveAlternativesOutput> {
  return suggestProductiveAlternativesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestProductiveAlternativesPrompt',
  input: {schema: SuggestProductiveAlternativesInputSchema},
  output: {schema: SuggestProductiveAlternativesOutputSchema},
  prompt: `You are an AI assistant designed to suggest productive alternative apps to users who have just been nudged away from a distracting app.

You know that the user was just using {{distractingAppName}}. Suggest a single alternative application, and give a brief reason why it would be a good alternative.  Be concise.

{% if userProfile %}Consider the following user profile when making your suggestion: {{userProfile}}{% endif %}`,
});

const suggestProductiveAlternativesFlow = ai.defineFlow(
  {
    name: 'suggestProductiveAlternativesFlow',
    inputSchema: SuggestProductiveAlternativesInputSchema,
    outputSchema: SuggestProductiveAlternativesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
