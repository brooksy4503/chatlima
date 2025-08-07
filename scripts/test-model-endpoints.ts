#!/usr/bin/env tsx

import fs from 'fs/promises';
import path from 'path';
import { config } from 'dotenv';
import { PROVIDERS, parseOpenRouterModels, parseRequestyModels } from '@/lib/models/provider-configs';
import { ModelInfo } from '@/lib/types/models';

// Load environment variables from .env.local
config({ path: path.join(process.cwd(), '.env.local') });

interface BlockedModel {
    provider: string;
    reason: string;
    lastTested: string;
    testError: string;
    retryCount: number;
    manuallyBlocked: boolean;
}

interface BlockedModelsList {
    $schema: string;
    description: string;
    lastUpdated: string;
    models: Record<string, BlockedModel>;
}

interface TestConfig {
    maxRetries: number;
    requestTimeoutMs: number;
    rateLimitDelayMs: number;
    testMessage: string;
    maxTokens: number;
}

const DEFAULT_CONFIG: TestConfig = {
    maxRetries: 2,
    requestTimeoutMs: 30000, // 30 seconds
    rateLimitDelayMs: 1000, // 1 second between requests
    testMessage: "Hello",
    maxTokens: 50
};

class ModelEndpointTester {
    private blockedModelsPath: string;
    private config: TestConfig;
    private stats = {
        total: 0,
        tested: 0,
        working: 0,
        blocked: 0,
        skipped: 0,
        errors: 0
    };

    constructor(config: Partial<TestConfig> = {}) {
        this.config = { ...DEFAULT_CONFIG, ...config };
        this.blockedModelsPath = path.join(process.cwd(), 'lib/models/blocked-models.json');
    }

    async loadBlockedModels(): Promise<BlockedModelsList> {
        try {
            const data = await fs.readFile(this.blockedModelsPath, 'utf-8');
            return JSON.parse(data);
        } catch (error) {
            console.warn('Could not load blocked models file, starting fresh');
            return {
                $schema: "https://json-schema.org/draft/2019-09/schema",
                description: "List of AI models that have been tested and found to have non-working endpoints",
                lastUpdated: new Date().toISOString(),
                models: {}
            };
        }
    }

    async saveBlockedModels(blockedModels: BlockedModelsList): Promise<void> {
        blockedModels.lastUpdated = new Date().toISOString();
        await fs.writeFile(
            this.blockedModelsPath,
            JSON.stringify(blockedModels, null, 2),
            'utf-8'
        );
    }

