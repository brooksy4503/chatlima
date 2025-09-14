import type { WebSearchCitation, OpenRouterCitationAnnotation } from '@/lib/types';

/**
 * Generate a readable title from a URL
 */
function generateTitleFromUrl(url: string): string {
    try {
        const urlObj = new URL(url);
        const domain = urlObj.hostname.replace('www.', '');
        const pathParts = urlObj.pathname.split('/').filter(part => part && part !== '');

        if (pathParts.length > 0) {
            // Use the last path segment as title, cleaned up
            const lastPart = pathParts[pathParts.length - 1];
            const cleanTitle = lastPart
                .replace(/[_-]/g, ' ')
                .replace(/\.(html|htm|php|aspx?)$/i, '')
                .replace(/([a-z])([A-Z])/g, '$1 $2')
                .split(' ')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                .join(' ');
            return `${cleanTitle} - ${domain}`;
        }

        return domain;
    } catch (e) {
        // If URL parsing fails, return the original URL
        return url;
    }
}

export function extractCitationsFromResponse(
    response: any,
    provider: 'openrouter' | 'openai' | 'perplexity'
): WebSearchCitation[] {
    console.log(`[Citation Extraction] Processing response for provider: ${provider}`, {
        hasAnnotations: !!response.annotations?.length,
        annotationCount: response.annotations?.length || 0,
        hasMessages: !!response.messages?.length,
        messageCount: response.messages?.length || 0
    });

    // For Perplexity models through OpenRouter, try text-based extraction first
    if (provider === 'perplexity' && !response.annotations?.length) {
        console.log('[Citation Extraction] No annotations for Perplexity, trying text extraction');
        return extractCitationsFromText(response);
    }

    if (!response.annotations?.length) {
        console.log('[Citation Extraction] No annotations found, checking for text-based citations');
        // Try text extraction for all providers as fallback
        const textCitations = extractCitationsFromText(response);
        if (textCitations.length > 0) {
            console.log(`[Citation Extraction] Found ${textCitations.length} text-based citations`);
            return textCitations;
        }
        return [];
    }

    console.log(`[Citation Extraction] Processing ${response.annotations.length} annotations`);

    // Handle different citation formats based on provider
    if (provider === 'perplexity') {
        // For Perplexity models (including through OpenRouter), try both formats
        const citations = response.annotations
            .filter((annotation: any) =>
                annotation.type === 'url_citation' || annotation.type === 'citation'
            )
            .map((annotation: any, index: number) => {
                console.log(`[Citation Extraction] Processing Perplexity annotation ${index}:`, annotation);

                // Handle standard OpenRouter format for Perplexity models
                if (annotation.url_citation) {
                    return {
                        url: annotation.url_citation.url,
                        title: annotation.url_citation.title || generateTitleFromUrl(annotation.url_citation.url),
                        content: annotation.url_citation.content,
                        startIndex: annotation.url_citation.start_index,
                        endIndex: annotation.url_citation.end_index,
                        source: provider
                    };
                }
                // Handle potential native Perplexity format
                else if (annotation.citation) {
                    return {
                        url: annotation.citation.url || annotation.url,
                        title: annotation.citation.title || annotation.title || generateTitleFromUrl(annotation.citation.url || annotation.url),
                        content: annotation.citation.content || annotation.content,
                        startIndex: annotation.citation.start_index || annotation.start_index || 0,
                        endIndex: annotation.citation.end_index || annotation.end_index || 0,
                        source: provider
                    };
                }
                // Fallback: annotation might be the citation itself
                else if (annotation.url) {
                    return {
                        url: annotation.url,
                        title: annotation.title || generateTitleFromUrl(annotation.url),
                        content: annotation.content,
                        startIndex: annotation.start_index || 0,
                        endIndex: annotation.end_index || 0,
                        source: provider
                    };
                }
                return null;
            })
            .filter(Boolean) as WebSearchCitation[];

        console.log(`[Citation Extraction] Extracted ${citations.length} Perplexity citations`);
        return citations;
    }

    // Default OpenRouter/OpenAI format
    const citations = response.annotations
        .filter((annotation: any) => annotation.type === 'url_citation')
        .map((annotation: OpenRouterCitationAnnotation, index: number) => {
            console.log(`[Citation Extraction] Processing standard annotation ${index}:`, annotation);
            return {
                url: annotation.url_citation.url,
                title: annotation.url_citation.title || generateTitleFromUrl(annotation.url_citation.url),
                content: annotation.url_citation.content,
                startIndex: annotation.url_citation.start_index,
                endIndex: annotation.url_citation.end_index,
                source: provider
            };
        });

    console.log(`[Citation Extraction] Extracted ${citations.length} standard citations`);
    return citations;
}

/**
 * Extract citations from text content when OpenRouter doesn't provide structured annotations
 * Enhanced to handle multiple citation formats like Scira does
 */
