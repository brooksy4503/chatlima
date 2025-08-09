# Token Tracking Middleware Documentation

## Overview

The Token Tracking Middleware is a comprehensive system designed to track, analyze, and report token usage and associated costs for AI model interactions in the ChatLima application. This system provides detailed insights into resource consumption, enables cost monitoring, and supports billing integration.

## Features

### 1. Detailed Token Usage Tracking
- **Input/Output Token Tracking**: Captures separate counts for input and output tokens from AI model responses
- **Provider Support**: Works with multiple AI providers (OpenAI, Anthropic, Google, Groq, XAI, OpenRouter, Requesty)
- **Model-Specific Tracking**: Tracks usage per model ID for granular analysis
- **Real-time Processing**: Tracks token usage during chat interactions without disrupting user experience

### 2. Cost Calculation and Management
- **Dynamic Pricing**: Supports model-specific pricing with provider-based rate structures
- **Cost Estimation**: Calculates estimated costs based on token usage and pricing models
- **Currency Support**: Handles multiple currencies with USD as default
- **Pricing Management**: Admin interface for updating model pricing information

### 3. Data Storage and Aggregation
- **Detailed Metrics**: Stores individual token usage events with full context
- **Daily Aggregation**: Automatically aggregates daily usage statistics per user and provider
- **Historical Data**: Maintains complete history for trend analysis and reporting
- **Metadata Storage**: Captures additional context like web search usage, processing time, and error states

### 4. Analytics and Reporting
- **User Statistics**: Provides comprehensive token usage statistics per user
- **Provider Breakdown**: Shows usage distribution across different AI providers
- **Time-based Analysis**: Supports filtering by date ranges for trend analysis
- **API Access**: RESTful APIs for accessing token usage data

## Architecture

### Database Schema

The system uses three main database tables:

#### 1. `token_usage_metrics`
Stores individual token usage events with detailed information:

```sql
CREATE TABLE token_usage_metrics (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    chat_id TEXT NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
    message_id TEXT NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    model_id TEXT NOT NULL,
    provider TEXT NOT NULL,
    input_tokens INTEGER DEFAULT 0 NOT NULL,
    output_tokens INTEGER DEFAULT 0 NOT NULL,
    total_tokens INTEGER DEFAULT 0 NOT NULL,
    estimated_cost NUMERIC(10,6) DEFAULT 0 NOT NULL,
    actual_cost NUMERIC(10,6),
    currency TEXT DEFAULT 'USD' NOT NULL,
    processing_time_ms INTEGER,
    status TEXT DEFAULT 'completed' NOT NULL,
    error_message TEXT,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);
```

#### 2. `model_pricing`
Stores pricing information for different models and providers:

```sql
CREATE TABLE model_pricing (
    id TEXT PRIMARY KEY,
    model_id TEXT NOT NULL,
    provider TEXT NOT NULL,
    input_token_price NUMERIC(10,6) NOT NULL,
    output_token_price NUMERIC(10,6) NOT NULL,
    currency TEXT DEFAULT 'USD' NOT NULL,
    effective_from TIMESTAMP DEFAULT NOW() NOT NULL,
    effective_to TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);
```

#### 3. `daily_token_usage`
Aggregated daily token usage statistics:

```sql
CREATE TABLE daily_token_usage (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    provider TEXT NOT NULL,
    total_input_tokens INTEGER DEFAULT 0 NOT NULL,
    total_output_tokens INTEGER DEFAULT 0 NOT NULL,
    total_tokens INTEGER DEFAULT 0 NOT NULL,
    total_estimated_cost NUMERIC(10,6) DEFAULT 0 NOT NULL,
    total_actual_cost NUMERIC(10,6) DEFAULT 0 NOT NULL,
    request_count INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
    UNIQUE(user_id, date, provider)
);
```

### Core Components

#### 1. TokenTrackingService
The main service class that handles all token tracking operations:

