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

export function AdminModelAnalytics({ loading = false }: AdminModelAnalyticsProps) {
  const [timeRange, setTimeRange] = React.useState<"day" | "week" | "month" | "year">("month");
  const [providerFilter, setProviderFilter] = React.useState<string>("all");
  const [sortBy, setSortBy] = React.useState<"tokens" | "cost" | "requests">("tokens");
  const [modelAnalytics, setModelAnalytics] = React.useState<ModelAnalytics[]>([]);
  const [providerAnalytics, setProviderAnalytics] = React.useState<ProviderAnalytics[]>([]);
  const [timeSeriesData, setTimeSeriesData] = React.useState<TimeSeriesData[]>([]);

  // Mock data for model analytics
  React.useEffect(() => {
    const mockModelAnalytics: ModelAnalytics[] = [
      {
        id: "gpt-4",
        name: "GPT-4",
        provider: "openai",
        tokensUsed: 5432100,
        cost: 12345.67,
        requestCount: 8765,
        avgResponseTime: 1.5,
        successRate: 99.5,
        lastUsed: "2024-01-15",
        usagePercentage: 35.7,
        costPercentage: 52.6,
      },
      {
        id: "gpt-3.5-turbo",
        name: "GPT-3.5 Turbo",
        provider: "openai",
        tokensUsed: 4321000,
        cost: 5432.10,
        requestCount: 10987,
        avgResponseTime: 0.8,
        successRate: 99.8,
        lastUsed: "2024-01-15",
        usagePercentage: 28.4,
        costPercentage: 23.2,
      },
      {
        id: "claude-3",
        name: "Claude 3",
        provider: "anthropic",
        tokensUsed: 3210000,
        cost: 4567.89,
        requestCount: 6543,
        avgResponseTime: 1.2,
        successRate: 99.2,
        lastUsed: "2024-01-14",
        usagePercentage: 21.1,
        costPercentage: 19.5,
      },
      {
        id: "gemini-pro",
        name: "Gemini Pro",
        provider: "google",
        tokensUsed: 2100000,
        cost: 2345.67,
        requestCount: 4321,
        avgResponseTime: 0.9,
        successRate: 99.7,
        lastUsed: "2024-01-14",
        usagePercentage: 13.8,
        costPercentage: 10.0,
      },
      {
        id: "llama-2",
        name: "Llama 2",
        provider: "groq",
        tokensUsed: 1234567,
        cost: 1234.56,
        requestCount: 3210,
        avgResponseTime: 0.5,
        successRate: 99.9,
        lastUsed: "2024-01-13",
        usagePercentage: 8.1,
        costPercentage: 5.3,
      },
    ];
    setModelAnalytics(mockModelAnalytics);

    const mockProviderAnalytics: ProviderAnalytics[] = [
      {
        name: "OpenAI",
        tokensUsed: 9753100,
        cost: 17777.77,
        requestCount: 19752,
        avgResponseTime: 1.15,
        successRate: 99.65,
        modelCount: 2,
        usagePercentage: 64.1,
        costPercentage: 75.8,
      },
      {
        name: "Anthropic",
        tokensUsed: 3210000,
        cost: 4567.89,
        requestCount: 6543,
        avgResponseTime: 1.2,
        successRate: 99.2,
        modelCount: 1,
        usagePercentage: 21.1,
        costPercentage: 19.5,
      },
      {
        name: "Google",
        tokensUsed: 2100000,
        cost: 2345.67,
        requestCount: 4321,
        avgResponseTime: 0.9,
        successRate: 99.7,
        modelCount: 1,
        usagePercentage: 13.8,
        costPercentage: 10.0,
      },
      {
        name: "Groq",
        tokensUsed: 1234567,
        cost: 1234.56,
        requestCount: 3210,
        avgResponseTime: 0.5,
        successRate: 99.9,
        modelCount: 1,
        usagePercentage: 8.1,
        costPercentage: 5.3,
      },
    ];
    setProviderAnalytics(mockProviderAnalytics);

    const mockTimeSeriesData: TimeSeriesData[] = Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      tokens: Math.floor(Math.random() * 500000) + 100000,
      cost: Math.random() * 1000 + 100,
      requests: Math.floor(Math.random() * 1000) + 200,
    })).reverse();
    setTimeSeriesData(mockTimeSeriesData);
  }, []);

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

  const filteredModelAnalytics = modelAnalytics.filter(
    (model) => providerFilter === "all" || model.provider === providerFilter
  );

  const sortedModelAnalytics = [...filteredModelAnalytics].sort((a, b) => {
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

  const exportData = () => {
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
    link.setAttribute("download", "model_analytics.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>Model & Provider Analytics</span>
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
              
              <Button variant="outline" onClick={exportData}>
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
              
              <Button variant="outline">
                <RefreshCw className="mr-2 h-4 w-4" />
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
            {providerAnalytics.map((provider, index) => (
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
                    No models found
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
                <p className="text-sm font-medium text-muted-foreground">Total Models</p>
                <p className="text-2xl font-bold">{modelAnalytics.length}</p>
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
                <p className="text-2xl font-bold">
                  {formatNumber(modelAnalytics.reduce((sum, model) => sum + model.tokensUsed, 0))}
                </p>
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
                <p className="text-2xl font-bold">
                  {formatCurrency(modelAnalytics.reduce((sum, model) => sum + model.cost, 0))}
                </p>
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
                <p className="text-2xl font-bold">
                  {formatNumber(modelAnalytics.reduce((sum, model) => sum + model.requestCount, 0))}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}