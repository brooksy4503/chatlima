"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Coins, Zap, DollarSign } from "lucide-react";

interface MessageTokenMetricsProps {
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
  estimatedCost?: number;
  currency?: string;
  isLoading?: boolean;
  className?: string;
  compact?: boolean;
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
}: MessageTokenMetricsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: value < 0.01 ? 4 : 2,
      maximumFractionDigits: value < 0.01 ? 4 : 2,
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
          <div className="flex items-center gap-1">
            <DollarSign className="h-3 w-3" />
            <span>{formatCurrency(estimatedCost)}</span>
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
              {formatCurrency(estimatedCost)}
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
      </CardContent>
    </Card>
  );
}

/**
 * CompactMessageTokenMetrics component displays minimal token usage information
 */
interface CompactMessageTokenMetricsProps extends Omit<MessageTokenMetricsProps, 'compact'> {
  showCost?: boolean;
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
}: CompactMessageTokenMetricsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: value < 0.01 ? 4 : 2,
      maximumFractionDigits: value < 0.01 ? 4 : 2,
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
      {showCost && estimatedCost >= 0.0001 && (
        <div className="flex items-center gap-1">
          <DollarSign className="h-3 w-3" />
          <span>{formatCurrency(estimatedCost)}</span>
        </div>
      )}
    </div>
  );
}

/**
 * StreamingTokenMetrics component displays real-time token usage during streaming
 */
interface StreamingTokenMetricsProps {
  inputTokens?: number;
  outputTokens?: number;
  estimatedCost?: number;
  currency?: string;
  className?: string;
  isStreaming?: boolean;
}

export function StreamingTokenMetrics({
  inputTokens = 0,
  outputTokens = 0,
  estimatedCost = 0,
  currency = "USD",
  className,
  isStreaming = false,
}: StreamingTokenMetricsProps) {
  // Only pulse if we're actively streaming (not just if tokens exist)
  const isActivelyStreaming = isStreaming;
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: value < 0.01 ? 4 : 2,
      maximumFractionDigits: value < 0.01 ? 4 : 2,
    }).format(value);
  };

  return (
    <div className={cn("flex items-center gap-2 text-xs text-muted-foreground", isActivelyStreaming && "animate-pulse", className)}>
      <div className="flex items-center gap-1">
        <Coins className="h-3 w-3" />
        <span>{inputTokens} → {outputTokens}</span>
      </div>
      {estimatedCost >= 0.0001 && (
        <div className="flex items-center gap-1">
          <DollarSign className="h-3 w-3" />
          <span>{formatCurrency(estimatedCost)}</span>
        </div>
      )}
    </div>
  );
}