// This file contains the Genkit flow for suggesting a move to the player.

'use server';

/**
 * @fileOverview Suggests a move to the player.
 *
 * - suggestMove - A function that suggests a move to the player.
 * - SuggestMoveInput - The input type for the suggestMove function.
 * - SuggestMoveOutput - The return type for the suggestMove function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestMoveInputSchema = z.object({
  boardState: z.string().describe('The current state of the Scrabble board.'),
  playerRack: z.string().describe('The letters currently in the player\'s rack.'),
  availableLetters: z.string().describe('The letters available in the tile bag.'),
  dictionary: z.string().describe('A list of valid words.'),
});

export type SuggestMoveInput = z.infer<typeof SuggestMoveInputSchema>;

const SuggestMoveOutputSchema = z.object({
  move: z.string().describe('Suggested move for the player.'),
  reasoning: z.string().describe('The AI reasoning behind the suggested move.'),
});

export type SuggestMoveOutput = z.infer<typeof SuggestMoveOutputSchema>;

export async function suggestMove(input: SuggestMoveInput): Promise<SuggestMoveOutput> {
  return suggestMoveFlow(input);
}

const suggestMovePrompt = ai.definePrompt({
  name: 'suggestMovePrompt',
  input: {schema: SuggestMoveInputSchema},
  output: {schema: SuggestMoveOutputSchema},
  prompt: `You are a Scrabble expert. Given the current board state, the player\'s rack, and the available letters, suggest the best possible move for the player.

Consider the following:

*   Maximize the score of the move.
*   Use as many letters from the player\'s rack as possible.
*   Create opportunities for future moves.
*   Block the opponent from making high-scoring moves.

Here is the board state:
{{{boardState}}}

Here is the player\'s rack:
{{{playerRack}}}

Here are the available letters:
{{{availableLetters}}}

Here is the dictionary:
{{{dictionary}}}

Suggest a move and explain your reasoning.`,
});

const suggestMoveFlow = ai.defineFlow(
  {
    name: 'suggestMoveFlow',
    inputSchema: SuggestMoveInputSchema,
    outputSchema: SuggestMoveOutputSchema,
  },
  async input => {
    const {output} = await suggestMovePrompt(input);
    return output!;
  }
);
