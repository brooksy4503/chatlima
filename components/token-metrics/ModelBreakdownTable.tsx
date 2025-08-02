import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ModelBreakdownTableProps, ModelUsageBreakdown } from "./types";

/**
 * ModelBreakdownTable component displays a sortable table of model usage breakdown
 * 
 * @param data - The model usage breakdown data
 * @param loading - Whether the table is in loading state
 * @param sortBy - The column to sort by
 * @param sortOrder - The sort order (asc or desc)
 * @param onSort - Callback for sort changes
 * @param currency - Currency code for formatting
 * @param className - Additional CSS classes
 */
export function ModelBreakdownTable({
  data,
  loading = false,
  sortBy,
  sortOrder = "desc",
  onSort,
  currency = "USD",
  className,
}: ModelBreakdownTableProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatNumber = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toLocaleString();
  };

  const handleSort = (column: keyof ModelUsageBreakdown) => {
    if (onSort) {
      onSort(column);
    }
  };

  const getSortIcon = (column: keyof ModelUsageBreakdown) => {
    if (sortBy !== column) return null;
    return sortOrder === "asc" ? "↑" : "↓";
  };

  const getProviderColor = (provider: string) => {
    const colors: Record<string, string> = {
      openai: "bg-green-100 text-green-800",
      anthropic: "bg-blue-100 text-blue-800",
      google: "bg-red-100 text-red-800",
      groq: "bg-purple-100 text-purple-800",
      xai: "bg-orange-100 text-orange-800",
      openrouter: "bg-indigo-100 text-indigo-800",
      requesty: "bg-pink-100 text-pink-800",
    };
    return colors[provider] || "bg-gray-100 text-gray-800";
  };

  const renderTableHeader = (column: keyof ModelUsageBreakdown, label: string) => (
    <th
      className={cn(
        "px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground transition-colors",
        onSort && "hover:bg-muted/50"
      )}
      onClick={() => onSort && handleSort(column)}
    >
      <div className="flex items-center space-x-1">
        <span>{label}</span>
        {getSortIcon(column)}
      </div>
    </th>
  );

  const renderLoadingRows = () => {
    return Array.from({ length: 5 }).map((_, index) => (
      <tr key={index}>
        <td className="px-4 py-4 whitespace-nowrap">
          <Skeleton className="h-4 w-32" />
        </td>
        <td className="px-4 py-4 whitespace-nowrap">
          <Skeleton className="h-4 w-20" />
        </td>
        <td className="px-4 py-4 whitespace-nowrap">
          <Skeleton className="h-4 w-24" />
        </td>
        <td className="px-4 py-4 whitespace-nowrap">
          <Skeleton className="h-4 w-24" />
        </td>
        <td className="px-4 py-4 whitespace-nowrap">
          <Skeleton className="h-4 w-20" />
        </td>
        <td className="px-4 py-4 whitespace-nowrap">
          <Skeleton className="h-4 w-20" />
        </td>
        <td className="px-4 py-4 whitespace-nowrap">
          <Skeleton className="h-4 w-20" />
        </td>
      </tr>
    ));
  };

  const renderEmptyState = () => (
    <tr>
      <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
        No model usage data available
      </td>
    </tr>
  );

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Model Usage Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted/50">
              <tr>
                {renderTableHeader("modelId", "Model")}
                {renderTableHeader("provider", "Provider")}
                {renderTableHeader("totalTokens", "Total Tokens")}
                {renderTableHeader("inputTokens", "Input Tokens")}
                {renderTableHeader("outputTokens", "Output Tokens")}
                {renderTableHeader("estimatedCost", "Cost")}
                {renderTableHeader("requestCount", "Requests")}
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-background">
              {loading ? (
                renderLoadingRows()
              ) : data.length === 0 ? (
                renderEmptyState()
              ) : (
                data.map((item, index) => (
                  <tr key={index} className="hover:bg-muted/50 transition-colors">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-foreground">
                        {item.modelId}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <Badge
                        variant="secondary"
                        className={getProviderColor(item.provider)}
                      >
                        {item.provider}
                      </Badge>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-foreground">
                        {formatNumber(item.totalTokens)}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-muted-foreground">
                        {formatNumber(item.inputTokens)}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-muted-foreground">
                        {formatNumber(item.outputTokens)}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-foreground">
                        {formatCurrency(item.estimatedCost)}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-foreground">
                        {item.requestCount.toLocaleString()}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * ProviderBreakdownCard component displays provider usage in a card format
 */
export interface ProviderBreakdownCardProps {
  data: Array<{
    provider: string;
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
    estimatedCost: number;
    actualCost: number;
    requestCount: number;
  }>;
  loading?: boolean;
  currency?: string;
  className?: string;
}

export function ProviderBreakdownCard({
  data,
  loading = false,
  currency = "USD",
  className,
}: ProviderBreakdownCardProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatNumber = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toLocaleString();
  };

  const getProviderColor = (provider: string) => {
    const colors: Record<string, string> = {
      openai: "bg-green-500",
      anthropic: "bg-blue-500",
      google: "bg-red-500",
      groq: "bg-purple-500",
      xai: "bg-orange-500",
      openrouter: "bg-indigo-500",
      requesty: "bg-pink-500",
    };
    return colors[provider] || "bg-gray-500";
  };

  const getProviderIcon = (provider: string) => {
    const icons: Record<string, string> = {
      openai: "🤖",
      anthropic: "🧠",
      google: "🔍",
      groq: "⚡",
      xai: "🚀",
      openrouter: "🌐",
      requesty: "📡",
    };
    return icons[provider] || "🔧";
  };

  const totalTokens = data.reduce((sum, item) => sum + item.totalTokens, 0);
  const totalCost = data.reduce((sum, item) => sum + item.estimatedCost, 0);

  if (loading) {
    return (
      <Card className={cn("w-full", className)}>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Provider Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Provider Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Summary stats */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Total Tokens</p>
              <p className="text-2xl font-bold">{formatNumber(totalTokens)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Total Cost</p>
              <p className="text-2xl font-bold">{formatCurrency(totalCost)}</p>
            </div>
          </div>

          {/* Provider cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {data.map((item, index) => {
              const tokenPercentage = totalTokens > 0 ? (item.totalTokens / totalTokens) * 100 : 0;
              const costPercentage = totalCost > 0 ? (item.estimatedCost / totalCost) * 100 : 0;

              return (
                <div key={index} className="space-y-3 rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div
                        className={cn(
                          "flex h-8 w-8 items-center justify-center rounded-full text-white",
                          getProviderColor(item.provider)
                        )}
                      >
                        <span className="text-sm">{getProviderIcon(item.provider)}</span>
                      </div>
                      <div>
                        <h3 className="font-medium capitalize">{item.provider}</h3>
                        <p className="text-xs text-muted-foreground">
                          {item.requestCount} requests
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Tokens</span>
                        <span>{formatNumber(item.totalTokens)}</span>
                      </div>
                      <div className="h-2 rounded-full bg-muted">
                        <div
                          className={cn(
                            "h-2 rounded-full transition-all duration-300",
                            getProviderColor(item.provider)
                          )}
                          style={{ width: `${tokenPercentage}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {tokenPercentage.toFixed(1)}% of total
                      </p>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Cost</span>
                        <span>{formatCurrency(item.estimatedCost)}</span>
                      </div>
                      <div className="h-2 rounded-full bg-muted">
                        <div
                          className={cn(
                            "h-2 rounded-full transition-all duration-300",
                            getProviderColor(item.provider)
                          )}
                          style={{ width: `${costPercentage}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {costPercentage.toFixed(1)}% of total
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="space-y-1">
                      <p className="text-muted-foreground">Input</p>
                      <p className="font-medium">{formatNumber(item.inputTokens)}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-muted-foreground">Output</p>
                      <p className="font-medium">{formatNumber(item.outputTokens)}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}