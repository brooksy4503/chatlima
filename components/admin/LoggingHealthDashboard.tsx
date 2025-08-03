'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  Activity,
  BarChart3
} from 'lucide-react';

interface LoggingHealthStatus {
  status: 'healthy' | 'warning' | 'critical';
  billingRecords: number;
  analyticsRecords: number;
  discrepancy: number;
  discrepancyPercentage: number;
  lastCheck: string;
  recentErrors: string[];
  recommendations: string[];
}

interface LoggingSummary {
  totalBillingRecords: number;
  totalAnalyticsRecords: number;
  dailyBreakdown: Array<{
    date: string;
    billingRecords: number;
    analyticsRecords: number;
    discrepancy: number;
  }>;
  overallHealthScore: number;
}

interface LoggingAlert {
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: 'discrepancy' | 'failure' | 'performance';
  message: string;
  data: Record<string, any>;
  timestamp: string;
}

export function LoggingHealthDashboard() {
  const [health, setHealth] = useState<LoggingHealthStatus | null>(null);
  const [summary, setSummary] = useState<LoggingSummary | null>(null);
  const [alerts, setAlerts] = useState<LoggingAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [healthRes, summaryRes, alertsRes] = await Promise.all([
        fetch('/api/admin/logging-health?action=health'),
        fetch('/api/admin/logging-health?action=summary&days=7'),
        fetch('/api/admin/logging-health?action=alerts')
      ]);

      if (!healthRes.ok || !summaryRes.ok || !alertsRes.ok) {
        throw new Error('Failed to fetch logging health data');
      }

      const [healthData, summaryData, alertsData] = await Promise.all([
        healthRes.json(),
        summaryRes.json(),
        alertsRes.json()
      ]);

      setHealth(healthData);
      setSummary(summaryData);
      setAlerts(alertsData.alerts || []);
      setLastRefresh(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'critical':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Activity className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-500';
      case 'warning':
        return 'text-yellow-500';
      case 'critical':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low':
        return 'bg-blue-100 text-blue-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'critical':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading && !health) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Logging Health Dashboard</h2>
          <RefreshCw className="h-5 w-5 animate-spin" />
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-gray-500">Loading logging health data...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Logging Health Dashboard</h2>
          <Button onClick={fetchData} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Error loading logging health data: {error}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Logging Health Dashboard</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </span>
          <Button 
            onClick={fetchData} 
            variant="outline" 
            size="sm"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Status Overview */}
      {health && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Overall Status</p>
                  <p className={`text-lg font-semibold ${getStatusColor(health.status)}`}>
                    {health.status.toUpperCase()}
                  </p>
                </div>
                {getStatusIcon(health.status)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Billing Records (24h)</p>
                  <p className="text-lg font-semibold">{health.billingRecords.toLocaleString()}</p>
                </div>
                <TrendingUp className="h-5 w-5 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Analytics Records (24h)</p>
                  <p className="text-lg font-semibold">{health.analyticsRecords.toLocaleString()}</p>
                </div>
                <BarChart3 className="h-5 w-5 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Missing Records</p>
                  <p className="text-lg font-semibold text-red-600">{health.discrepancy}</p>
                  <p className="text-xs text-gray-500">
                    {(health.discrepancyPercentage * 100).toFixed(1)}% loss
                  </p>
                </div>
                <TrendingDown className="h-5 w-5 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Alerts Section */}
      {alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Active Alerts ({alerts.length})
            </CardTitle>
            <CardDescription>
              Current issues requiring attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts.map((alert, index) => (
                <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                  <Badge className={getSeverityColor(alert.severity)}>
                    {alert.severity.toUpperCase()}
                  </Badge>
                  <div className="flex-1">
                    <p className="font-medium">{alert.message}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {alert.type} • {new Date(alert.timestamp).toLocaleString()}
                    </p>
                    {alert.data && Object.keys(alert.data).length > 0 && (
                      <details className="mt-2">
                        <summary className="text-sm text-blue-600 cursor-pointer">
                          View details
                        </summary>
                        <pre className="text-xs bg-gray-50 p-2 rounded mt-1 overflow-auto">
                          {JSON.stringify(alert.data, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Stats */}
      {summary && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>7-Day Summary</CardTitle>
              <CardDescription>Overall logging performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Health Score</span>
                  <span className={`text-lg font-bold ${
                    summary.overallHealthScore >= 95 ? 'text-green-600' :
                    summary.overallHealthScore >= 85 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {summary.overallHealthScore}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Total Billing Records</span>
                  <span className="font-semibold">{summary.totalBillingRecords.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Total Analytics Records</span>
                  <span className="font-semibold">{summary.totalAnalyticsRecords.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Missing Records</span>
                  <span className="font-semibold text-red-600">
                    {(summary.totalBillingRecords - summary.totalAnalyticsRecords).toLocaleString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Trends</CardTitle>
              <CardDescription>Daily breakdown of logging activity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {summary.dailyBreakdown.slice(-5).map((day, index) => (
                  <div key={index} className="flex justify-between items-center text-sm">
                    <span className="font-medium">
                      {new Date(day.date).toLocaleDateString()}
                    </span>
                    <div className="flex gap-4">
                      <span className="text-blue-600">
                        B: {day.billingRecords}
                      </span>
                      <span className="text-green-600">
                        A: {day.analyticsRecords}
                      </span>
                      {day.discrepancy > 0 && (
                        <span className="text-red-600">
                          Missing: {day.discrepancy}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recommendations */}
      {health && health.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recommendations</CardTitle>
            <CardDescription>
              Actions to improve logging health
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {health.recommendations.map((recommendation, index) => (
                <div key={index} className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                  <p className="text-sm">{recommendation}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Errors */}
      {health && health.recentErrors.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Recent Errors</CardTitle>
            <CardDescription>
              Latest errors from the logging system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {health.recentErrors.map((error, index) => (
                <div key={index} className="p-2 bg-red-50 border border-red-200 rounded text-sm">
                  <code className="text-red-800">{error}</code>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}