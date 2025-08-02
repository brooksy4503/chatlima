# Cost Calculation Service

## Overview

The Cost Calculation Service is a comprehensive system for calculating and analyzing costs associated with AI model usage in the ChatLima application. It provides detailed cost breakdowns, supports multiple currencies, volume discounts, and offers various analytical features.

## Features

### Core Functionality
- **Cost Calculation**: Calculate costs for individual token usage records
- **Aggregated Analytics**: Get comprehensive cost breakdowns by provider, model, and time period
- **Usage Projections**: Project future costs based on historical usage patterns
- **Usage Limit Monitoring**: Check if users are approaching their usage limits
- **Currency Support**: Convert costs between different currencies
- **Volume Discounts**: Apply tiered pricing discounts based on usage volume

### Supported Providers
The service supports all AI providers integrated with ChatLima:
- OpenAI
- Anthropic
- Google
- Groq
- XAI
- OpenRouter
- Requesty

## API Endpoints

### 1. Cost Analytics API

**Endpoint**: `/api/cost-analytics`

**Methods**: `GET`

**Description**: Retrieve cost analytics data including aggregated costs, projected costs, or usage limit checks.

#### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `type` | string | Yes | - | Type of analytics: `aggregated`, `projected`, or `limits` |
| `startDate` | string | No | - | Start date for analysis (ISO 8601 format) |
| `endDate` | string | No | - | End date for analysis (ISO 8601 format) |
| `provider` | string | No | - | Filter by specific provider |
| `modelId` | string | No | - | Filter by specific model |
| `currency` | string | No | `USD` | Currency for cost calculations |
| `includeVolumeDiscounts` | boolean | No | `true` | Whether to include volume discounts |

#### Example Requests

**Get Aggregated Costs**
```bash
GET /api/cost-analytics?type=aggregated&startDate=2023-01-01T00:00:00Z&endDate=2023-01-31T23:59:59Z&currency=USD
```

**Get Projected Costs**
```bash
GET /api/cost-analytics?type=projected&periodDays=30&currency=EUR
```

**Check Usage Limits**
```bash
GET /api/cost-analytics?type=limits&monthlyLimit=100&currency=USD
```

#### Response Format

**Aggregated Costs Response**
```json
{
  "success": true,
  "data": {
    "totalInputTokens": 150000,
    "totalOutputTokens": 75000,
    "totalTokens": 225000,
    "totalInputCost": 0.075,
    "totalOutputCost": 0.1125,
    "totalSubtotal": 0.1875,
    "totalDiscount": 0.009375,
    "totalCost": 0.178125,
    "currency": "USD",
    "requestCount": 50,
    "averageCostPerRequest": 0.0035625,
    "averageCostPerToken": 0.0000007916666666666667,
    "breakdownByProvider": {
      "openai": {
        "inputTokens": 100000,
        "outputTokens": 50000,
        "totalTokens": 150000,
        "inputCost": 0.05,
        "outputCost": 0.075,
        "subtotal": 0.125,
        "discountAmount": 0.00625,
        "totalCost": 0.11875,
        "currency": "USD",
        "volumeDiscountApplied": true,
        "discountPercentage": 5
      }
    },
    "breakdownByModel": {
      "gpt-4.1-mini": {
        "inputTokens": 100000,
        "outputTokens": 50000,
        "totalTokens": 150000,
        "inputCost": 0.05,
        "outputCost": 0.075,
        "subtotal": 0.125,
        "discountAmount": 0.00625,
        "totalCost": 0.11875,
        "currency": "USD",
        "volumeDiscountApplied": true,
        "discountPercentage": 5
      }
    },
    "breakdownByDay": {
      "2023-01-01": {
        "inputTokens": 5000,
        "outputTokens": 2500,
        "totalTokens": 7500,
        "inputCost": 0.0025,
        "outputCost": 0.00375,
        "subtotal": 0.00625,
        "discountAmount": 0.0003125,
        "totalCost": 0.0059375,
        "currency": "USD",
        "volumeDiscountApplied": false,
        "discountPercentage": 0
      }
    }
  },
  "meta": {
    "userId": "user123",
    "startDate": "2023-01-01T00:00:00.000Z",
    "endDate": "2023-01-31T23:59:59.000Z",
    "currency": "USD",
    "type": "aggregated",
    "includeVolumeDiscounts": true
  }
}
```

**Projected Costs Response**
```json
{
  "success": true,
  "data": {
    "projectedDailyCost": 0.0059375,
    "projectedMonthlyCost": 0.178125,
    "projectedYearlyCost": 2.1671875,
    "currency": "USD",
    "basedOnPeriod": {
      "days": 30,
      "startDate": "2023-01-01T00:00:00.000Z",
      "endDate": "2023-01-31T00:00:00.000Z"
    },
    "confidence": "medium"
  },
  "meta": {
    "userId": "user123",
    "currency": "USD",
    "type": "projected"
  }
}
```

