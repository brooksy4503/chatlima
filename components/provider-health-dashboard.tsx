"use client";

import React from 'react';
import { useProviderHealth, useModelsCache } from '@/hooks/use-models';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  RefreshCw, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  HelpCircle,
  Clock,
  Zap,
  Database,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Type guard for health status
function isValidHealthStatus(status: string): status is 'healthy' | 'degraded' | 'down' | 'unknown' {
  return ['healthy', 'degraded', 'down', 'unknown'].includes(status);
}

// Health indicator component
function HealthIndicator({ status }: { status: 'healthy' | 'degraded' | 'down' | 'unknown' }) {
  const config = {
    healthy: {
      icon: CheckCircle,
      color: 'text-green-500',
      bgColor: 'bg-green-50 dark:bg-green-950',
      label: 'Healthy',
    },
    degraded: {
      icon: AlertTriangle,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-50 dark:bg-yellow-950',
      label: 'Degraded',
    },
    down: {
      icon: XCircle,
      color: 'text-red-500',
      bgColor: 'bg-red-50 dark:bg-red-950',
      label: 'Down',
    },
    unknown: {
      icon: HelpCircle,
      color: 'text-gray-500',
      bgColor: 'bg-gray-50 dark:bg-gray-950',
      label: 'Unknown',
    },
  };
  
  const { icon: Icon, color, bgColor, label } = config[status];
  
  return (
    <div className={cn("flex items-center gap-2 px-2 py-1 rounded-md", bgColor)}>
      <Icon className={cn("h-4 w-4", color)} />
      <span className={cn("text-sm font-medium", color)}>{label}</span>
    </div>
  );
}

// Provider icon helper
function getProviderIcon(providerName: string) {
  switch (providerName.toLowerCase()) {
    case 'openrouter':
      return <Zap className="h-4 w-4 text-purple-500" />;
    case 'requesty':
      return <Zap className="h-4 w-4 text-cyan-500" />;
    case 'anthropic':
      return <Zap className="h-4 w-4 text-orange-600" />;
    case 'openai':
      return <Zap className="h-4 w-4 text-green-500" />;
    default:
      return <Database className="h-4 w-4 text-gray-500" />;
  }
}

// Time formatter
function formatTime(date: Date | string): string {
  const d = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return d.toLocaleDateString();
}

interface ProviderHealthDashboardProps {
  compact?: boolean;
  showRefreshButton?: boolean;
  className?: string;
  dialogMode?: boolean;
}

