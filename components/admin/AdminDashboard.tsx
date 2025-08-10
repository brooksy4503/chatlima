"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { 
  RefreshCw, 
  Download, 
  AlertCircle, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  DollarSign,
  BarChart3,
  PieChart,
  Table,
  Settings,
  Users,
  Database,
  Shield,
  Activity,
  Trash2
} from "lucide-react";
import { AdminSystemStats } from "./AdminSystemStats";
import { AdminUserBreakdown } from "./AdminUserBreakdown";
import { AdminModelAnalytics } from "./AdminModelAnalytics";
import { AdminPricingManagement } from "./AdminPricingManagement";
import { AdminUsageLimits } from "./AdminUsageLimits";
import { LoggingHealthDashboard } from "./LoggingHealthDashboard";
import { AdminUserCleanup } from "./AdminUserCleanup";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function AdminDashboard() {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [activeTab, setActiveTab] = React.useState("overview");
  const queryClient = useQueryClient();

  // Pricing sync mutation
  const syncPricingMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/admin/sync-pricing', {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error('Failed to sync pricing data');
      }
      return response.json();
    },
    onSuccess: (data) => {
      toast.success('Pricing data synchronized successfully', {
        description: `Processed ${data.data.modelsProcessed} models, added ${data.data.newPricingEntries} new entries, updated ${data.data.updatedPricingEntries} entries.`
      });
    },
    onError: (error) => {
      toast.error('Failed to sync pricing data', {
        description: error.message
      });
    }
  });

  const handleRefresh = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Invalidate all admin-related queries to force refetch
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin-system-stats'] }),
        queryClient.invalidateQueries({ queryKey: ['admin-users'] }),
        queryClient.invalidateQueries({ queryKey: ['admin-model-analytics'] }),
        queryClient.invalidateQueries({ queryKey: ['pricing'] }),
        queryClient.invalidateQueries({ queryKey: ['logging-health'] }),
        queryClient.invalidateQueries({ queryKey: ['admin-cleanup-stats'] }),
        queryClient.invalidateQueries({ queryKey: ['admin-cleanup-preview'] }),
      ]);
      
      toast.success('Dashboard data refreshed successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to refresh data';
      setError(errorMessage);
      toast.error('Failed to refresh dashboard data', {
        description: errorMessage
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    // Placeholder for export functionality
    console.log("Export functionality not implemented yet");
  };

  const handleSyncPricing = () => {
    syncPricingMutation.mutate();
  };

  return (
    <div className="w-full space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div className="flex items-center space-x-3">
          <Shield className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
            <p className="text-muted-foreground">
              System-wide token usage and cost analytics
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            onClick={handleSyncPricing}
            disabled={syncPricingMutation.isPending}
          >
            <RefreshCw className={cn("mr-2 h-4 w-4", syncPricingMutation.isPending && "animate-spin")} />
            Sync Pricing
          </Button>
          <Button variant="outline" onClick={handleRefresh} disabled={loading}>
            <RefreshCw className={cn("mr-2 h-4 w-4", loading && "animate-spin")} />
            Refresh
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="overview" className="flex items-center space-x-2">
            <BarChart3 className="h-4 w-4" />
            <span>Overview</span>
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>Users</span>
          </TabsTrigger>
          <TabsTrigger value="models" className="flex items-center space-x-2">
            <Database className="h-4 w-4" />
            <span>Models</span>
          </TabsTrigger>
          <TabsTrigger value="pricing" className="flex items-center space-x-2">
            <DollarSign className="h-4 w-4" />
            <span>Pricing</span>
          </TabsTrigger>
          <TabsTrigger value="limits" className="flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span>Limits</span>
          </TabsTrigger>
          <TabsTrigger value="logging" className="flex items-center space-x-2">
            <Activity className="h-4 w-4" />
            <span>Logging</span>
          </TabsTrigger>
          <TabsTrigger value="cleanup" className="flex items-center space-x-2">
            <Trash2 className="h-4 w-4" />
            <span>Cleanup</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6 space-y-6">
          <AdminSystemStats loading={loading} />
        </TabsContent>

        <TabsContent value="users" className="mt-6 space-y-6">
          <AdminUserBreakdown loading={loading} />
        </TabsContent>

        <TabsContent value="models" className="mt-6 space-y-6">
          <AdminModelAnalytics loading={loading} />
        </TabsContent>

        <TabsContent value="pricing" className="mt-6 space-y-6">
          <AdminPricingManagement loading={loading} />
        </TabsContent>

        <TabsContent value="limits" className="mt-6 space-y-6">
          <AdminUsageLimits loading={loading} />
        </TabsContent>

        <TabsContent value="logging" className="mt-6 space-y-6">
          <LoggingHealthDashboard />
        </TabsContent>

        <TabsContent value="cleanup" className="mt-6 space-y-6">
          <AdminUserCleanup loading={loading} />
        </TabsContent>
      </Tabs>
    </div>
  );
}