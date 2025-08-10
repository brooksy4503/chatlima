"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { 
  Trash2, 
  Eye, 
  RefreshCw, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Users,
  Calendar,
  Database,
  Activity,
  Shield,
  AlertCircle,
  Download,
  Play,
  Pause,
  Clock,
  Settings,
  History,
  Bell,
  BellOff,
  BarChart3,
  TrendingUp,
  Monitor,
  Timer,
  Zap,
  CalendarClock
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface ScheduleConfig {
  enabled: boolean;
  schedule: string;
  thresholdDays: number;
  batchSize: number;
  notificationEnabled: boolean;
  lastModified?: string;
  modifiedBy?: string;
}

interface CleanupLogEntry {
  id: string;
  executedAt: string;
  executedBy: 'admin' | 'cron' | 'script';
  adminUser?: string;
  usersCounted: number;
  usersDeleted: number;
  thresholdDays: number;
  batchSize: number;
  durationMs: number;
  status: 'success' | 'error' | 'partial';
  errorMessage?: string;
  errorCount: number;
  dryRun: boolean;
}

interface LogsResponse {
  logs: CleanupLogEntry[];
  summary: {
    totalExecutions: number;
    successfulExecutions: number;
    failedExecutions: number;
    partialExecutions: number;
    totalUsersDeleted: number;
    dryRunExecutions: number;
    averageDuration: number;
    lastExecution?: string;
    cronExecutions: number;
    manualExecutions: number;
    scriptExecutions: number;
  };
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
    page: number;
    totalPages: number;
  };
}

interface UserActivity {
  userId: string;
  email: string;
  accountCreated: Date;
  lastChatActivity: Date | null;
  lastSessionActivity: Date | null;
  lastTokenUsage: Date | null;
  isActive: boolean;
  daysSinceLastActivity: number;
}

interface CleanupPreview {
  totalAnonymousUsers: number;
  activeUsers: number;
  candidatesForDeletion: number;
  candidates: UserActivity[];
  candidatesShown: number;
  candidatesTotal: number;
  thresholdDays: number;
  minimumAgeDays: number;
}

interface CleanupStats {
  totalUsers: number;
  anonymousUsers: number;
  oldInactiveUsers: number;
  potentialStorageSavings: string;
  lastCleanupDate?: Date;
}

interface CleanupResult {
  success: boolean;
  usersDeleted: number;
  deletedUserIds: string[];
  errors: string[];
  executionTimeMs: number;
  thresholdDays: number;
  batchSize: number;
  dryRun: boolean;
  isPartialSuccess?: boolean;
}

interface AdminUserCleanupProps {
  loading?: boolean;
}