function extractCitationsFromText(response: any): WebSearchCitation[] {
    console.log('[Citation Extraction] Attempting text-based extraction');

    if (!response.messages?.length) {
        console.log('[Citation Extraction] No messages found in response');
        return [];
    }

    const assistantMessage = response.messages.find((msg: any) => msg.role === 'assistant');
    if (!assistantMessage?.content?.length) {
        console.log('[Citation Extraction] No assistant message content found');
        return [];
    }

    const textContent = assistantMessage.content
        .filter((part: any) => part.type === 'text')
        .map((part: any) => part.text)
        .join(' ');

    console.log('[Citation Extraction] Text content length:', textContent.length);

    // Try multiple extraction patterns like Scira does

    // 1. Extract markdown-style citations like [1](url) or [5](url)
    const markdownCitations = extractMarkdownCitations(textContent);
    if (markdownCitations.length > 0) {
        console.log(`[Citation Extraction] Found ${markdownCitations.length} markdown citations`);
        return markdownCitations;
    }

    // 2. Extract inline URL citations with numbers
    const inlineCitations = extractInlineUrlCitations(textContent);
    if (inlineCitations.length > 0) {
        console.log(`[Citation Extraction] Found ${inlineCitations.length} inline URL citations`);
        return inlineCitations;
    }

    // 3. Extract from sources sections (common in Perplexity responses)
    const sourcesSectionCitations = extractSourcesSectionCitations(textContent);
    if (sourcesSectionCitations.length > 0) {
        console.log(`[Citation Extraction] Found ${sourcesSectionCitations.length} sources section citations`);
        return sourcesSectionCitations;
    }

    // 4. Extract numbered citations with fallback URLs
    const numberedCitations = extractNumberedCitations(textContent);
    if (numberedCitations.length > 0) {
        console.log(`[Citation Extraction] Found ${numberedCitations.length} numbered citations`);
        return numberedCitations;
    }

    console.log('[Citation Extraction] No citations found in text');
    return [];
}

/**
 * Extract markdown-style citations [1](url)
 */
function extractMarkdownCitations(textContent: string): WebSearchCitation[] {
    const markdownCitations = textContent.match(/\[(\d+)\]\((https?:\/\/[^\)]+)\)/g);

    if (!markdownCitations || markdownCitations.length === 0) return [];

    const citations: WebSearchCitation[] = [];

    markdownCitations.forEach((match: string) => {
        const markdownMatch = match.match(/\[(\d+)\]\((https?:\/\/[^\)]+)\)/);
        if (markdownMatch) {
            const [, number, url] = markdownMatch;
            const citationNumber = parseInt(number);

            citations.push({
                url,
                title: generateTitleFromUrl(url),
                content: `Source ${citationNumber}`,
                startIndex: 0,
                endIndex: 0,
                source: 'perplexity' as const
            });
        }
    });

    // Remove duplicates and sort by citation number
    const uniqueCitations = citations.filter((citation, index, self) =>
        index === self.findIndex(c => c.url === citation.url)
    );

    return uniqueCitations.sort((a, b) => {
        const aNum = parseInt(a.title.match(/Source (\d+)/)?.[1] || '0');
        const bNum = parseInt(b.title.match(/Source (\d+)/)?.[1] || '0');
        return aNum - bNum;
    });
}

/**
 * Extract inline URL citations (URLs that appear directly in text with context)
 */
function extractInlineUrlCitations(textContent: string): WebSearchCitation[] {
    // Look for URLs that appear inline in the text
    const urlPattern = /https?:\/\/[^\s\]]+/g;
    const urls = textContent.match(urlPattern);

    if (!urls || urls.length === 0) return [];

    // Create citations for unique URLs
    const uniqueUrls = Array.from(new Set(urls));

    return uniqueUrls.map((url, index) => ({
        url,
        title: generateTitleFromUrl(url),
        content: `Inline citation ${index + 1}`,
        startIndex: 0,
        endIndex: 0,
        source: 'perplexity' as const
    }));
}

/**
 * Extract citations from a sources section
 */
function extractSourcesSectionCitations(textContent: string): WebSearchCitation[] {
    // Look for various sources section patterns
    const sourcesPatterns = [
        /Sources?:\s*([\s\S]+)$/i,
        /References?:\s*([\s\S]+)$/i,
        /Links?:\s*([\s\S]+)$/i,
        /Citations?:\s*([\s\S]+)$/i
    ];

    let sourceContent = '';

    for (const pattern of sourcesPatterns) {
        const match = textContent.match(pattern);
        if (match) {
            sourceContent = match[1];
            break;
        }
    }

    if (!sourceContent) return [];

    // Extract URLs from the sources section
    const urlMatches = sourceContent.match(/https?:\/\/[^\s\]]+/g);
    if (!urlMatches) return [];

    // Also look for numbered citations in the main text
    const citationMatches = textContent.match(/\[(\d+)\]/g);
    const citationNumbers = citationMatches
        ? Array.from(new Set(citationMatches.map(match => parseInt(match.replace(/[\[\]]/g, '')))))
        : [];

    return urlMatches.map((url, index) => {
        const citationNumber = citationNumbers[index] || (index + 1);
        return {
            url,
            title: generateTitleFromUrl(url),
            content: `Source ${citationNumber}`,
            startIndex: 0,
            endIndex: 0,
            source: 'perplexity' as const
        };
    });
}

