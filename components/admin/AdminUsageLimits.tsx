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
  Zap, 
  Plus, 
  Edit, 
  Trash2, 
  Save,
  X,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Settings,
  Users,
  BarChart3
} from "lucide-react";

interface AdminUsageLimitsProps {
  loading?: boolean;
}

interface UsageLimit {
  id: string;
  userId?: string;
  modelId?: string;
  provider?: string;
  dailyTokenLimit: number;
  monthlyTokenLimit: number;
  dailyCostLimit: number;
  monthlyCostLimit: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  description?: string;
}

interface UsageLimitFormData {
  userId?: string;
  modelId?: string;
  provider?: string;
  dailyTokenLimit: number;
  monthlyTokenLimit: number;
  dailyCostLimit: number;
  monthlyCostLimit: number;
  isActive: boolean;
  description?: string;
}

interface User {
  id: string;
  email: string;
  name: string;
}

interface Model {
  id: string;
  name: string;
  provider: string;
}

export function AdminUsageLimits({ loading = false }: AdminUsageLimitsProps) {
  const [usageLimits, setUsageLimits] = React.useState<UsageLimit[]>([]);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingLimit, setEditingLimit] = React.useState<UsageLimit | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [limitType, setLimitType] = React.useState<"user" | "model">("user");
  const [formData, setFormData] = React.useState<UsageLimitFormData>({
    userId: "",
    modelId: "",
    provider: "openai",
    dailyTokenLimit: 10000,
    monthlyTokenLimit: 300000,
    dailyCostLimit: 10,
    monthlyCostLimit: 300,
    isActive: true,
    description: "",
  });

  // Mock data for users
  const mockUsers: User[] = [
    { id: "1", email: "admin@example.com", name: "Admin User" },
    { id: "2", email: "user1@example.com", name: "John Doe" },
    { id: "3", email: "user2@example.com", name: "Jane Smith" },
    { id: "4", email: "user3@example.com", name: "Bob Johnson" },
    { id: "5", email: "user4@example.com", name: "Alice Williams" },
  ];

  // Mock data for models
  const mockModels: Model[] = [
    { id: "gpt-4", name: "GPT-4", provider: "openai" },
    { id: "gpt-3.5-turbo", name: "GPT-3.5 Turbo", provider: "openai" },
    { id: "claude-3", name: "Claude 3", provider: "anthropic" },
    { id: "gemini-pro", name: "Gemini Pro", provider: "google" },
    { id: "llama-2", name: "Llama 2", provider: "groq" },
  ];

  // Mock data for usage limits
  React.useEffect(() => {
    const mockUsageLimits: UsageLimit[] = [
      {
        id: "1",
        userId: "2",
        dailyTokenLimit: 10000,
        monthlyTokenLimit: 300000,
        dailyCostLimit: 10,
        monthlyCostLimit: 300,
        isActive: true,
        createdAt: "2023-06-01",
        updatedAt: "2024-01-15",
        description: "Standard user limits",
      },
      {
        id: "2",
        userId: "3",
        dailyTokenLimit: 5000,
        monthlyTokenLimit: 150000,
        dailyCostLimit: 5,
        monthlyCostLimit: 150,
        isActive: true,
        createdAt: "2023-07-15",
        updatedAt: "2024-01-14",
        description: "Reduced limits for trial user",
      },
      {
        id: "3",
        modelId: "gpt-4",
        provider: "openai",
        dailyTokenLimit: 50000,
        monthlyTokenLimit: 1500000,
        dailyCostLimit: 50,
        monthlyCostLimit: 1500,
        isActive: true,
        createdAt: "2023-08-20",
        updatedAt: "2024-01-13",
        description: "GPT-4 model limits",
      },
      {
        id: "4",
        modelId: "claude-3",
        provider: "anthropic",
        dailyTokenLimit: 40000,
        monthlyTokenLimit: 1200000,
        dailyCostLimit: 40,
        monthlyCostLimit: 1200,
        isActive: true,
        createdAt: "2023-10-05",
        updatedAt: "2024-01-12",
        description: "Claude 3 model limits",
      },
    ];
    setUsageLimits(mockUsageLimits);
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat("en-US").format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getUserName = (userId: string) => {
    const user = mockUsers.find(u => u.id === userId);
    return user ? `${user.name} (${user.email})` : "Unknown User";
  };

  const getModelName = (modelId: string) => {
    const model = mockModels.find(m => m.id === modelId);
    return model ? `${model.name} (${model.provider})` : "Unknown Model";
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

  const handleEdit = (limit: UsageLimit) => {
    setEditingLimit(limit);
    setLimitType(limit.userId ? "user" : "model");
    setFormData({
      userId: limit.userId,
      modelId: limit.modelId,
      provider: limit.provider,
      dailyTokenLimit: limit.dailyTokenLimit,
      monthlyTokenLimit: limit.monthlyTokenLimit,
      dailyCostLimit: limit.dailyCostLimit,
      monthlyCostLimit: limit.monthlyCostLimit,
      isActive: limit.isActive,
      description: limit.description || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this usage limit?")) {
      setUsageLimits(usageLimits.filter(l => l.id !== id));
    }
  };

  const handleInputChange = (field: keyof UsageLimitFormData, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const onSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // Validate required fields
      if (limitType === "user" && !formData.userId) {
        alert("Please select a user");
        return;
      }
      
      if (limitType === "model" && !formData.modelId) {
        alert("Please select a model");
        return;
      }
      
      if (formData.dailyTokenLimit <= 0 || formData.monthlyTokenLimit <= 0 || 
          formData.dailyCostLimit <= 0 || formData.monthlyCostLimit <= 0) {
        alert("All limits must be greater than 0");
        return;
      }
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (editingLimit) {
        // Update existing limit
        setUsageLimits(usageLimits.map(l => 
          l.id === editingLimit.id 
            ? { ...l, ...formData, updatedAt: new Date().toISOString() }
            : l
        ));
      } else {
        // Add new limit
        const newLimit: UsageLimit = {
          id: Date.now().toString(),
          ...formData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setUsageLimits([...usageLimits, newLimit]);
      }
      
      setIsDialogOpen(false);
      setEditingLimit(null);
      setFormData({
        userId: "",
        modelId: "",
        provider: "openai",
        dailyTokenLimit: 10000,
        monthlyTokenLimit: 300000,
        dailyCostLimit: 10,
        monthlyCostLimit: 300,
        isActive: true,
        description: "",
      });
    } catch (error) {
      console.error("Error saving usage limit:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderLoadingRows = () => {
    return Array.from({ length: 5 }).map((_, index) => (
      <TableRow key={index}>
        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
        <TableCell><Skeleton className="h-4 w-12" /></TableCell>
        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
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
              <Zap className="h-5 w-5" />
              <span>Usage Limits Management</span>
            </CardTitle>
            <div className="flex space-x-2">
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Limit
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>
                      {editingLimit ? "Edit Usage Limit" : "Add New Usage Limit"}
                    </DialogTitle>
                    <DialogDescription>
                      {editingLimit 
                        ? "Update the usage limit configuration."
                        : "Configure a new usage limit for users or models."
                      }
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Limit Type</label>
                      <Select 
                        value={limitType} 
                        onValueChange={(value: "user" | "model") => setLimitType(value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select limit type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">User Limit</SelectItem>
                          <SelectItem value="model">Model Limit</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {limitType === "user" ? (
                      <div>
                        <label className="text-sm font-medium">User</label>
                        <Select 
                          value={formData.userId} 
                          onValueChange={(value) => handleInputChange("userId", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select user" />
                          </SelectTrigger>
                          <SelectContent>
                            {mockUsers.map(user => (
                              <SelectItem key={user.id} value={user.id}>
                                {user.name} ({user.email})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    ) : (
                      <div>
                        <label className="text-sm font-medium">Model</label>
                        <Select 
                          value={formData.modelId} 
                          onValueChange={(value) => {
                            const model = mockModels.find(m => m.id === value);
                            handleInputChange("modelId", value);
                            if (model) {
                              handleInputChange("provider", model.provider);
                            }
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select model" />
                          </SelectTrigger>
                          <SelectContent>
                            {mockModels.map(model => (
                              <SelectItem key={model.id} value={model.id}>
                                {model.name} ({model.provider})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Daily Token Limit</label>
                        <Input
                          type="number"
                          placeholder="10000"
                          value={formData.dailyTokenLimit}
                          onChange={(e) => handleInputChange("dailyTokenLimit", parseInt(e.target.value))}
                        />
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium">Monthly Token Limit</label>
                        <Input
                          type="number"
                          placeholder="300000"
                          value={formData.monthlyTokenLimit}
                          onChange={(e) => handleInputChange("monthlyTokenLimit", parseInt(e.target.value))}
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Daily Cost Limit</label>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="10"
                          value={formData.dailyCostLimit}
                          onChange={(e) => handleInputChange("dailyCostLimit", parseFloat(e.target.value))}
                        />
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium">Monthly Cost Limit</label>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="300"
                          value={formData.monthlyCostLimit}
                          onChange={(e) => handleInputChange("monthlyCostLimit", parseFloat(e.target.value))}
                        />
                      </div>
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
                        setEditingLimit(null);
                        setFormData({
                          userId: "",
                          modelId: "",
                          provider: "openai",
                          dailyTokenLimit: 10000,
                          monthlyTokenLimit: 300000,
                          dailyCostLimit: 10,
                          monthlyCostLimit: 300,
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
                      {editingLimit ? "Update" : "Add"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Usage Limits Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Target</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Daily Tokens</TableHead>
                <TableHead>Monthly Tokens</TableHead>
                <TableHead>Daily Cost</TableHead>
                <TableHead>Monthly Cost</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                renderLoadingRows()
              ) : usageLimits.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    No usage limits configured
                  </TableCell>
                </TableRow>
              ) : (
                usageLimits.map((limit) => (
                  <TableRow key={limit.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div className="font-medium">
                        {limit.userId ? getUserName(limit.userId) : getModelName(limit.modelId!)}
                      </div>
                      {limit.description && (
                        <div className="text-sm text-muted-foreground">{limit.description}</div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={limit.userId ? "default" : "secondary"}>
                        {limit.userId ? "User" : "Model"}
                      </Badge>
                      {limit.provider && (
                        <Badge className={cn("ml-2", getProviderColor(limit.provider))}>
                          {limit.provider}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{formatNumber(limit.dailyTokenLimit)}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{formatNumber(limit.monthlyTokenLimit)}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{formatCurrency(limit.dailyCostLimit)}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{formatCurrency(limit.monthlyCostLimit)}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={limit.isActive ? "default" : "secondary"}>
                        {limit.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{formatDate(limit.updatedAt)}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(limit)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(limit.id)}
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
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">User Limits</p>
                <p className="text-2xl font-bold">
                  {usageLimits.filter(l => l.userId).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Model Limits</p>
                <p className="text-2xl font-bold">
                  {usageLimits.filter(l => l.modelId).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Limits</p>
                <p className="text-2xl font-bold">
                  {usageLimits.filter(l => l.isActive).length}
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
                <p className="text-sm font-medium text-muted-foreground">Total Limits</p>
                <p className="text-2xl font-bold">{usageLimits.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}