import type { ModelInfo } from '@/lib/types/models';
import {
    getImageGenerationCreditCost,
    resolveAllowedImageModel,
} from '@/lib/constants/image-generation-models';
import { logDiagnostic } from '@/lib/utils/performantLogging';
import {
    createOpenRouterImageGenerationTool,
    type ImageGenerationOutputFormat,
    type ImageGenerationQuality,
} from '@/lib/openrouter-image-generation-tool';
import { ChatWebSearchService } from '@/lib/services/chatWebSearchService';

export interface ImageGenerationOptions {
    enabled: boolean;
    quality: ImageGenerationQuality;
    aspectRatio: string;
    outputFormat: ImageGenerationOutputFormat;
    model: string;
}

export interface ImageGenerationContext {
    imageGeneration: ImageGenerationOptions;
    selectedModel: string;
    isUsingOwnApiKeys: boolean;
    isAnonymous: boolean;
    actualCredits: number | null;
    modelInfo: ModelInfo | null;
}

export interface ImageGenerationResult {
    enabled: boolean;
    quality: ImageGenerationQuality;
    aspectRatio: string;
    outputFormat: ImageGenerationOutputFormat;
    model: string;
    canUseImageGeneration: boolean;
    modelSupportsToolCalling: boolean;
    /** Minimum reserved cost (one image). Final billing uses actual invocation count. */
    additionalCost: number;
}

type ToolCallLike = { toolName?: string; toolCallId?: string };

