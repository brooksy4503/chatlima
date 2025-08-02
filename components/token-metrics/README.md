# Token Metrics Components

This directory contains React components for displaying token usage and cost metrics in the ChatLima application. The components are designed to be responsive, accessible, and consistent with the existing design system.

## Components

### TokenMetricsDashboard

The main dashboard component that brings together all the metrics components.

```tsx
import { TokenMetricsDashboard } from "@/components/token-metrics";

function App() {
  return (
    <TokenMetricsDashboard 
      userId="user-123"
      initialTimeRange="30d"
      initialCurrency="USD"
    />
  );
}
```

**Props:**
- `userId` (string): The user ID to fetch data for
- `className` (string, optional): Additional CSS classes
- `initialTimeRange` (string, optional): Initial time range filter (default: "30d")
- `initialCurrency` (string, optional): Initial currency (default: "USD")
- `initialProvider` (string, optional): Initial provider filter (default: "all")

### UsageSummaryCard

Displays a single metric with optional change indicator.

```tsx
import { UsageSummaryCard } from "@/components/token-metrics";

<UsageSummaryCard
  title="Total Tokens"
  value="1.2M"
  change={15.5}
  changeType="increase"
  description="vs previous period"
  loading={false}
/>
```

**Props:**
- `title` (string): The title of the metric
- `value` (string | number): The value to display
- `change` (number, optional): The percentage change
- `changeType` ("increase" | "decrease", optional): The type of change
- `description` (string, optional): Additional description
- `loading` (boolean, optional): Whether the card is in loading state
- `className` (string, optional): Additional CSS classes
- `icon` (React.ReactNode, optional): Icon to display
- `format` (Function, optional): Custom formatting function

### TokenUsageSummaryCards

Displays multiple summary cards in a grid layout.

```tsx
import { TokenUsageSummaryCards } from "@/components/token-metrics";

<TokenUsageSummaryCards
  data={tokenStats}
  previousData={previousTokenStats}
  loading={loading}
/>
```

**Props:**
- `data` (TokenUsageStats): Current period data
- `previousData` (TokenUsageStats, optional): Previous period data for comparison
- `loading` (boolean, optional): Whether the cards are in loading state
- `className` (string, optional): Additional CSS classes
- `currency` (string, optional): Currency code for formatting

### UsageChart

Displays time-based usage data in various chart formats.

```tsx
import { UsageChart } from "@/components/token-metrics";

<UsageChart
  title="Token Usage Over Time"
  data={chartData}
  type="line"
  height={300}
  loading={loading}
  timeRange="30d"
  onTimeRangeChange={setTimeRange}
  currency="USD"
/>
```

**Props:**
- `title` (string): The title of the chart
- `data` (ChartDataSeries[]): The chart data series
- `type` ("line" | "bar" | "area", optional): The type of chart (default: "line")
- `height` (number, optional): The height of the chart in pixels (default: 300)
- `loading` (boolean, optional): Whether the chart is in loading state
- `className` (string, optional): Additional CSS classes
- `onTimeRangeChange` (Function, optional): Callback for time range changes
- `timeRange` (string, optional): Current selected time range
- `showLegend` (boolean, optional): Whether to show the legend (default: true)
- `showGrid` (boolean, optional): Whether to show the grid (default: true)
- `showTooltip` (boolean, optional): Whether to show tooltips (default: true)
- `currency` (string, optional): Currency code for formatting

### ModelBreakdownTable

Displays a sortable table of model usage breakdown.

```tsx
import { ModelBreakdownTable } from "@/components/token-metrics";

<ModelBreakdownTable
  data={modelBreakdown}
  loading={loading}
  sortBy="totalTokens"
  sortOrder="desc"
  onSort={handleSort}
  currency="USD"
/>
```

**Props:**
- `data` (ModelUsageBreakdown[]): The model usage breakdown data
- `loading` (boolean, optional): Whether the table is in loading state
- `sortBy` (keyof ModelUsageBreakdown, optional): The column to sort by
- `sortOrder` ("asc" | "desc", optional): The sort order (default: "desc")
- `onSort` (Function, optional): Callback for sort changes
- `currency` (string, optional): Currency code for formatting
- `className` (string, optional): Additional CSS classes

### ProviderBreakdownCard

Displays provider usage in a card format with visual breakdowns.

```tsx
import { ProviderBreakdownCard } from "@/components/token-metrics";

<ProviderBreakdownCard
  data={providerBreakdown}
  loading={loading}
  currency="USD"
/>
```

**Props:**
- `data` (ProviderBreakdownData[]): The provider breakdown data
- `loading` (boolean, optional): Whether the card is in loading state
- `currency` (string, optional): Currency code for formatting
- `className` (string, optional): Additional CSS classes

### CostAnalysisChart

Displays comprehensive cost analysis visualizations with tabs.

```tsx
import { CostAnalysisChart } from "@/components/token-metrics";

<CostAnalysisChart
  data={costData}
  loading={loading}
  currency="USD"
  showComparison={true}
  previousPeriodData={previousCostData}
/>
```

