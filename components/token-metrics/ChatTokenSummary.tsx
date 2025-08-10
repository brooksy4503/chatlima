"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { 
  Coins, 
  TrendingUp, 
  TrendingDown, 
  RefreshCw,
  BarChart3,
  Zap
} from "lucide-react";

interface ChatTokenSummaryProps {
  totalInputTokens?: number;
  totalOutputTokens?: number;
  totalTokens?: number;
  totalEstimatedCost?: number;
  totalActualCost?: number;
  messageCount?: number;
  currency?: string;
  isLoading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
  className?: string;
  compact?: boolean;
}

/**
 * ChatTokenSummary component displays aggregated token usage and cost information for a chat session
 * 
 * @param totalInputTokens - Total input tokens used in the chat
 * @param totalOutputTokens - Total output tokens used in the chat
 * @param totalTokens - Total tokens used in the chat
 * @param totalEstimatedCost - Total estimated cost for the chat
 * @param totalActualCost - Total actual cost for the chat
 * @param messageCount - Number of messages in the chat (or AI requests for user-wide stats)
 * @param currency - Currency code (default: USD)
 * @param isLoading - Whether the summary is loading
 * @param error - Error message if loading failed
 * @param onRefresh - Callback for refreshing the data
 * @param className - Additional CSS classes
 * @param compact - Whether to show compact version
 */
export function ChatTokenSummary({
  totalInputTokens = 0,
  totalOutputTokens = 0,
  totalTokens = 0,
  totalEstimatedCost = 0,
  totalActualCost = 0,
  messageCount = 0,
  currency = "USD",
  isLoading = false,
  error = null,
  onRefresh,
  className,
  compact = false,
}: ChatTokenSummaryProps) {
  const formatCost = (totalCost: number) => {
    if (totalCost === 0) return "$0.00";
    if (totalCost >= 0.01) {
      return `$${totalCost.toFixed(2)}`;
    }
    // For very small amounts, show as "< $0.01"
    return "< $0.01";
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

  const calculateAverageTokensPerMessage = () => {
    if (messageCount === 0) return 0;
    return Math.round(totalTokens / messageCount);
  };

  const calculateAverageCostPerMessage = () => {
    if (messageCount === 0) return 0;
    return totalEstimatedCost / messageCount;
  };

  const getCostEfficiency = () => {
    if (totalEstimatedCost === 0) return 0;
    return totalTokens / totalEstimatedCost;
  };

  if (compact) {
    return (
      <div className={cn("flex items-center gap-3 text-xs", className)}>
        {isLoading ? (
          <div className="flex items-center gap-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-12" />
          </div>
        ) : error ? (
          <div className="text-red-500 text-xs">Error loading metrics</div>
        ) : (
          <>
            <div className="flex items-center gap-1">
              <Coins className="h-3 w-3" />
              <span>{formatNumber(totalTokens)}</span>
            </div>
            {totalEstimatedCost > 0 && (
              <span>{formatCost(totalEstimatedCost)}</span>
            )}
            <div className="flex items-center gap-1">
              <BarChart3 className="h-3 w-3" />
              <span>{messageCount} msgs</span>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Zap className="h-4 w-4" />
          Chat Token Usage
        </CardTitle>
        <div className="flex items-center gap-2">
          {onRefresh && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRefresh}
              disabled={isLoading}
              className="h-6 w-6 p-0"
            >
              <RefreshCw className={cn("h-3 w-3", isLoading && "animate-spin")} />
            </Button>
          )}
          {totalEstimatedCost > 0 && (
            <Badge variant="secondary" className="text-xs">
              {formatCost(totalEstimatedCost)}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading ? (
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ) : error ? (
          <div className="text-center py-2">
            <div className="text-red-500 text-sm mb-1">Failed to load token metrics</div>
            {onRefresh && (
              <Button variant="outline" size="sm" onClick={onRefresh}>
                Try Again
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {/* Token Breakdown */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Input Tokens:</span>
                <span className="font-medium">{formatNumber(totalInputTokens)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Output Tokens:</span>
                <span className="font-medium">{formatNumber(totalOutputTokens)}</span>
              </div>
              <div className="flex justify-between col-span-2">
                <span className="text-muted-foreground">Total Tokens:</span>
                <span className="font-medium">{formatNumber(totalTokens)}</span>
              </div>
            </div>

            {/* Cost Information */}
            {totalEstimatedCost > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Estimated Cost:</span>
                  <span className="font-medium">{formatCost(totalEstimatedCost)}</span>
                </div>
                {totalActualCost > 0 && totalActualCost !== totalEstimatedCost && (
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Actual Cost:</span>
                    <span className="font-medium">{formatCost(totalActualCost)}</span>
                  </div>
                )}
              </div>
            )}

            {/* Statistics */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Messages:</span>
                <span className="font-medium">{messageCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Avg Tokens/Msg:</span>
                <span className="font-medium">{formatNumber(calculateAverageTokensPerMessage())}</span>
              </div>
              {totalEstimatedCost > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Avg Cost/Msg:</span>
                  <span className="font-medium">{formatCost(calculateAverageCostPerMessage())}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tokens/$:</span>
                <span className="font-medium">{formatNumber(getCostEfficiency())}</span>
              </div>
            </div>

            {/* Efficiency Indicator */}
            <div className="flex items-center justify-between pt-2 border-t">
              <span className="text-xs text-muted-foreground">Efficiency</span>
              <div className="flex items-center gap-1">
                {getCostEfficiency() > 100000 ? (
                  <TrendingUp className="h-3 w-3 text-green-500" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-yellow-500" />
                )}
                <span className={cn(
                  "text-xs font-medium",
                  getCostEfficiency() > 100000 ? "text-green-600" : "text-yellow-600"
                )}>
                  {getCostEfficiency() > 100000 ? "High" : "Standard"}
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * MiniChatTokenSummary component displays a very compact version for inline use.
 * When used in the sidebar, messageCount represents the number of AI requests.
 */
interface MiniChatTokenSummaryProps extends Omit<ChatTokenSummaryProps, 'compact'> {
  showCost?: boolean;
}

export function MiniChatTokenSummary({
  totalInputTokens = 0,
  totalOutputTokens = 0,
  totalTokens = 0,
  totalEstimatedCost = 0,
  messageCount = 0,
  currency = "USD",
  isLoading = false,
  error = null,
  className,
  showCost = true,
}: MiniChatTokenSummaryProps) {
  const formatCost = (totalCost: number) => {
    if (totalCost === 0) return "$0.00";
    if (totalCost >= 0.01) {
      return `$${totalCost.toFixed(2)}`;
    }
    // For very small amounts, show as "< $0.01"
    return "< $0.01";
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

  if (isLoading) {
    return (
      <div className={cn("flex items-center gap-2 text-xs text-muted-foreground", className)}>
        <Skeleton className="h-3 w-12" />
        <Skeleton className="h-3 w-8" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn("text-xs text-red-500", className)}>
        Metrics unavailable
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-3 text-xs text-muted-foreground", className)}>
      <div className="flex items-center gap-1">
        <Coins className="h-3 w-3" />
        <span>{formatNumber(totalTokens)}</span>
      </div>
              {showCost && totalEstimatedCost > 0 && (
        <span>{formatCost(totalEstimatedCost)}</span>
      )}
      <div className="flex items-center gap-1" title="AI Requests">
        <BarChart3 className="h-3 w-3" />
        <span>{messageCount}</span>
      </div>
    </div>
  );
}