/**
 * Extract numbered citations with fallback URLs
 */
function extractNumberedCitations(textContent: string): WebSearchCitation[] {
    const citationMatches = textContent.match(/\[(\d+)\]/g);
    if (!citationMatches) return [];

    // Extract unique citation numbers
    const numbers = citationMatches.map((match: string) =>
        parseInt(match.replace(/[\[\]]/g, ''))
    );
    const citationNumbers = Array.from(new Set(numbers)).sort((a, b) => a - b);

    // Create fallback citations (these would ideally be replaced with real URLs)
    return citationNumbers.map((num) => ({
        url: `https://source-${num}.example.com`,
        title: `Source ${num}`,
        content: `Citation ${num} - URL not available`,
        startIndex: 0,
        endIndex: 0,
        source: 'perplexity' as const
    }));
}

export function normalizeCitations(citations: WebSearchCitation[]): WebSearchCitation[] {
    // Remove duplicates based on URL
    const seen = new Set<string>();
    return citations.filter(citation => {
        if (seen.has(citation.url)) return false;
        seen.add(citation.url);
        return true;
    });
}

/**
 * Convert markdown-style citations [1](url) to clean [1] format in text
 * Enhanced to handle multiple citation formats like Scira does
 */
export function cleanCitationText(text: string): string {
    console.log('[Citation Cleaning] Original text length:', text.length);

    let cleanedText = text;

    // 1. Replace [number](url) with just [number]
    cleanedText = cleanedText.replace(/\[(\d+)\]\(https?:\/\/[^\)]+\)/g, '[$1]');

    // 2. Remove any standalone URLs that aren't in citation format
    // Keep URLs that are part of content but remove redundant ones
    const urlPattern = /(?<!\[)\bhttps?:\/\/[^\s\]]+(?!\])/g;
    const existingCitations = cleanedText.match(/\[\d+\]/g) || [];

    // Only remove URLs if we have corresponding citation numbers
    if (existingCitations.length > 0) {
        cleanedText = cleanedText.replace(urlPattern, '');
        // Clean up any extra whitespace left by URL removal
        cleanedText = cleanedText.replace(/\s{2,}/g, ' ').trim();
    }

    // 3. Normalize citation spacing
    cleanedText = cleanedText.replace(/\s+\[(\d+)\]/g, '[$1]');
    cleanedText = cleanedText.replace(/\[(\d+)\]\s+/g, '[$1] ');

    // 4. Remove sources section if it exists (since we extract citations separately)
    const sourcesPatterns = [
        /\n\s*Sources?:\s*[\s\S]*$/i,
        /\n\s*References?:\s*[\s\S]*$/i,
        /\n\s*Links?:\s*[\s\S]*$/i,
        /\n\s*Citations?:\s*[\s\S]*$/i
    ];

    for (const pattern of sourcesPatterns) {
        cleanedText = cleanedText.replace(pattern, '');
    }

    console.log('[Citation Cleaning] Cleaned text length:', cleanedText.length);
    console.log('[Citation Cleaning] Found citations:', cleanedText.match(/\[\d+\]/g) || []);

    return cleanedText.trim();
}

export function detectWebSearchProvider(modelId: string): 'openrouter' | 'openai' | 'perplexity' | undefined {
    // Check for specific model types first, regardless of provider
    if (modelId.includes('sonar') || modelId.includes('perplexity/')) return 'perplexity';
    if (modelId.startsWith('openai/') && (modelId.includes('gpt-4') || modelId.includes('gpt-4o'))) return 'openai';
    if (modelId.startsWith('openrouter/')) return 'openrouter';
    if (modelId.startsWith('perplexity/')) return 'perplexity';
    return undefined;
}

export function getWebSearchOptions(
    provider: 'openrouter' | 'openai' | 'perplexity',
    options: {
        contextSize: 'low' | 'medium' | 'high';
        maxResults?: number;
        searchPrompt?: string;
    }
) {
    switch (provider) {
        case 'openrouter':
            return {
                plugins: [{
                    id: 'web',
                    max_results: options.maxResults || 5,
                    search_prompt: options.searchPrompt || 'A web search was conducted. Incorporate the following web search results into your response.'
                }]
            };
        case 'openai':
            return {
                web_search_options: {
                    search_context_size: options.contextSize
                }
            };
        case 'perplexity':
            return {
                web_search_options: {
                    search_context_size: options.contextSize
                }
            };
        default:
            return {};
    }
}
