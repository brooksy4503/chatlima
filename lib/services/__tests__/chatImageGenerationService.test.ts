import { ChatImageGenerationService } from '@/lib/services/chatImageGenerationService';
import { IMAGE_GENERATION_COST } from '@/lib/tokenCounter';

describe('ChatImageGenerationService', () => {
    const baseContext = {
        imageGeneration: {
            enabled: true,
            quality: 'medium' as const,
            aspectRatio: '1:1',
            outputFormat: 'png' as const,
            model: 'openai/gpt-5-image',
        },
        selectedModel: 'openrouter/openai/gpt-4o',
        isUsingOwnApiKeys: false,
        isAnonymous: false,
        actualCredits: 100,
        modelInfo: {
            id: 'openrouter/openai/gpt-4o',
            provider: 'openai',
            name: 'GPT-4o',
            premium: false,
            vision: true,
            supportsToolCalling: true,
            capabilities: ['Tools'],
            status: 'available' as const,
            lastChecked: new Date(),
        },
    };

    describe('validateAndConfigureImageGeneration', () => {
        it('enables image generation for eligible OpenRouter tool-calling models', () => {
            const result = ChatImageGenerationService.validateAndConfigureImageGeneration(baseContext);

            expect(result.enabled).toBe(true);
            expect(result.additionalCost).toBe(IMAGE_GENERATION_COST);
        });

        it('disables image generation for anonymous users', () => {
            const result = ChatImageGenerationService.validateAndConfigureImageGeneration({
                ...baseContext,
                isAnonymous: true,
            });

            expect(result.enabled).toBe(false);
            expect(result.canUseImageGeneration).toBe(false);
        });

        it('disables image generation when model lacks tool calling support', () => {
            const result = ChatImageGenerationService.validateAndConfigureImageGeneration({
                ...baseContext,
                modelInfo: {
                    ...baseContext.modelInfo,
                    supportsToolCalling: false,
                    capabilities: [],
                },
            });

            expect(result.enabled).toBe(false);
        });
    });

    describe('buildOpenRouterServerTools', () => {
        it('returns image_generation tool when enabled', () => {
            const config = ChatImageGenerationService.validateAndConfigureImageGeneration(baseContext);
            const tools = ChatImageGenerationService.buildOpenRouterServerTools(config);

            expect(tools.image_generation).toBeDefined();
        });

        it('returns empty object when disabled', () => {
            const config = ChatImageGenerationService.validateAndConfigureImageGeneration({
                ...baseContext,
                imageGeneration: { ...baseContext.imageGeneration, enabled: false },
            });
            const tools = ChatImageGenerationService.buildOpenRouterServerTools(config);

            expect(Object.keys(tools)).toHaveLength(0);
        });
    });

    describe('computeImageGenerationCreditCost', () => {
        it('charges per invocation when credits apply', () => {
            const cost = ChatImageGenerationService.computeImageGenerationCreditCost({
                imageGenerationEnabled: true,
                isUsingOwnApiKeys: false,
                shouldDeductCredits: true,
                steps: [{ toolCalls: [{ toolName: 'image_generation' }, { toolName: 'image_generation' }] }],
            });

            expect(cost).toBe(IMAGE_GENERATION_COST * 2);
        });

        it('returns zero for BYOK users', () => {
            const cost = ChatImageGenerationService.computeImageGenerationCreditCost({
                imageGenerationEnabled: true,
                isUsingOwnApiKeys: true,
                shouldDeductCredits: true,
                steps: [{ toolCalls: [{ toolName: 'image_generation' }] }],
            });

            expect(cost).toBe(0);
        });
    });

    describe('isImageGenerationToolName', () => {
        it('recognizes OpenRouter image generation tool aliases', () => {
            expect(ChatImageGenerationService.isImageGenerationToolName('image_generation')).toBe(true);
            expect(ChatImageGenerationService.isImageGenerationToolName('openrouter:image_generation')).toBe(true);
            expect(ChatImageGenerationService.isImageGenerationToolName('web_search')).toBe(false);
        });
    });
});