    async fetchModels(provider: 'openrouter' | 'requesty'): Promise<ModelInfo[]> {
        const providerConfig = PROVIDERS[provider];
        if (!providerConfig) {
            throw new Error(`Unknown provider: ${provider}`);
        }

        const apiKey = process.env[providerConfig.envKey];
        if (!apiKey) {
            throw new Error(`Missing API key for ${provider}: ${providerConfig.envKey}`);
        }

        console.log(`Fetching models from ${provider}...`);

        const response = await fetch(providerConfig.endpoint, {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'User-Agent': 'ChatLima/1.0 Model Endpoint Tester'
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch models from ${provider}: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return providerConfig.parse(data);
    }

    async testModelEndpoint(model: ModelInfo, provider: 'openrouter' | 'requesty'): Promise<{
        success: boolean;
        error?: string;
        responseTime?: number;
    }> {
        const startTime = Date.now();

        try {
            const apiKey = process.env[PROVIDERS[provider].envKey];
            if (!apiKey) {
                throw new Error(`Missing API key for ${provider}`);
            }

            // Get the actual model ID for the API call
            let modelId: string;
            if (provider === 'openrouter') {
                // Remove the 'openrouter/' prefix for OpenRouter API calls
                modelId = model.id.replace('openrouter/', '');
            } else if (provider === 'requesty') {
                // For Requesty, use the apiVersion which contains the full provider/model format
                modelId = model.apiVersion || model.id.replace('requesty/', '');
            } else {
                modelId = model.apiVersion || model.id;
            }

            // Construct the appropriate endpoint
            const endpoint = provider === 'openrouter'
                ? 'https://openrouter.ai/api/v1/chat/completions'
                : 'https://router.requesty.ai/v1/chat/completions';

            // Determine which token parameter to use based on the model
            const useMaxCompletionTokens = modelId.includes('o4-mini') || modelId.includes('o1-mini');

            const requestBody: any = {
                model: modelId,
                messages: [
                    {
                        role: 'user',
                        content: this.config.testMessage
                    }
                ],
                temperature: 0.1
            };

            // Use the appropriate token parameter
            if (useMaxCompletionTokens) {
                requestBody.max_completion_tokens = this.config.maxTokens;
            } else {
                requestBody.max_tokens = this.config.maxTokens;
            }

            // Add provider-specific headers
            const headers: Record<string, string> = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
                'User-Agent': 'ChatLima/1.0 Model Endpoint Tester'
            };

            // Add provider-specific headers for both OpenRouter and Requesty
            headers['HTTP-Referer'] = 'https://chatlima.app';
            headers['X-Title'] = 'ChatLima Model Endpoint Test';

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), this.config.requestTimeoutMs);

            const response = await fetch(endpoint, {
                method: 'POST',
                headers,
                body: JSON.stringify(requestBody),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            const responseTime = Date.now() - startTime;

            if (!response.ok) {
                const errorText = await response.text().catch(() => 'Unable to read error response');
                return {
                    success: false,
                    error: `HTTP ${response.status}: ${errorText}`,
                    responseTime
                };
            }

            // Try to parse the response
            const responseData = await response.json();

            // Basic validation that this looks like a proper chat completion response
            if (!responseData.choices || !Array.isArray(responseData.choices) || responseData.choices.length === 0) {
                return {
                    success: false,
                    error: 'Invalid response format - missing choices array',
                    responseTime
                };
            }

            return {
                success: true,
                responseTime
            };

        } catch (error) {
            const responseTime = Date.now() - startTime;

            if (error instanceof Error) {
                if (error.name === 'AbortError') {
                    return {
                        success: false,
                        error: 'Request timeout',
                        responseTime
                    };
                }
                return {
                    success: false,
                    error: error.message,
                    responseTime
                };
            }

            return {
                success: false,
                error: 'Unknown error occurred',
                responseTime
            };
        }
    }

    async testProvider(provider: 'openrouter' | 'requesty', options: {
        retestBlocked?: boolean;
        maxModels?: number;
        skipWorking?: boolean;
        onlyBlocked?: boolean;
    } = {}): Promise<void> {
        console.log(`\n🧪 Testing ${provider} models...`);

        const blockedModels = await this.loadBlockedModels();
        let models: ModelInfo[];

        if (options.onlyBlocked) {
            // Only test blocked models for this provider
            const blockedModelIds = Object.entries(blockedModels.models)
                .filter(([_, model]) => model.provider === provider)
                .map(([modelId, _]) => modelId);

            console.log(`Found ${blockedModelIds.length} blocked models to test for ${provider}`);
            this.stats.total += blockedModelIds.length;

            // Create mock ModelInfo objects for blocked models
            models = blockedModelIds.map(modelId => {
                // For Requesty models, we need to construct the proper provider/model format
                let apiVersion = modelId;
                if (provider === 'requesty') {
                    // Remove context window suffixes like :1024, :16384, etc.
                    apiVersion = modelId.replace(/:\d+$/, '');
                    // Also handle special cases like :high, :low, :medium, :max
                    apiVersion = apiVersion.replace(/:(high|low|medium|max)$/, '');

                    // For Requesty, we need to determine the provider from the model name
                    // Common patterns: claude-* -> anthropic, gpt-* -> openai, etc.
                    let providerName = 'openai'; // default
                    if (apiVersion.startsWith('claude-')) {
                        providerName = 'anthropic';
                    } else if (apiVersion.startsWith('gpt-')) {
                        providerName = 'openai';
                    } else if (apiVersion.startsWith('gemini-')) {
                        providerName = 'google';
                    } else if (apiVersion.startsWith('o1') || apiVersion.startsWith('o3') || apiVersion.startsWith('o4')) {
                        providerName = 'openai';
                    }

                    apiVersion = `${providerName}/${apiVersion}`;
                }

                return {
                    id: `${provider}/${modelId}`,
                    provider: provider === 'openrouter' ? 'OpenRouter' : 'Requesty',
                    name: modelId,
                    capabilities: [],
                    premium: false,
                    vision: false,
                    status: 'available' as const,
                    lastChecked: new Date(),
                    apiVersion: apiVersion, // This will be used for the actual API call
                    pricing: { input: 0, output: 0 }
                };
            });
        } else {
            try {
                models = await this.fetchModels(provider);
            } catch (error) {
                console.error(`❌ Failed to fetch models from ${provider}:`, error);
                this.stats.errors++;
                return;
            }

            if (options.maxModels) {
                models = models.slice(0, options.maxModels);
            }

            console.log(`Found ${models.length} models to test`);
            this.stats.total += models.length;
        }

        for (let i = 0; i < models.length; i++) {
            const model = models[i];
            const modelKey = model.apiVersion || model.id.replace(`${provider}/`, '');

            // Check if model is already blocked and we're not retesting
            const isBlocked = blockedModels.models[modelKey];
            if (isBlocked && !options.retestBlocked) {
                if (isBlocked.manuallyBlocked) {
                    console.log(`⏭️  Skipping manually blocked model: ${modelKey}`);
                    this.stats.skipped++;
                    continue;
                }
            }

            // Skip working models if requested
            if (options.skipWorking && !isBlocked) {
                this.stats.skipped++;
                continue;
            }

            const progress = `[${i + 1}/${models.length}]`;
            console.log(`${progress} Testing ${modelKey}...`);

            try {
                const result = await this.testModelEndpoint(model, provider);

                if (result.success) {
                    console.log(`✅ ${progress} ${modelKey} - Working (${result.responseTime}ms)`);
                    this.stats.working++;

                    // Remove from blocked list if it was previously blocked
                    if (isBlocked) {
                        delete blockedModels.models[modelKey];
                        console.log(`📋 Removed ${modelKey} from blocked list`);
                    }
                } else {
                    console.log(`❌ ${progress} ${modelKey} - Failed: ${result.error}`);
                    this.stats.blocked++;

                    // Add or update in blocked list
                    blockedModels.models[modelKey] = {
                        provider,
                        reason: `Endpoint test failed: ${result.error}`,
                        lastTested: new Date().toISOString(),
                        testError: result.error || 'Unknown error',
                        retryCount: (isBlocked?.retryCount || 0) + 1,
                        manuallyBlocked: false
                    };
                }

                this.stats.tested++;

                // Rate limiting delay
                if (i < models.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, this.config.rateLimitDelayMs));
                }

            } catch (error) {
                console.error(`💥 ${progress} ${modelKey} - Test error:`, error);
                this.stats.errors++;

                // Add to blocked list
                blockedModels.models[modelKey] = {
                    provider,
                    reason: `Test execution failed: ${error}`,
                    lastTested: new Date().toISOString(),
                    testError: error instanceof Error ? error.message : 'Unknown test error',
                    retryCount: (isBlocked?.retryCount || 0) + 1,
                    manuallyBlocked: false
                };
            }
        }

