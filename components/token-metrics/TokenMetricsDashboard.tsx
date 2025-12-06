import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { TokenMetricsDashboardProps } from "./types";
import { TokenUsageSummaryCards } from "./UsageSummaryCard";
import { UsageChart } from "./UsageChart";
import { ModelBreakdownTable, ProviderBreakdownCard } from "./ModelBreakdownTable";
import { CostAnalysisChart } from "./CostAnalysisChart";
import { UsageLimitIndicator, UsageLimitCard } from "./UsageLimitIndicator";
import { 
  RefreshCw, 
  Download, 
  AlertCircle, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  DollarSign,
  BarChart3,
  PieChart,
  Table,
  Settings
} from "lucide-react";

/**
 * TokenMetricsDashboard component is the main dashboard for displaying token usage and cost metrics
 * 
 * @param userId - The user ID to fetch data for
 * @param className - Additional CSS classes
 * @param initialTimeRange - Initial time range filter
 * @param initialCurrency - Initial currency
 * @param initialProvider - Initial provider filter
 */
export function TokenMetricsDashboard({
  userId,
  className,
  initialTimeRange = "30d",
  initialCurrency = "USD",
  initialProvider = "all",
}: TokenMetricsDashboardProps) {
  // State management
  const [timeRange, setTimeRange] = React.useState(initialTimeRange);
  const [currency, setCurrency] = React.useState(initialCurrency);
  const [provider, setProvider] = React.useState(initialProvider);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  
  // Data states
  const [tokenStats, setTokenStats] = React.useState<any>(null);
  const [previousTokenStats, setPreviousTokenStats] = React.useState<any>(null);
  const [dailyUsage, setDailyUsage] = React.useState<any>(null);
  const [costData, setCostData] = React.useState<any>(null);
  const [previousCostData, setPreviousCostData] = React.useState<any>(null);
  const [usageLimits, setUsageLimits] = React.useState<any>(null);
  const [modelBreakdown, setModelBreakdown] = React.useState<any>(null);
  const [providerBreakdown, setProviderBreakdown] = React.useState<any>(null);

  // Time range options
  const timeRanges = [
    { label: "Last 7 days", value: "7d", days: 7 },
    { label: "Last 30 days", value: "30d", days: 30 },
    { label: "Last 90 days", value: "90d", days: 90 },
    { label: "Last year", value: "1y", days: 365 },
  ];

  // Currency options
  const currencies = [
    { code: "USD", symbol: "$", name: "US Dollar" },
    { code: "EUR", symbol: "€", name: "Euro" },
    { code: "GBP", symbol: "£", name: "British Pound" },
    { code: "JPY", symbol: "¥", name: "Japanese Yen" },
  ];

  // Provider options
  const providers = [
    { provider: "all", label: "All Providers", isActive: true },
    { provider: "openai", label: "OpenAI", isActive: true },
    { provider: "anthropic", label: "Anthropic", isActive: true },
    { provider: "google", label: "Google", isActive: true },
    { provider: "groq", label: "Groq", isActive: true },
    { provider: "xai", label: "xAI", isActive: true },
  ];

  // Mock data fetching function (replace with actual API calls)
  const fetchData = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API calls with mock data
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock token stats
      const mockTokenStats = {
        totalTokens: 1250000,
        totalCost: 1250.50,
        requestCount: 3420,
        averageCostPerRequest: 0.37,
        currency: currency,
      };
      
      const mockPreviousTokenStats = {
        totalTokens: 980000,
        totalCost: 980.25,
        requestCount: 2850,
        averageCostPerRequest: 0.34,
        currency: currency,
      };
      
      // Mock daily usage data
      const mockDailyUsage = {
        "input-tokens": {
          name: "Input Tokens",
          data: Array.from({ length: 30 }, (_, i) => ({
            date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            value: Math.floor(Math.random() * 50000) + 20000,
          })),
          color: "#3b82f6",
          type: "line" as const,
        },
        "output-tokens": {
          name: "Output Tokens",
          data: Array.from({ length: 30 }, (_, i) => ({
            date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            value: Math.floor(Math.random() * 30000) + 10000,
          })),
          color: "#8b5cf6",
          type: "line" as const,
        },
      };
      
      // Mock cost data
      const mockCostData = {
        totalInputTokens: 750000,
        totalOutputTokens: 500000,
        totalTokens: 1250000,
        totalInputCost: 750.25,
        totalOutputCost: 500.25,
        totalSubtotal: 1250.50,
        totalDiscount: 25.00,
        totalCost: 1225.50,
        currency: currency,
        requestCount: 3420,
        averageCostPerRequest: 0.36,
        breakdownByProvider: {
          openai: {
            inputTokens: 450000,
            outputTokens: 300000,
            totalTokens: 750000,
            inputCost: 450.15,
            outputCost: 300.15,
            subtotal: 750.30,
            discountAmount: 15.00,
            totalCost: 735.30,
            currency: currency,
          },
          anthropic: {
            inputTokens: 200000,
            outputTokens: 150000,
            totalTokens: 350000,
            inputCost: 200.10,
            outputCost: 150.10,
            subtotal: 350.20,
            discountAmount: 7.00,
            totalCost: 343.20,
            currency: currency,
          },
          google: {
            inputTokens: 100000,
            outputTokens: 50000,
            totalTokens: 150000,
            inputCost: 100.00,
            outputCost: 50.00,
            subtotal: 150.00,
            discountAmount: 3.00,
            totalCost: 147.00,
            currency: currency,
          },
        },
        breakdownByModel: {
          "gpt-4": {
            inputTokens: 400000,
            outputTokens: 250000,
            totalTokens: 650000,
            inputCost: 400.00,
            outputCost: 250.00,
            subtotal: 650.00,
            discountAmount: 13.00,
            totalCost: 637.00,
            currency: currency,
          },
          "claude-3": {
            inputTokens: 200000,
            outputTokens: 150000,
            totalTokens: 350000,
            inputCost: 200.00,
            outputCost: 150.00,
            subtotal: 350.00,
            discountAmount: 7.00,
            totalCost: 343.00,
            currency: currency,
          },
          "gemini-pro": {
            inputTokens: 100000,
            outputTokens: 50000,
            totalTokens: 150000,
            inputCost: 100.00,
            outputCost: 50.00,
            subtotal: 150.00,
            discountAmount: 3.00,
            totalCost: 147.00,
            currency: currency,
          },
        },
      };
      
      // Mock usage limits
      const mockUsageLimits = {
        isApproachingLimit: true,
        isOverLimit: false,
        currentUsage: 1225.50,
        limit: 1500.00,
        percentageUsed: 81.7,
        projectedOverage: 0,
        currency: currency,
        recommendations: [
          "Consider upgrading to a higher tier plan if usage continues to increase",
          "Monitor usage patterns to identify optimization opportunities",
          "Set up alerts for when usage reaches 90% of your limit"
        ],
      };
      
      // Mock model breakdown
      const mockModelBreakdown = [
        {
          modelId: "gpt-4",
          provider: "openai",
          inputTokens: 400000,
          outputTokens: 250000,
          totalTokens: 650000,
          estimatedCost: 637.00,
          actualCost: 637.00,
          requestCount: 1850,
          averageTokensPerRequest: 351,
          averageCostPerRequest: 0.34,
        },
        {
          modelId: "claude-3",
          provider: "anthropic",
          inputTokens: 200000,
          outputTokens: 150000,
          totalTokens: 350000,
          estimatedCost: 343.00,
          actualCost: 343.00,
          requestCount: 1200,
          averageTokensPerRequest: 292,
          averageCostPerRequest: 0.29,
        },
        {
          modelId: "gemini-pro",
          provider: "google",
          inputTokens: 100000,
          outputTokens: 50000,
          totalTokens: 150000,
          estimatedCost: 147.00,
          actualCost: 147.00,
          requestCount: 370,
          averageTokensPerRequest: 405,
          averageCostPerRequest: 0.40,
        },
      ];
      
      // Mock provider breakdown
      const mockProviderBreakdown = [
        {
          provider: "openai",
          inputTokens: 450000,
          outputTokens: 300000,
          totalTokens: 750000,
          estimatedCost: 735.30,
          actualCost: 735.30,
          requestCount: 2220,
        },
        {
          provider: "anthropic",
          inputTokens: 200000,
          outputTokens: 150000,
          totalTokens: 350000,
          estimatedCost: 343.20,
          actualCost: 343.20,
          requestCount: 1200,
        },
        {
          provider: "google",
          inputTokens: 100000,
          outputTokens: 50000,
          totalTokens: 150000,
          estimatedCost: 147.00,
          actualCost: 147.00,
          requestCount: 370,
        },
      ];
      
      setTokenStats(mockTokenStats);
      setPreviousTokenStats(mockPreviousTokenStats);
      setDailyUsage(mockDailyUsage);
      setCostData(mockCostData);
      setUsageLimits(mockUsageLimits);
      setModelBreakdown(mockModelBreakdown);
      setProviderBreakdown(mockProviderBreakdown);
    } catch (err) {
      setError("Failed to load metrics data. Please try again.");
      console.error("Error fetching metrics data:", err);
    } finally {
      setLoading(false);
    }
  }, [currency]);

  // Initial data fetch
  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle refresh
  const handleRefresh = () => {
    fetchData();
  };

  // Handle export
  const handleExport = () => {
    // Placeholder for export functionality
    console.log("Export functionality not implemented yet");
  };

  // Render loading state
  const renderLoading = () => (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-32" />
        ))}
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <Skeleton className="h-80" />
        <Skeleton className="h-80" />
      </div>
      <Skeleton className="h-96" />
    </div>
  );

  // Render error state
  const renderError = () => (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>{error}</AlertDescription>
    </Alert>
  );

  return (
    <div className={cn("w-full space-y-6", className)}>
      {/* Header */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Token Usage & Cost Metrics</h1>
          <p className="text-muted-foreground">
            Monitor your AI model usage and costs across providers
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleRefresh} disabled={loading}>
            <RefreshCw className={cn("mr-2 h-4 w-4", loading && "animate-spin")} />
            Refresh
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col space-y-4 md:flex-row md:items-center md:space-y-0 md:space-x-6">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Time Range:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {timeRanges.map((range) => (
                <Button
                  key={range.value}
                  variant={timeRange === range.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTimeRange(range.value)}
                  className="h-8 px-3"
                >
                  {range.label}
                </Button>
              ))}
            </div>
            
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Currency:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {currencies.map((curr) => (
                <Button
                  key={curr.code}
                  variant={currency === curr.code ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrency(curr.code)}
                  className="h-8 px-3"
                >
                  {curr.code}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main content */}
      {loading ? (
        renderLoading()
      ) : error ? (
        renderError()
      ) : (
        <div className="space-y-6">
          {/* Summary Cards */}
          <TokenUsageSummaryCards
            data={tokenStats}
            previousData={previousTokenStats}
            loading={loading}
          />

          {/* Usage Limit Card */}
          <UsageLimitCard
            data={usageLimits}
            loading={loading}
            onClick={() => {
              // Scroll to detailed usage limit section
              document.getElementById("usage-limits")?.scrollIntoView({ behavior: "smooth" });
            }}
          />

          {/* Charts and Breakdowns */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Usage Chart */}
            <UsageChart
              title="Token Usage Over Time"
              data={Object.values(dailyUsage)}
              type="line"
              height={300}
              loading={loading}
              timeRange={timeRange}
              onTimeRangeChange={setTimeRange}
              currency={currency}
            />

            {/* Cost Analysis */}
            <CostAnalysisChart
              data={costData}
              loading={loading}
              currency={currency}
              showComparison={true}
              previousPeriodData={previousCostData}
            />
          </div>

          {/* Detailed Breakdowns */}
          <Tabs defaultValue="models" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="models">Model Breakdown</TabsTrigger>
              <TabsTrigger value="providers">Provider Breakdown</TabsTrigger>
              <TabsTrigger value="limits">Usage Limits</TabsTrigger>
            </TabsList>
            
            <TabsContent value="models" className="mt-4">
              <ModelBreakdownTable
                data={modelBreakdown}
                loading={loading}
                currency={currency}
              />
            </TabsContent>
            
            <TabsContent value="providers" className="mt-4">
              <ProviderBreakdownCard
                data={providerBreakdown}
                loading={loading}
                currency={currency}
              />
            </TabsContent>
            
            <TabsContent value="limits" className="mt-4" id="usage-limits">
              <UsageLimitIndicator
                data={usageLimits}
                loading={loading}
                showDetails={true}
                onLimitChange={(newLimit) => {
                  // Handle limit change
                  console.log("New limit:", newLimit);
                }}
              />
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}