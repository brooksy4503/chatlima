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
import { cn } from "@/lib/utils";
import { 
  DollarSign, 
  Plus, 
  Edit, 
  Trash2, 
  Save,
  X,
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
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  description?: string;
}

interface PricingFormData {
  modelId: string;
  provider: string;
  inputTokenPrice: number;
  outputTokenPrice: number;
  currency: string;
  isActive: boolean;
  description?: string;
}

export function AdminPricingManagement({ loading = false }: AdminPricingManagementProps) {
  const [pricingData, setPricingData] = React.useState<ModelPricing[]>([]);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingPricing, setEditingPricing] = React.useState<ModelPricing | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [providerFilter, setProviderFilter] = React.useState<string>("all");
  const [formData, setFormData] = React.useState<PricingFormData>({
    modelId: "",
    provider: "openai",
    inputTokenPrice: 0.001,
    outputTokenPrice: 0.002,
    currency: "USD",
    isActive: true,
    description: "",
  });

  // Mock data for pricing
  React.useEffect(() => {
    const mockPricingData: ModelPricing[] = [
      {
        id: "1",
        modelId: "gpt-4",
        provider: "openai",
        inputTokenPrice: 0.001,
        outputTokenPrice: 0.002,
        currency: "USD",
        isActive: true,
        createdAt: "2023-06-01",
        updatedAt: "2024-01-15",
        description: "GPT-4 pricing",
      },
      {
        id: "2",
        modelId: "gpt-3.5-turbo",
        provider: "openai",
        inputTokenPrice: 0.0005,
        outputTokenPrice: 0.0015,
        currency: "USD",
        isActive: true,
        createdAt: "2023-06-01",
        updatedAt: "2024-01-15",
        description: "GPT-3.5 Turbo pricing",
      },
      {
        id: "3",
        modelId: "claude-3",
        provider: "anthropic",
        inputTokenPrice: 0.0008,
        outputTokenPrice: 0.0024,
        currency: "USD",
        isActive: true,
        createdAt: "2023-07-15",
        updatedAt: "2024-01-14",
        description: "Claude 3 pricing",
      },
      {
        id: "4",
        modelId: "gemini-pro",
        provider: "google",
        inputTokenPrice: 0.0005,
        outputTokenPrice: 0.0015,
        currency: "USD",
        isActive: true,
        createdAt: "2023-08-20",
        updatedAt: "2024-01-13",
        description: "Gemini Pro pricing",
      },
      {
        id: "5",
        modelId: "llama-2",
        provider: "groq",
        inputTokenPrice: 0.0002,
        outputTokenPrice: 0.0008,
        currency: "USD",
        isActive: true,
        createdAt: "2023-10-05",
        updatedAt: "2024-01-12",
        description: "Llama 2 pricing",
      },
    ];
    setPricingData(mockPricingData);
  }, []);

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

  const filteredPricingData = pricingData.filter(
    (pricing) => providerFilter === "all" || pricing.provider === providerFilter
  );

  const handleEdit = (pricing: ModelPricing) => {
    setEditingPricing(pricing);
    setFormData({
      modelId: pricing.modelId,
      provider: pricing.provider,
      inputTokenPrice: pricing.inputTokenPrice,
      outputTokenPrice: pricing.outputTokenPrice,
      currency: pricing.currency,
      isActive: pricing.isActive,
      description: pricing.description || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this pricing configuration?")) {
      setPricingData(pricingData.filter(p => p.id !== id));
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
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (editingPricing) {
        // Update existing pricing
        setPricingData(pricingData.map(p => 
          p.id === editingPricing.id 
            ? { ...p, ...formData, updatedAt: new Date().toISOString() }
            : p
        ));
      } else {
        // Add new pricing
        const newPricing: ModelPricing = {
          id: Date.now().toString(),
          ...formData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setPricingData([...pricingData, newPricing]);
      }
      
      setIsDialogOpen(false);
      setEditingPricing(null);
      setFormData({
        modelId: "",
        provider: "openai",
        inputTokenPrice: 0.001,
        outputTokenPrice: 0.002,
        currency: "USD",
        isActive: true,
        description: "",
      });
    } catch (error) {
      console.error("Error saving pricing:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getProviderColor = (provider: string) => {
    const colors: Record<string, string> = {
      openai: "bg-green-100 text-green-800",
      anthropic: "bg-blue-100 text-blue-800",
      google: "bg-red-100 text-red-800",
      groq: "bg-purple-100 text-purple-800",
      xai: "bg-orange-100 text-orange-800",
    };
    return colors[provider] || "bg-gray-100 text-gray-800";
  };

  const renderLoadingRows = () => {
    return Array.from({ length: 5 }).map((_, index) => (
      <TableRow key={index}>
        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
        <TableCell><Skeleton className="h-4 w-12" /></TableCell>
        <TableCell><Skeleton className="h-4 w-12" /></TableCell>
        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
      </TableRow>
    ));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <span>Model Pricing Management</span>
            </CardTitle>
            <div className="flex space-x-2">
              <Select value={providerFilter} onValueChange={setProviderFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Providers</SelectItem>
                  <SelectItem value="openai">OpenAI</SelectItem>
                  <SelectItem value="anthropic">Anthropic</SelectItem>
                  <SelectItem value="google">Google</SelectItem>
                  <SelectItem value="groq">Groq</SelectItem>
                  <SelectItem value="xai">xAI</SelectItem>
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
                          <SelectItem value="google">Google</SelectItem>
                          <SelectItem value="groq">Groq</SelectItem>
                          <SelectItem value="xai">xAI</SelectItem>
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
                      <label className="text-sm font-medium">Description</label>
                      <Input
                        placeholder="Optional description"
                        value={formData.description}
                        onChange={(e) => handleInputChange("description", e.target.value)}
                      />
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
                          description: "",
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
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
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
                      {pricing.description && (
                        <div className="text-sm text-muted-foreground">{pricing.description}</div>
                      )}
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
                      <Badge variant={pricing.isActive ? "default" : "secondary"}>
                        {pricing.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{formatDate(pricing.createdAt)}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{formatDate(pricing.updatedAt)}</div>
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
                        >
                          <Trash2 className="h-4 w-4" />
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

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Models</p>
                <p className="text-2xl font-bold">{pricingData.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Models</p>
                <p className="text-2xl font-bold">
                  {pricingData.filter(p => p.isActive).length}
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
                <p className="text-sm font-medium text-muted-foreground">Providers</p>
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