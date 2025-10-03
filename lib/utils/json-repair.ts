import { jsonrepair } from 'jsonrepair';
import type { JSONParseError, TypeValidationError } from 'ai';

/**
 * Repairs malformed JSON text using the jsonrepair library.
 * This is designed to work with Vercel AI SDK's experimental_repairText callback
 * to automatically fix invalid JSON from cost-efficient LLMs.
 * 
 * Based on Matt Pocock's approach demonstrating 100% parsing success rate
 * even with highly malformed JSON (syntax errors, unquoted keys, inline comments).
 * 
 * @param options - Object containing the malformed JSON text and error details
 * @returns Promise resolving to the repaired JSON string, or null if repair fails
 */
export async function repairJSON(options: {
    text: string;
    error: JSONParseError | TypeValidationError;
}): Promise<string | null> {
    const text = options.text;

    try {
        // First try parsing without repair - if it works, return as-is
        JSON.parse(text);
        return text;
    } catch (originalError) {
        try {
            // Attempt repair using jsonrepair
            const repaired = jsonrepair(text);

            // Verify the repaired JSON is valid
            JSON.parse(repaired);

            // Log successful repair for monitoring and model evaluation
            console.log('[JSON Repair] Successfully fixed malformed JSON', {
                errorType: options.error.name,
                originalLength: text.length,
                repairedLength: repaired.length,
                originalSample: text.substring(0, 200),
                repairedSample: repaired.substring(0, 200),
                timestamp: new Date().toISOString()
            });

            return repaired;
        } catch (repairError) {
            // If repair fails, log detailed error for debugging
            console.error('[JSON Repair] Failed to repair JSON', {
                originalError: originalError instanceof Error ? originalError.message : 'Unknown error',
                repairError: repairError instanceof Error ? repairError.message : 'Unknown error',
                textSample: text.substring(0, 500),
                timestamp: new Date().toISOString()
            });

            // Return null to indicate repair failed (AI SDK will use default behavior)
            return null;
        }
    }
}