        // Save updated blocked models
        await this.saveBlockedModels(blockedModels);
        console.log(`💾 Updated blocked models list`);
    }

    async testAllProviders(options: {
        retestBlocked?: boolean;
        onlyBlocked?: boolean;
        maxModels?: number;
        skipWorking?: boolean;
        providers?: ('openrouter' | 'requesty')[];
    } = {}): Promise<void> {
        const providers = options.providers || ['openrouter', 'requesty'];

        console.log('🚀 Starting model endpoint testing...');
        console.log(`Configuration:`, {
            maxRetries: this.config.maxRetries,
            timeout: `${this.config.requestTimeoutMs}ms`,
            rateLimit: `${this.config.rateLimitDelayMs}ms`,
            testMessage: this.config.testMessage,
            maxTokens: this.config.maxTokens
        });

        const startTime = Date.now();

        for (const provider of providers) {
            await this.testProvider(provider, options);
        }

        const duration = Date.now() - startTime;

        console.log('\n📊 Testing Complete!');
        console.log('Stats:', {
            ...this.stats,
            duration: `${Math.round(duration / 1000)}s`,
            avgTimePerModel: this.stats.tested > 0 ? `${Math.round(duration / this.stats.tested)}ms` : 'N/A'
        });

        if (this.stats.blocked > 0) {
            console.log(`\n⚠️  ${this.stats.blocked} models were added to the blocked list`);
            console.log(`📄 Check ${this.blockedModelsPath} for details`);
        }
    }

    async printBlockedSummary(): Promise<void> {
        const blockedModels = await this.loadBlockedModels();
        const models = Object.entries(blockedModels.models);

        if (models.length === 0) {
            console.log('✨ No blocked models found!');
            return;
        }

        console.log(`\n🚫 Blocked Models Summary (${models.length} total):`);
        console.log(`Last updated: ${blockedModels.lastUpdated}`);

        const byProvider = models.reduce((acc, [key, model]) => {
            acc[model.provider] = (acc[model.provider] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        Object.entries(byProvider).forEach(([provider, count]) => {
            console.log(`  ${provider}: ${count} models`);
        });

        if (process.argv.includes('--verbose')) {
            console.log('\nDetailed list:');
            models.forEach(([key, model]) => {
                console.log(`  ${key} (${model.provider}): ${model.reason}`);
            });
        }
    }
}

// CLI Interface
async function main() {
    const args = process.argv.slice(2);
    const tester = new ModelEndpointTester();

    if (args.includes('--help') || args.includes('-h')) {
        console.log(`
🧪 Model Endpoint Tester

Usage: tsx scripts/test-model-endpoints.ts [options]

Options:
  --help, -h              Show this help message
  --provider <name>       Test specific provider (openrouter, requesty)
  --retest-blocked        Re-test previously blocked models
  --only-blocked          Test ONLY blocked models (don't fetch all models)
  --max-models <n>        Limit number of models to test per provider
  --skip-working          Skip models that aren't currently blocked
  --summary               Show summary of blocked models
  --verbose               Show detailed output
  
Examples:
  tsx scripts/test-model-endpoints.ts
  tsx scripts/test-model-endpoints.ts --provider openrouter --max-models 10
  tsx scripts/test-model-endpoints.ts --retest-blocked
  tsx scripts/test-model-endpoints.ts --only-blocked
  tsx scripts/test-model-endpoints.ts --summary --verbose
`);
        return;
    }

    if (args.includes('--summary')) {
        await tester.printBlockedSummary();
        return;
    }

    const options = {
        retestBlocked: args.includes('--retest-blocked'),
        onlyBlocked: args.includes('--only-blocked'),
        skipWorking: args.includes('--skip-working'),
        maxModels: args.includes('--max-models') ?
            parseInt(args[args.indexOf('--max-models') + 1] || '10') : undefined,
        providers: args.includes('--provider') ?
            [args[args.indexOf('--provider') + 1] as 'openrouter' | 'requesty'] : undefined
    };

    await tester.testAllProviders(options);
}

if (require.main === module) {
    main().catch(console.error);
}

export { ModelEndpointTester }; 