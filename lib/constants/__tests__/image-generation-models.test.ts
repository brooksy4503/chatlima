import {
    DEFAULT_IMAGE_GENERATION_MODEL,
    getImageGenerationCreditCost,
    resolveAllowedImageModel,
} from '@/lib/constants/image-generation-models';

describe('image-generation-models', () => {
    describe('resolveAllowedImageModel', () => {
        it('returns the model when allowlisted', () => {
            expect(resolveAllowedImageModel('openai/gpt-5-image-mini')).toBe('openai/gpt-5-image-mini');
        });

        it('falls back to default for unknown models', () => {
            expect(resolveAllowedImageModel('openai/dalle-3')).toBe(DEFAULT_IMAGE_GENERATION_MODEL);
            expect(resolveAllowedImageModel(undefined)).toBe(DEFAULT_IMAGE_GENERATION_MODEL);
        });
    });

    describe('getImageGenerationCreditCost', () => {
        it('returns model-specific credit costs', () => {
            expect(getImageGenerationCreditCost('openai/gpt-5-image')).toBe(25);
            expect(getImageGenerationCreditCost('openai/gpt-5-image-mini')).toBe(10);
        });

        it('uses default model cost for unknown models', () => {
            expect(getImageGenerationCreditCost('custom/model')).toBe(25);
        });
    });
});