export function AdminUserCleanup({ loading: externalLoading = false }: AdminUserCleanupProps) {
  const [thresholdDays, setThresholdDays] = React.useState(45);
  const [batchSize, setBatchSize] = React.useState(50);
  const [previewLimit, setPreviewLimit] = React.useState(25);
  const [isExecuteDialogOpen, setIsExecuteDialogOpen] = React.useState(false);
  const [confirmationText, setConfirmationText] = React.useState("");
  const [lastExecutionResult, setLastExecutionResult] = React.useState<CleanupResult | null>(null);
  const [activeTab, setActiveTab] = React.useState<'overview' | 'schedule' | 'logs'>('overview');
  const [logsType, setLogsType] = React.useState('all');
  const [logsLimit, setLogsLimit] = React.useState(20);

  const queryClient = useQueryClient();

  // Fetch cleanup stats
  const { 
    data: stats, 
    isLoading: statsLoading, 
    error: statsError,
    refetch: refetchStats 
  } = useQuery({
    queryKey: ['admin-cleanup-stats'],
    queryFn: async () => {
      const response = await fetch('/api/admin/cleanup-users/execute');
      if (!response.ok) {
        throw new Error('Failed to fetch cleanup stats');
      }
      const result = await response.json();
      return result.data.currentStats as CleanupStats;
    },
    refetchInterval: 5 * 60 * 1000, // Auto-refresh every 5 minutes
  });

  // Fetch cleanup preview
  const { 
    data: preview, 
    isLoading: previewLoading, 
    error: previewError,
    refetch: refetchPreview 
  } = useQuery({
    queryKey: ['admin-cleanup-preview', thresholdDays, previewLimit],
    queryFn: async () => {
      const response = await fetch(
        `/api/admin/cleanup-users/preview?thresholdDays=${thresholdDays}&limit=${previewLimit}`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch cleanup preview');
      }
      const result = await response.json();
      return result.data as CleanupPreview;
    },
    enabled: !externalLoading,
  });

  // Fetch schedule configuration
  const { 
    data: scheduleConfig, 
    isLoading: scheduleLoading, 
    error: scheduleError,
    refetch: refetchSchedule 
  } = useQuery({
    queryKey: ['admin-cleanup-schedule'],
    queryFn: async () => {
      const response = await fetch('/api/admin/cleanup-users/schedule');
      if (!response.ok) {
        throw new Error('Failed to fetch cleanup schedule');
      }
      const result = await response.json();
      return result.data as ScheduleConfig;
    },
    refetchInterval: 30 * 1000, // Refresh every 30 seconds
  });

  // Fetch execution logs
  const { 
    data: logsData, 
    isLoading: logsLoading, 
    error: logsError,
    refetch: refetchLogs 
  } = useQuery({
    queryKey: ['admin-cleanup-logs', logsType, logsLimit],
    queryFn: async () => {
      const response = await fetch(
        `/api/admin/cleanup-users/logs?type=${logsType}&limit=${logsLimit}`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch cleanup logs');
      }
      const result = await response.json();
      return result.data as LogsResponse;
    },
    enabled: activeTab === 'logs',
    refetchInterval: 60 * 1000, // Refresh every minute when viewing logs
  });

  // Execute cleanup mutation
  const executeCleanupMutation = useMutation({
    mutationFn: async (params: { dryRun: boolean }) => {
      const response = await fetch('/api/admin/cleanup-users/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          thresholdDays,
          batchSize,
          dryRun: params.dryRun,
          confirmationToken: params.dryRun ? undefined : 'DELETE_ANONYMOUS_USERS',
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Cleanup execution failed');
      }

      const result = await response.json();
      return { 
        ...result.data as CleanupResult, 
        isPartialSuccess: response.status === 206 
      };
    },
    onSuccess: (result) => {
      setLastExecutionResult(result);
      setIsExecuteDialogOpen(false);
      setConfirmationText("");
      
      // Handle different success scenarios
      if (result.dryRun) {
        toast.success(`Dry run completed: ${result.usersDeleted} users would be deleted`);
      } else if (result.errors.length > 0) {
        // Partial success - some users deleted but with errors
        toast.success(
          `Cleanup partially completed: ${result.usersDeleted} users deleted (${result.errors.length} errors)`,
          { duration: 6000 }
        );
      } else {
        // Complete success
        toast.success(`Cleanup completed: ${result.usersDeleted} users deleted`);
      }
      
      // Refresh data
      queryClient.invalidateQueries({ queryKey: ['admin-cleanup-stats'] });
      queryClient.invalidateQueries({ queryKey: ['admin-cleanup-preview'] });
      queryClient.invalidateQueries({ queryKey: ['admin-cleanup-logs'] });
    },
    onError: (error) => {
      toast.error(`Cleanup failed: ${error.message}`);
    },
  });

  // Update schedule configuration mutation
  const updateScheduleMutation = useMutation({
    mutationFn: async (newConfig: Partial<ScheduleConfig>) => {
      const response = await fetch('/api/admin/cleanup-users/schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newConfig),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Schedule update failed');
      }

      const result = await response.json();
      return result.data as ScheduleConfig;
    },
    onSuccess: (result) => {
      toast.success(result.enabled 
        ? 'Automated cleanup has been enabled' 
        : 'Automated cleanup has been disabled'
      );
      
      // Refresh schedule data
      queryClient.invalidateQueries({ queryKey: ['admin-cleanup-schedule'] });
    },
    onError: (error) => {
      toast.error(`Schedule update failed: ${error.message}`);
    },
  });

  const loading = externalLoading || statsLoading || previewLoading;
  const error = statsError || previewError || scheduleError || logsError;

  const handleRefresh = () => {
    refetchStats();
    refetchPreview();
    refetchSchedule();
    refetchLogs();
  };

  const handleExecute = (dryRun: boolean) => {
    executeCleanupMutation.mutate({ dryRun });
  };

  const handleScheduleToggle = (enabled: boolean) => {
    updateScheduleMutation.mutate({ enabled });
  };

  const handleScheduleUpdate = (updates: Partial<ScheduleConfig>) => {
    updateScheduleMutation.mutate(updates);
  };

  const isConfirmationValid = confirmationText === "DELETE_ANONYMOUS_USERS";

  const formatDate = (date: Date | string | null) => {
    if (!date) return "Never";
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString() + " " + d.toLocaleTimeString();
  };

  const formatDaysAgo = (days: number) => {
    if (days === 0) return "Today";
    if (days === 1) return "1 day ago";
    return `${days} days ago`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Anonymous User Cleanup</h2>
          <p className="text-muted-foreground">
            Manage inactive anonymous users to optimize database performance
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {scheduleConfig?.enabled && (
            <Badge variant="secondary" className="flex items-center space-x-1">
              <Zap className="h-3 w-3" />
              <span>Auto Cleanup Enabled</span>
            </Badge>
          )}
          <Button 
            onClick={handleRefresh} 
            disabled={loading}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={cn(
              "border-b-2 pb-2 px-1 text-sm font-medium transition-colors",
              activeTab === 'overview'
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300"
            )}
          >
            <Activity className="h-4 w-4 inline mr-2" />
            Overview
          </button>
          <button
            onClick={() => setActiveTab('schedule')}
            className={cn(
              "border-b-2 pb-2 px-1 text-sm font-medium transition-colors",
              activeTab === 'schedule'
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300"
            )}
          >
            <CalendarClock className="h-4 w-4 inline mr-2" />
            Schedule
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={cn(
              "border-b-2 pb-2 px-1 text-sm font-medium transition-colors",
              activeTab === 'logs'
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300"
            )}
          >
            <History className="h-4 w-4 inline mr-2" />
            Execution Logs
          </button>
        </nav>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load cleanup data: {error.message}
          </AlertDescription>
        </Alert>
      )}

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Stats Overview */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? <Skeleton className="h-8 w-16" /> : stats?.totalUsers.toLocaleString()}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Anonymous Users</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? <Skeleton className="h-8 w-16" /> : stats?.anonymousUsers.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  {loading ? "" : `${Math.round((stats?.anonymousUsers || 0) / (stats?.totalUsers || 1) * 100)}% of total`}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Inactive (45+ days)</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {loading ? <Skeleton className="h-8 w-16" /> : stats?.oldInactiveUsers.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  {loading ? "" : `${Math.round((stats?.oldInactiveUsers || 0) / (stats?.anonymousUsers || 1) * 100)}% of anonymous`}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Storage Savings</CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {loading ? <Skeleton className="h-8 w-16" /> : stats?.potentialStorageSavings}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Configuration */}
          <Card>
        <CardHeader>
          <CardTitle>Cleanup Configuration</CardTitle>
          <p className="text-sm text-muted-foreground">
            Configure the parameters for anonymous user cleanup
          </p>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="threshold-days">Inactivity Threshold (days)</Label>
            <Input
              id="threshold-days"
              type="number"
              min="7"
              max="365"
              value={thresholdDays}
              onChange={(e) => setThresholdDays(parseInt(e.target.value) || 45)}
            />
            <p className="text-xs text-muted-foreground">
              Delete users inactive for this many days (minimum: 7)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="batch-size">Batch Size</Label>
            <Input
              id="batch-size"
              type="number"
              min="1"
              max="100"
              value={batchSize}
              onChange={(e) => setBatchSize(parseInt(e.target.value) || 50)}
            />
            <p className="text-xs text-muted-foreground">
              Maximum users to delete per execution
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="preview-limit">Preview Limit</Label>
            <Input
              id="preview-limit"
              type="number"
              min="10"
              max="200"
              value={previewLimit}
              onChange={(e) => setPreviewLimit(parseInt(e.target.value) || 25)}
            />
            <p className="text-xs text-muted-foreground">
              Maximum candidates to show in preview (max: 200 for performance)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Preview Results */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Eye className="h-5 w-5" />
            <span>Cleanup Preview</span>
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Preview of users that would be deleted with current settings
          </p>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ) : preview ? (
            <div className="space-y-4">
              {/* Preview Summary */}
              <div className="grid gap-4 md:grid-cols-3">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{preview.totalAnonymousUsers}</div>
                  <div className="text-sm text-blue-700">Total Anonymous</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{preview.activeUsers}</div>
                  <div className="text-sm text-green-700">Active Users</div>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{preview.candidatesForDeletion}</div>
                  <div className="text-sm text-red-700">Deletion Candidates</div>
                </div>
              </div>

              {/* Safety Notice */}
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  Users younger than {preview.minimumAgeDays} days are automatically protected from deletion.
                  Current threshold: {preview.thresholdDays} days of inactivity.
                </AlertDescription>
              </Alert>

              {/* Candidates Table */}
              {preview.candidates.length > 0 && (
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User ID</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Last Activity</TableHead>
                        <TableHead>Days Inactive</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {preview.candidates.slice(0, 10).map((user) => (
                        <TableRow key={user.userId}>
                          <TableCell className="font-mono text-xs">
                            {user.userId.substring(0, 8)}...
                          </TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{formatDate(user.accountCreated)}</TableCell>
                          <TableCell>
                            {formatDate(
                              user.lastChatActivity || 
                              user.lastSessionActivity || 
                              user.lastTokenUsage ||
                              user.accountCreated
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant="destructive">
                              {formatDaysAgo(user.daysSinceLastActivity)}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  
                  {preview.candidatesTotal > 10 && (
                    <div className="p-3 text-center text-sm text-muted-foreground border-t">
                      Showing 10 of {preview.candidatesTotal} candidates
                      {preview.candidatesShown < preview.candidatesTotal && 
                        ` (limited to ${preview.candidatesShown} for preview)`
                      }
                    </div>
                  )}
                </div>
              )}

              {preview.candidatesForDeletion === 0 && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    No users found for deletion with current criteria. All anonymous users are either active or too young.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          ) : null}
        </CardContent>
      </Card>

      {/* Execution Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Play className="h-5 w-5" />
            <span>Execute Cleanup</span>
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Run the cleanup process with current configuration
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-3">
            <Button
              onClick={() => handleExecute(true)}
              disabled={loading || executeCleanupMutation.isPending}
              variant="outline"
            >
              <Eye className="h-4 w-4 mr-2" />
              Dry Run
            </Button>

            <Dialog open={isExecuteDialogOpen} onOpenChange={setIsExecuteDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  disabled={loading || !preview?.candidatesForDeletion || executeCleanupMutation.isPending}
                  variant="destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Execute Cleanup
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                    <span>Confirm User Deletion</span>
                  </DialogTitle>
                  <DialogDescription>
                    This action will permanently delete up to {Math.min(batchSize, preview?.candidatesForDeletion || 0)} anonymous users
                    and all their associated data (chats, messages, sessions, usage metrics).
                    This action cannot be undone.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  <div className="bg-red-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-red-800">
                      Users to be deleted: {Math.min(batchSize, preview?.candidatesForDeletion || 0)}
                    </p>
                    <p className="text-sm text-red-700">
                      Inactivity threshold: {thresholdDays} days
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmation">
                      Type <code className="bg-gray-100 px-2 py-1 rounded">DELETE_ANONYMOUS_USERS</code> to confirm:
                    </Label>
                    <Input
                      id="confirmation"
                      value={confirmationText}
                      onChange={(e) => setConfirmationText(e.target.value)}
                      placeholder="DELETE_ANONYMOUS_USERS"
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsExecuteDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    disabled={!isConfirmationValid || executeCleanupMutation.isPending}
                    onClick={() => handleExecute(false)}
                  >
                    {executeCleanupMutation.isPending ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Users
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Last Execution Result */}
          {lastExecutionResult && (
            <Alert variant={
              lastExecutionResult.success || (lastExecutionResult.usersDeleted > 0 && lastExecutionResult.errors.length > 0) 
                ? "default" 
                : "destructive"
            }>
              <div className="flex items-center space-x-2">
                {lastExecutionResult.success ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : lastExecutionResult.usersDeleted > 0 ? (
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600" />
                )}
                <div>
                  <p className="font-medium">
                    {lastExecutionResult.dryRun ? "Dry Run" : "Cleanup"} 
                    {lastExecutionResult.success 
                      ? " Completed" 
                      : lastExecutionResult.usersDeleted > 0 
                        ? " Partially Completed" 
                        : " Failed"
                    }
                  </p>
                  <p className="text-sm">
                    {lastExecutionResult.dryRun ? "Would delete" : "Deleted"} {lastExecutionResult.usersDeleted} users
                    in {lastExecutionResult.executionTimeMs}ms
                    {lastExecutionResult.errors.length > 0 && ` (${lastExecutionResult.errors.length} errors)`}
                  </p>
                  {lastExecutionResult.errors.length > 0 && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-sm font-medium">
                        {lastExecutionResult.usersDeleted > 0 ? "View Warnings & Errors" : "View Errors"}
                      </summary>
                      <div className="mt-2 text-xs space-y-1">
                        {lastExecutionResult.errors.map((error, i) => (
                          <div key={i} className={cn(
                            "p-2 rounded",
                            lastExecutionResult.usersDeleted > 0 ? "bg-orange-50" : "bg-red-50"
                          )}>
                            {error}
                          </div>
                        ))}
                      </div>
                    </details>
                  )}
                </div>
              </div>
            </Alert>
          )}
          </CardContent>
          </Card>
        </div>
      )}

      {/* Schedule Tab */}
      {activeTab === 'schedule' && (
        <div className="space-y-6">
          {/* Schedule Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CalendarClock className="h-5 w-5" />
                <span>Automated Cleanup Schedule</span>
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Configure and manage automated cleanup schedules using Vercel Cron
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {scheduleLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ) : scheduleConfig ? (
                <>
                  {/* Schedule Toggle */}
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium">Automated Cleanup</h3>
                        <Badge variant={scheduleConfig.enabled ? "default" : "secondary"}>
                          {scheduleConfig.enabled ? "Enabled" : "Disabled"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {scheduleConfig.enabled 
                          ? `Cleanup runs ${scheduleConfig.schedule} (${scheduleConfig.thresholdDays} days threshold)`
                          : "Automated cleanup is currently disabled"
                        }
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant={scheduleConfig.enabled ? "destructive" : "default"}
                        size="sm"
                        onClick={() => handleScheduleToggle(!scheduleConfig.enabled)}
                        disabled={updateScheduleMutation.isPending}
                      >
                        {scheduleConfig.enabled ? (
                          <>
                            <Pause className="h-4 w-4 mr-2" />
                            Disable
                          </>
                        ) : (
                          <>
                            <Play className="h-4 w-4 mr-2" />
                            Enable
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Schedule Configuration */}
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-4">
                      <h4 className="font-medium">Schedule Settings</h4>
                      
                      <div className="space-y-2">
                        <Label htmlFor="cron-schedule">Cron Schedule</Label>
                        <Input
                          id="cron-schedule"
                          value={scheduleConfig.schedule}
                          onChange={(e) => handleScheduleUpdate({ schedule: e.target.value })}
                          placeholder="0 2 * * 0"
                          disabled={updateScheduleMutation.isPending}
                        />
                        <p className="text-xs text-muted-foreground">
                          Current: {scheduleConfig.schedule} (Weekly on Sundays at 2 AM UTC)
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="schedule-threshold">Inactivity Threshold (days)</Label>
                        <Input
                          id="schedule-threshold"
                          type="number"
                          min="7"
                          max="365"
                          value={scheduleConfig.thresholdDays}
                          onChange={(e) => handleScheduleUpdate({ thresholdDays: parseInt(e.target.value) || 45 })}
                          disabled={updateScheduleMutation.isPending}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="schedule-batch">Batch Size</Label>
                        <Input
                          id="schedule-batch"
                          type="number"
                          min="1"
                          max="100"
                          value={scheduleConfig.batchSize}
                          onChange={(e) => handleScheduleUpdate({ batchSize: parseInt(e.target.value) || 50 })}
                          disabled={updateScheduleMutation.isPending}
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-medium">Monitoring & Alerts</h4>
                      
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-2">
                          {scheduleConfig.notificationEnabled ? (
                            <Bell className="h-4 w-4 text-green-600" />
                          ) : (
                            <BellOff className="h-4 w-4 text-gray-400" />
                          )}
                          <span className="text-sm">Email notifications</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleScheduleUpdate({ notificationEnabled: !scheduleConfig.notificationEnabled })}
                          disabled={updateScheduleMutation.isPending}
                        >
                          {scheduleConfig.notificationEnabled ? "Disable" : "Enable"}
                        </Button>
                      </div>

                      <div className="p-4 bg-blue-50 rounded-lg">
                        <h5 className="font-medium text-blue-900 mb-2">Vercel Cron Configuration</h5>
                        <code className="text-xs bg-white p-2 rounded block text-blue-800">
                          {JSON.stringify({
                            path: "/api/admin/cleanup-users/execute",
                            schedule: scheduleConfig.schedule
                          }, null, 2)}
                        </code>
                      </div>

                      {scheduleConfig.lastModified && (
                        <div className="text-xs text-muted-foreground">
                          Last modified: {formatDate(scheduleConfig.lastModified)}
                          {scheduleConfig.modifiedBy && ` by ${scheduleConfig.modifiedBy}`}
                        </div>
                      )}
                    </div>
                  </div>
                </>
              ) : null}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Logs Tab */}
      {activeTab === 'logs' && (
        <div className="space-y-6">
          {/* Logs Header */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <History className="h-5 w-5" />
                <span>Execution History</span>
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                View history and statistics of cleanup executions
              </p>
            </CardHeader>
            <CardContent>
              {logsLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ) : logsData ? (
                <>
                  {/* Summary Stats */}
                  <div className="grid gap-4 md:grid-cols-4 mb-6">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{logsData.summary.totalExecutions}</div>
                      <div className="text-sm text-green-700">Total Executions</div>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{logsData.summary.successfulExecutions}</div>
                      <div className="text-sm text-blue-700">Successful</div>
                    </div>
                    <div className="text-center p-4 bg-red-50 rounded-lg">
                      <div className="text-2xl font-bold text-red-600">{logsData.summary.totalUsersDeleted}</div>
                      <div className="text-sm text-red-700">Users Deleted</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">{logsData.summary.averageDuration}ms</div>
                      <div className="text-sm text-purple-700">Avg Duration</div>
                    </div>
                  </div>

                  {/* Filters */}
                  <div className="flex items-center space-x-4 mb-4">
                    <Select value={logsType} onValueChange={setLogsType}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Filter by type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Executions</SelectItem>
                        <SelectItem value="cron">Cron Jobs</SelectItem>
                        <SelectItem value="manual">Manual</SelectItem>
                        <SelectItem value="script">Scripts</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={logsLimit.toString()} onValueChange={(value) => setLogsLimit(parseInt(value))}>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Limit" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10 logs</SelectItem>
                        <SelectItem value="20">20 logs</SelectItem>
                        <SelectItem value="50">50 logs</SelectItem>
                        <SelectItem value="100">100 logs</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Execution Logs Table */}
                  <div className="border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Executed At</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Users Deleted</TableHead>
                          <TableHead>Duration</TableHead>
                          <TableHead>Threshold</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {logsData.logs.map((log) => (
                          <TableRow key={log.id}>
                            <TableCell>
                              <div className="flex flex-col">
                                <span>{formatDate(log.executedAt)}</span>
                                {log.adminUser && (
                                  <span className="text-xs text-muted-foreground">{log.adminUser}</span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {log.executedBy === 'cron' && <Timer className="h-3 w-3 mr-1" />}
                                {log.executedBy === 'admin' && <Users className="h-3 w-3 mr-1" />}
                                {log.executedBy === 'script' && <Settings className="h-3 w-3 mr-1" />}
                                {log.executedBy}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <Badge 
                                  variant={
                                    log.status === 'success' ? 'default' : 
                                    log.status === 'error' ? 'destructive' : 'secondary'
                                  }
                                >
                                  {log.status}
                                </Badge>
                                {log.dryRun && <Badge variant="outline">dry run</Badge>}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col">
                                <span className="font-medium">{log.usersDeleted}</span>
                                <span className="text-xs text-muted-foreground">
                                  of {log.usersCounted} candidates
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>{log.durationMs}ms</TableCell>
                            <TableCell>{log.thresholdDays} days</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    
                    {logsData.pagination.hasMore && (
                      <div className="p-3 text-center text-sm text-muted-foreground border-t">
                        Showing {logsData.logs.length} of {logsData.pagination.total} executions
                      </div>
                    )}
                  </div>
                </>
              ) : null}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
