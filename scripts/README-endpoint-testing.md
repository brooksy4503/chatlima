# Model Endpoint Testing System

This system automatically tests every model endpoint from OpenRouter and Requesty to identify and block non-working models.

## Overview

The endpoint testing system consists of:

1. **`scripts/test-model-endpoints.ts`** - The main testing script
2. **`lib/models/blocked-models.json`** - Persistent storage for blocked models
3. **Updated `lib/models/provider-configs.ts`** - Dynamically loads blocked models
4. **NPM scripts** - Easy commands for running tests

## How It Works

1. **Fetches all models** from OpenRouter and Requesty APIs
2. **Tests each model** by making a simple chat completion request
3. **Records failures** in the blocked models list with detailed error information
4. **Automatically filters** blocked models during normal model loading
5. **Tracks metadata** like retry counts, last tested time, and error details

## Usage

### Quick Start

```bash
# Test a few models from each provider (recommended for initial testing)
pnpm test:endpoints:quick

# Test all models from all providers (can take a while!)
pnpm test:endpoints

# Test only OpenRouter models
pnpm test:endpoints:openrouter

# Test only Requesty models  
pnpm test:endpoints:requesty

# View current blocked models summary
pnpm test:endpoints:summary

# Re-test previously blocked models to see if they're working now
pnpm test:endpoints:retest
```

### Advanced Usage

```bash
# Test specific provider with custom limits
npx tsx scripts/test-model-endpoints.ts --provider openrouter --max-models 20

# Re-test blocked models for a specific provider
npx tsx scripts/test-model-endpoints.ts --provider requesty --retest-blocked

# Show help and all options
npx tsx scripts/test-model-endpoints.ts --help
```

## Configuration

The script uses these default settings:

- **Request timeout**: 30 seconds
- **Rate limiting**: 1 second between requests
- **Test message**: "Hello"
- **Max tokens**: 1 (minimal response)
- **Max retries**: 2

## Blocked Models File

The `lib/models/blocked-models.json` file stores:

```json
{
  "lastUpdated": "2024-01-01T00:00:00.000Z",
  "models": {
    "model-id": {
      "provider": "openrouter",
      "reason": "Endpoint test failed: HTTP 404",
      "lastTested": "2024-01-01T00:00:00.000Z", 
      "testError": "HTTP 404: Model not found",
      "retryCount": 1,
      "manuallyBlocked": false
    }
  }
}
```

### Manual Blocking

You can manually block models by:

1. Adding them to the JSON file with `"manuallyBlocked": true`
2. These models will be skipped during automated testing unless `--retest-blocked` is used

## Integration

The system automatically integrates with your existing model loading:

- **`parseOpenRouterModels()`** and **`parseRequestyModels()`** automatically filter blocked models
- **No changes needed** to existing code - blocked models simply won't appear in model lists
- **Dynamic loading** - updates to the blocked list take effect after process restart

## Monitoring & Maintenance

### Regular Testing Schedule

Recommended approach:

1. **Weekly full test**: `pnpm test:endpoints` 
2. **Daily retest**: `pnpm test:endpoints:retest` (check if blocked models are working again)
3. **Before deployments**: `pnpm test:endpoints:quick` (spot check)

### Monitoring Output

The script provides detailed logging:

```
🧪 Testing openrouter models...
Found 156 models to test
[1/156] Testing anthropic/claude-3.5-sonnet...
✅ [1/156] anthropic/claude-3.5-sonnet - Working (1234ms)
[2/156] Testing google/gemini-2.5-pro-exp-03-25...
❌ [2/156] google/gemini-2.5-pro-exp-03-25 - Failed: HTTP 404: Model not found
```

### Summary Statistics

```
📊 Testing Complete!
Stats: {
  total: 156,
  tested: 156, 
  working: 143,
  blocked: 13,
  skipped: 0,
  errors: 0,
  duration: "89s",
  avgTimePerModel: "571ms"
}
```

## Troubleshooting

### Common Issues

**Missing API Keys**
```bash
Error: Missing API key for openrouter: OPENROUTER_API_KEY
```
Make sure your `.env.local` file has the required API keys:
```
OPENROUTER_API_KEY=your_key_here
REQUESTY_API_KEY=your_key_here
```

**Rate Limiting**
The script includes built-in rate limiting, but if you hit limits:
- Increase the delay with custom config
- Test smaller batches with `--max-models`

**Network Issues**
- Use `--retest-blocked` to retry failed models
- Check your internet connection and firewall settings

### Debugging

**Verbose output**:
```bash
pnpm test:endpoints:summary --verbose
```

**Test a single provider**:
```bash
pnpm test:endpoints:openrouter --max-models 1
```

## API Key Requirements

The script requires API keys for the providers you want to test:

- **OpenRouter**: `OPENROUTER_API_KEY` 
- **Requesty**: `REQUESTY_API_KEY`

Set these in your `.env.local` file or environment variables.

## Cost Considerations

Each test makes a minimal API call:
- **1 token output** - minimal cost
- **"Hello" message** - small input
- **Most providers**: ~$0.0001 per test

For 150+ models, expect costs under $0.05 per full test run.

## Contributing

To extend the testing system:

1. **Add new providers**: Update the `PROVIDERS` config in `provider-configs.ts`
2. **Custom test logic**: Modify `testModelEndpoint()` method  
3. **New CLI options**: Update the argument parsing in `main()`
4. **Additional metadata**: Extend the `BlockedModel` interface

## Best Practices

1. **Start small**: Use `--max-models` for initial testing
2. **Monitor logs**: Check for patterns in failures
3. **Regular maintenance**: Set up automated testing schedule
4. **Manual review**: Periodically review blocked models list
5. **Provider communication**: Report consistent failures to provider support

This system helps maintain a high-quality, reliable model experience by automatically filtering out problematic endpoints. 