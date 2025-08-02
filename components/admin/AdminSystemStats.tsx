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
  topModels: Array<{
    id: string;
    name: string;
    usage: number;
    cost: number;
  }>;
  topProviders: Array<{
    name: string;
    usage: number;
    cost: number;
  }>;
  dailyUsage: Array<{
    date: string;
    tokens: number;
    cost: number;
  }>;
}

export function AdminSystemStats({ loading = false }: AdminSystemStatsProps) {
  const [timeRange, setTimeRange] = React.useState<"day" | "week" | "month" | "year">("month");
  const [systemStats, setSystemStats] = React.useState<SystemStats | null>(null);

  // Mock data for system stats
  React.useEffect(() => {
    const mockSystemStats: SystemStats = {
      totalUsers: 1245,
      activeUsers: 423,
      totalTokens: 15234567,
      totalCost: 23456.78,
      avgResponseTime: 1.2,
      systemUptime: 99.9,
      requestsToday: 2345,
      requestsThisMonth: 67890,
      topModels: [
        { id: "gpt-4", name: "GPT-4", usage: 5432100, cost: 12345.67 },
        { id: "gpt-3.5-turbo", name: "GPT-3.5 Turbo", usage: 4321000, cost: 5432.10 },
        { id: "claude-3", name: "Claude 3", usage: 3210000, cost: 4567.89 },
        { id: "gemini-pro", name: "Gemini Pro", usage: 2100000, cost: 2345.67 },
        { id: "llama-2", name: "Llama 2", usage: 1234567, cost: 1234.56 },
      ],
      topProviders: [
        { name: "OpenAI", usage: 9753100, cost: 17777.77 },
        { name: "Anthropic", usage: 3210000, cost: 4567.89 },
        { name: "Google", usage: 2100000, cost: 2345.67 },
        { name: "Groq", usage: 1234567, cost: 1234.56 },
      ],
      dailyUsage: Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        tokens: Math.floor(Math.random() * 500000) + 100000,
        cost: Math.random() * 1000 + 100,
      })).reverse(),
    };
    setSystemStats(mockSystemStats);
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

  const getStatusColor = (value: number, type: "uptime" | "response") => {
    if (type === "uptime") {
      return value >= 99.5 ? "text-green-600" : value >= 99 ? "text-yellow-600" : "text-red-600";
    } else {
      return value <= 1 ? "text-green-600" : value <= 2 ? "text-yellow-600" : "text-red-600";
    }
  };

  const getStatusIcon = (value: number, type: "uptime" | "response") => {
    if (type === "uptime") {
      return value >= 99.5 ? (
        <CheckCircle className="h-4 w-4 text-green-600" />
      ) : value >= 99 ? (
        <AlertCircle className="h-4 w-4 text-yellow-600" />
      ) : (
        <AlertCircle className="h-4 w-4 text-red-600" />
      );
    } else {
      return value <= 1 ? (
        <CheckCircle className="h-4 w-4 text-green-600" />
      ) : value <= 2 ? (
        <AlertCircle className="h-4 w-4 text-yellow-600" />
      ) : (
        <AlertCircle className="h-4 w-4 text-red-600" />
      );
    }
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

  if (!systemStats) {
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
          <Button variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
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
                  <TrendingUp className="h-3 w-3 text-green-600" />
                  <span className="text-green-600">+12.5%</span>
                  <span className="text-muted-foreground">from last month</span>
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
                  <TrendingUp className="h-3 w-3 text-green-600" />
                  <span className="text-green-600">+8.3%</span>
                  <span className="text-muted-foreground">from last month</span>
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
                  <TrendingUp className="h-3 w-3 text-green-600" />
                  <span className="text-green-600">+15.2%</span>
                  <span className="text-muted-foreground">from last month</span>
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
                  <TrendingUp className="h-3 w-3 text-green-600" />
                  <span className="text-green-600">+10.7%</span>
                  <span className="text-muted-foreground">from last month</span>
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
                    {systemStats.avgResponseTime}s
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
            {systemStats.topModels.map((model, index) => (
              <div key={model.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-medium">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium">{model.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatNumber(model.usage)} tokens
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">{formatCurrency(model.cost)}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatPercentage((model.usage / systemStats.totalTokens) * 100)} of total
                  </p>
                </div>
              </div>
            ))}
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
            {systemStats.topProviders.map((provider, index) => (
              <div key={provider.name} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-medium">
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
                      {formatNumber(provider.usage)} tokens
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">{formatCurrency(provider.cost)}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatPercentage((provider.usage / systemStats.totalTokens) * 100)} of total
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}