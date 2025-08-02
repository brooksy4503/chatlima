import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { UsageSummaryCardProps } from "./types";

/**
 * UsageSummaryCard component displays a summary metric with optional change indicator
 * 
 * @param title - The title of the metric
 * @param value - The value to display
 * @param change - Optional change value (percentage or absolute)
 * @param changeType - Whether the change is an increase or decrease
 * @param icon - Optional icon to display
 * @param description - Optional description text
 * @param loading - Whether the card is in loading state
 * @param className - Additional CSS classes
 */
export function UsageSummaryCard({
  title,
  value,
  change,
  changeType = "increase",
  icon,
  description,
  loading = false,
  className,
}: UsageSummaryCardProps) {
  const formatValue = (val: string | number) => {
    if (typeof val === "number") {
      // Format large numbers with commas
      return val.toLocaleString();
    }
    return val;
  };

  const getChangeColor = () => {
    if (change === undefined) return "";
    return changeType === "increase" ? "text-green-600" : "text-red-600";
  };

  const getChangeIcon = () => {
    if (change === undefined) return null;
    return changeType === "increase" ? "↑" : "↓";
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon && <div className="h-4 w-4 text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-7 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ) : (
          <div className="space-y-2">
            <div className="text-2xl font-bold">{formatValue(value)}</div>
            {change !== undefined && (
              <div className="flex items-center space-x-2">
                <Badge 
                  variant={changeType === "increase" ? "default" : "destructive"}
                  className={cn("text-xs", getChangeColor())}
                >
                  {getChangeIcon()} {Math.abs(change)}%
                </Badge>
                {description && (
                  <p className="text-xs text-muted-foreground">{description}</p>
                )}
              </div>
            )}
            {change === undefined && description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * TokenUsageSummaryCards component displays a grid of token usage summary cards
 */
export interface TokenUsageSummaryCardsProps {
  data: {
    totalTokens: number;
    totalCost: number;
    requestCount: number;
    averageCostPerRequest: number;
    currency: string;
  };
  previousData?: {
    totalTokens: number;
    totalCost: number;
    requestCount: number;
    averageCostPerRequest: number;
  };
  loading?: boolean;
  className?: string;
}

export function TokenUsageSummaryCards({
  data,
  previousData,
  loading = false,
  className,
}: TokenUsageSummaryCardsProps) {
  const calculateChange = (current: number, previous?: number) => {
    if (previous === undefined || previous === 0) return undefined;
    return Math.round(((current - previous) / previous) * 100);
  };

  const formatCurrency = (value: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
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
    return value.toString();
  };

  return (
    <div className={cn("grid gap-4 md:grid-cols-2 lg:grid-cols-4", className)}>
      <UsageSummaryCard
        title="Total Tokens"
        value={formatNumber(data.totalTokens)}
        change={calculateChange(data.totalTokens, previousData?.totalTokens)}
        changeType={data.totalTokens >= (previousData?.totalTokens || 0) ? "increase" : "decrease"}
        description="vs previous period"
        loading={loading}
      />
      
      <UsageSummaryCard
        title="Total Cost"
        value={formatCurrency(data.totalCost, data.currency)}
        change={calculateChange(data.totalCost, previousData?.totalCost)}
        changeType={data.totalCost >= (previousData?.totalCost || 0) ? "increase" : "decrease"}
        description="vs previous period"
        loading={loading}
      />
      
      <UsageSummaryCard
        title="Requests"
        value={data.requestCount}
        change={calculateChange(data.requestCount, previousData?.requestCount)}
        changeType={data.requestCount >= (previousData?.requestCount || 0) ? "increase" : "decrease"}
        description="vs previous period"
        loading={loading}
      />
      
      <UsageSummaryCard
        title="Avg Cost per Request"
        value={formatCurrency(data.averageCostPerRequest, data.currency)}
        change={calculateChange(data.averageCostPerRequest, previousData?.averageCostPerRequest)}
        changeType={data.averageCostPerRequest >= (previousData?.averageCostPerRequest || 0) ? "increase" : "decrease"}
        description="vs previous period"
        loading={loading}
      />
    </div>
  );
}