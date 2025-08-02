import { modelID } from '@/ai/providers';
import {
    AggregatedCostData,
    CostBreakdown,
    ProjectedCost,
    UsageLimitWarning
} from '@/lib/services/costCalculation';

/**
 * Token usage statistics for a user
 */
export interface TokenUsageStats {
    totalInputTokens: number;
    totalOutputTokens: number;
    totalTokens: number;
    totalEstimatedCost: number;
    totalActualCost: number;
    requestCount: number;
    breakdownByProvider: Array<{
        provider: string;
        inputTokens: number;
        outputTokens: number;
        totalTokens: number;
        estimatedCost: number;
        actualCost: number;
        requestCount: number;
    }>;
}

/**
 * Daily token usage data point
 */
export interface DailyTokenUsageData {
    date: Date;
    provider: string;
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
    estimatedCost: number;
    actualCost: number;
    requestCount: number;
}

/**
 * Model usage breakdown
 */
export interface ModelUsageBreakdown {
    modelId: modelID;
    provider: string;
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
    estimatedCost: number;
    actualCost: number;
    requestCount: number;
    averageTokensPerRequest: number;
    averageCostPerRequest: number;
}

/**
 * Time range filter options
 */
export interface TimeRangeFilter {
    label: string;
    value: string;
    days: number;
}

/**
 * Provider filter options
 */
export interface ProviderFilter {
    provider: string;
    label: string;
    isActive: boolean;
}

/**
 * Currency options
 */
export interface CurrencyOption {
    code: string;
    symbol: string;
    name: string;
}

/**
 * Chart data point for time series
 */
export interface ChartDataPoint {
    date: string;
    value: number;
    label?: string;
}

/**
 * Chart data series
 */
export interface ChartDataSeries {
    name: string;
    data: ChartDataPoint[];
    color?: string;
    type?: 'line' | 'bar' | 'area';
}

/**
 * Props for UsageSummaryCard component
 */
export interface UsageSummaryCardProps {
    title: string;
    value: string | number;
    change?: number;
    changeType?: 'increase' | 'decrease';
    icon?: React.ReactNode;
    description?: string;
    loading?: boolean;
    className?: string;
}

/**
 * Props for UsageChart component
 */
export interface UsageChartProps {
    title: string;
    data: ChartDataSeries[];
    type?: 'line' | 'bar' | 'area';
    height?: number;
    loading?: boolean;
    className?: string;
    onTimeRangeChange?: (range: string) => void;
    timeRange?: string;
    showLegend?: boolean;
    showGrid?: boolean;
    showTooltip?: boolean;
    currency?: string;
}

/**
 * Props for ModelBreakdownTable component
 */
export interface ModelBreakdownTableProps {
    data: ModelUsageBreakdown[];
    loading?: boolean;
    sortBy?: keyof ModelUsageBreakdown;
    sortOrder?: 'asc' | 'desc';
    onSort?: (column: keyof ModelUsageBreakdown) => void;
    currency?: string;
    className?: string;
}

/**
 * Props for CostAnalysisChart component
 */
export interface CostAnalysisChartProps {
    data: AggregatedCostData;
    loading?: boolean;
    currency?: string;
    className?: string;
    showComparison?: boolean;
    previousPeriodData?: AggregatedCostData;
}

/**
 * Props for UsageLimitIndicator component
 */
export interface UsageLimitIndicatorProps {
    data: UsageLimitWarning;
    loading?: boolean;
    className?: string;
    showDetails?: boolean;
    onLimitChange?: (limit: number) => void;
}

/**
 * Props for TokenMetricsDashboard component
 */
export interface TokenMetricsDashboardProps {
    userId: string;
    className?: string;
    initialTimeRange?: string;
    initialCurrency?: string;
    initialProvider?: string;
}

/**
 * Props for FilterBar component
 */
export interface FilterBarProps {
    timeRanges: TimeRangeFilter[];
    providers: ProviderFilter[];
    currencies: CurrencyOption[];
    selectedTimeRange: string;
    selectedProvider: string;
    selectedCurrency: string;
    onTimeRangeChange: (range: string) => void;
    onProviderChange: (provider: string) => void;
    onCurrencyChange: (currency: string) => void;
    className?: string;
}

/**
 * Props for ErrorMessage component
 */
export interface ErrorMessageProps {
    title: string;
    message: string;
    onRetry?: () => void;
    className?: string;
}

/**
 * Props for LoadingSpinner component
 */
export interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

/**
 * API response wrapper
 */
export interface ApiResponse<T> {
    success: boolean;
    data: T;
    meta?: {
        userId: string;
        startDate?: string;
        endDate?: string;
        provider?: string;
        currency?: string;
        type?: string;
    };
}

/**
 * Error response
 */
export interface ApiError {
    code: string;
    message: string;
}