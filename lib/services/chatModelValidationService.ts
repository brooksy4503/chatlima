import { getModelDetails } from '@/lib/models/fetch-models';
import { validatePresetParameters, getModelDefaults } from '@/lib/parameter-validation';
import type { modelID } from '@/ai/providers';
import type { ModelInfo } from '@/lib/types/models';

export interface ModelValidationContext {
    selectedModel: modelID;
    temperature?: number;
    maxTokens?: number;
    systemInstruction?: string;
}

export interface ModelValidationResult {
    modelInfo: ModelInfo | null;
    effectiveTemperature: number;
    effectiveMaxTokens: number;
    effectiveSystemInstruction: string;
}

export class ChatModelValidationService {
    /**
     * Validates model and parameters, returns effective configuration
     */
    static async validateAndConfigureModel(context: ModelValidationContext): Promise<ModelValidationResult> {
        const { selectedModel, temperature, maxTokens, systemInstruction } = context;

        // Get model info for validation and defaults
        const modelInfo = await getModelDetails(selectedModel);

        // Validate preset parameters if provided
        if (temperature !== undefined || maxTokens !== undefined || systemInstruction !== undefined) {
            const validation = validatePresetParameters(modelInfo, temperature, maxTokens, systemInstruction);
            if (!validation.valid) {
                console.error('[Parameter Validation] Invalid preset parameters:', validation.errors);
                throw new Error(`Invalid preset parameters: ${validation.errors.join(', ')}`);
            }
            console.log('[Parameter Validation] Preset parameters validated successfully');
        }

        // Get default parameters and apply overrides
        const modelDefaults = getModelDefaults(modelInfo);
        const effectiveTemperature = temperature !== undefined ? temperature : modelDefaults.temperature;
        const effectiveMaxTokens = maxTokens !== undefined ? maxTokens : modelDefaults.maxTokens;
        const effectiveSystemInstruction = systemInstruction !== undefined
            ? systemInstruction
            : `You are a helpful AI assistant. Today's date is ${new Date().toISOString().split('T')[0]}.

You have access to external tools provided by connected servers. These tools can perform specific actions like running code, searching databases, or accessing external services.

## How to Respond:
1. **Analyze the Request:** Understand what the user is asking.
2. **Use Tools When Necessary:** If an external tool provides the best way to answer (e.g., fetching specific data, performing calculations, interacting with services), select the most relevant tool(s) and use them. You can use multiple tools in sequence. Clearly indicate when you are using a tool and what it's doing.
3. **Use Your Own Abilities:** For requests involving brainstorming, explanation, writing, summarization, analysis, or general knowledge, rely on your own reasoning and knowledge base. You don't need to force the use of external tool if it's not suitable or required for these tasks.
4. **Respond Clearly:** Provide your answer directly when using your own abilities. If using tools, explain the steps taken and present the results clearly.
5. **Handle Limitations:** If you cannot answer fully (due to lack of information, missing tools, or capability limits), explain the limitation clearly. Don't just say "I don't know" if you can provide partial information or explain *why* you can't answer. If relevant tools seem to be missing, you can mention that the user could potentially add them via the server configuration.

## Response Format:
- Use Markdown for formatting.
- Base your response on the results from any tools used, or on your own reasoning and knowledge.
`;

        return {
            modelInfo,
            effectiveTemperature,
            effectiveMaxTokens,
            effectiveSystemInstruction
        };
    }

    /**
     * Checks if model supports web search
     */
    static supportsWebSearch(modelInfo: ModelInfo): boolean {
        return modelInfo.supportsWebSearch === true;
    }

    /**
     * Checks if model is premium
     */
    static isPremium(modelInfo: ModelInfo): boolean {
        return modelInfo.premium === true;
    }

    /**
     * Checks if model supports vision
     */
    static supportsVision(modelInfo: ModelInfo): boolean {
        return modelInfo.vision === true;
    }
}