import { asSchema, jsonSchema, type FlexibleSchema, type Tool } from 'ai';

/**
 * Google models routed via OpenRouter/Vertex reject JSON Schema `$schema` metadata
 * on tool definitions. AI SDK v6's `asSchema().jsonSchema` always includes it,
 * so we wrap each tool's input schema to strip `$schema` at resolution time.
 *
 * Do not recursively mutate tool objects — that breaks Zod v4 schemas, provider
 * tools, and jsonSchema getter-only wrappers (causing 500s before streamText runs).
 */
export function isGoogleModel(selectedModel: string): boolean {
    return selectedModel.includes('vertex/google/') ||
        selectedModel.includes('google/gemini') ||
        selectedModel.includes('openrouter/google/') ||
        selectedModel.includes('coding/gemini') ||
        selectedModel.includes('requesty/google/') ||
        (selectedModel.includes('vertex') && selectedModel.includes('google')) ||
        selectedModel.toLowerCase().includes('gemini');
}

export function stripJsonSchemaMeta<T>(value: T): T {
    if (value === null || value === undefined) {
        return value;
    }

    if (Array.isArray(value)) {
        return value.map((item) => stripJsonSchemaMeta(item)) as T;
    }

    if (typeof value !== 'object') {
        return value;
    }

    const result: Record<string, unknown> = {};
    for (const [key, nestedValue] of Object.entries(value as Record<string, unknown>)) {
        if (key === '$schema') {
            continue;
        }
        result[key] = stripJsonSchemaMeta(nestedValue);
    }

    return result as T;
}

export function googleCompatibleInputSchema(inputSchema: FlexibleSchema<unknown> | undefined) {
    const baseSchema = asSchema(inputSchema);

    return jsonSchema(
        () => stripJsonSchemaMeta(baseSchema.jsonSchema),
        baseSchema.validate ? { validate: baseSchema.validate } : undefined,
    );
}

export function cleanToolsForGoogleModels(
    tools: Record<string, Tool>,
): Record<string, Tool> {
    const cleaned: Record<string, Tool> = {};

    for (const [name, toolDef] of Object.entries(tools)) {
        if (toolDef == null) {
            continue;
        }

        // Provider tools (e.g. OpenRouter web_search) are sent without JSON schemas.
        if (toolDef.type === 'provider') {
            cleaned[name] = toolDef;
            continue;
        }

        cleaned[name] = {
            ...toolDef,
            inputSchema: googleCompatibleInputSchema(toolDef.inputSchema),
        };
    }

    return cleaned;
}