```typescript
class TokenTrackingService {
  // Track token usage for a chat interaction
  static async trackTokenUsage(params: TokenTrackingParams): Promise<void>
  
  // Get user token usage statistics
  static async getUserTokenStats(userId: string, options?: StatsOptions): Promise<UserTokenStats>
  
  // Get daily token usage
  static async getDailyTokenUsage(userId: string, options?: StatsOptions): Promise<DailyTokenUsage[]>
  
  // Set model pricing
  static async setModelPricing(pricing: ModelPricingInfo): Promise<void>
}
```

#### 2. Integration Points
- **Chat API**: Integrated into `/app/api/chat/route.ts` to track token usage during chat interactions
- **Token Counter**: Works alongside existing `trackTokenUsage` function for credit tracking
- **Authentication**: Uses existing auth system to identify users and enforce permissions

## API Endpoints

### 1. Token Usage API
**Endpoint**: `GET /api/token-usage`

Retrieve token usage statistics for the authenticated user.

#### Query Parameters:
- `type` (optional): `stats` (default) or `daily`
- `startDate` (optional): Start date for filtering (ISO 8601 format)
- `endDate` (optional): End date for filtering (ISO 8601 format)
- `provider` (optional): Filter by specific provider

#### Response Example:
```json
{
  "success": true,
  "data": {
    "totalInputTokens": 15000,
    "totalOutputTokens": 8000,
    "totalTokens": 23000,
    "totalEstimatedCost": 0.023,
    "totalActualCost": 0.023,
    "requestCount": 45,
    "breakdownByProvider": [
      {
        "provider": "openai",
        "inputTokens": 10000,
        "outputTokens": 5000,
        "totalTokens": 15000,
        "estimatedCost": 0.015,
        "actualCost": 0.015,
        "requestCount": 30
      },
      {
        "provider": "anthropic",
        "inputTokens": 5000,
        "outputTokens": 3000,
        "totalTokens": 8000,
        "estimatedCost": 0.008,
        "actualCost": 0.008,
        "requestCount": 15
      }
    ]
  },
  "meta": {
    "userId": "user123",
    "startDate": "2024-01-01T00:00:00.000Z",
    "endDate": "2024-01-31T23:59:59.999Z",
    "type": "stats"
  }
}
```

### 2. Model Pricing API
**Endpoint**: `POST /api/model-pricing`

Update model pricing information (admin only).

#### Request Body:
```json
{
  "modelId": "gpt-4",
  "provider": "openai",
  "inputTokenPrice": 0.0005,
  "outputTokenPrice": 0.0015,
  "currency": "USD",
  "isActive": true
}
```

#### Response Example:
```json
{
  "success": true,
  "message": "Model pricing updated successfully",
  "data": {
    "modelId": "gpt-4",
    "provider": "openai",
    "inputTokenPrice": 0.0005,
    "outputTokenPrice": 0.0015,
    "currency": "USD",
    "isActive": true
  }
}
```

## Configuration

### Default Pricing
The system includes default pricing for major providers when specific pricing is not configured:

```typescript
const defaultPrices = {
  openai: { input: 0.0005, output: 0.0015 },     // $0.50 / 1M input, $1.50 / 1M output
  anthropic: { input: 0.003, output: 0.015 },   // $3.00 / 1M input, $15.00 / 1M output
  google: { input: 0.0005, output: 0.0015 },   // $0.50 / 1M input, $1.50 / 1M output
  groq: { input: 0.00005, output: 0.00008 },   // $0.05 / 1M input, $0.08 / 1M output
  xai: { input: 0.0002, output: 0.0006 },      // $0.20 / 1M input, $0.60 / 1M output
  openrouter: { input: 0.0005, output: 0.0015 }, // Varies by model
  requesty: { input: 0.0005, output: 0.0015 }   // Varies by model
};
```

