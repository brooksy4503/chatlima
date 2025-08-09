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
  DollarSign, 
  Plus, 
  Edit, 
  Trash2, 
  Save,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Settings
} from "lucide-react";

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
  effectiveTo?: string | null;
  isActive: boolean;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
}

interface PricingFormData {
  modelId: string;
  provider: string;
  inputTokenPrice: number;
  outputTokenPrice: number;
  currency: string;
  isActive: boolean;
  metadata?: any;
}

export function AdminPricingManagement({ loading = false }: AdminPricingManagementProps) {
  const [pricingData, setPricingData] = React.useState<ModelPricing[]>([]);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingPricing, setEditingPricing] = React.useState<ModelPricing | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);
  
  // Filters and pagination
  const [providerFilter, setProviderFilter] = React.useState<string>("all");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [modelSearch, setModelSearch] = React.useState<string>("");
  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(50);
  const [totalRecords, setTotalRecords] = React.useState(0);
  const [totalPages, setTotalPages] = React.useState(0);
  
  const [formData, setFormData] = React.useState<PricingFormData>({
    modelId: "",
    provider: "openai",
    inputTokenPrice: 0.001,
    outputTokenPrice: 0.002,
    currency: "USD",
    isActive: true,
    metadata: {},
  });

  // Fetch real pricing data from API with pagination and filters
  const fetchPricingData = React.useCallback(async (page = currentPage, filters = {}) => {
    setIsLoading(true);
    try {
      const searchParams = new URLSearchParams({
        page: page.toString(),
        limit: pageSize.toString(),
        ...filters
      });

      const response = await fetch(`/api/pricing/models?${searchParams.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch pricing data');
      }
      const result = await response.json();
      if (result.success && result.data.models) {
        setPricingData(result.data.models);
        setTotalRecords(result.data.total || 0);
        setTotalPages(Math.ceil((result.data.total || 0) / pageSize));
        setCurrentPage(result.data.page || 1);
      } else {
        console.error('Invalid response format:', result);
        setPricingData([]);
      }
    } catch (error) {
      console.error('Error fetching pricing data:', error);
      setPricingData([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, pageSize]);

  React.useEffect(() => {
    const filters: Record<string, string> = {};
    if (providerFilter !== "all") filters.provider = providerFilter;
    if (statusFilter !== "all") filters.isActive = statusFilter;
    if (modelSearch.trim()) filters.modelId = modelSearch.trim();
    
    fetchPricingData(1, filters);
  }, [providerFilter, statusFilter, modelSearch, pageSize, fetchPricingData]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 6,
      maximumFractionDigits: 6,
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // API handles filtering now, so we use pricingData directly
  const filteredPricingData = pricingData;

  const handleEdit = (pricing: ModelPricing) => {
    setEditingPricing(pricing);
    setFormData({
      modelId: pricing.modelId,
      provider: pricing.provider,
      inputTokenPrice: pricing.inputTokenPrice,
      outputTokenPrice: pricing.outputTokenPrice,
      currency: pricing.currency,
      isActive: pricing.isActive,
      metadata: pricing.metadata || {},
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this pricing configuration?")) {
      setDeletingId(id); // Set deletingId to track the deletion process
      try {
        // Find the pricing entry to get its details
        const pricingToDelete = pricingData.find(p => p.id === id);
        if (!pricingToDelete) {
          alert("Pricing entry not found");
          setDeletingId(null); // Clear deletingId on not found
          return;
        }

        // Deactivate the pricing entry by setting isActive to false
        const payload = {
          modelId: pricingToDelete.modelId,
          provider: pricingToDelete.provider,
          inputTokenPrice: pricingToDelete.inputTokenPrice,
          outputTokenPrice: pricingToDelete.outputTokenPrice,
          currency: pricingToDelete.currency,
          isActive: false, // This will deactivate the entry
          effectiveFrom: new Date().toISOString(),
          effectiveTo: new Date().toISOString() // Set end date to now
        };

        const response = await fetch('/api/pricing/models', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error?.message || 'Failed to delete pricing');
        }

        const result = await response.json();
        
        if (result.success) {
          // Refresh the data from the server
          await fetchPricingData(1, {});
          setDeletingId(null); // Clear deletingId on success
          
          // Show success message
          setSuccessMessage('Pricing deleted successfully!');
          setTimeout(() => setSuccessMessage(null), 3000); // Clear after 3 seconds
        } else {
          throw new Error(result.error?.message || 'Failed to delete pricing');
        }
      } catch (error) {
        console.error("Error deleting pricing:", error);
        alert(`Error deleting pricing: ${error instanceof Error ? error.message : 'Unknown error'}`);
        setDeletingId(null); // Clear deletingId on error
      }
    }
  };

  const handleInputChange = (field: keyof PricingFormData, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const onSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // Validate required fields
      if (!formData.modelId || !formData.provider || formData.inputTokenPrice < 0 || formData.outputTokenPrice < 0) {
        alert("Please fill in all required fields with valid values");
        return;
      }
      
      // Prepare the request payload
      const payload = {
        modelId: formData.modelId,
        provider: formData.provider,
        inputTokenPrice: formData.inputTokenPrice,
        outputTokenPrice: formData.outputTokenPrice,
        currency: formData.currency,
        isActive: formData.isActive,
        effectiveFrom: new Date().toISOString(),
        metadata: formData.metadata || {}
      };

      // Make real API call
      const response = await fetch('/api/pricing/models', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to save pricing');
      }

      const result = await response.json();
      
      if (result.success) {
        // Refresh the data from the server
        await fetchPricingData(1, {});
        
        // Show success message
        const action = editingPricing ? 'updated' : 'created';
        setSuccessMessage(`Pricing ${action} successfully!`);
        setTimeout(() => setSuccessMessage(null), 3000); // Clear after 3 seconds
        
        setIsDialogOpen(false);
        setEditingPricing(null);
        setFormData({
          modelId: "",
          provider: "openai",
          inputTokenPrice: 0.001,
          outputTokenPrice: 0.002,
          currency: "USD",
          isActive: true,
          metadata: {},
        });
      } else {
        throw new Error(result.error?.message || 'Failed to save pricing');
      }
    } catch (error) {
      console.error("Error saving pricing:", error);
      alert(`Error saving pricing: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getProviderColor = (provider: string) => {
    const colors: Record<string, string> = {
      openai: "bg-green-100 text-green-800",
      anthropic: "bg-blue-100 text-blue-800",
      groq: "bg-purple-100 text-purple-800",
      xai: "bg-orange-100 text-orange-800",
      openrouter: "bg-indigo-100 text-indigo-800",
      requesty: "bg-cyan-100 text-cyan-800",
    };
    return colors[provider.toLowerCase()] || "bg-gray-100 text-gray-800";
  };

  const renderLoadingRows = () => {
    return Array.from({ length: 5 }).map((_, index) => (
      <TableRow key={index}>
        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
        <TableCell><Skeleton className="h-4 w-12" /></TableCell>
        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
        <TableCell><Skeleton className="h-4 w-12" /></TableCell>
        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
      </TableRow>
    ));
  };

  return (
    <div className="space-y-6">
      {/* Success Message */}
      {successMessage && (
        <div className="flex items-center space-x-2 p-4 bg-green-50 border border-green-200 rounded-lg">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <span className="text-green-800 font-medium">{successMessage}</span>
        </div>
      )}

      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <span>Model Pricing Management</span>
              <div className="text-sm font-normal text-muted-foreground ml-2">
                ({totalRecords} total records)
              </div>
            </CardTitle>
            <div className="flex space-x-2">
              <Input
                placeholder="Search model ID..."
                value={modelSearch}
                onChange={(e) => setModelSearch(e.target.value)}
                className="w-48"
              />
              <Select value={providerFilter} onValueChange={setProviderFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Providers</SelectItem>
                  <SelectItem value="openai">OpenAI</SelectItem>
                  <SelectItem value="anthropic">Anthropic</SelectItem>
                  <SelectItem value="groq">Groq</SelectItem>
                  <SelectItem value="xai">xAI</SelectItem>
                  <SelectItem value="openrouter">OpenRouter</SelectItem>
                  <SelectItem value="requesty">Requesty</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="true">Active</SelectItem>
                  <SelectItem value="false">Inactive</SelectItem>
                </SelectContent>
              </Select>
              
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Pricing
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>
                      {editingPricing ? "Edit Pricing" : "Add New Pricing"}
                    </DialogTitle>
                    <DialogDescription>
                      {editingPricing 
                        ? "Update the pricing configuration for this model."
                        : "Configure pricing for a new model."
                      }
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Model ID</label>
                      <Input
                        placeholder="e.g., gpt-4"
                        value={formData.modelId}
                        onChange={(e) => handleInputChange("modelId", e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium">Provider</label>
                      <Select 
                        value={formData.provider} 
                        onValueChange={(value) => handleInputChange("provider", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select provider" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="openai">OpenAI</SelectItem>
                          <SelectItem value="anthropic">Anthropic</SelectItem>
                          <SelectItem value="groq">Groq</SelectItem>
                          <SelectItem value="xai">xAI</SelectItem>
                          <SelectItem value="openrouter">OpenRouter</SelectItem>
                          <SelectItem value="requesty">Requesty</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Input Token Price</label>
                        <Input
                          type="number"
                          step="0.000001"
                          placeholder="0.001"
                          value={formData.inputTokenPrice}
                          onChange={(e) => handleInputChange("inputTokenPrice", parseFloat(e.target.value))}
                        />
                        <p className="text-xs text-muted-foreground mt-1">Price per 1K input tokens</p>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium">Output Token Price</label>
                        <Input
                          type="number"
                          step="0.000001"
                          placeholder="0.002"
                          value={formData.outputTokenPrice}
                          onChange={(e) => handleInputChange("outputTokenPrice", parseFloat(e.target.value))}
                        />
                        <p className="text-xs text-muted-foreground mt-1">Price per 1K output tokens</p>
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium">Currency</label>
                      <Select 
                        value={formData.currency} 
                        onValueChange={(value) => handleInputChange("currency", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="EUR">EUR</SelectItem>
                          <SelectItem value="GBP">GBP</SelectItem>
                          <SelectItem value="JPY">JPY</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium">Status</label>
                      <div className="flex items-center space-x-2 mt-2">
                        <input
                          type="checkbox"
                          id="isActive"
                          checked={formData.isActive}
                          onChange={(e) => handleInputChange("isActive", e.target.checked)}
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <label htmlFor="isActive" className="text-sm text-muted-foreground">
                          Active (this pricing configuration is currently in use)
                        </label>
                      </div>
                    </div>

                  </div>
                  
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsDialogOpen(false);
                        setEditingPricing(null);
                        setFormData({
                          modelId: "",
                          provider: "openai",
                          inputTokenPrice: 0.001,
                          outputTokenPrice: 0.002,
                          currency: "USD",
                          isActive: true,
                          metadata: {},
                        });
                      }}
                    >
                      Cancel
                    </Button>
                    <Button onClick={onSubmit} disabled={isSubmitting}>
                      {isSubmitting ? (
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="mr-2 h-4 w-4" />
                      )}
                      {editingPricing ? "Update" : "Add"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Pricing Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
                          <TableRow>
              <TableHead>Model ID</TableHead>
              <TableHead>Provider</TableHead>
              <TableHead>Input Price</TableHead>
              <TableHead>Output Price</TableHead>
              <TableHead>Currency</TableHead>
              <TableHead>Effective From</TableHead>
              <TableHead>Effective To</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-24">Actions</TableHead>
            </TableRow>
            </TableHeader>
            <TableBody>
              {loading || isLoading ? (
                renderLoadingRows()
              ) : filteredPricingData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    No pricing configurations found
                  </TableCell>
                </TableRow>
              ) : (
                filteredPricingData.map((pricing) => (
                  <TableRow key={pricing.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div className="font-medium">{pricing.modelId}</div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getProviderColor(pricing.provider)}>
                        {pricing.provider}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{formatCurrency(pricing.inputTokenPrice)}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{formatCurrency(pricing.outputTokenPrice)}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{pricing.currency}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{formatDate(pricing.effectiveFrom)}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {pricing.effectiveTo ? formatDate(pricing.effectiveTo) : "—"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={pricing.isActive ? "default" : "secondary"}>
                        {pricing.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(pricing)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(pricing.id)}
                          disabled={deletingId === pricing.id}
                        >
                          {deletingId === pricing.id ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <p className="text-sm text-muted-foreground">
                  Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalRecords)} of {totalRecords} records
                </p>
                <Select value={pageSize.toString()} onValueChange={(value) => setPageSize(parseInt(value))}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="25">25 per page</SelectItem>
                    <SelectItem value="50">50 per page</SelectItem>
                    <SelectItem value="100">100 per page</SelectItem>
                    <SelectItem value="200">200 per page</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchPricingData(1)}
                  disabled={currentPage === 1 || isLoading}
                >
                  First
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchPricingData(currentPage - 1)}
                  disabled={currentPage === 1 || isLoading}
                >
                  Previous
                </Button>
                <div className="flex items-center space-x-1">
                  <p className="text-sm">
                    Page {currentPage} of {totalPages}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchPricingData(currentPage + 1)}
                  disabled={currentPage === totalPages || isLoading}
                >
                  Next
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchPricingData(totalPages)}
                  disabled={currentPage === totalPages || isLoading}
                >
                  Last
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Models</p>
                <p className="text-2xl font-bold">{totalRecords}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Current Page</p>
                <p className="text-2xl font-bold">
                  {pricingData.filter(p => p.isActive).length} active
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Providers (Current)</p>
                <p className="text-2xl font-bold">
                  {new Set(pricingData.map(p => p.provider)).size}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}