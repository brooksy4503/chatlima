"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { 
  Users, 
  Activity, 
  DollarSign, 
  Zap,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  BarChart3,
  PieChart,
  Clock,
  Server,
  AlertCircle,
  CheckCircle
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface AdminSystemStatsProps {
  loading?: boolean;
}

interface SystemStats {
  totalUsers: number;
  activeUsers: number;
  totalTokens: number;
  totalCost: number;
  avgResponseTime: number;
  systemUptime: number;
  requestsToday: number;
  requestsThisMonth: number;
  trends: {
    tokenTrend: number;
    costTrend: number;
    userTrend: number;
    activeUserTrend: number;
  };
  topModels: Array<{
    id: string;
    name: string;
    usage: number;
    cost: number;
    requestCount: number;
  }>;
  topProviders: Array<{
    name: string;
    usage: number;
    cost: number;
    requestCount: number;
  }>;
  dailyUsage: Array<{
    date: string;
    tokens: number;
    cost: number;
  }>;
}

export function AdminSystemStats({ loading = false }: AdminSystemStatsProps) {
  const [timeRange, setTimeRange] = React.useState<"day" | "week" | "month" | "year">("month");

  // Fetch system stats from API
  const { data: systemStats, isLoading, error, refetch } = useQuery({
    queryKey: ['admin-system-stats', timeRange],
    queryFn: async (): Promise<SystemStats> => {
      const response = await fetch(`/api/admin/system-stats?timeRange=${timeRange}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`);
      }
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to fetch system stats');
      }
      return result.data;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const safeNumber = (value: any): number => {
    if (typeof value === 'number' && !isNaN(value) && isFinite(value)) return value;
    if (typeof value === 'string') {
      const parsed = parseFloat(value);
      if (!isNaN(parsed) && isFinite(parsed)) return parsed;
    }
    return 0;
  };

  const formatCurrency = (value: number) => {
    const safeValue = safeNumber(value);
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(safeValue);
  };

  const formatNumber = (value: number) => {
    const safeValue = safeNumber(value);
    return new Intl.NumberFormat("en-US").format(safeValue);
  };

  const formatPercentage = (value: number) => {
    const safeValue = safeNumber(value);
    return `${safeValue.toFixed(1)}%`;
  };

  const formatTrend = (value: number) => {
    const safeValue = safeNumber(value);
    const sign = safeValue >= 0 ? "+" : "";
    return `${sign}${safeValue.toFixed(1)}%`;
  };

  const getTrendIcon = (value: number) => {
    const safeValue = safeNumber(value);
    return safeValue >= 0 ? (
      <TrendingUp className="h-3 w-3 text-green-600" />
    ) : (
      <TrendingDown className="h-3 w-3 text-red-600" />
    );
  };

  const getTrendColor = (value: number) => {
    const safeValue = safeNumber(value);
    return safeValue >= 0 ? "text-green-600" : "text-red-600";
  };

  const getProviderColor = (provider: string) => {
    if (!provider) return "bg-gray-100 text-gray-800";
    const colors: Record<string, string> = {
      openai: "bg-green-100 text-green-800",
      anthropic: "bg-blue-100 text-blue-800",
      google: "bg-red-100 text-red-800",
      groq: "bg-purple-100 text-purple-800",
      xai: "bg-orange-100 text-orange-800",
      openrouter: "bg-purple-100 text-purple-800",
      requesty: "bg-cyan-100 text-cyan-800",
    };
    return colors[provider.toLowerCase()] || "bg-gray-100 text-gray-800";
  };

  const getStatusColor = (value: number, type: "uptime" | "response") => {
    const safeValue = safeNumber(value);
    if (type === "uptime") {
      return safeValue >= 99.5 ? "text-green-600" : safeValue >= 99 ? "text-yellow-600" : "text-red-600";
    } else {
      return safeValue <= 1 ? "text-green-600" : safeValue <= 2 ? "text-yellow-600" : "text-red-600";
    }
  };

  const getStatusIcon = (value: number, type: "uptime" | "response") => {
    const safeValue = safeNumber(value);
    if (type === "uptime") {
      return safeValue >= 99.5 ? (
        <CheckCircle className="h-4 w-4 text-green-600" />
      ) : safeValue >= 99 ? (
        <AlertCircle className="h-4 w-4 text-yellow-600" />
      ) : (
        <AlertCircle className="h-4 w-4 text-red-600" />
      );
    } else {
      return safeValue <= 1 ? (
        <CheckCircle className="h-4 w-4 text-green-600" />
      ) : safeValue <= 2 ? (
        <AlertCircle className="h-4 w-4 text-yellow-600" />
      ) : (
        <AlertCircle className="h-4 w-4 text-red-600" />
      );
    }
  };

  const calculatePercentage = (value: number, total: number) => {
    const safeValue = safeNumber(value);
    const safeTotal = safeNumber(total);
    if (safeTotal === 0) return 0;
    return (safeValue / safeTotal) * 100;
  };

  const renderLoadingCards = () => {
    return Array.from({ length: 8 }).map((_, index) => (
      <Card key={index}>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-2">
            <Skeleton className="h-8 w-8" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-6 w-16" />
            </div>
          </div>
        </CardContent>
      </Card>
    ));
  };

  const handleRefresh = () => {
    refetch();
  };

  if (isLoading || loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">System Overview</h2>
          <Select value={timeRange} onValueChange={(value: any) => setTimeRange(value)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Last 24 Hours</SelectItem>
              <SelectItem value="week">Last 7 Days</SelectItem>
              <SelectItem value="month">Last 30 Days</SelectItem>
              <SelectItem value="year">Last Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {renderLoadingCards()}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">System Overview</h2>
          <div className="flex space-x-2">
            <Select value={timeRange} onValueChange={(value: any) => setTimeRange(value)}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Last 24 Hours</SelectItem>
                <SelectItem value="week">Last 7 Days</SelectItem>
                <SelectItem value="month">Last 30 Days</SelectItem>
                <SelectItem value="year">Last Year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={handleRefresh}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 text-red-600">
              <AlertCircle className="h-4 w-4" />
              <div>
                <p className="font-medium">Failed to load system stats</p>
                <p className="text-sm text-muted-foreground">
                  {error instanceof Error ? error.message : 'An unexpected error occurred'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!systemStats) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">System Overview</h2>
          <div className="flex space-x-2">
            <Select value={timeRange} onValueChange={(value: any) => setTimeRange(value)}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Last 24 Hours</SelectItem>
                <SelectItem value="week">Last 7 Days</SelectItem>
                <SelectItem value="month">Last 30 Days</SelectItem>
                <SelectItem value="year">Last Year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={handleRefresh}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 text-muted-foreground">
              <AlertCircle className="h-4 w-4" />
              <p>No system stats available.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">System Overview</h2>
        <div className="flex space-x-2">
          <Select value={timeRange} onValueChange={(value: any) => setTimeRange(value)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Last 24 Hours</SelectItem>
              <SelectItem value="week">Last 7 Days</SelectItem>
              <SelectItem value="month">Last 30 Days</SelectItem>
              <SelectItem value="year">Last Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className={cn("mr-2 h-4 w-4", isLoading && "animate-spin")} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">{formatNumber(systemStats.totalUsers)}</p>
                <div className="flex items-center space-x-1 text-xs">
                  {getTrendIcon(systemStats.trends?.userTrend || 0)}
                  <span className={getTrendColor(systemStats.trends?.userTrend || 0)}>
                    {formatTrend(systemStats.trends?.userTrend || 0)}
                  </span>
                  <span className="text-muted-foreground">from previous period</span>
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
                <p className="text-sm font-medium text-muted-foreground">Active Users</p>
                <p className="text-2xl font-bold">{formatNumber(systemStats.activeUsers)}</p>
                <div className="flex items-center space-x-1 text-xs">
                  {getTrendIcon(systemStats.trends?.activeUserTrend || 0)}
                  <span className={getTrendColor(systemStats.trends?.activeUserTrend || 0)}>
                    {formatTrend(systemStats.trends?.activeUserTrend || 0)}
                  </span>
                  <span className="text-muted-foreground">from previous period</span>
                </div>
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
                <p className="text-2xl font-bold">{formatNumber(systemStats.totalTokens)}</p>
                <div className="flex items-center space-x-1 text-xs">
                  {getTrendIcon(systemStats.trends?.tokenTrend || 0)}
                  <span className={getTrendColor(systemStats.trends?.tokenTrend || 0)}>
                    {formatTrend(systemStats.trends?.tokenTrend || 0)}
                  </span>
                  <span className="text-muted-foreground">from previous period</span>
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
                <p className="text-2xl font-bold">{formatCurrency(systemStats.totalCost)}</p>
                <div className="flex items-center space-x-1 text-xs">
                  {getTrendIcon(systemStats.trends?.costTrend || 0)}
                  <span className={getTrendColor(systemStats.trends?.costTrend || 0)}>
                    {formatTrend(systemStats.trends?.costTrend || 0)}
                  </span>
                  <span className="text-muted-foreground">from previous period</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Requests Today</p>
                <p className="text-2xl font-bold">{formatNumber(systemStats.requestsToday)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Requests This Month</p>
                <p className="text-2xl font-bold">{formatNumber(systemStats.requestsThisMonth)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Response Time</p>
                <div className="flex items-center space-x-1">
                  <p className={`text-2xl font-bold ${getStatusColor(systemStats.avgResponseTime, "response")}`}>
                    {typeof systemStats.avgResponseTime === 'number' ? systemStats.avgResponseTime.toFixed(1) : '0.0'}s
                  </p>
                  {getStatusIcon(systemStats.avgResponseTime, "response")}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Server className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">System Uptime</p>
                <div className="flex items-center space-x-1">
                  <p className={`text-2xl font-bold ${getStatusColor(systemStats.systemUptime, "uptime")}`}>
                    {formatPercentage(systemStats.systemUptime)}
                  </p>
                  {getStatusIcon(systemStats.systemUptime, "uptime")}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Models */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" />
            <span>Top Models by Usage</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {systemStats.topModels && systemStats.topModels.length > 0 ? (
              systemStats.topModels.map((model, index) => (
                <div key={model.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{model.name || 'Unknown Model'}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatNumber(model.usage)} tokens ({formatNumber(model.requestCount)} requests)
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatCurrency(model.cost)}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatPercentage(calculatePercentage(model.usage, systemStats.totalTokens))} of total
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-muted-foreground py-4">
                No model usage data available
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Top Providers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <PieChart className="h-5 w-5" />
            <span>Top Providers by Usage</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {systemStats.topProviders && systemStats.topProviders.length > 0 ? (
              systemStats.topProviders.map((provider, index) => (
                <div key={provider.name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <p className="font-medium">{provider.name || 'Unknown Provider'}</p>
                        <Badge className={getProviderColor(provider.name)}>
                          {provider.name || 'Unknown'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {formatNumber(provider.usage)} tokens ({formatNumber(provider.requestCount)} requests)
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatCurrency(provider.cost)}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatPercentage(calculatePercentage(provider.usage, systemStats.totalTokens))} of total
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-muted-foreground py-4">
                No provider usage data available
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}