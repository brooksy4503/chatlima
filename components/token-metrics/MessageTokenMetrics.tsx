"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Coins, Zap, Clock, TrendingUp } from "lucide-react";

interface MessageTokenMetricsProps {
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
  estimatedCost?: number;
  currency?: string;
  isLoading?: boolean;
  className?: string;
  compact?: boolean;
  // NEW: Enhanced timing metrics for Phase 2
  timeToFirstToken?: number;  // TTFT in milliseconds
  tokensPerSecond?: number;   // TPS calculation
  totalDuration?: number;     // Total response time in milliseconds
  isStreaming?: boolean;
}

/**
 * MessageTokenMetrics component displays token usage and cost information for individual messages
 * 
 * @param inputTokens - Number of input tokens used
 * @param outputTokens - Number of output tokens used
 * @param totalTokens - Total tokens used (input + output)
 * @param estimatedCost - Estimated cost for the message
 * @param currency - Currency code (default: USD)
 * @param isLoading - Whether the metrics are loading
 * @param className - Additional CSS classes
 * @param compact - Whether to show compact version
 * @param timeToFirstToken - Time to first token in milliseconds (NEW)
 * @param tokensPerSecond - Tokens per second generation speed (NEW)
 * @param totalDuration - Total response duration in milliseconds (NEW)
 * @param isStreaming - Whether the message is currently streaming (NEW)
 */
