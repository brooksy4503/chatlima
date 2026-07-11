"use client";

import * as React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { RefreshCw, AlertCircle, BarChart3, Users, Wrench, Shield } from "lucide-react";
import { AdminSystemStats } from "./AdminSystemStats";
import { AdminUserBreakdown } from "./AdminUserBreakdown";
import { AdminModelAnalytics } from "./AdminModelAnalytics";
import { AdminPricingManagement } from "./AdminPricingManagement";
import { AdminUserCleanup } from "./AdminUserCleanup";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function AdminDashboard() {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [activeTab, setActiveTab] = React.useState("overview");
  const queryClient = useQueryClient();

  const handleRefresh = async () => {
    setLoading(true);
    setError(null);

    try {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin-system-stats'] }),
        queryClient.invalidateQueries({ queryKey: ['admin-users'] }),
        queryClient.invalidateQueries({ queryKey: ['admin-model-analytics'] }),
        queryClient.invalidateQueries({ queryKey: ['admin-pricing'] }),
        queryClient.invalidateQueries({ queryKey: ['admin-cleanup-stats'] }),
        queryClient.invalidateQueries({ queryKey: ['admin-cleanup-preview'] }),
        queryClient.invalidateQueries({ queryKey: ['admin-cleanup-logs'] }),
      ]);

      toast.success('Dashboard data refreshed');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to refresh data';
      setError(errorMessage);
      toast.error('Failed to refresh dashboard data', { description: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full space-y-6 p-6">
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div className="flex items-center space-x-3">
          <Shield className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
            <p className="text-muted-foreground">
              System usage, users, and operations
            </p>
          </div>
        </div>
        <Button variant="outline" onClick={handleRefresh} disabled={loading}>
          <RefreshCw className={cn("mr-2 h-4 w-4", loading && "animate-spin")} />
          Refresh
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview" className="flex items-center space-x-2">
            <BarChart3 className="h-4 w-4" />
            <span>Overview</span>
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>Users</span>
          </TabsTrigger>
          <TabsTrigger value="ops" className="flex items-center space-x-2">
            <Wrench className="h-4 w-4" />
            <span>Ops</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6 space-y-6">
          <AdminSystemStats loading={loading} />
          <AdminModelAnalytics loading={loading} />
        </TabsContent>

        <TabsContent value="users" className="mt-6 space-y-6">
          <AdminUserBreakdown loading={loading} />
        </TabsContent>

        <TabsContent value="ops" className="mt-6 space-y-6">
          <AdminPricingManagement loading={loading} />
          <AdminUserCleanup loading={loading} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
