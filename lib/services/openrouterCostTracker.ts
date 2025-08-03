// Diagnostic logging helper
const logDiagnostic = (category: string, message: string, data?: any) => {
    const timestamp = new Date().toISOString();
    console.log(`[OpenRouterCostTracker:${category}] ${timestamp} - ${message}`, data || '');
};

/**
 * Service for fetching actual costs from OpenRouter's generation endpoint
 */
export class OpenRouterCostTracker {
    private static readonly BASE_URL = 'https://openrouter.ai/api/v1';

    /**
     * Fetch actual cost and native token counts from OpenRouter generation endpoint
     */
    static async fetchActualCost(generationId: string): Promise<{
        actualCost: number | null;
        nativeInputTokens: number | null;
        nativeOutputTokens: number | null;
        generationData: any;
    }> {
        const trackingId = `cost-fetch-${Date.now()}`;

        logDiagnostic('OPENROUTER_COST_FETCH_START', `Starting cost fetch from OpenRouter`, {
            trackingId,
            generationId
        });

        try {
            const apiKey = process.env.OPENROUTER_API_KEY;
            if (!apiKey) {
                logDiagnostic('OPENROUTER_COST_FETCH_ERROR', `No OpenRouter API key available`, {
                    trackingId,
                    generationId
                });
                return {
                    actualCost: null,
                    nativeInputTokens: null,
                    nativeOutputTokens: null,
                    generationData: null
                };
            }

            const url = `${this.BASE_URL}/generation?id=${generationId}`;
            logDiagnostic('OPENROUTER_COST_FETCH_REQUEST', `Making request to OpenRouter`, {
                trackingId,
                generationId,
                url
            });

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                logDiagnostic('OPENROUTER_COST_FETCH_HTTP_ERROR', `HTTP error from OpenRouter`, {
                    trackingId,
                    generationId,
                    status: response.status,
                    statusText: response.statusText
                });
                return {
                    actualCost: null,
                    nativeInputTokens: null,
                    nativeOutputTokens: null,
                    generationData: null
                };
            }

            const data = await response.json();
            logDiagnostic('OPENROUTER_COST_FETCH_RESPONSE', `Received response from OpenRouter`, {
                trackingId,
                generationId,
                hasData: !!data.data,
                dataKeys: data.data ? Object.keys(data.data) : []
            });

            if (!data.data) {
                logDiagnostic('OPENROUTER_COST_FETCH_NO_DATA', `No data in OpenRouter response`, {
                    trackingId,
                    generationId,
                    response: data
                });
                return {
                    actualCost: null,
                    nativeInputTokens: null,
                    nativeOutputTokens: null,
                    generationData: data
                };
            }

            const generation = data.data;
            const actualCost = generation.total_cost || null;
            const nativeInputTokens = generation.tokens_prompt || generation.native_tokens_prompt || null;
            const nativeOutputTokens = generation.tokens_completion || generation.native_tokens_completion || null;

            logDiagnostic('OPENROUTER_COST_FETCH_SUCCESS', `Successfully fetched cost data`, {
                trackingId,
                generationId,
                actualCost,
                nativeInputTokens,
                nativeOutputTokens,
                hasActualCost: actualCost !== null,
                hasNativeTokens: nativeInputTokens !== null && nativeOutputTokens !== null
            });

            return {
                actualCost,
                nativeInputTokens,
                nativeOutputTokens,
                generationData: generation
            };

        } catch (error) {
            logDiagnostic('OPENROUTER_COST_FETCH_ERROR', `Error fetching cost from OpenRouter`, {
                trackingId,
                generationId,
                error: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? error.stack : undefined
            });

            console.error('[OpenRouterCostTracker] Error fetching actual cost:', error);
            return {
                actualCost: null,
                nativeInputTokens: null,
                nativeOutputTokens: null,
                generationData: null
            };
        }
    }

    /**
     * Extract generation ID from OpenRouter response
     */
    static extractGenerationId(response: any): string | null {
        const trackingId = `id-extract-${Date.now()}`;

        logDiagnostic('OPENROUTER_ID_EXTRACT', `Extracting generation ID from response`, {
            trackingId,
            hasResponse: !!response,
            responseKeys: response ? Object.keys(response) : [],
            id: response?.id,
            hasId: !!response?.id
        });

        // Check common locations for the generation ID
        const generationId = response?.id ||
            response?.generation_id ||
            response?.generationId ||
            response?.metadata?.id ||
            response?.metadata?.generation_id;

        if (generationId) {
            logDiagnostic('OPENROUTER_ID_EXTRACT_SUCCESS', `Found generation ID`, {
                trackingId,
                generationId,
                source: response?.id ? 'response.id' :
                    response?.generation_id ? 'response.generation_id' :
                        response?.generationId ? 'response.generationId' :
                            response?.metadata?.id ? 'response.metadata.id' :
                                'response.metadata.generation_id'
            });
        } else {
            logDiagnostic('OPENROUTER_ID_EXTRACT_FAILED', `No generation ID found`, {
                trackingId,
                response: JSON.stringify(response, null, 2).substring(0, 500)
            });
        }

        return generationId || null;
    }
}