export function ProviderHealthDashboard({ 
  compact = false, 
  showRefreshButton = true,
  className,
  dialogMode = false
}: ProviderHealthDashboardProps) {
  const { 
    overall, 
    providers, 
    healthyCount, 
    totalCount, 
    lastUpdated, 
    isLoading, 
    error 
  } = useProviderHealth();
  
  const { clearCache, isClearing } = useModelsCache();
  
  const handleRefresh = async () => {
    try {
      await clearCache(); // Clear cache to force refresh
      // The useProviderHealth hook will automatically refetch
    } catch (error) {
      console.error('Failed to refresh provider data:', error);
    }
  };

  // Ensure overall status is valid
  const safeOverallStatus = isValidHealthStatus(overall) ? overall : 'unknown';

  if (error) {
    return (
      <Card className={cn("w-full", className)}>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm font-medium">Failed to load provider health</span>
          </div>
          {showRefreshButton && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh}
              disabled={isClearing}
              className="mt-2"
            >
              <RefreshCw className={cn("h-3 w-3 mr-2", isClearing && "animate-spin")} />
              Retry
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  if (compact) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <HealthIndicator status={safeOverallStatus} />
        <span className="text-sm text-muted-foreground">
          {healthyCount}/{totalCount} providers
        </span>
        {showRefreshButton && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={isClearing || isLoading}
                  className="h-6 w-6 p-0"
                >
                  <RefreshCw className={cn("h-3 w-3", (isClearing || isLoading) && "animate-spin")} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Refresh provider data</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    );
  }

  // Content component for reuse
  const content = (
    <div className="space-y-4">
      {/* Header and refresh button for dialog mode */}
      {dialogMode && showRefreshButton && (
        <div className="flex items-center justify-end">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={isClearing || isLoading}
                >
                  <RefreshCw className={cn("h-4 w-4 mr-2", (isClearing || isLoading) && "animate-spin")} />
                  <span className="hidden sm:inline">Refresh</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Force refresh all provider data</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )}

      {/* Overall status */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 border rounded-lg gap-2">
        <div className="flex items-center gap-3">
          <HealthIndicator status={safeOverallStatus} />
          <div>
            <div className="font-medium text-sm sm:text-base">Overall Status</div>
            <div className="text-xs sm:text-sm text-muted-foreground">
              {healthyCount} of {totalCount} providers operational
            </div>
          </div>
        </div>
        {lastUpdated && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            {formatTime(lastUpdated)}
          </div>
        )}
      </div>

      {/* Provider grid - improved mobile responsiveness */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {Object.entries(providers).map(([key, provider]) => {
          // Ensure provider status is valid
          const safeProviderStatus = isValidHealthStatus(provider.status) ? provider.status : 'unknown';
          
          return (
            <div key={key} className="border rounded-lg p-3 space-y-2 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  {getProviderIcon(provider.name)}
                  <span className="font-medium text-sm truncate">{provider.name}</span>
                </div>
                <HealthIndicator status={safeProviderStatus} />
              </div>
              
              <div className="space-y-1 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground text-xs">Models:</span>
                  <Badge variant="secondary" className="text-xs h-5">
                    {provider.modelCount}
                  </Badge>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground text-xs">API Key:</span>
                  <div className="flex gap-1">
                    {provider.hasEnvironmentKey && (
                      <Badge variant="outline" className="text-xs h-5">
                        ENV
                      </Badge>
                    )}
                    {provider.supportsUserKeys && (
                      <Badge variant="outline" className="text-xs h-5">
                        User
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground">Last checked:</span>
                  <span className="truncate ml-2">{formatTime(provider.lastChecked)}</span>
                </div>
                
                {provider.error && (
                  <div className="text-xs text-red-600 bg-red-50 dark:bg-red-950 p-2 rounded mt-2">
                    <div className="flex items-start gap-1">
                      <AlertCircle className="h-3 w-3 flex-shrink-0 mt-0.5" />
                      <span className="break-words text-xs leading-tight" title={provider.error}>
                        {provider.error}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty state */}
      {Object.keys(providers).length === 0 && !isLoading && (
        <div className="text-center py-8 text-muted-foreground">
          <Database className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No provider data available</p>
          <p className="text-xs">Check your API keys and network connection</p>
        </div>
      )}

      {/* Loading state */}
      {isLoading && Object.keys(providers).length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <RefreshCw className="h-8 w-8 mx-auto mb-2 animate-spin" />
          <p className="text-sm">Loading provider status...</p>
        </div>
      )}
    </div>
  );

  // Return with or without Card wrapper based on mode
  if (dialogMode) {
    return <div className={cn("w-full", className)}>{content}</div>;
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <CardTitle className="text-lg">Provider Health</CardTitle>
            <CardDescription>
              Status of AI model providers and their availability
            </CardDescription>
          </div>
          {showRefreshButton && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRefresh}
                    disabled={isClearing || isLoading}
                  >
                    <RefreshCw className={cn("h-4 w-4 mr-2", (isClearing || isLoading) && "animate-spin")} />
                    Refresh
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Force refresh all provider data</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        {content}
      </CardContent>
    </Card>
  );
}

// Standalone health status indicator for use in other components
export function ProviderHealthIndicator({ className }: { className?: string }) {
  const { overall, healthyCount, totalCount, isLoading } = useProviderHealth();
  
  if (isLoading) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <RefreshCw className="h-3 w-3 animate-spin text-muted-foreground" />
        <span className="text-xs text-muted-foreground">Checking...</span>
      </div>
    );
  }
  
  // Ensure overall status is valid
  const safeOverallStatus = isValidHealthStatus(overall) ? overall : 'unknown';
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn("flex items-center gap-2 cursor-help", className)}>
            <HealthIndicator status={safeOverallStatus} />
            <span className="text-xs text-muted-foreground">
              {healthyCount}/{totalCount}
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{healthyCount} of {totalCount} providers are healthy</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
} 