# Scripts Directory

This directory contains utility scripts for development and maintenance tasks.

## Dynamic API Pricing Analysis

**File**: `dynamic-api-pricing-analysis.ts`

A comprehensive pricing analysis tool that fetches model data from both OpenRouter and Requesty APIs and calculates estimated costs for different user types.

### Features

- **Multi-Provider Support**: Analyzes models from both OpenRouter and Requesty
- **Cost Estimation**: Calculates per-message, daily, and monthly costs
- **User Type Analysis**: Different cost estimates for anonymous vs Google users
- **Provider Comparison**: Side-by-side comparison of OpenRouter vs Requesty pricing
- **Error Handling**: Graceful handling of missing API keys and network issues

### Usage

```bash
# Basic usage (requires API keys)
npx tsx scripts/dynamic-api-pricing-analysis.ts

# Set API keys in environment
export OPENROUTER_API_KEY="sk-or-your-key"
export REQUESTY_API_KEY="rq-your-key"
npx tsx scripts/dynamic-api-pricing-analysis.ts
```

### Environment Variables

- `OPENROUTER_API_KEY`: Your OpenRouter API key (optional)
- `REQUESTY_API_KEY`: Your Requesty API key (optional)

### Output

The script provides:

1. **Pricing Table**: Detailed cost breakdown for each model
2. **Cost Summary**: Most expensive and cheapest models
3. **Provider Breakdown**: Average costs per provider
4. **Usage Notes**: Important caveats about pricing estimates

### Example Output

```
📊 Dynamic API Model Pricing Analysis
=====================================

Provider    Model                              Input/M     Output/M    Per Msg     Anon Daily  Google Daily   Anon Monthly  Google Monthly
OpenRouter  Claude 3.5 Sonnet                 $0.000003   $0.000015   $0.000008   $0.000080   $0.000160      $0.002400     $0.004800
Requesty    Claude 3.5 Sonnet (Latest)        $0.003000   $0.015000   $0.008000   $0.080000   $0.160000      $2.400000     $4.800000
```

### Notes

- Requesty pricing is estimated since the API doesn't provide real-time pricing
- Token estimates are based on actual ChatLima usage data
- Anonymous users have 10 messages/day limit
- Google users have 20 messages/day limit
- Monthly estimates assume 30 days

## Other Scripts

- `add-requesty-models.ts`: Adds Requesty model mappings to the configuration
- `update-model-parameters.ts`: Updates model parameters and capabilities
- `update-vision-models.ts`: Updates vision support for models 