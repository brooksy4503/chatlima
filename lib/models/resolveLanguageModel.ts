import type { LanguageModel } from 'ai';
import {
    usesTagBasedReasoningExtraction,
    usesNativeReasoningField,
    wrapWithTagBasedReasoning,
} from '@/ai/reasoning-middleware';
import { normalizeModelId } from '@/lib/models/normalize-model-id';

// SDK provider clients are callable but don't share one strict function type.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type CallableProviderClient = any;

export interface ProviderClients {
    getOpenAIClient: () => CallableProviderClient;
    getAnthropicClient: () => CallableProviderClient;
    getGroqClient: () => CallableProviderClient;
    getXaiClient: () => CallableProviderClient;
    getOpenRouterClient: () => CallableProviderClient;
    getRequestyClient: () => CallableProviderClient;
}

const DIRECT_PROVIDERS = ['openai', 'anthropic', 'groq', 'xai'] as const;
type DirectProvider = (typeof DIRECT_PROVIDERS)[number];

function resolveDirectProviderModel(
    provider: DirectProvider,
    modelPath: string,
    modelId: string,
    clients: ProviderClients,
): LanguageModel {
    switch (provider) {
        case 'openai':
            return clients.getOpenAIClient()(modelPath) as LanguageModel;
        case 'anthropic':
            return clients.getAnthropicClient()(modelPath) as LanguageModel;
        case 'groq': {
            const groqModel = clients.getGroqClient()(modelPath);
            return usesTagBasedReasoningExtraction(modelId)
                ? wrapWithTagBasedReasoning(groqModel)
                : (groqModel as LanguageModel);
        }
        case 'xai':
            return clients.getXaiClient()(modelPath) as LanguageModel;
    }
}

function resolveRequestyModel(modelId: string, modelPath: string, clients: ProviderClients): LanguageModel {
    if (usesTagBasedReasoningExtraction(modelId)) {
        return wrapWithTagBasedReasoning(
            clients.getRequestyClient()(modelPath, { logprobs: false }),
        );
    }
    return clients.getRequestyClient()(modelPath) as LanguageModel;
}

function resolveOpenRouterModel(modelId: string, modelPath: string, clients: ProviderClients): LanguageModel {
    if (usesNativeReasoningField(modelId)) {
        return clients.getOpenRouterClient()(modelPath) as LanguageModel;
    }

    if (modelPath === 'x-ai/grok-3-mini-beta' && modelId.includes('reasoning-high')) {
        return wrapWithTagBasedReasoning(
            clients.getOpenRouterClient()('x-ai/grok-3-mini-beta', {
                reasoning: { effort: 'high' },
                logprobs: false,
            }),
        );
    }

    if (usesTagBasedReasoningExtraction(modelId)) {
        return wrapWithTagBasedReasoning(
            clients.getOpenRouterClient()(modelPath, { logprobs: false }),
        );
    }

    return clients.getOpenRouterClient()(modelPath) as LanguageModel;
}

export function resolveLanguageModel(
    modelId: string,
    clients: ProviderClients,
    staticModels: Record<string, LanguageModel>,
): LanguageModel {
    const normalizedId = normalizeModelId(modelId);
    const [prefix, ...pathParts] = normalizedId.split('/');
    const modelPath = pathParts.join('/');

    if (prefix === 'requesty' && modelPath) {
        console.log(`[resolveLanguageModel] Creating dynamic requesty/ client for: ${modelPath}`);
        return resolveRequestyModel(normalizedId, modelPath, clients);
    }

    if (prefix === 'openrouter' && modelPath) {
        console.log(`[resolveLanguageModel] Creating dynamic openrouter/ client for: ${modelPath}`);
        return resolveOpenRouterModel(normalizedId, modelPath, clients);
    }

    if (DIRECT_PROVIDERS.includes(prefix as DirectProvider) && modelPath) {
        console.log(`[resolveLanguageModel] Creating dynamic ${prefix}/ client for: ${modelPath}`);
        return resolveDirectProviderModel(prefix as DirectProvider, modelPath, normalizedId, clients);
    }

    const staticModel = staticModels[normalizedId] ?? staticModels[modelId];
    if (staticModel) {
        return staticModel;
    }

    console.warn(`Model ${modelId} not found in dynamic models, falling back to static model`);
    return staticModels[normalizedId as keyof typeof staticModels];
}
