# Scripts

This directory contains utility scripts for managing and analyzing the ChatLima codebase.

## Available Scripts

### `update-model-parameters.ts`

**Purpose:** Dynamically fetches model data from OpenRouter and Requesty APIs and updates the model configuration in `ai/providers.ts` with accurate parameter limits and capabilities.

**What it updates:**
- `maxTokensRange`: Updates min/max/default token limits based on actual API data
- `vision`: Updates vision capabilities based on model input modalities

**Usage:**
```bash
# Run directly with tsx
pnpm tsx scripts/update-model-parameters.ts

# Or use the npm script
pnpm run update:models
```

**Requirements:**
- `OPENROUTER_API_KEY` environment variable (required)
- `REQUESTY_API_KEY` environment variable (optional, will use fallback data if missing)

**What it does:**
1. Fetches all available models from OpenRouter and Requesty APIs
2. Extracts `max_completion_tokens` and vision capabilities from API responses
3. Updates the `ai/providers.ts` file with accurate parameter ranges
4. Generates a detailed report showing updated models and their new limits

**Example output:**
```
🚀 Starting model parameters update...
✅ Fetched 320 OpenRouter models
✅ Fetched 341 Requesty models from API
✅ Updated 73 models with max tokens range
✅ Updated 1 models with vision capabilities
```

### `openrouter-pricing-analysis.ts`

**Purpose:** Analyzes pricing data for OpenRouter models configured in ChatLima.

**Usage:**
```bash
# Run directly with tsx
pnpm tsx scripts/openrouter-pricing-analysis.ts

# Or use the npm script
pnpm run pricing:analysis
```

### `update-vision-models.ts`

**Purpose:** Updates vision capabilities for models by fetching data from OpenRouter and Requesty APIs.

**Usage:**
```bash
pnpm tsx scripts/update-vision-models.ts
```

### `add-requesty-models.ts`

**Purpose:** Helps add Requesty equivalents for existing OpenRouter models by generating the necessary configuration code.

**Usage:**
```bash
pnpm tsx scripts/add-requesty-models.ts
```

## Environment Variables

Make sure you have the following environment variables set in your `.env.local` file:

```bash
OPENROUTER_API_KEY=your_openrouter_api_key
REQUESTY_API_KEY=your_requesty_api_key  # Optional for some scripts
```

## Notes

- The `update-model-parameters.ts` script is the most comprehensive and should be run regularly to keep model configurations up to date
- All scripts will automatically load environment variables from both `.env.local` and `.env` files
- Scripts that update `ai/providers.ts` will create backups and show detailed reports of changes made 