import { tool, jsonSchema, asSchema } from 'ai';
import { z } from 'zod';
import {
    cleanToolsForGoogleModels,
    googleCompatibleInputSchema,
    isGoogleModel,
    stripJsonSchemaMeta,
} from '../google-model-tools';

describe('google-model-tools', () => {
    describe('isGoogleModel', () => {
        it('detects OpenRouter Google models', () => {
            expect(isGoogleModel('openrouter/google/gemma-4-31b-it')).toBe(true);
            expect(isGoogleModel('openrouter/deepseek/deepseek-v4-flash')).toBe(false);
        });
    });

    describe('stripJsonSchemaMeta', () => {
        it('removes $schema from nested JSON schema objects', () => {
            const cleaned = stripJsonSchemaMeta({
                $schema: 'http://json-schema.org/draft-07/schema#',
                type: 'object',
                properties: {
                    query: {
                        type: 'string',
                        $schema: 'should-not-happen',
                    },
                },
            });

            expect(cleaned).toEqual({
                type: 'object',
                properties: {
                    query: {
                        type: 'string',
                    },
                },
            });
        });
    });

    describe('googleCompatibleInputSchema', () => {
        it('strips $schema from Zod-derived schemas', async () => {
            const schema = googleCompatibleInputSchema(z.object({ query: z.string() }));
            const resolved = await asSchema(schema).jsonSchema;

            expect(resolved).not.toHaveProperty('$schema');
            expect(resolved).toMatchObject({
                type: 'object',
                properties: {
                    query: { type: 'string' },
                },
            });
        });

        it('strips $schema from jsonSchema wrappers', async () => {
            const schema = googleCompatibleInputSchema(
                jsonSchema({
                    type: 'object',
                    properties: { query: { type: 'string' } },
                    $schema: 'http://json-schema.org/draft-07/schema#',
                }),
            );
            const resolved = await asSchema(schema).jsonSchema;

            expect(resolved).not.toHaveProperty('$schema');
            expect(resolved).toMatchObject({
                type: 'object',
                properties: {
                    query: { type: 'string' },
                },
            });
        });
    });

    describe('cleanToolsForGoogleModels', () => {
        it('cleans function tools and leaves provider tools unchanged', async () => {
            const providerTool = {
                type: 'provider' as const,
                id: 'openrouter.web_search',
                args: { maxResults: 5 },
            };

            const readFileTool = tool({
                description: 'Read a file',
                inputSchema: z.object({ filepath: z.string().optional() }),
                execute: async () => 'ok',
            });

            const mcpTool = tool({
                description: 'Search the web',
                inputSchema: jsonSchema({
                    type: 'object',
                    properties: { query: { type: 'string' } },
                    $schema: 'http://json-schema.org/draft-07/schema#',
                }),
                execute: async () => 'ok',
            });

            const cleaned = cleanToolsForGoogleModels({
                web_search: providerTool,
                read_file: readFileTool,
                mcp_search: mcpTool,
            });

            expect(cleaned.web_search).toBe(providerTool);
            expect(typeof cleaned.read_file.execute).toBe('function');

            const readFileSchema = await asSchema(cleaned.read_file.inputSchema).jsonSchema;
            const mcpSchema = await asSchema(cleaned.mcp_search.inputSchema).jsonSchema;

            expect(readFileSchema).not.toHaveProperty('$schema');
            expect(mcpSchema).not.toHaveProperty('$schema');
        });
    });
});