**Usage Limits Response**
```json
{
  "success": true,
  "data": {
    "isApproachingLimit": false,
    "isOverLimit": false,
    "currentUsage": 25.50,
    "limit": 100,
    "percentageUsed": 25.5,
    "projectedOverage": 0,
    "currency": "USD",
    "recommendations": [
      "Review usage patterns and optimize where possible"
    ]
  },
  "meta": {
    "userId": "user123",
    "currency": "USD",
    "type": "limits"
  }
}
```

### 2. Cost Calculation API

**Endpoint**: `/api/cost-calculate`

**Methods**: `GET`, `POST`

**Description**: Calculate costs for specific token usage or existing records.

#### POST Method - Calculate Cost for Token Usage

**Request Body**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `inputTokens` | number | Yes | Number of input tokens |
| `outputTokens` | number | Yes | Number of output tokens |
| `modelId` | string | Yes | Model identifier |
| `provider` | string | Yes | Provider name |
| `currency` | string | No | Target currency (default: USD) |
| `includeVolumeDiscounts` | boolean | No | Include volume discounts (default: true) |
| `exchangeRates` | object | No | Custom exchange rates |
| `customPricing` | object | No | Custom pricing per model |

**Example Request**
```bash
POST /api/cost-calculate
Content-Type: application/json

{
  "inputTokens": 1000,
  "outputTokens": 500,
  "modelId": "gpt-4.1-mini",
  "provider": "openai",
  "currency": "USD",
  "includeVolumeDiscounts": true
}
```

#### GET Method - Calculate Cost for Existing Record

**Query Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `recordId` | string | Yes | Token usage record ID |
| `currency` | string | No | Target currency (default: USD) |
| `includeVolumeDiscounts` | boolean | No | Include volume discounts (default: true) |

**Example Request**
```bash
GET /api/cost-calculate?recordId=token-record-123&currency=USD
```

#### Response Format

```json
{
  "success": true,
  "data": {
    "inputTokens": 1000,
    "outputTokens": 500,
    "totalTokens": 1500,
    "inputCost": 0.0005,
    "outputCost": 0.00075,
    "subtotal": 0.00125,
    "discountAmount": 0,
    "totalCost": 0.00125,
    "currency": "USD",
    "volumeDiscountApplied": false,
    "discountPercentage": 0
  },
  "meta": {
    "inputTokens": 1000,
    "outputTokens": 500,
    "modelId": "gpt-4.1-mini",
    "provider": "openai",
    "currency": "USD",
    "includeVolumeDiscounts": true
  }
}
```

### 3. Provider Configuration API

**Endpoint**: `/api/provider-config`

**Methods**: `GET`, `PUT`

**Description**: Manage provider pricing configurations (admin only).

#### GET Method - Get Provider Configuration

**Query Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `provider` | string | No | Specific provider name (if omitted, returns all) |

**Example Request**
```bash
GET /api/provider-config?provider=openai
```

#### PUT Method - Update Provider Configuration

**Query Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `provider` | string | Yes | Provider name to update |

**Request Body**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `currency` | string | No | Default currency for provider |
| `volumeDiscountTiers` | array | No | Volume discount tiers configuration |
| `specialModels` | object | No | Special pricing for specific models |

**Example Request**
```bash
PUT /api/provider-config?provider=openai
Content-Type: application/json

{
  "currency": "USD",
  "volumeDiscountTiers": [
    {
      "minTokens": 0,
      "maxTokens": 1000000,
      "discountPercentage": 0
    },
    {
      "minTokens": 1000001,
      "maxTokens": 10000000,
      "discountPercentage": 5
    }
  ],
  "specialModels": {
    "gpt-4.1-mini": {
      "inputTokenPrice": 0.0005,
      "outputTokenPrice": 0.0015
    }
  }
}
```

#### Response Format

```json
{
  "success": true,
  "message": "Provider configuration updated for openai",
  "data": {
    "provider": "openai",
    "currency": "USD",
    "volumeDiscountTiers": [
      {
        "minTokens": 0,
        "maxTokens": 1000000,
        "discountPercentage": 0
      },
      {
        "minTokens": 1000001,
        "maxTokens": 10000000,
        "discountPercentage": 5
      }
    ],
    "specialModels": {
      "gpt-4.1-mini": {
        "inputTokenPrice": 0.0005,
        "outputTokenPrice": 0.0015
      }
    }
  },
  "meta": {
    "provider": "openai"
  }
}
```

## Usage Examples

### Basic Cost Calculation

