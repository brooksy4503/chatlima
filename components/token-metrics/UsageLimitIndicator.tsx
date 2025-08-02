import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { UsageLimitIndicatorProps } from "./types";
import type { UsageLimitWarning } from "@/lib/services/costCalculation";
import { AlertTriangle, TrendingUp, TrendingDown, Info } from "lucide-react";

/**
 * UsageLimitIndicator component displays usage limits and warnings
 * 
 * @param data - The usage limit warning data
 * @param loading - Whether the indicator is in loading state
 * @param className - Additional CSS classes
 * @param showDetails - Whether to show detailed information
 * @param onLimitChange - Callback for limit changes
 */
export function UsageLimitIndicator({
  data,
  loading = false,
  className,
  showDetails = true,
  onLimitChange,
}: UsageLimitIndicatorProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: data.currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const getProgressColor = () => {
    if (data.isOverLimit) return "bg-red-500";
    if (data.isApproachingLimit) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getAlertVariant = () => {
    if (data.isOverLimit) return "destructive";
    if (data.isApproachingLimit) return "default";
    return "default";
  };

  const getAlertIcon = () => {
    if (data.isOverLimit) return <AlertTriangle className="h-4 w-4" />;
    if (data.isApproachingLimit) return <TrendingUp className="h-4 w-4" />;
    return <Info className="h-4 w-4" />;
  };

  const renderProgressBar = () => {
    if (loading) {
      return <Skeleton className="h-3 w-full" />;
    }

    const progressWidth = Math.min(data.percentageUsed, 100);

    return (
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Usage</span>
          <span>{data.percentageUsed.toFixed(1)}%</span>
        </div>
        <div className="h-3 rounded-full bg-muted overflow-hidden">
          <div
            className={cn(
              "h-full transition-all duration-300",
              getProgressColor()
            )}
            style={{ width: `${progressWidth}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{formatCurrency(data.currentUsage)}</span>
          <span>{formatCurrency(data.limit)}</span>
        </div>
      </div>
    );
  };

  const renderProjectedUsage = () => {
    if (loading) {
      return (
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>
      );
    }

    if (data.projectedOverage <= 0) {
      return (
        <div className="flex items-center space-x-2 text-sm">
          <TrendingDown className="h-4 w-4 text-green-500" />
          <span className="text-green-600">
            Projected to stay within limit
          </span>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        <div className="flex items-center space-x-2 text-sm">
          <TrendingUp className="h-4 w-4 text-red-500" />
          <span className="text-red-600">
            Projected overage: {formatCurrency(data.projectedOverage)}
          </span>
        </div>
        <div className="text-xs text-muted-foreground">
          Based on current usage patterns
        </div>
      </div>
    );
  };

  const renderRecommendations = () => {
    if (loading || !showDetails || data.recommendations.length === 0) {
      return null;
    }

    return (
      <div className="space-y-2">
        <h4 className="text-sm font-medium">Recommendations</h4>
        <ul className="space-y-1">
          {data.recommendations.map((recommendation, index) => (
            <li key={index} className="text-xs text-muted-foreground flex items-start space-x-2">
              <span className="text-blue-500 mt-0.5">•</span>
              <span>{recommendation}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  const renderLimitControls = () => {
    if (!onLimitChange || loading) {
      return null;
    }

    const limitOptions = [
      { label: "$50", value: 50 },
      { label: "$100", value: 100 },
      { label: "$250", value: 250 },
      { label: "$500", value: 500 },
      { label: "$1000", value: 1000 },
    ];

    return (
      <div className="space-y-2">
        <h4 className="text-sm font-medium">Adjust Limit</h4>
        <div className="flex flex-wrap gap-2">
          {limitOptions.map((option) => (
            <Button
              key={option.value}
              variant={data.limit === option.value ? "default" : "outline"}
              size="sm"
              onClick={() => onLimitChange(option.value)}
              className="h-8 px-3"
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center space-x-2">
          <span>Usage Limits</span>
          {data.isOverLimit && (
            <Badge variant="destructive" className="text-xs">
              Over Limit
            </Badge>
          )}
          {data.isApproachingLimit && !data.isOverLimit && (
            <Badge variant="outline" className="text-xs">
              Approaching Limit
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Alert */}
        <Alert variant={getAlertVariant()}>
          {getAlertIcon()}
          <AlertDescription>
            {data.isOverLimit
              ? `You have exceeded your monthly limit of ${formatCurrency(data.limit)}. Please upgrade your plan or reduce usage.`
              : data.isApproachingLimit
              ? `You are approaching your monthly limit of ${formatCurrency(data.limit)}. Monitor your usage closely.`
              : `Your usage is well within your monthly limit of ${formatCurrency(data.limit)}.`}
          </AlertDescription>
        </Alert>

        {/* Progress bar */}
        {renderProgressBar()}

        {/* Projected usage */}
        {showDetails && renderProjectedUsage()}

        {/* Recommendations */}
        {renderRecommendations()}

        {/* Limit controls */}
        {renderLimitControls()}
      </CardContent>
    </Card>
  );
}

/**
 * UsageLimitCard component displays a compact version of the usage limit indicator
 */
export interface UsageLimitCardProps {
  data: UsageLimitWarning;
  loading?: boolean;
  className?: string;
  onClick?: () => void;
}

export function UsageLimitCard({
  data,
  loading = false,
  className,
  onClick,
}: UsageLimitCardProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: data.currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const getProgressColor = () => {
    if (data.isOverLimit) return "bg-red-500";
    if (data.isApproachingLimit) return "bg-yellow-500";
    return "bg-green-500";
  };

  if (loading) {
    return (
      <Card className={cn("w-full cursor-pointer hover:shadow-md transition-shadow", className)}>
        <CardContent className="p-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      className={cn("w-full cursor-pointer hover:shadow-md transition-shadow", className)}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium">Monthly Usage</h3>
            <div className="flex items-center space-x-2">
              {data.isOverLimit && (
                <Badge variant="destructive" className="text-xs">
                  Over Limit
                </Badge>
              )}
              {data.isApproachingLimit && !data.isOverLimit && (
                <Badge variant="outline" className="text-xs">
                  Warning
                </Badge>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{formatCurrency(data.currentUsage)}</span>
              <span className="text-muted-foreground">{formatCurrency(data.limit)}</span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div
                className={cn(
                  "h-full transition-all duration-300",
                  getProgressColor()
                )}
                style={{ width: `${Math.min(data.percentageUsed, 100)}%` }}
              />
            </div>
          </div>

          {data.projectedOverage > 0 && (
            <div className="text-xs text-red-600">
              Projected overage: {formatCurrency(data.projectedOverage)}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * UsageLimitSummary component displays a very compact summary of usage limits
 */
export interface UsageLimitSummaryProps {
  data: UsageLimitWarning;
  loading?: boolean;
  className?: string;
}

export function UsageLimitSummary({
  data,
  loading = false,
  className,
}: UsageLimitSummaryProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: data.currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (loading) {
    return (
      <div className={cn("space-y-1", className)}>
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-3 w-16" />
      </div>
    );
  }

  return (
    <div className={cn("space-y-1", className)}>
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Usage</span>
        <span className={cn(
          "font-medium",
          data.isOverLimit && "text-red-600",
          data.isApproachingLimit && !data.isOverLimit && "text-yellow-600"
        )}>
          {formatCurrency(data.currentUsage)} / {formatCurrency(data.limit)}
        </span>
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{data.percentageUsed.toFixed(0)}% used</span>
        {data.projectedOverage > 0 && (
          <span className="text-red-600">
            +{formatCurrency(data.projectedOverage)} projected
          </span>
        )}
      </div>
    </div>
  );
}