export class ChatImageGenerationService {
    static validateAndConfigureImageGeneration(context: ImageGenerationContext): ImageGenerationResult {
        const {
            imageGeneration,
            selectedModel,
            isUsingOwnApiKeys,
            isAnonymous,
            actualCredits,
            modelInfo,
        } = context;

        const requestId = `imagegen_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        logDiagnostic('IMAGE_GEN_VALIDATION_START', 'Starting image generation validation', {
            requestId,
            enabled: imageGeneration.enabled,
            selectedModel,
            isUsingOwnApiKeys,
            isAnonymous,
            actualCredits,
        });

        const resolvedModel = resolveAllowedImageModel(imageGeneration.model);
        const imageCreditCost = getImageGenerationCreditCost(resolvedModel);

        const canUseImageGeneration = this.determineImageGenerationPermission({
            imageGeneration,
            resolvedModel,
            imageCreditCost,
            isUsingOwnApiKeys,
            isAnonymous,
            actualCredits,
            requestId,
        });

        const modelSupportsToolCalling = ChatWebSearchService.supportsToolCalling(modelInfo);
        const isOpenRouterModel = selectedModel.startsWith('openrouter/');

        const finalEnabled =
            imageGeneration.enabled &&
            canUseImageGeneration &&
            isOpenRouterModel &&
            modelSupportsToolCalling;

        const additionalCost = finalEnabled && !isUsingOwnApiKeys ? imageCreditCost : 0;

        logDiagnostic('IMAGE_GEN_VALIDATION_COMPLETE', 'Image generation validation completed', {
            requestId,
            requested: imageGeneration.enabled,
            canUse: canUseImageGeneration,
            modelSupportsToolCalling,
            isOpenRouterModel,
            finalEnabled,
            additionalCost,
        });

        return {
            enabled: finalEnabled,
            quality: imageGeneration.quality,
            aspectRatio: imageGeneration.aspectRatio,
            outputFormat: imageGeneration.outputFormat,
            model: resolvedModel,
            canUseImageGeneration,
            modelSupportsToolCalling,
            additionalCost,
        };
    }

    static buildOpenRouterServerTools(
        config: ImageGenerationResult,
        apiKey?: string
    ): Record<string, ReturnType<typeof createOpenRouterImageGenerationTool>> {
        if (!config.enabled) {
            return {};
        }

        return {
            image_generation: createOpenRouterImageGenerationTool({
                model: config.model,
                quality: config.quality,
                aspectRatio: config.aspectRatio,
                outputFormat: config.outputFormat,
                apiKey,
            }),
        };
    }

    static isImageGenerationToolName(toolName: string): boolean {
        return (
            toolName === 'image_generation' ||
            toolName === 'openrouter.image_generation' ||
            toolName === 'openrouter:image_generation' ||
            toolName.endsWith('.image_generation') ||
            toolName.endsWith(':image_generation')
        );
    }

    static countImageGenerationInvocations(steps: Array<{ toolCalls?: ToolCallLike[] }> | undefined): number {
        if (!steps?.length) {
            return 0;
        }

        let count = 0;
        for (const step of steps) {
            for (const call of step.toolCalls ?? []) {
                const name = call.toolName ?? '';
                if (this.isImageGenerationToolName(name)) {
                    count++;
                }
            }
        }
        return count;
    }

    static computeImageGenerationCreditCost(params: {
        imageGenerationEnabled: boolean;
        isUsingOwnApiKeys: boolean;
        shouldDeductCredits: boolean;
        model?: string;
        steps?: Array<{ toolCalls?: ToolCallLike[] }>;
    }): number {
        const { imageGenerationEnabled, isUsingOwnApiKeys, shouldDeductCredits, model, steps } = params;

        if (!imageGenerationEnabled || isUsingOwnApiKeys || !shouldDeductCredits) {
            return 0;
        }

        const invocations = this.countImageGenerationInvocations(steps);
        return invocations * getImageGenerationCreditCost(model);
    }

    static validateImageGenerationRequest(context: ImageGenerationContext): void {
        const { imageGeneration, isAnonymous, actualCredits, isUsingOwnApiKeys } = context;
        const resolvedModel = resolveAllowedImageModel(imageGeneration.model);
        const imageCreditCost = getImageGenerationCreditCost(resolvedModel);

        if (imageGeneration.enabled && isAnonymous) {
            throw new Error(
                'Image generation is only available to signed-in users with credits. Please sign in and purchase credits to use this feature.'
            );
        }

        if (
            imageGeneration.enabled &&
            !isUsingOwnApiKeys &&
            actualCredits !== null &&
            actualCredits < imageCreditCost
        ) {
            throw new Error(
                `You need at least ${imageCreditCost} credits to generate images with ${resolvedModel}. Your balance is ${actualCredits}.`
            );
        }
    }

    private static determineImageGenerationPermission(context: {
        imageGeneration: ImageGenerationOptions;
        resolvedModel: ReturnType<typeof resolveAllowedImageModel>;
        imageCreditCost: number;
        isUsingOwnApiKeys: boolean;
        isAnonymous: boolean;
        actualCredits: number | null;
        requestId: string;
    }): boolean {
        const {
            imageGeneration,
            imageCreditCost,
            isUsingOwnApiKeys,
            isAnonymous,
            actualCredits,
            requestId,
        } = context;

        if (isUsingOwnApiKeys && imageGeneration.enabled) {
            logDiagnostic('IMAGE_GEN_PERMISSION', 'Allowed for user with own API keys', { requestId });
            return true;
        }

        if (isAnonymous) {
            logDiagnostic('IMAGE_GEN_PERMISSION', 'Blocked for anonymous user', { requestId });
            return false;
        }

        if (actualCredits !== null && actualCredits >= imageCreditCost) {
            logDiagnostic('IMAGE_GEN_PERMISSION', 'Allowed for user with sufficient credits', {
                requestId,
                actualCredits,
                cost: imageCreditCost,
            });
            return imageGeneration.enabled;
        }

        if (actualCredits !== null && actualCredits < imageCreditCost) {
            logDiagnostic('IMAGE_GEN_PERMISSION', 'Blocked due to insufficient credits', {
                requestId,
                actualCredits,
                required: imageCreditCost,
            });
        }

        return false;
    }
}