```typescript
import { CostCalculationService } from '@/lib/services/costCalculation';

// Calculate cost for token usage
const costBreakdown = await CostCalculationService.calculateCost(
  1000,  // inputTokens
  500,   // outputTokens
  'gpt-4.1-mini',  // modelId
  'openai',        // provider
  {
    currency: 'USD',
    includeVolumeDiscounts: true
  }
);

console.log(`Total cost: ${costBreakdown.totalCost} ${costBreakdown.currency}`);
```

### Get Aggregated Costs

```typescript
import { CostCalculationService } from '@/lib/services/costCalculation';

// Get aggregated costs for the last 30 days
const aggregatedData = await CostCalculationService.getAggregatedCosts(
  'user123',
  {
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    endDate: new Date(),
    currency: 'USD',
    includeVolumeDiscounts: true
  }
);

console.log(`Total cost: ${aggregatedData.totalCost} ${aggregatedData.currency}`);
console.log(`Average cost per request: ${aggregatedData.averageCostPerRequest}`);
```

### Check Usage Limits

```typescript
import { CostCalculationService } from '@/lib/services/costCalculation';

// Check if user is approaching their $100 monthly limit
const limitWarning = await CostCalculationService.checkUsageLimits(
  'user123',
  {
    monthlyLimit: 100,
    currency: 'USD'
  }
);

if (limitWarning.isApproachingLimit) {
  console.warn('User is approaching their usage limit!');
  console.log(`Current usage: ${limitWarning.percentageUsed}%`);
  console.log('Recommendations:', limitWarning.recommendations);
}
```

### Project Future Costs

```typescript
import { CostCalculationService } from '@/lib/services/costCalculation';

// Project costs based on last 30 days of usage
const projectedCosts = await CostCalculationService.calculateProjectedCosts(
  'user123',
  {
    periodDays: 30,
    currency: 'USD'
  }
);

console.log(`Projected monthly cost: ${projectedCosts.projectedMonthlyCost} ${projectedCosts.currency}`);
console.log(`Projected yearly cost: ${projectedCosts.projectedYearlyCost} ${projectedCosts.currency}`);
console.log(`Confidence: ${projectedCosts.confidence}`);
```

## Configuration

### Default Exchange Rates

The service uses the following default exchange rates (can be overridden):

```typescript
{
  USD: 1,
  EUR: 0.85,
  GBP: 0.73,
  JPY: 110,
  AUD: 1.35,
  CAD: 1.25,
}
```

### Volume Discount Tiers

Each provider can have custom volume discount tiers. Example for OpenAI:

```typescript
{
  provider: 'openai',
  currency: 'USD',
  volumeDiscountTiers: [
    { minTokens: 0, maxTokens: 1000000, discountPercentage: 0 },
    { minTokens: 1000001, maxTokens: 10000000, discountPercentage: 5 },
    { minTokens: 10000001, maxTokens: 50000000, discountPercentage: 10 },
    { minTokens: 50000001, discountPercentage: 15 },
  ],
}
```

### Special Model Pricing

Providers can have special pricing for specific models:

```typescript
{
  provider: 'openai',
  specialModels: {
    'gpt-4.1-mini': {
      inputTokenPrice: 0.0005,  // $0.50 per 1M tokens
      outputTokenPrice: 0.0015  // $1.50 per 1M tokens
    }
  }
}
```

## Error Handling

The service includes comprehensive error handling with proper logging:

```typescript
try {
  const costBreakdown = await CostCalculationService.calculateCost(
    inputTokens,
    outputTokens,
    modelId,
    provider,
    options
  );
} catch (error) {
  console.error('[CostCalculation] Error calculating cost:', error);
  // Handle error appropriately
}
```

All API endpoints return structured error responses:

```json
{
  "error": {
    "code": "INVALID_PARAMETER",
    "message": "Missing required fields: inputTokens, outputTokens, modelId, provider"
  }
}
```

## Integration with Token Tracking

The cost calculation service is integrated with the existing token tracking middleware. When token usage is tracked, costs are automatically calculated using the new service, providing more accurate and feature-rich cost calculations.

The integration maintains backward compatibility, falling back to the original calculation method if the new service encounters an error.

## Best Practices

1. **Currency Consistency**: Use consistent currency throughout your application for accurate comparisons
2. **Error Handling**: Always wrap cost calculation calls in try-catch blocks
3. **Performance**: Cache aggregated cost data when possible to avoid repeated calculations
4. **Monitoring**: Set up alerts for users approaching their usage limits
5. **Configuration**: Regularly update provider pricing configurations to reflect current rates

## Security Considerations

- All API endpoints require authentication
- Provider configuration management is restricted to admin users
- Input validation is performed on all parameters
- Error messages are generic to avoid exposing sensitive information

## Future Enhancements

Potential future improvements:
- Real-time cost tracking during chat sessions
- Budget management and alerts
- Cost optimization recommendations
- Integration with billing systems
- Historical cost trend analysis
- Custom user-defined pricing tiers