export function MessageTokenMetrics({
  inputTokens = 0,
  outputTokens = 0,
  totalTokens = 0,
  estimatedCost = 0,
  currency = "USD",
  isLoading = false,
  className,
  compact = false,
  timeToFirstToken,
  tokensPerSecond,
  totalDuration,
  isStreaming = false,
}: MessageTokenMetricsProps) {
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

  const formatTime = (ms: number) => {
    if (ms < 1000) {
      return `${ms}ms`;
    }
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const formatTokensPerSecond = (tps: number) => {
    if (tps >= 100) {
      return `${tps.toFixed(0)}/s`;
    }
    return `${tps.toFixed(1)}/s`;
  };

  const getTimingColor = (ttft: number) => {
    if (ttft < 1000) return "text-green-600 dark:text-green-400";
    if (ttft < 3000) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  if (isLoading) {
    return (
      <div className={cn("flex items-center gap-2 text-xs text-muted-foreground", className)}>
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-12" />
        <Skeleton className="h-3 w-8" />
      </div>
    );
  }

  if (compact) {
    return (
      <div className={cn("flex items-center gap-2 text-xs text-muted-foreground", className)}>
        <div className="flex items-center gap-1">
          <Coins className="h-3 w-3" />
          <span>{formatNumber(totalTokens)}</span>
        </div>
        {estimatedCost > 0 && (
          <span>{formatCost(estimatedCost)}</span>
        )}
        {/* NEW: Show timing metrics in compact mode if available */}
        {timeToFirstToken && (
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span className={getTimingColor(timeToFirstToken)}>
              {formatTime(timeToFirstToken)}
            </span>
          </div>
        )}
        {tokensPerSecond && (
          <div className="flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            <span>{formatTokensPerSecond(tokensPerSecond)}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardContent className="p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Coins className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Token Usage</span>
          </div>
          {estimatedCost > 0 && (
            <Badge variant="secondary" className="text-xs">
              {formatCost(estimatedCost)}
            </Badge>
          )}
        </div>
        
        <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Input:</span>
            <span className="font-medium">{formatNumber(inputTokens)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Output:</span>
            <span className="font-medium">{formatNumber(outputTokens)}</span>
          </div>
          <div className="flex items-center justify-between col-span-2">
            <span className="text-muted-foreground">Total:</span>
            <span className="font-medium">{formatNumber(totalTokens)}</span>
          </div>
        </div>

        {/* NEW: Enhanced timing metrics section */}
        {(timeToFirstToken || tokensPerSecond || totalDuration) && (
          <div className="mt-3 pt-2 border-t border-border">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">Performance</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {timeToFirstToken && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">TTFT:</span>
                  <span className={cn("font-medium", getTimingColor(timeToFirstToken))}>
                    {formatTime(timeToFirstToken)}
                  </span>
                </div>
              )}
              {tokensPerSecond && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Speed:</span>
                  <span className="font-medium">{formatTokensPerSecond(tokensPerSecond)}</span>
                </div>
              )}
              {totalDuration && (
                <div className="flex items-center justify-between col-span-2">
                  <span className="text-muted-foreground">Total:</span>
                  <span className="font-medium">{formatTime(totalDuration)}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * CompactMessageTokenMetrics component displays minimal token usage information
 */
interface CompactMessageTokenMetricsProps extends Omit<MessageTokenMetricsProps, 'compact'> {
  showCost?: boolean;
  showTiming?: boolean; // NEW: Control timing display
}

export function CompactMessageTokenMetrics({
  inputTokens = 0,
  outputTokens = 0,
  totalTokens = 0,
  estimatedCost = 0,
  currency = "USD",
  isLoading = false,
  className,
  showCost = true,
  showTiming = true, // NEW: Default to showing timing
  timeToFirstToken,
  tokensPerSecond,
  totalDuration,
  isStreaming = false,
}: CompactMessageTokenMetricsProps) {
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

  const formatTime = (ms: number) => {
    if (ms < 1000) {
      return `${ms}ms`;
    }
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const formatTokensPerSecond = (tps: number) => {
    if (tps >= 100) {
      return `${tps.toFixed(0)}/s`;
    }
    return `${tps.toFixed(1)}/s`;
  };

  const getTimingColor = (ttft: number) => {
    if (ttft < 1000) return "text-green-600 dark:text-green-400";
    if (ttft < 3000) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  if (isLoading) {
    return (
      <div className={cn("flex items-center gap-1 text-xs text-muted-foreground", className)}>
        <Skeleton className="h-3 w-12" />
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-2 text-xs text-muted-foreground", className)}>
      <div className="flex items-center gap-1">
        <Zap className="h-3 w-3" />
        <span>{formatNumber(totalTokens)}</span>
      </div>
      {showCost && estimatedCost > 0 && (
        <span>{formatCost(estimatedCost)}</span>
      )}
      {/* NEW: Show timing metrics if enabled and available */}
      {showTiming && timeToFirstToken && (
        <div className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          <span className={getTimingColor(timeToFirstToken)}>
            {formatTime(timeToFirstToken)}
          </span>
        </div>
      )}
      {showTiming && tokensPerSecond && (
        <div className="flex items-center gap-1">
          <TrendingUp className="h-3 w-3" />
          <span>{formatTokensPerSecond(tokensPerSecond)}</span>
        </div>
      )}
    </div>
  );
}

/**
 * StreamingTokenMetrics component displays real-time token usage during streaming
 * ENHANCED: Now includes timing metrics for Phase 2
 */
interface StreamingTokenMetricsProps {
  inputTokens?: number;
  outputTokens?: number;
  estimatedCost?: number;
  currency?: string;
  className?: string;
  isStreaming?: boolean;
  // NEW: Enhanced timing metrics
  timeToFirstToken?: number;
  tokensPerSecond?: number;
  totalDuration?: number;
}

export function StreamingTokenMetrics({
  inputTokens = 0,
  outputTokens = 0,
  estimatedCost = 0,
  currency = "USD",
  className,
  isStreaming = false,
  timeToFirstToken,
  tokensPerSecond,
  totalDuration,
}: StreamingTokenMetricsProps) {
  // Only pulse if we're actively streaming (not just if tokens exist)
  const isActivelyStreaming = isStreaming;
  const totalTokens = inputTokens + outputTokens;
  const formatCost = (totalCost: number) => {
    if (totalCost === 0) return "$0.00";
    if (totalCost >= 0.01) {
      return `$${totalCost.toFixed(2)}`;
    }
    // For very small amounts, show as "< $0.01"
    return "< $0.01";
  };

  const formatTime = (ms: number) => {
    if (ms < 1000) {
      return `${ms}ms`;
    }
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const formatTokensPerSecond = (tps: number) => {
    if (tps >= 100) {
      return `${tps.toFixed(0)}/s`;
    }
    return `${tps.toFixed(1)}/s`;
  };

  const getTimingColor = (ttft: number) => {
    if (ttft < 1000) return "text-green-600 dark:text-green-400";
    if (ttft < 3000) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  return (
    <div className={cn("flex items-center gap-2 text-xs text-muted-foreground", isActivelyStreaming && "animate-pulse", className)}>
      <div className="flex items-center gap-1">
        <Coins className="h-3 w-3" />
        <span>{inputTokens} → {outputTokens}</span>
      </div>
      {estimatedCost > 0 && (
        <span>{formatCost(estimatedCost)}</span>
      )}
      {/* NEW: Show real-time timing metrics during streaming */}
      {timeToFirstToken && (
        <div className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          <span className={getTimingColor(timeToFirstToken)}>
            {formatTime(timeToFirstToken)}
          </span>
        </div>
      )}
      {tokensPerSecond && (
        <div className="flex items-center gap-1">
          <TrendingUp className="h-3 w-3" />
          <span>{formatTokensPerSecond(tokensPerSecond)}</span>
        </div>
      )}
    </div>
  );
}