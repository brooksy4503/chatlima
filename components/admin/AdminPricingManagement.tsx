"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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
import { DollarSign, RefreshCw } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface AdminPricingManagementProps {
  loading?: boolean;
}

interface ModelPricing {
  id: string;
  modelId: string;
  provider: string;
  inputTokenPrice: number;
  outputTokenPrice: number;
  currency: string;
  effectiveFrom: string;
  isActive: boolean;
}

export function AdminPricingManagement({ loading: externalLoading = false }: AdminPricingManagementProps) {
  const [providerFilter, setProviderFilter] = React.useState("all");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [modelSearch, setModelSearch] = React.useState("");
  const [currentPage, setCurrentPage] = React.useState(1);
  const pageSize = 50;
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-pricing', currentPage, providerFilter, statusFilter, modelSearch],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: pageSize.toString(),
      });
      if (providerFilter !== "all") params.set("provider", providerFilter);
      if (statusFilter !== "all") params.set("isActive", statusFilter);
      if (modelSearch.trim()) params.set("modelId", modelSearch.trim());

      const response = await fetch(`/api/pricing/models?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch pricing data');
      const result = await response.json();
      return {
        models: (result.data?.models || []) as ModelPricing[],
        total: result.data?.total || 0,
        totalPages: Math.ceil((result.data?.total || 0) / pageSize),
      };
    },
  });

  const syncPricingMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/admin/sync-pricing', { method: 'POST' });
      if (!response.ok) throw new Error('Failed to sync pricing data');
      return response.json();
    },
    onSuccess: (result) => {
      toast.success('Pricing synchronized', {
        description: `Processed ${result.data.modelsProcessed} models.`
      });
      queryClient.invalidateQueries({ queryKey: ['admin-pricing'] });
    },
    onError: (err) => {
      toast.error('Failed to sync pricing', { description: err.message });
    },
  });

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 9,
      maximumFractionDigits: 9,
    }).format(value);

  const loading = externalLoading || isLoading;
  const models = data?.models || [];
  const totalPages = data?.totalPages || 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Model Pricing
          </h3>
          <p className="text-sm text-muted-foreground">
            Sync from providers, then verify pricing below
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => syncPricingMutation.mutate()}
          disabled={syncPricingMutation.isPending}
        >
          <RefreshCw className={cn("mr-2 h-4 w-4", syncPricingMutation.isPending && "animate-spin")} />
          Sync Pricing
        </Button>
      </div>

      {error && (
        <p className="text-sm text-destructive">Failed to load pricing: {error.message}</p>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Pricing Table</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <Input
              placeholder="Search model ID..."
              value={modelSearch}
              onChange={(e) => { setModelSearch(e.target.value); setCurrentPage(1); }}
              className="max-w-xs"
            />
            <Select value={providerFilter} onValueChange={(v) => { setProviderFilter(v); setCurrentPage(1); }}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Provider" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Providers</SelectItem>
                <SelectItem value="openai">OpenAI</SelectItem>
                <SelectItem value="anthropic">Anthropic</SelectItem>
                <SelectItem value="openrouter">OpenRouter</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setCurrentPage(1); }}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="true">Active</SelectItem>
                <SelectItem value="false">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <Skeleton className="h-48 w-full" />
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Model</TableHead>
                    <TableHead>Provider</TableHead>
                    <TableHead>Input / 1M</TableHead>
                    <TableHead>Output / 1M</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {models.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        No pricing records found. Run Sync Pricing to populate.
                      </TableCell>
                    </TableRow>
                  ) : (
                    models.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell className="font-mono text-xs">{row.modelId}</TableCell>
                        <TableCell>{row.provider}</TableCell>
                        <TableCell>{formatCurrency(row.inputTokenPrice * 1_000_000)}</TableCell>
                        <TableCell>{formatCurrency(row.outputTokenPrice * 1_000_000)}</TableCell>
                        <TableCell>
                          <Badge variant={row.isActive ? "default" : "secondary"}>
                            {row.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages} ({data?.total} records)
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
