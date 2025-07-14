#!/usr/bin/env tsx

/**
 * Add Requesty Models Script
 * 
 * This script helps add Requesty equivalents for existing OpenRouter models.
 * It analyzes the current configuration and generates the necessary code.
 * 
 * Usage: pnpm tsx scripts/add-requesty-models.ts
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

interface ModelMapping {
    openRouterModelId: string;
    requestyModelId: string;
    requestyApiId: string;
    notes?: string;
}

// Define the mappings for OpenRouter -> Requesty models
// You can update this list with the models you want to add
const MODEL_MAPPINGS: ModelMapping[] = [
    // Claude 4 Models - Add additional aliases
    {
        openRouterModelId: "openrouter/anthropic/claude-opus-4",
        requestyModelId: "requesty/anthropic/claude-4-opus",
        requestyApiId: "anthropic/claude-4-opus-20250514",
        notes: "Anthropic Claude 4 Opus model via Requesty (alternative naming)"
    },
    {
        openRouterModelId: "openrouter/anthropic/claude-sonnet-4",
        requestyModelId: "requesty/anthropic/claude-4-sonnet",
        requestyApiId: "anthropic/claude-4-sonnet-20250514",
        notes: "Anthropic Claude 4 Sonnet model via Requesty (alternative naming)"
    },

    // Claude 3.5 Models - Latest aliases
    {
        openRouterModelId: "openrouter/anthropic/claude-3.5-sonnet",
        requestyModelId: "requesty/anthropic/claude-3.5-sonnet-latest",
        requestyApiId: "anthropic/claude-3-5-sonnet-latest",
        notes: "Anthropic Claude 3.5 Sonnet latest version via Requesty"
    },
    {
        openRouterModelId: "openrouter/anthropic/claude-3.5-haiku",
        requestyModelId: "requesty/anthropic/claude-3.5-haiku-latest",
        requestyApiId: "anthropic/claude-3-5-haiku-latest",
        notes: "Anthropic Claude 3.5 Haiku latest version via Requesty"
    },

    // Claude 3.7 Models - Latest aliases
    {
        openRouterModelId: "openrouter/anthropic/claude-3.7-sonnet",
        requestyModelId: "requesty/anthropic/claude-3.7-sonnet-latest",
        requestyApiId: "anthropic/claude-3-7-sonnet-latest",
        notes: "Anthropic Claude 3.7 Sonnet latest version via Requesty"
    },

    // Claude 3 Models - Latest aliases
    {
        openRouterModelId: "openrouter/anthropic/claude-3-opus",
        requestyModelId: "requesty/anthropic/claude-3-opus-latest",
        requestyApiId: "anthropic/claude-3-opus-latest",
        notes: "Anthropic Claude 3 Opus latest version via Requesty"
    },

    // Add more mappings here as needed
];

class RequestyModelAdder {
    private providersPath = join(process.cwd(), 'ai/providers.ts');

    async addRequestyModels(): Promise<void> {
        console.log('🚀 Adding Requesty equivalents for OpenRouter models...\n');

        const providersContent = readFileSync(this.providersPath, 'utf-8');

        // Parse existing configuration
        const { openRouterModels, requestyModels } = this.parseExistingModels(providersContent);

        console.log(`Found ${openRouterModels.length} OpenRouter models`);
        console.log(`Found ${requestyModels.length} existing Requesty models\n`);

        // Generate new model definitions
        const newLanguageModels: string[] = [];
        const newModelDetails: string[] = [];
        const newCaseStatements: string[] = [];

        for (const mapping of MODEL_MAPPINGS) {
            if (requestyModels.includes(mapping.requestyModelId)) {
                console.log(`⚠️  Skipping ${mapping.requestyModelId} - already exists`);
                continue;
            }

            if (!openRouterModels.includes(mapping.openRouterModelId)) {
                console.log(`⚠️  Warning: ${mapping.openRouterModelId} not found in OpenRouter models`);
            }

            console.log(`✅ Adding ${mapping.requestyModelId}`);

            // Generate language model entry
            const languageModelEntry = `  "${mapping.requestyModelId}": requestyClient("${mapping.requestyApiId}"),`;
            newLanguageModels.push(languageModelEntry);

            // Generate model details entry
            const modelDetailsEntry = this.generateModelDetails(mapping, providersContent);
            newModelDetails.push(modelDetailsEntry);

            // Generate case statement for getLanguageModelWithKeys
            const caseStatement = this.generateCaseStatement(mapping);
            newCaseStatements.push(caseStatement);
        }

        if (newLanguageModels.length === 0) {
            console.log('🎉 No new models to add!');
            return;
        }

        // Update the providers file
        await this.updateProvidersFile(providersContent, {
            newLanguageModels,
            newModelDetails,
            newCaseStatements
        });

        console.log(`\n🎉 Successfully added ${newLanguageModels.length} new Requesty models!`);
        console.log('\n📝 Next steps:');
        console.log('1. Review the changes in ai/providers.ts');
        console.log('2. Test the new models');
        console.log('3. Update the MODEL_MAPPINGS array in this script to add more models');
    }

    private parseExistingModels(content: string): { openRouterModels: string[], requestyModels: string[] } {
        const openRouterModels: string[] = [];
        const requestyModels: string[] = [];

        // Extract model IDs from languageModels object
        const languageModelsMatch = content.match(/const languageModels = \{([\s\S]*?)\};/);
        if (languageModelsMatch) {
            const modelsSection = languageModelsMatch[1];

            // Find OpenRouter models
            const openRouterMatches = modelsSection.matchAll(/"(openrouter\/[^"]+)":/g);
            for (const match of openRouterMatches) {
                openRouterModels.push(match[1]);
            }

            // Find Requesty models
            const requestyMatches = modelsSection.matchAll(/"(requesty\/[^"]+)":/g);
            for (const match of requestyMatches) {
                requestyModels.push(match[1]);
            }
        }

        return { openRouterModels, requestyModels };
    }

    private generateModelDetails(mapping: ModelMapping, providersContent: string): string {
        // Try to find the corresponding OpenRouter model details
        const openRouterModelDetails = this.extractModelDetails(mapping.openRouterModelId, providersContent);

        if (!openRouterModelDetails) {
            console.log(`⚠️  Could not find model details for ${mapping.openRouterModelId}, using defaults`);
        }

        // Convert OpenRouter model details to Requesty format
        const name = openRouterModelDetails?.name?.replace('OpenRouter', 'Requesty') ||
            this.generateModelName(mapping.requestyModelId);

        const description = openRouterModelDetails?.description?.replace('accessed via OpenRouter', 'accessed via Requesty') ||
            `${this.generateModelName(mapping.requestyModelId)} accessed via Requesty.`;

        const capabilities = openRouterModelDetails?.capabilities || ['General Purpose'];
        const enabled = openRouterModelDetails?.enabled ?? true;
        const supportsWebSearch = openRouterModelDetails?.supportsWebSearch ?? true;

        // All Anthropic models are premium models
        const isAnthropicModel = mapping.requestyModelId.includes('/anthropic/');
        const premium = isAnthropicModel ? true : (openRouterModelDetails?.premium ?? false);

        const vision = openRouterModelDetails?.vision ?? false;

        return `  "${mapping.requestyModelId}": {
    provider: "Requesty",
    name: "${name}",
    description: "${description}",
    apiVersion: "${mapping.requestyApiId}",
    capabilities: ${JSON.stringify(capabilities)},
    enabled: ${enabled},
    supportsWebSearch: ${supportsWebSearch},
    premium: ${premium},
    vision: ${vision}
  },`;
    }

    private extractModelDetails(modelId: string, content: string): any {
        // Extract model details from the modelDetails object
        const detailsMatch = content.match(new RegExp(`"${modelId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}":\\s*\\{([^}]+(?:\\{[^}]*\\}[^}]*)*)\\}`));

        if (!detailsMatch) return null;

        const detailsString = detailsMatch[1];

        // Parse key properties
        const name = detailsString.match(/name:\s*"([^"]+)"/)?.[1];
        const description = detailsString.match(/description:\s*"([^"]+(?:\\.[^"]*)*)"/)?.
        [1]?.replace(/\\"/g, '"').replace(/\\'/g, "'");
        const capabilitiesMatch = detailsString.match(/capabilities:\s*(\[[^\]]+\])/)?.[1];
        const capabilities = capabilitiesMatch ? JSON.parse(capabilitiesMatch) : ['General Purpose'];
        const enabled = detailsString.match(/enabled:\s*(true|false)/)?.[1] === 'true';
        const supportsWebSearch = detailsString.match(/supportsWebSearch:\s*(true|false)/)?.[1] === 'true';
        const premium = detailsString.match(/premium:\s*(true|false)/)?.[1] === 'true';
        const vision = detailsString.match(/vision:\s*(true|false)/)?.[1] === 'true';

        return {
            name,
            description,
            capabilities,
            enabled,
            supportsWebSearch,
            premium,
            vision
        };
    }

    private generateModelName(modelId: string): string {
        // Convert model ID to a human-readable name
        const parts = modelId.split('/');
        const provider = parts[1]; // Skip 'requesty/'
        const model = parts[2];

        // Capitalize and clean up the name
        const cleanName = model
            .split('-')
            .map(part => part.charAt(0).toUpperCase() + part.slice(1))
            .join(' ');

        const providerName = provider.charAt(0).toUpperCase() + provider.slice(1);

        return `${providerName} ${cleanName}`;
    }

    private generateCaseStatement(mapping: ModelMapping): string {
        const hasSpecialWrapper = mapping.openRouterModelId.includes('r1') ||
            mapping.openRouterModelId.includes('qwq') ||
            mapping.openRouterModelId.includes('thinking');

        if (hasSpecialWrapper) {
            // For reasoning models that need middleware
            return `    case "${mapping.requestyModelId}":
      return wrapLanguageModel({
        model: getRequestyClient()("${mapping.requestyApiId}", { logprobs: false }),
        middleware: deepseekR1Middleware,
      });`;
        } else {
            // Standard models
            return `    case "${mapping.requestyModelId}":
      return getRequestyClient()("${mapping.requestyApiId}");`;
        }
    }

    private async updateProvidersFile(content: string, updates: {
        newLanguageModels: string[],
        newModelDetails: string[],
        newCaseStatements: string[]
    }): Promise<void> {
        let updatedContent = content;

        // 1. Add to languageModels object
        if (updates.newLanguageModels.length > 0) {
            const languageModelsMatch = updatedContent.match(/(const languageModels = \{[\s\S]*?)(  \/\/ Requesty models)/);
            if (languageModelsMatch) {
                const beforeRequesty = languageModelsMatch[1];
                const requestyComment = languageModelsMatch[2];

                // Find the last existing Requesty model
                const lastRequestyMatch = updatedContent.match(/(  "requesty\/[^"]+": requestyClient\("[^"]+"\),?\s*\n)/g);
                if (lastRequestyMatch) {
                    const lastRequestyModel = lastRequestyMatch[lastRequestyMatch.length - 1];
                    const insertPoint = updatedContent.indexOf(lastRequestyModel) + lastRequestyModel.length;

                    const newModelsText = updates.newLanguageModels.join('\n') + '\n';
                    updatedContent = updatedContent.slice(0, insertPoint) + newModelsText + updatedContent.slice(insertPoint);
                }
            }
        }

        // 2. Add to modelDetails object
        if (updates.newModelDetails.length > 0) {
            // Find the last Requesty model details entry
            const lastRequestyDetailsMatch = updatedContent.match(/(  "requesty\/[^"]+": \{[\s\S]*?\n  \},)/g);
            if (lastRequestyDetailsMatch) {
                const lastRequestyDetails = lastRequestyDetailsMatch[lastRequestyDetailsMatch.length - 1];
                const insertPoint = updatedContent.indexOf(lastRequestyDetails) + lastRequestyDetails.length;

                const newDetailsText = '\n' + updates.newModelDetails.join('\n') + '\n';
                updatedContent = updatedContent.slice(0, insertPoint) + newDetailsText + updatedContent.slice(insertPoint);
            }
        }

        // 3. Add to getLanguageModelWithKeys function
        if (updates.newCaseStatements.length > 0) {
            // Find the last Requesty case statement
            const lastRequestyCaseMatch = updatedContent.match(/(    case "requesty\/[^"]+":[\s\S]*?(?:return [^;]+;|}\);))/g);
            if (lastRequestyCaseMatch) {
                const lastRequestyCase = lastRequestyCaseMatch[lastRequestyCaseMatch.length - 1];
                const insertPoint = updatedContent.indexOf(lastRequestyCase) + lastRequestyCase.length;

                const newCasesText = '\n' + updates.newCaseStatements.join('\n') + '\n';
                updatedContent = updatedContent.slice(0, insertPoint) + newCasesText + updatedContent.slice(insertPoint);
            }
        }

        // Write the updated content
        writeFileSync(this.providersPath, updatedContent);
    }
}

async function main(): Promise<void> {
    try {
        const adder = new RequestyModelAdder();
        await adder.addRequestyModels();
    } catch (error) {
        console.error('❌ Error adding Requesty models:', error);
        process.exit(1);
    }
}

// Run the script
if (require.main === module) {
    main();
} 