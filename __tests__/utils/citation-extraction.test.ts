import {
    extractCitationsFromResponse,
    normalizeCitations,
    detectWebSearchProvider,
    getWebSearchOptions
} from '@/lib/utils/citation-extraction';
import type { WebSearchCitation } from '@/lib/types';

describe('Citation Extraction Utilities', () => {
    describe('extractCitationsFromResponse', () => {
        it('extracts citations from OpenRouter response', () => {
            const response = {
                annotations: [
                    {
                        type: 'url_citation',
                        url_citation: {
                            url: 'https://example.com/article1',
                            title: 'Example Article 1',
                            content: 'Article content here',
                            start_index: 0,
                            end_index: 10
                        }
                    },
                    {
                        type: 'url_citation',
                        url_citation: {
                            url: 'https://example.com/article2',
                            title: 'Example Article 2',
                            start_index: 20,
                            end_index: 30
                        }
                    }
                ]
            };

            const result = extractCitationsFromResponse(response, 'openrouter');

            expect(result).toHaveLength(2);
            expect(result[0]).toEqual({
                url: 'https://example.com/article1',
                title: 'Example Article 1',
                content: 'Article content here',
                startIndex: 0,
                endIndex: 10,
                source: 'openrouter'
            });
            expect(result[1]).toEqual({
                url: 'https://example.com/article2',
                title: 'Example Article 2',
                content: undefined,
                startIndex: 20,
                endIndex: 30,
                source: 'openrouter'
            });
        });

        it('returns empty array when no annotations', () => {
            const response = { annotations: [] };
            const result = extractCitationsFromResponse(response, 'openrouter');
            expect(result).toEqual([]);
        });

        it('returns empty array when annotations is undefined', () => {
            const response = {};
            const result = extractCitationsFromResponse(response, 'openrouter');
            expect(result).toEqual([]);
        });

        it('filters out non-url_citation annotations', () => {
            const response = {
                annotations: [
                    {
                        type: 'url_citation',
                        url_citation: {
                            url: 'https://example.com/article1',
                            title: 'Example Article 1',
                            start_index: 0,
                            end_index: 10
                        }
                    },
                    {
                        type: 'other_annotation',
                        data: 'some data'
                    }
                ]
            };

            const result = extractCitationsFromResponse(response, 'openrouter');
            expect(result).toHaveLength(1);
        });

        it('works with different providers', () => {
            const response = {
                annotations: [
                    {
                        type: 'url_citation',
                        url_citation: {
                            url: 'https://example.com/test',
                            title: 'Test Article',
                            start_index: 0,
                            end_index: 5
                        }
                    }
                ]
            };

            const openaiResult = extractCitationsFromResponse(response, 'openai');
            const perplexityResult = extractCitationsFromResponse(response, 'perplexity');

            expect(openaiResult[0].source).toBe('openai');
            expect(perplexityResult[0].source).toBe('perplexity');
        });

        it('extracts citations from Perplexity response with various formats', () => {
            const response = {
                annotations: [
                    // Standard OpenRouter format for Perplexity
                    {
                        type: 'url_citation',
                        url_citation: {
                            url: 'https://example.com/standard',
                            title: 'Standard Format',
                            content: 'Standard content',
                            start_index: 0,
                            end_index: 10
                        }
                    },
                    // Direct citation format
                    {
                        type: 'citation',
                        url: 'https://example.com/direct',
                        title: 'Direct Format',
                        content: 'Direct content',
                        start_index: 20,
                        end_index: 30
                    }
                ]
            };

            const result = extractCitationsFromResponse(response, 'perplexity');
            expect(result).toHaveLength(2);
            expect(result[0]).toEqual({
                url: 'https://example.com/standard',
                title: 'Standard Format',
                content: 'Standard content',
                startIndex: 0,
                endIndex: 10,
                source: 'perplexity'
            });
            expect(result[1]).toEqual({
                url: 'https://example.com/direct',
                title: 'Direct Format',
                content: 'Direct content',
                startIndex: 20,
                endIndex: 30,
                source: 'perplexity'
            });
        });

        it('extracts citations from text when OpenRouter does not provide annotations for Perplexity', () => {
            const response = {
                messages: [
                    {
                        role: 'assistant',
                        content: [
                            {
                                type: 'text',
                                text: 'This is a test response with citations[1][2]. More text here[3]. Final text.'
                            }
                        ]
                    }
                ]
            };

            const result = extractCitationsFromResponse(response, 'perplexity');
            expect(result).toHaveLength(3);
            expect(result[0]).toEqual({
                url: 'https://source-1.example.com',
                title: 'Source 1',
                content: 'Citation 1 - URL not available',
                startIndex: 0,
                endIndex: 0,
                source: 'perplexity'
            });
            expect(result[1]).toEqual({
                url: 'https://source-2.example.com',
                title: 'Source 2',
                content: 'Citation 2 - URL not available',
                startIndex: 0,
                endIndex: 0,
                source: 'perplexity'
            });
            expect(result[2]).toEqual({
                url: 'https://source-3.example.com',
                title: 'Source 3',
                content: 'Citation 3 - URL not available',
                startIndex: 0,
                endIndex: 0,
                source: 'perplexity'
            });
        });

        it('extracts citations from text with sources section', () => {
            const response = {
                messages: [
                    {
                        role: 'assistant',
                        content: [
                            {
                                type: 'text',
                                text: 'This is content with citations[1][2]. Sources: https://example.com/source1 https://test.com/source2'
                            }
                        ]
                    }
                ]
            };

            const result = extractCitationsFromResponse(response, 'perplexity');
            expect(result).toHaveLength(2);
            expect(result[0]).toEqual({
                url: 'https://example.com/source1',
                title: 'Source1 - example.com',
                content: 'Inline citation 1',
                startIndex: 0,
                endIndex: 0,
                source: 'perplexity'
            });
            expect(result[1]).toEqual({
                url: 'https://test.com/source2',
                title: 'Source2 - test.com',
                content: 'Inline citation 2',
                startIndex: 0,
                endIndex: 0,
                source: 'perplexity'
            });
        });
    });

    describe('normalizeCitations', () => {
        it('removes duplicate citations based on URL', () => {
            const citations: WebSearchCitation[] = [
                {
                    url: 'https://example.com/article1',
                    title: 'Article 1',
                    startIndex: 0,
                    endIndex: 10,
                    source: 'openrouter'
                },
                {
                    url: 'https://example.com/article2',
                    title: 'Article 2',
                    startIndex: 20,
                    endIndex: 30,
                    source: 'openrouter'
                },
                {
                    url: 'https://example.com/article1',
                    title: 'Article 1 Duplicate',
                    startIndex: 40,
                    endIndex: 50,
                    source: 'openai'
                }
            ];

            const result = normalizeCitations(citations);
            expect(result).toHaveLength(2);
            expect(result.map(c => c.url)).toEqual([
                'https://example.com/article1',
                'https://example.com/article2'
            ]);
        });

        it('returns empty array for empty input', () => {
            const result = normalizeCitations([]);
            expect(result).toEqual([]);
        });

        it('preserves order of first occurrence', () => {
            const citations: WebSearchCitation[] = [
                {
                    url: 'https://example.com/article1',
                    title: 'First',
                    startIndex: 0,
                    endIndex: 10,
                    source: 'openrouter'
                },
                {
                    url: 'https://example.com/article2',
                    title: 'Second',
                    startIndex: 20,
                    endIndex: 30,
                    source: 'openrouter'
                },
                {
                    url: 'https://example.com/article1',
                    title: 'Duplicate',
                    startIndex: 40,
                    endIndex: 50,
                    source: 'openai'
                }
            ];

            const result = normalizeCitations(citations);
            expect(result[0].title).toBe('First');
        });
    });

    describe('detectWebSearchProvider', () => {
        it('detects OpenRouter models', () => {
            expect(detectWebSearchProvider('openrouter/gpt-4')).toBe('openrouter');
            expect(detectWebSearchProvider('openrouter/claude-3-sonnet')).toBe('openrouter');
        });

        it('detects OpenAI models with web search', () => {
            expect(detectWebSearchProvider('openai/gpt-4')).toBe('openai');
            expect(detectWebSearchProvider('openai/gpt-4o')).toBe('openai');
            expect(detectWebSearchProvider('openai/gpt-4-turbo')).toBe('openai');
        });

        it('detects Perplexity models', () => {
            expect(detectWebSearchProvider('perplexity/sonar-pro')).toBe('perplexity');
            expect(detectWebSearchProvider('perplexity/sonar-reasoning')).toBe('perplexity');
            expect(detectWebSearchProvider('openai/sonar-pro')).toBe('perplexity');
        });

        it('detects Perplexity Sonar models through OpenRouter', () => {
            expect(detectWebSearchProvider('openrouter/perplexity/llama-3.1-sonar-small-128k-online')).toBe('perplexity');
            expect(detectWebSearchProvider('openrouter/perplexity/llama-3.1-sonar-large-128k-online')).toBe('perplexity');
            expect(detectWebSearchProvider('openrouter/perplexity/sonar-reasoning')).toBe('perplexity');
        });

        it('returns undefined for unsupported models', () => {
            expect(detectWebSearchProvider('anthropic/claude-3-haiku')).toBeUndefined();
            expect(detectWebSearchProvider('meta/llama-3')).toBeUndefined();
            expect(detectWebSearchProvider('openai/gpt-3.5-turbo')).toBeUndefined();
        });
    });

    describe('getWebSearchOptions', () => {
        it('returns OpenRouter plugin options', () => {
            const options = getWebSearchOptions('openrouter', {
                contextSize: 'medium',
                maxResults: 3,
                searchPrompt: 'Custom search prompt'
            });

            expect(options).toEqual({
                plugins: [{
                    id: 'web',
                    max_results: 3,
                    search_prompt: 'Custom search prompt'
                }]
            });
        });

        it('uses default values for OpenRouter when not provided', () => {
            const options = getWebSearchOptions('openrouter', {
                contextSize: 'high'
            });

            expect(options).toEqual({
                plugins: [{
                    id: 'web',
                    max_results: 5,
                    search_prompt: 'A web search was conducted. Incorporate the following web search results into your response.'
                }]
            });
        });

        it('returns OpenAI web search options', () => {
            const options = getWebSearchOptions('openai', {
                contextSize: 'low'
            });

            expect(options).toEqual({
                web_search_options: {
                    search_context_size: 'low'
                }
            });
        });

        it('returns Perplexity web search options', () => {
            const options = getWebSearchOptions('perplexity', {
                contextSize: 'high'
            });

            expect(options).toEqual({
                web_search_options: {
                    search_context_size: 'high'
                }
            });
        });

        it('returns empty object for unknown provider', () => {
            const options = getWebSearchOptions('unknown' as any, {
                contextSize: 'medium'
            });

            expect(options).toEqual({});
        });
    });
});