### Error Handling
The system includes comprehensive error handling to ensure that token tracking failures do not disrupt the main chat functionality:

```typescript
try {
  await TokenTrackingService.trackTokenUsage(params);
} catch (error) {
  console.error('[TokenTracking] Error tracking token usage:', error);
  // Don't throw - we don't want to break the chat flow if tracking fails
}
```

## Usage Examples

### 1. Tracking Token Usage
The system automatically tracks token usage during chat interactions. Here's how it works:

```typescript
// In the chat API route
await TokenTrackingService.trackTokenUsage({
  userId: 'user123',
  chatId: 'chat456',
  messageId: 'msg789',
  modelId: 'gpt-4',
  provider: 'openai',
  tokenUsage: {
    inputTokens: 100,
    outputTokens: 50,
    totalTokens: 150
  },
  processingTimeMs: 2500,
  status: 'completed',
  metadata: {
    webSearchEnabled: true,
    webSearchContextSize: 'medium',
    isUsingOwnApiKeys: false
  }
});
```

### 2. Getting User Statistics
Retrieve token usage statistics for a user:

```typescript
const stats = await TokenTrackingService.getUserTokenStats('user123', {
  startDate: new Date('2024-01-01'),
  endDate: new Date('2024-01-31'),
  provider: 'openai'
});

console.log(`Total tokens used: ${stats.totalTokens}`);
console.log(`Estimated cost: $${stats.totalEstimatedCost}`);
```

### 3. Setting Model Pricing
Update pricing for a specific model:

```typescript
await TokenTrackingService.setModelPricing({
  modelId: 'claude-3-sonnet',
  provider: 'anthropic',
  inputTokenPrice: 0.003,
  outputTokenPrice: 0.015,
  currency: 'USD',
  isActive: true
});
```

## Best Practices

### 1. Performance Considerations
- The system is designed to be non-blocking and will not affect chat performance
- Database operations are wrapped in try-catch blocks to prevent failures
- Daily aggregations are updated incrementally to optimize performance

### 2. Data Privacy
- All token usage data is associated with user IDs and requires authentication
- Admin-only endpoints are protected by role-based access control
- Sensitive information is stored securely in the database

### 3. Monitoring and Logging
- Comprehensive logging is implemented for debugging and monitoring
- Error conditions are logged but do not disrupt user experience
- Performance metrics can be extracted from the processing time data

### 4. Maintenance
- Regular database maintenance may be required for large datasets
- Consider implementing data retention policies for historical data
- Monitor pricing updates to ensure cost calculations remain accurate

## Future Enhancements

### 1. Advanced Analytics
- Real-time dashboards for token usage monitoring
- Cost prediction and budgeting features
- Anomaly detection for unusual usage patterns

### 2. Billing Integration
- Enhanced integration with billing systems
- Automated invoice generation
- Usage-based billing tiers

### 3. Performance Optimization
- Caching layer for frequently accessed statistics
- Batch processing for high-volume scenarios
- Database indexing optimization

### 4. User Features
- User-facing dashboards for personal usage tracking
- Budget alerts and notifications
- Cost optimization recommendations

## Troubleshooting

### Common Issues

1. **Token Count Discrepancies**
   - Different providers may report tokens differently
   - Verify provider-specific token counting methods
   - Check if model responses include usage information

2. **Cost Calculation Errors**
   - Ensure pricing data is up to date
   - Verify currency settings
   - Check for negative price values

3. **Database Performance**
   - Monitor query performance for large datasets
   - Consider archiving old data
   - Review database indexes

### Debug Mode
Enable debug logging by setting appropriate log levels:

```typescript
console.log(`[TokenTracking] Tracked token usage for user ${userId}`);
console.error(`[TokenTracking] Error tracking token usage:`, error);
```

## Support

For issues or questions regarding the token tracking system, please refer to:
- System logs for detailed error information
- Database query logs for performance issues
- API documentation for endpoint-specific issues