import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { CostAnalysisChartProps } from "./types";
import type { AggregatedCostData } from "@/lib/services/costCalculation";

/**
 * CostAnalysisChart component displays comprehensive cost analysis visualizations
 * 
 * @param data - The aggregated cost data
 * @param loading - Whether the chart is in loading state
 * @param currency - Currency code for formatting
 * @param className - Additional CSS classes
 * @param showComparison - Whether to show comparison with previous period
 * @param previousPeriodData - Previous period data for comparison
 */
export function CostAnalysisChart({
  data,
  loading = false,
  currency = "USD",
  className,
  showComparison = false,
  previousPeriodData,
}: CostAnalysisChartProps) {
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

  const calculateChange = (current: number, previous?: number) => {
    if (previous === undefined || previous === 0) return null;
    const change = ((current - previous) / previous) * 100;
    return {
      value: Math.abs(change),
      type: change >= 0 ? "increase" : "decrease" as const,
      amount: current - previous,
    };
  };

  const renderCostBreakdown = () => {
    if (loading) {
      return (
        <div className="space-y-4">
          <Skeleton className="h-6 w-32" />
          <div className="grid gap-4 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-full" />
              </div>
            ))}
          </div>
        </div>
      );
    }

    const inputCostChange = calculateChange(data.totalInputCost, previousPeriodData?.totalInputCost);
    const outputCostChange = calculateChange(data.totalOutputCost, previousPeriodData?.totalOutputCost);
    const discountChange = calculateChange(data.totalDiscount, previousPeriodData?.totalDiscount);
    const totalCostChange = calculateChange(data.totalCost, previousPeriodData?.totalCost);

    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2 rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-muted-foreground">Input Cost</h3>
              {inputCostChange && (
                <Badge
                  variant={inputCostChange.type === "increase" ? "destructive" : "default"}
                  className="text-xs"
                >
                  {inputCostChange.type === "increase" ? "↑" : "↓"} {inputCostChange.value.toFixed(1)}%
                </Badge>
              )}
            </div>
            <p className="text-2xl font-bold">{formatCurrency(data.totalInputCost)}</p>
            {inputCostChange && (
              <p className="text-xs text-muted-foreground">
                {formatCurrency(Math.abs(inputCostChange.amount))} {inputCostChange.type === "increase" ? "more" : "less"} than previous
              </p>
            )}
          </div>

          <div className="space-y-2 rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-muted-foreground">Output Cost</h3>
              {outputCostChange && (
                <Badge
                  variant={outputCostChange.type === "increase" ? "destructive" : "default"}
                  className="text-xs"
                >
                  {outputCostChange.type === "increase" ? "↑" : "↓"} {outputCostChange.value.toFixed(1)}%
                </Badge>
              )}
            </div>
            <p className="text-2xl font-bold">{formatCurrency(data.totalOutputCost)}</p>
            {outputCostChange && (
              <p className="text-xs text-muted-foreground">
                {formatCurrency(Math.abs(outputCostChange.amount))} {outputCostChange.type === "increase" ? "more" : "less"} than previous
              </p>
            )}
          </div>

          <div className="space-y-2 rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-muted-foreground">Discounts</h3>
              {discountChange && (
                <Badge
                  variant={discountChange.type === "increase" ? "default" : "destructive"}
                  className="text-xs"
                >
                  {discountChange.type === "increase" ? "↑" : "↓"} {discountChange.value.toFixed(1)}%
                </Badge>
              )}
            </div>
            <p className="text-2xl font-bold text-green-600">-{formatCurrency(data.totalDiscount)}</p>
            {discountChange && (
              <p className="text-xs text-muted-foreground">
                {formatCurrency(Math.abs(discountChange.amount))} {discountChange.type === "increase" ? "more" : "less"} than previous
              </p>
            )}
          </div>

          <div className="space-y-2 rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-muted-foreground">Total Cost</h3>
              {totalCostChange && (
                <Badge
                  variant={totalCostChange.type === "increase" ? "destructive" : "default"}
                  className="text-xs"
                >
                  {totalCostChange.type === "increase" ? "↑" : "↓"} {totalCostChange.value.toFixed(1)}%
                </Badge>
              )}
            </div>
            <p className="text-2xl font-bold">{formatCurrency(data.totalCost)}</p>
            {totalCostChange && (
              <p className="text-xs text-muted-foreground">
                {formatCurrency(Math.abs(totalCostChange.amount))} {totalCostChange.type === "increase" ? "more" : "less"} than previous
              </p>
            )}
          </div>
        </div>

        {/* Cost distribution pie chart representation */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Cost Distribution</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Input Tokens</span>
                <span>{formatCurrency(data.totalInputCost)}</span>
              </div>
              <div className="h-3 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-blue-500 transition-all duration-300"
                  style={{
                    width: `${(data.totalInputCost / data.totalSubtotal) * 100}%`,
                  }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {((data.totalInputCost / data.totalSubtotal) * 100).toFixed(1)}% of subtotal
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Output Tokens</span>
                <span>{formatCurrency(data.totalOutputCost)}</span>
              </div>
              <div className="h-3 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-purple-500 transition-all duration-300"
                  style={{
                    width: `${(data.totalOutputCost / data.totalSubtotal) * 100}%`,
                  }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {((data.totalOutputCost / data.totalSubtotal) * 100).toFixed(1)}% of subtotal
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderProviderBreakdown = () => {
    if (loading) {
      return (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
              </div>
              <Skeleton className="h-3 w-full" />
            </div>
          ))}
        </div>
      );
    }

    const providers = Object.entries(data.breakdownByProvider);
    const maxProviderCost = Math.max(...providers.map(([, cost]) => cost.totalCost));

    return (
      <div className="space-y-4">
        {providers.map(([provider, costData], index) => {
          const percentage = maxProviderCost > 0 ? (costData.totalCost / maxProviderCost) * 100 : 0;
          const providerColor = {
            openai: "bg-green-500",
            anthropic: "bg-blue-500",
            google: "bg-red-500",
            groq: "bg-purple-500",
            xai: "bg-orange-500",
            openrouter: "bg-indigo-500",
            requesty: "bg-pink-500",
          }[provider] || "bg-gray-500";

          return (
            <div key={provider} className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <div
                    className={cn(
                      "h-3 w-3 rounded-full",
                      providerColor
                    )}
                  />
                  <span className="text-sm font-medium capitalize">{provider}</span>
                </div>
                <span className="text-sm font-medium">{formatCurrency(costData.totalCost)}</span>
              </div>
              <div className="h-3 rounded-full bg-muted overflow-hidden">
                <div
                  className={cn(
                    "h-full transition-all duration-300",
                    providerColor
                  )}
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                <div>Input: {formatNumber(costData.inputTokens)}</div>
                <div>Output: {formatNumber(costData.outputTokens)}</div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderModelBreakdown = () => {
    if (loading) {
      return (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-16" />
              </div>
              <Skeleton className="h-3 w-full" />
            </div>
          ))}
        </div>
      );
    }

    const models = Object.entries(data.breakdownByModel);
    const maxModelCost = Math.max(...models.map(([, cost]) => cost.totalCost));

    return (
      <div className="space-y-4">
        {models.map(([modelId, costData], index) => {
          const percentage = maxModelCost > 0 ? (costData.totalCost / maxModelCost) * 100 : 0;
          const colors = [
            "bg-blue-500",
            "bg-green-500",
            "bg-purple-500",
            "bg-orange-500",
            "bg-red-500",
            "bg-indigo-500",
            "bg-pink-500",
            "bg-teal-500",
          ];
          const color = colors[index % colors.length];

          return (
            <div key={modelId} className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <div
                    className={cn(
                      "h-3 w-3 rounded-full",
                      color
                    )}
                  />
                  <span className="text-sm font-medium">{modelId}</span>
                </div>
                <span className="text-sm font-medium">{formatCurrency(costData.totalCost)}</span>
              </div>
              <div className="h-3 rounded-full bg-muted overflow-hidden">
                <div
                  className={cn(
                    "h-full transition-all duration-300",
                    color
                  )}
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                <div>Input: {formatNumber(costData.inputTokens)}</div>
                <div>Output: {formatNumber(costData.outputTokens)}</div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Cost Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="breakdown" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="breakdown">Cost Breakdown</TabsTrigger>
            <TabsTrigger value="providers">By Provider</TabsTrigger>
            <TabsTrigger value="models">By Model</TabsTrigger>
          </TabsList>
          
          <TabsContent value="breakdown" className="mt-4">
            {renderCostBreakdown()}
          </TabsContent>
          
          <TabsContent value="providers" className="mt-4">
            {renderProviderBreakdown()}
          </TabsContent>
          
          <TabsContent value="models" className="mt-4">
            {renderModelBreakdown()}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}