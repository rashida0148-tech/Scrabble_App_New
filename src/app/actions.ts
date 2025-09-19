"use server";

import { suggestMove, type SuggestMoveInput, type SuggestMoveOutput } from "@/ai/flows/suggest-move";

export async function suggestMoveAction(input: SuggestMoveInput): Promise<SuggestMoveOutput | null> {
    try {
        const result = await suggestMove(input);
        return result;
    } catch (error) {
        console.error("Error in suggestMoveAction:", error);
        return null;
    }
}
