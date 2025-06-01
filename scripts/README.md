# Developer Scripts

This directory contains developer-only utilities and scripts for the ChatLima project.

## OpenRouter Pricing Analysis

### Overview
The `openrouter-pricing-analysis.ts` script fetches real-time pricing information from OpenRouter for all models configured in ChatLima and provides cost analysis for different user types.

### Features
- 📊 **Real-time pricing**: Fetches current pricing directly from OpenRouter API
- 📋 **Table display**: Shows pricing data in an easy-to-read table format
- 💰 **Cost calculations**: Estimates costs for different user scenarios:
  - Anonymous users: 10 messages per day
  - Google users: 20 messages per day
- 📈 **Comparative analysis**: Identifies most expensive and cheapest models
- 🎯 **ChatLima-specific**: Only analyzes models actually configured in the application

### Prerequisites
- OpenRouter API key must be set in your `.env` file:
  ```
  OPENROUTER_API_KEY=your_api_key_here
  ```

### Usage

#### Option 1: Using npm script (recommended)
```bash
pnpm run pricing:analysis
```

#### Option 2: Direct execution
```bash
npx tsx scripts/openrouter-pricing-analysis.ts
```

### Output
The script provides:

1. **Pricing Table**: Shows all models with:
   - Input/output token pricing (per million tokens)
   - Cost per message estimate
   - Daily cost estimates for both user types
   - Monthly cost estimates

2. **Cost Summary**: Highlights:
   - Most expensive model and its costs
   - Cheapest model and its costs
   - Price ratio between extremes

### Example Output
```
📊 OpenRouter Model Pricing Analysis
=====================================

Model                              Input/M     Output/M    Per Msg     Anon Daily  Google Daily  Anon Monthly  Google Monthly
Claude 4 Opus                      $15.000000  $75.000000  $0.030000   $0.300000   $0.600000     $9.000000     $18.000000
Claude 3.7 Sonnet (thinking)       $3.000000   $15.000000  $0.006000   $0.060000   $0.120000     $1.800000     $3.600000
...

💰 Cost Summary
===============

🔥 MOST EXPENSIVE MODEL:
   Claude 4 Opus
   Anonymous users (10 msg/day): $0.300000/day, $9.000000/month
   Google users (20 msg/day): $0.600000/day, $18.000000/month

💚 CHEAPEST MODEL:
   DeepSeek R1
   Anonymous users (10 msg/day): $0.000100/day, $0.003000/month
   Google users (20 msg/day): $0.000200/day, $0.006000/month

📈 Price Difference: Most expensive is 300.0x more costly than cheapest
```

### Token Estimates
The script uses realistic token estimates:
- **Input tokens**: 5000 per message (user prompt + context)
- **Output tokens**: 3000 per message (AI response)

These estimates can be adjusted in the script if needed for more accurate calculations.

### Use Cases
- **Cost planning**: Understand the financial impact of different models
- **Model selection**: Choose cost-effective models for different scenarios
- **Budget forecasting**: Estimate monthly costs based on usage patterns
- **Pricing monitoring**: Track price changes over time

### Notes
- Pricing data is fetched in real-time from OpenRouter
- Calculations are estimates based on average usage patterns
- Actual costs may vary based on actual token usage
- The script only analyzes models currently configured in ChatLima 