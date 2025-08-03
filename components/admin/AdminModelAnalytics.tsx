"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { 
  BarChart3, 
  PieChart, 
  Download, 
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Zap,
  DollarSign,
  Activity,
  Calendar,
  Server,
  Filter
} from "lucide-react";

interface AdminModelAnalyticsProps {
  loading?: boolean;
}

interface ModelAnalytics {
  id: string;
  name: string;
  provider: string;
  tokensUsed: number;
  cost: number;
  requestCount: number;
  avgResponseTime: number;
  successRate: number;
  lastUsed: string;
  usagePercentage: number;
  costPercentage: number;
}

interface ProviderAnalytics {
  name: string;
  tokensUsed: number;
  cost: number;
  requestCount: number;
  avgResponseTime: number;
  successRate: number;
  modelCount: number;
  usagePercentage: number;
  costPercentage: number;
}

interface TimeSeriesData {
  date: string;
  tokens: number;
  cost: number;
  requests: number;
}

export function AdminModelAnalytics({ loading: externalLoading = false }: AdminModelAnalyticsProps) {
  const [timeRange, setTimeRange] = React.useState<"day" | "week" | "month" | "year">("month");
  const [providerFilter, setProviderFilter] = React.useState<string>("all");
  const [sortBy, setSortBy] = React.useState<"tokens" | "cost" | "requests">("tokens");

  // Fetch model analytics data
  const { data: analyticsData, isLoading, error, refetch } = useQuery({
    queryKey: ['admin-model-analytics', timeRange, providerFilter],
    queryFn: async () => {
      const params = new URLSearchParams({
        timeRange,
        ...(providerFilter !== 'all' && { provider: providerFilter })
      });
      
      const response = await fetch(`/api/admin/model-analytics?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch model analytics');
      }
      return response.json();
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const modelAnalytics = analyticsData?.data?.modelAnalytics || [];
  const providerAnalytics = analyticsData?.data?.providerAnalytics || [];
  const summary = analyticsData?.data?.summary || {};

  const loading = isLoading || externalLoading;

  // Sort model analytics for display and export
  const sortedModelAnalytics = [...modelAnalytics].sort((a, b) => {
    switch (sortBy) {
      case "tokens":
        return b.tokensUsed - a.tokensUsed;
      case "cost":
        return b.cost - a.cost;
      case "requests":
        return b.requestCount - a.requestCount;
      default:
        return b.tokensUsed - a.tokensUsed;
    }
  });

  const handleRefresh = () => {
    refetch();
  };

  const handleExport = () => {
    if (!modelAnalytics.length) return;
    
    const csvContent = [
      ["Model", "Provider", "Tokens Used", "Cost", "Requests", "Avg Response Time", "Success Rate", "Last Used"],
      ...sortedModelAnalytics.map(model => [
        model.name,
        model.provider,
        model.tokensUsed,
        model.cost,
        model.requestCount,
        model.avgResponseTime,
        model.successRate,
        model.lastUsed
      ])
    ].map(row => row.join(",")).join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `model_analytics_${timeRange}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat("en-US").format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getProviderColor = (provider: string) => {
    const colors: Record<string, string> = {
      openai: "bg-green-100 text-green-800",
      anthropic: "bg-blue-100 text-blue-800",
      google: "bg-red-100 text-red-800",
      groq: "bg-purple-100 text-purple-800",
      xai: "bg-orange-100 text-orange-800",
      openrouter: "bg-cyan-100 text-cyan-800",
    };
    return colors[provider.toLowerCase()] || "bg-gray-100 text-gray-800";
  };

  const getResponseTimeColor = (responseTime: number) => {
    if (responseTime <= 1) return "text-green-600";
    if (responseTime <= 2) return "text-yellow-600";
    return "text-red-600";
  };

  const getSuccessRateColor = (successRate: number) => {
    if (successRate >= 99.5) return "text-green-600";
    if (successRate >= 99) return "text-yellow-600";
    return "text-red-600";
  };

  const renderLoadingRows = () => {
    return Array.from({ length: 5 }).map((_, index) => (
      <TableRow key={index}>
        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
      </TableRow>
    ));
  };

  if (error) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-red-500">
              <p>Error loading model analytics: {error.message}</p>
              <Button variant="outline" onClick={handleRefresh} className="mt-4">
                <RefreshCw className="mr-2 h-4 w-4" />
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                          <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>Model & Provider Analytics</span>
              {summary.totalModelsWithUsage && summary.totalModelsInPricing && (
                <Badge variant="outline" className="ml-2">
                  {summary.totalModelsWithUsage} of {summary.totalModelsInPricing} models active
                </Badge>
              )}
            </CardTitle>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              <Select value={timeRange} onValueChange={(value: any) => setTimeRange(value)}>
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue placeholder="Time range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Last 24 Hours</SelectItem>
                  <SelectItem value="week">Last 7 Days</SelectItem>
                  <SelectItem value="month">Last 30 Days</SelectItem>
                  <SelectItem value="year">Last Year</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={providerFilter} onValueChange={setProviderFilter}>
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue placeholder="Provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Providers</SelectItem>
                  <SelectItem value="openai">OpenAI</SelectItem>
                  <SelectItem value="anthropic">Anthropic</SelectItem>
                  <SelectItem value="google">Google</SelectItem>
                  <SelectItem value="groq">Groq</SelectItem>
                  <SelectItem value="xai">xAI</SelectItem>
                  <SelectItem value="openrouter">OpenRouter</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tokens">Token Usage</SelectItem>
                  <SelectItem value="cost">Cost</SelectItem>
                  <SelectItem value="requests">Requests</SelectItem>
                </SelectContent>
              </Select>
              
              <Button variant="outline" onClick={handleExport} disabled={!modelAnalytics.length}>
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
              
              <Button variant="outline" onClick={handleRefresh} disabled={loading}>
                <RefreshCw className={cn("mr-2 h-4 w-4", loading && "animate-spin")} />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Provider Analytics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <PieChart className="h-5 w-5" />
            <span>Provider Analytics</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {providerAnalytics.map((provider: ProviderAnalytics, index: number) => (
              <div key={provider.name} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-medium">
                    {index + 1}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <p className="font-medium">{provider.name}</p>
                      <Badge className={getProviderColor(provider.name)}>
                        {provider.name}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {provider.modelCount} model{provider.modelCount !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-right">
                  <div>
                    <p className="text-sm text-muted-foreground">Tokens</p>
                    <p className="font-medium">{formatNumber(provider.tokensUsed)}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatPercentage(provider.usagePercentage)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Cost</p>
                    <p className="font-medium">{formatCurrency(provider.cost)}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatPercentage(provider.costPercentage)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Response</p>
                    <p className={`font-medium ${getResponseTimeColor(provider.avgResponseTime)}`}>
                      {provider.avgResponseTime}s
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Success Rate</p>
                    <p className={`font-medium ${getSuccessRateColor(provider.successRate)}`}>
                      {formatPercentage(provider.successRate)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Model Analytics Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Model</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead>Tokens Used</TableHead>
                <TableHead>Cost</TableHead>
                <TableHead>Requests</TableHead>
                <TableHead>Avg Response</TableHead>
                <TableHead>Success Rate</TableHead>
                <TableHead>Last Used</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                renderLoadingRows()
              ) : sortedModelAnalytics.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    {loading ? "Loading models..." : `No models found${providerFilter !== 'all' ? ` for ${providerFilter}` : ''} in the selected time period`}
                  </TableCell>
                </TableRow>
              ) : (
                sortedModelAnalytics.map((model) => (
                  <TableRow key={model.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div className="font-medium">{model.name}</div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getProviderColor(model.provider)}>
                        {model.provider}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Zap className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{formatNumber(model.tokensUsed)}</span>
                        <span className="text-xs text-muted-foreground">
                          ({formatPercentage(model.usagePercentage)})
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{formatCurrency(model.cost)}</span>
                        <span className="text-xs text-muted-foreground">
                          ({formatPercentage(model.costPercentage)})
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Activity className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{formatNumber(model.requestCount)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className={`font-medium ${getResponseTimeColor(model.avgResponseTime)}`}>
                        {model.avgResponseTime}s
                      </p>
                    </TableCell>
                    <TableCell>
                      <p className={`font-medium ${getSuccessRateColor(model.successRate)}`}>
                        {formatPercentage(model.successRate)}
                      </p>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{formatDate(model.lastUsed)}</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Server className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Models with Usage</p>
                <div className="text-2xl font-bold">
                  {loading ? <Skeleton className="h-8 w-16 inline-block" /> : summary.totalModelsWithUsage || 0}
                </div>
                {summary.totalModelsInPricing && (
                  <p className="text-xs text-muted-foreground">
                    of {summary.totalModelsInPricing} total in pricing
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Zap className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Tokens</p>
                <div className="text-2xl font-bold">
                  {loading ? <Skeleton className="h-8 w-24 inline-block" /> : formatNumber(summary.totalTokens || 0)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Cost</p>
                <div className="text-2xl font-bold">
                  {loading ? <Skeleton className="h-8 w-20 inline-block" /> : formatCurrency(summary.totalCost || 0)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Activity className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Requests</p>
                <div className="text-2xl font-bold">
                  {loading ? <Skeleton className="h-8 w-20 inline-block" /> : formatNumber(summary.totalRequests || 0)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}