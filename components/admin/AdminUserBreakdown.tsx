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
import { cn } from "@/lib/utils";
import { 
  Users, 
  Search, 
  Download, 
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  User,
  Zap,
  DollarSign,
  Calendar,
  Activity,
  Mail,
  Filter
} from "lucide-react";

interface AdminUserBreakdownProps {
  loading?: boolean;
}

interface UserUsage {
  id: string;
  email: string;
  name: string;
  tokensUsed: number;
  cost: number;
  requestCount: number;
  lastActive: string;
  isActive: boolean;
  createdAt: string;
  plan: string;
  usagePercentage: number;
}

export function AdminUserBreakdown({ loading = false }: AdminUserBreakdownProps) {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [sortColumn, setSortColumn] = React.useState<keyof UserUsage>("tokensUsed");
  const [sortDirection, setSortDirection] = React.useState<"asc" | "desc">("desc");
  const [planFilter, setPlanFilter] = React.useState<string>("all");
  const [activeFilter, setActiveFilter] = React.useState<string>("all");
  const [currentPage, setCurrentPage] = React.useState(1);
  const [itemsPerPage] = React.useState(10);
  const [userUsage, setUserUsage] = React.useState<UserUsage[]>([]);

  // Mock data for user usage
  React.useEffect(() => {
    const mockUserUsage: UserUsage[] = [
      {
        id: "1",
        email: "admin@example.com",
        name: "Admin User",
        tokensUsed: 543210,
        cost: 1234.56,
        requestCount: 876,
        lastActive: "2024-01-15",
        isActive: true,
        createdAt: "2023-01-01",
        plan: "premium",
        usagePercentage: 85,
      },
      {
        id: "2",
        email: "user1@example.com",
        name: "John Doe",
        tokensUsed: 432100,
        cost: 987.65,
        requestCount: 654,
        lastActive: "2024-01-14",
        isActive: true,
        createdAt: "2023-02-15",
        plan: "premium",
        usagePercentage: 72,
      },
      {
        id: "3",
        email: "user2@example.com",
        name: "Jane Smith",
        tokensUsed: 321000,
        cost: 765.43,
        requestCount: 543,
        lastActive: "2024-01-13",
        isActive: true,
        createdAt: "2023-03-20",
        plan: "standard",
        usagePercentage: 65,
      },
      {
        id: "4",
        email: "user3@example.com",
        name: "Bob Johnson",
        tokensUsed: 210000,
        cost: 543.21,
        requestCount: 432,
        lastActive: "2024-01-12",
        isActive: true,
        createdAt: "2023-04-10",
        plan: "standard",
        usagePercentage: 45,
      },
      {
        id: "5",
        email: "user4@example.com",
        name: "Alice Williams",
        tokensUsed: 123456,
        cost: 321.09,
        requestCount: 321,
        lastActive: "2024-01-11",
        isActive: true,
        createdAt: "2023-05-05",
        plan: "basic",
        usagePercentage: 30,
      },
      {
        id: "6",
        email: "user5@example.com",
        name: "Charlie Brown",
        tokensUsed: 98765,
        cost: 210.98,
        requestCount: 210,
        lastActive: "2024-01-10",
        isActive: true,
        createdAt: "2023-06-15",
        plan: "basic",
        usagePercentage: 25,
      },
      {
        id: "7",
        email: "user6@example.com",
        name: "Diana Prince",
        tokensUsed: 65432,
        cost: 154.32,
        requestCount: 154,
        lastActive: "2024-01-09",
        isActive: true,
        createdAt: "2023-07-20",
        plan: "basic",
        usagePercentage: 20,
      },
      {
        id: "8",
        email: "user7@example.com",
        name: "Ethan Hunt",
        tokensUsed: 43210,
        cost: 98.76,
        requestCount: 98,
        lastActive: "2024-01-08",
        isActive: true,
        createdAt: "2023-08-10",
        plan: "basic",
        usagePercentage: 15,
      },
      {
        id: "9",
        email: "user8@example.com",
        name: "Fiona Green",
        tokensUsed: 21098,
        cost: 54.32,
        requestCount: 54,
        lastActive: "2023-12-15",
        isActive: false,
        createdAt: "2023-09-05",
        plan: "basic",
        usagePercentage: 10,
      },
      {
        id: "10",
        email: "user9@example.com",
        name: "George Wilson",
        tokensUsed: 10987,
        cost: 32.10,
        requestCount: 32,
        lastActive: "2023-11-20",
        isActive: false,
        createdAt: "2023-10-12",
        plan: "basic",
        usagePercentage: 5,
      },
    ];
    setUserUsage(mockUserUsage);
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

  const getPlanColor = (plan: string) => {
    const colors: Record<string, string> = {
      premium: "bg-purple-100 text-purple-800",
      standard: "bg-blue-100 text-blue-800",
      basic: "bg-gray-100 text-gray-800",
    };
    return colors[plan] || "bg-gray-100 text-gray-800";
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 80) return "text-red-600";
    if (percentage >= 60) return "text-yellow-600";
    return "text-green-600";
  };

  const handleSort = (column: keyof UserUsage) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("desc");
    }
  };

  const getSortIcon = (column: keyof UserUsage) => {
    if (sortColumn !== column) return <ArrowUpDown className="h-4 w-4" />;
    return sortDirection === "asc" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />;
  };

  const filteredUserUsage = userUsage.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPlan = planFilter === "all" || user.plan === planFilter;
    
    const matchesActive = activeFilter === "all" || 
      (activeFilter === "active" && user.isActive) ||
      (activeFilter === "inactive" && !user.isActive);
    
    return matchesSearch && matchesPlan && matchesActive;
  });

  const sortedUserUsage = [...filteredUserUsage].sort((a, b) => {
    const aValue = a[sortColumn];
    const bValue = b[sortColumn];
    
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
    }
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === "asc" 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    
    return 0;
  });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedUserUsage.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedUserUsage.length / itemsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const renderLoadingRows = () => {
    return Array.from({ length: 5 }).map((_, index) => (
      <TableRow key={index}>
        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
        <TableCell><Skeleton className="h-4 w-40" /></TableCell>
        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
        <TableCell><Skeleton className="h-4 w-12" /></TableCell>
        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
      </TableRow>
    ));
  };

  const exportData = () => {
    const csvContent = [
      ["Name", "Email", "Tokens Used", "Cost", "Requests", "Last Active", "Plan", "Usage %"],
      ...sortedUserUsage.map(user => [
        user.name,
        user.email,
        user.tokensUsed,
        user.cost,
        user.requestCount,
        user.lastActive,
        user.plan,
        user.usagePercentage
      ])
    ].map(row => row.join(",")).join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "user_usage_breakdown.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>User Usage Breakdown</span>
            </CardTitle>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              <Button variant="outline" onClick={exportData}>
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
              <Button variant="outline">
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={planFilter} onValueChange={setPlanFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Plan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Plans</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
                <SelectItem value="standard">Standard</SelectItem>
                <SelectItem value="basic">Basic</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={activeFilter} onValueChange={setActiveFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* User Usage Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Button
                    variant="ghost"
                    className="h-auto p-0 font-medium"
                    onClick={() => handleSort("name")}
                  >
                    User
                    {getSortIcon("name")}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    className="h-auto p-0 font-medium"
                    onClick={() => handleSort("tokensUsed")}
                  >
                    Tokens
                    {getSortIcon("tokensUsed")}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    className="h-auto p-0 font-medium"
                    onClick={() => handleSort("cost")}
                  >
                    Cost
                    {getSortIcon("cost")}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    className="h-auto p-0 font-medium"
                    onClick={() => handleSort("requestCount")}
                  >
                    Requests
                    {getSortIcon("requestCount")}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    className="h-auto p-0 font-medium"
                    onClick={() => handleSort("usagePercentage")}
                  >
                    Usage
                    {getSortIcon("usagePercentage")}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    className="h-auto p-0 font-medium"
                    onClick={() => handleSort("lastActive")}
                  >
                    Last Active
                    {getSortIcon("lastActive")}
                  </Button>
                </TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                renderLoadingRows()
              ) : currentItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                currentItems.map((user) => (
                  <TableRow key={user.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                          <User className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="font-medium">{user.name}</div>
                          <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                            <Mail className="h-3 w-3" />
                            <span>{user.email}</span>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Zap className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{formatNumber(user.tokensUsed)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{formatCurrency(user.cost)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Activity className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{formatNumber(user.requestCount)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-muted rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${getUsageColor(user.usagePercentage).replace("text-", "bg-")}`}
                            style={{ width: `${user.usagePercentage}%` }}
                          ></div>
                        </div>
                        <span className={`text-sm font-medium ${getUsageColor(user.usagePercentage)}`}>
                          {user.usagePercentage}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{formatDate(user.lastActive)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getPlanColor(user.plan)}>
                        {user.plan}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.isActive ? "default" : "secondary"}>
                        {user.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, sortedUserUsage.length)} of {sortedUserUsage.length} users
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => paginate(page)}
                  >
                    {page}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">{userUsage.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Activity className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Users</p>
                <p className="text-2xl font-bold">
                  {userUsage.filter(u => u.isActive).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Zap className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Tokens</p>
                <p className="text-2xl font-bold">
                  {formatNumber(userUsage.reduce((sum, user) => sum + user.tokensUsed, 0))}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Cost</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(userUsage.reduce((sum, user) => sum + user.cost, 0))}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}