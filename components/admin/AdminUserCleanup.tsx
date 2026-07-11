"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Shield,
  AlertCircle,
  Play,
  History,
  Settings,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

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
    totalUsersDeleted: number;
    averageDuration: number;
  };
  pagination: {
    total: number;
    hasMore: boolean;
  };
}

interface UserActivity {
  userId: string;
  email: string;
  accountCreated: Date;
  lastChatActivity: Date | null;
  lastSessionActivity: Date | null;
  lastTokenUsage: Date | null;
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
  const [activeTab, setActiveTab] = React.useState<'overview' | 'logs'>('overview');
  const [logsLimit, setLogsLimit] = React.useState(20);

  const queryClient = useQueryClient();

  const { data: stats, isLoading: statsLoading, error: statsError, refetch: refetchStats } = useQuery({
    queryKey: ['admin-cleanup-stats'],
    queryFn: async () => {
      const response = await fetch('/api/admin/cleanup-users/execute');
      if (!response.ok) throw new Error('Failed to fetch cleanup stats');
      const result = await response.json();
      return result.data.currentStats as CleanupStats;
    },
    refetchInterval: 5 * 60 * 1000,
  });

  const { data: preview, isLoading: previewLoading, error: previewError, refetch: refetchPreview } = useQuery({
    queryKey: ['admin-cleanup-preview', thresholdDays, previewLimit],
    queryFn: async () => {
      const response = await fetch(
        `/api/admin/cleanup-users/preview?thresholdDays=${thresholdDays}&limit=${previewLimit}`
      );
      if (!response.ok) throw new Error('Failed to fetch cleanup preview');
      const result = await response.json();
      return result.data as CleanupPreview;
    },
    enabled: !externalLoading,
  });

  const { data: logsData, isLoading: logsLoading, error: logsError, refetch: refetchLogs } = useQuery({
    queryKey: ['admin-cleanup-logs', logsLimit],
    queryFn: async () => {
      const response = await fetch(`/api/admin/cleanup-users/logs?limit=${logsLimit}`);
      if (!response.ok) throw new Error('Failed to fetch cleanup logs');
      const result = await response.json();
      return result.data as LogsResponse;
    },
    enabled: activeTab === 'logs',
    refetchInterval: 60 * 1000,
  });

  const executeCleanupMutation = useMutation({
    mutationFn: async (params: { dryRun: boolean }) => {
      const response = await fetch('/api/admin/cleanup-users/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
      return result.data as CleanupResult;
    },
    onSuccess: (result) => {
      setLastExecutionResult(result);
      setIsExecuteDialogOpen(false);
      setConfirmationText("");

      if (result.dryRun) {
        toast.success(`Dry run completed: ${result.usersDeleted} users would be deleted`);
      } else if (result.errors.length > 0) {
        toast.success(
          `Cleanup partially completed: ${result.usersDeleted} users deleted (${result.errors.length} errors)`,
          { duration: 6000 }
        );
      } else {
        toast.success(`Cleanup completed: ${result.usersDeleted} users deleted`);
      }

      queryClient.invalidateQueries({ queryKey: ['admin-cleanup-stats'] });
      queryClient.invalidateQueries({ queryKey: ['admin-cleanup-preview'] });
      queryClient.invalidateQueries({ queryKey: ['admin-cleanup-logs'] });
    },
    onError: (error) => {
      toast.error(`Cleanup failed: ${error.message}`);
    },
  });

  const loading = externalLoading || statsLoading || previewLoading;
  const error = statsError || previewError || logsError;
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
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Anonymous User Cleanup</h3>
          <p className="text-sm text-muted-foreground">
            Preview and manually delete inactive anonymous users
          </p>
        </div>
        <Button
          onClick={() => { refetchStats(); refetchPreview(); refetchLogs(); }}
          disabled={loading}
          variant="outline"
          size="sm"
        >
          <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
          Refresh
        </Button>
      </div>

      <div className="border-b">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={cn(
              "border-b-2 pb-2 px-1 text-sm font-medium transition-colors",
              activeTab === 'overview'
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={cn(
              "border-b-2 pb-2 px-1 text-sm font-medium transition-colors",
              activeTab === 'logs'
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <History className="h-4 w-4 inline mr-2" />
            Execution Logs
          </button>
        </nav>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Failed to load cleanup data: {error.message}</AlertDescription>
        </Alert>
      )}

      {activeTab === 'overview' && (
        <div className="space-y-6">
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

          <Card>
            <CardHeader>
              <CardTitle>Cleanup Configuration</CardTitle>
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
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Eye className="h-5 w-5" />
                <span>Cleanup Preview</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ) : preview ? (
                <div className="space-y-4">
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

                  <Alert>
                    <Shield className="h-4 w-4" />
                    <AlertDescription>
                      Users younger than {preview.minimumAgeDays} days are protected.
                      Threshold: {preview.thresholdDays} days of inactivity.
                    </AlertDescription>
                  </Alert>

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
                          {preview.candidates.map((user) => (
                            <TableRow key={user.userId}>
                              <TableCell className="font-mono text-xs">{user.userId.substring(0, 8)}...</TableCell>
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
                                <Badge variant="destructive">{formatDaysAgo(user.daysSinceLastActivity)}</Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}

                  {preview.candidatesForDeletion === 0 && (
                    <Alert>
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>
                        No users found for deletion with current criteria.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Play className="h-5 w-5" />
                <span>Execute Cleanup</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-3">
                <Button
                  onClick={() => executeCleanupMutation.mutate({ dryRun: true })}
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
                        This will permanently delete up to {Math.min(batchSize, preview?.candidatesForDeletion || 0)} anonymous users.
                        This cannot be undone.
                      </DialogDescription>
                    </DialogHeader>
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
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsExecuteDialogOpen(false)}>Cancel</Button>
                      <Button
                        variant="destructive"
                        disabled={!isConfirmationValid || executeCleanupMutation.isPending}
                        onClick={() => executeCleanupMutation.mutate({ dryRun: false })}
                      >
                        {executeCleanupMutation.isPending ? "Deleting..." : "Delete Users"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              {lastExecutionResult && (
                <Alert variant={lastExecutionResult.success ? "default" : "destructive"}>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    {lastExecutionResult.dryRun ? "Dry run" : "Cleanup"}: {lastExecutionResult.usersDeleted} users
                    in {lastExecutionResult.executionTimeMs}ms
                    {lastExecutionResult.errors.length > 0 && ` (${lastExecutionResult.errors.length} errors)`}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'logs' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <History className="h-5 w-5" />
              <span>Execution History</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {logsLoading ? (
              <Skeleton className="h-32 w-full" />
            ) : logsData ? (
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Select value={logsLimit.toString()} onValueChange={(v) => setLogsLimit(parseInt(v))}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Limit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10 logs</SelectItem>
                      <SelectItem value="20">20 logs</SelectItem>
                      <SelectItem value="50">50 logs</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Executed At</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Users Deleted</TableHead>
                        <TableHead>Duration</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {logsData.logs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell>{formatDate(log.executedAt)}</TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {log.executedBy === 'admin' && <Users className="h-3 w-3 mr-1 inline" />}
                              {log.executedBy === 'script' && <Settings className="h-3 w-3 mr-1 inline" />}
                              {log.executedBy}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={log.status === 'success' ? 'default' : 'destructive'}>
                              {log.status}
                            </Badge>
                            {log.dryRun && <Badge variant="outline" className="ml-1">dry run</Badge>}
                          </TableCell>
                          <TableCell>{log.usersDeleted}</TableCell>
                          <TableCell>{log.durationMs}ms</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
