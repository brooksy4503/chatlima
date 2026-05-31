export const IMAGE_GENERATION_MODELS = {
    'openai/gpt-5-image': { label: 'GPT-5 Image', creditCost: 25 },
    'openai/gpt-5-image-mini': { label: 'GPT-5 Image Mini', creditCost: 10 },
} as const;

export type AllowedImageModelId = keyof typeof IMAGE_GENERATION_MODELS;

export const DEFAULT_IMAGE_GENERATION_MODEL: AllowedImageModelId = 'openai/gpt-5-image';

export const IMAGE_GENERATION_MODEL_OPTIONS = Object.entries(IMAGE_GENERATION_MODELS).map(
    ([id, config]) => ({
        id: id as AllowedImageModelId,
        ...config,
    })
);

export function resolveAllowedImageModel(model?: string): AllowedImageModelId {
    if (model && model in IMAGE_GENERATION_MODELS) {
        return model as AllowedImageModelId;
    }

    return DEFAULT_IMAGE_GENERATION_MODEL;
}

export function getImageGenerationCreditCost(model?: string): number {
    const resolvedModel = resolveAllowedImageModel(model);
    return IMAGE_GENERATION_MODELS[resolvedModel].creditCost;
}