**Props:**
- `data` (AggregatedCostData): The aggregated cost data
- `loading` (boolean, optional): Whether the chart is in loading state
- `currency` (string, optional): Currency code for formatting
- `className` (string, optional): Additional CSS classes
- `showComparison` (boolean, optional): Whether to show comparison with previous period
- `previousPeriodData` (AggregatedCostData, optional): Previous period data for comparison

### UsageLimitIndicator

Displays usage limits and warnings with detailed information.

```tsx
import { UsageLimitIndicator } from "@/components/token-metrics";

<UsageLimitIndicator
  data={usageLimits}
  loading={loading}
  showDetails={true}
  onLimitChange={handleLimitChange}
/>
```

**Props:**
- `data` (UsageLimitWarning): The usage limit warning data
- `loading` (boolean, optional): Whether the indicator is in loading state
- `className` (string, optional): Additional CSS classes
- `showDetails` (boolean, optional): Whether to show detailed information
- `onLimitChange` (Function, optional): Callback for limit changes

### UsageLimitCard

Displays a compact version of the usage limit indicator.

```tsx
import { UsageLimitCard } from "@/components/token-metrics";

<UsageLimitCard
  data={usageLimits}
  loading={loading}
  onClick={handleClick}
/>
```

**Props:**
- `data` (UsageLimitWarning): The usage limit warning data
- `loading` (boolean, optional): Whether the card is in loading state
- `className` (string, optional): Additional CSS classes
- `onClick` (Function, optional): Click handler

### UsageLimitSummary

Displays a very compact summary of usage limits.

```tsx
import { UsageLimitSummary } from "@/components/token-metrics";

<UsageLimitSummary
  data={usageLimits}
  loading={loading}
/>
```

**Props:**
- `data` (UsageLimitWarning): The usage limit warning data
- `loading` (boolean, optional): Whether the summary is in loading state
- `className` (string, optional): Additional CSS classes

## Data Types

The components use several TypeScript interfaces for type safety:

### TokenUsageStats
```typescript
interface TokenUsageStats {
  totalTokens: number;
  totalCost: number;
  requestCount: number;
  averageCostPerRequest: number;
  currency: string;
}
```

### ChartDataSeries
```typescript
interface ChartDataSeries {
  name: string;
  data: Array<{
    date: string;
    value: number;
  }>;
  color?: string;
  type: "line" | "bar" | "area";
}
```

### ModelUsageBreakdown
```typescript
interface ModelUsageBreakdown {
  modelId: string;
  provider: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  estimatedCost: number;
  actualCost: number;
  requestCount: number;
}
```

### UsageLimitWarning
```typescript
interface UsageLimitWarning {
  isApproachingLimit: boolean;
  isOverLimit: boolean;
  currentUsage: number;
  limit: number;
  percentageUsed: number;
  projectedOverage: number;
  currency: string;
  recommendations: string[];
}
```

## Styling

All components use Tailwind CSS for styling and follow the existing design system:

- **Colors**: Components use the application's color palette through Tailwind's color classes
- **Spacing**: Consistent spacing using Tailwind's spacing scale
- **Typography**: Consistent typography using Tailwind's font size and weight classes
- **Responsive**: All components are responsive and work on all device sizes
- **Accessibility**: Components include proper ARIA labels and keyboard navigation

## Loading States

All components support loading states that display skeleton placeholders while data is being fetched:

```tsx
<UsageSummaryCard
  title="Total Tokens"
  value="1.2M"
  loading={true} // Shows skeleton placeholder
/>
```

## Error Handling

The main dashboard component includes error handling that displays user-friendly error messages when data fails to load:

```tsx
// Error state is automatically handled in the dashboard
<TokenMetricsDashboard userId="user-123" />
```

## Customization

### Custom Formatting

You can provide custom formatting functions for values:

```tsx
<UsageSummaryCard
  title="Custom Value"
  value={1234567}
  format={(value) => `$${(value / 1000).toFixed(1)}K`}
/>
```

### Custom Styling

All components accept a `className` prop for additional styling:

```tsx
<UsageSummaryCard
  title="Styled Card"
  value="100"
  className="border-2 border-blue-500"
/>
```

## Integration with API

The components are designed to work with the existing API endpoints:

- `/api/token-usage` - For token usage statistics
- `/api/cost-analytics` - For cost analytics data
- `/api/model-pricing` - For model pricing information

The dashboard component includes mock data for demonstration purposes. In a real implementation, you would replace the mock data with actual API calls.

## Example Usage

Here's a complete example of how to use the components:

```tsx
import { TokenMetricsDashboard } from "@/components/token-metrics";

function MetricsPage() {
  return (
    <div className="container mx-auto py-8">
      <TokenMetricsDashboard 
        userId="user-123"
        initialTimeRange="30d"
        initialCurrency="USD"
        className="space-y-6"
      />
    </div>
  );
}
```

## Dependencies

The components depend on:

- React
- Tailwind CSS
- Radix UI components (Card, Button, Badge, Tabs, etc.)
- Lucide React icons
- Class Variance Authority (CVA) for variant styling

Make sure these dependencies are installed in your project before using the components.