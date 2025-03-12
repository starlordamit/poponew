import React, { useState } from "react";
import DashboardLayout from "../dashboard/layout/DashboardLayout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Search,
  Download,
  Filter,
  DollarSign,
  CreditCard,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

const FinancesPage = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const payments = [
    {
      id: "1",
      influencer: {
        name: "Alex Johnson",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
      },
      campaign: "Summer Collection Launch",
      brand: "Fashion Brand X",
      amount: 2500,
      status: "paid",
      date: "2024-06-15",
    },
    {
      id: "2",
      influencer: {
        name: "Sarah Williams",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
      },
      campaign: "Product Review Series",
      brand: "Tech Company Y",
      amount: 1800,
      status: "pending",
      date: "2024-07-10",
    },
    {
      id: "3",
      influencer: {
        name: "Michael Chen",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael",
      },
      campaign: "App Promotion",
      brand: "Software Inc.",
      amount: 1200,
      status: "processing",
      date: "2024-06-28",
    },
    {
      id: "4",
      influencer: {
        name: "Emma Rodriguez",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emma",
      },
      campaign: "Spring Menu Campaign",
      brand: "Food Delivery Co.",
      amount: 3000,
      status: "paid",
      date: "2024-04-20",
    },
    {
      id: "5",
      influencer: {
        name: "David Kim",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=David",
      },
      campaign: "Gaming Tournament",
      brand: "Game Studio Z",
      amount: 5000,
      status: "pending",
      date: "2024-08-05",
    },
  ];

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-500";
      case "pending":
        return "bg-yellow-500";
      case "processing":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <DashboardLayout activeItem="Finances">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Financial Management</h1>
          <p className="text-muted-foreground">
            Track payments, invoices, and financial metrics.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Revenue
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$45,231</div>
              <div className="flex items-center text-xs text-green-500">
                <ArrowUpRight className="mr-1 h-4 w-4" />
                <span>+20.1% from last month</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pending Payments
              </CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$12,500</div>
              <div className="flex items-center text-xs text-yellow-500">
                <ArrowUpRight className="mr-1 h-4 w-4" />
                <span>8 payments awaiting</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Average Campaign ROI
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">320%</div>
              <div className="flex items-center text-xs text-green-500">
                <ArrowUpRight className="mr-1 h-4 w-4" />
                <span>+15% from last quarter</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Monthly Expenses
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$8,450</div>
              <div className="flex items-center text-xs text-red-500">
                <ArrowDownRight className="mr-1 h-4 w-4" />
                <span>-5.2% from last month</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="payments" className="space-y-4">
          <TabsList>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="invoices">Invoices</TabsTrigger>
            <TabsTrigger value="budgets">Budgets</TabsTrigger>
            <TabsTrigger value="reports">Financial Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="payments" className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search payments..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <Filter className="mr-2 h-4 w-4" />
                  Filter
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
                <Button size="sm">
                  <DollarSign className="mr-2 h-4 w-4" />
                  New Payment
                </Button>
              </div>
            </div>

            <Card>
              <CardContent className="p-0">
                <div className="rounded-md border">
                  <div className="grid grid-cols-7 bg-muted/50 p-4 text-sm font-medium">
                    <div className="col-span-2">Influencer</div>
                    <div className="col-span-2">Campaign</div>
                    <div>Amount</div>
                    <div>Status</div>
                    <div>Date</div>
                  </div>
                  <div className="divide-y">
                    {payments.map((payment) => (
                      <div
                        key={payment.id}
                        className="grid grid-cols-7 items-center p-4"
                      >
                        <div className="col-span-2 flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage
                              src={payment.influencer.avatar}
                              alt={payment.influencer.name}
                            />
                            <AvatarFallback>
                              {payment.influencer.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="font-medium">
                            {payment.influencer.name}
                          </div>
                        </div>
                        <div className="col-span-2">
                          <div className="font-medium">{payment.campaign}</div>
                          <div className="text-sm text-muted-foreground">
                            {payment.brand}
                          </div>
                        </div>
                        <div className="font-medium">
                          {formatCurrency(payment.amount)}
                        </div>
                        <div>
                          <Badge
                            className={`${getStatusColor(payment.status)} text-white`}
                          >
                            {payment.status.charAt(0).toUpperCase() +
                              payment.status.slice(1)}
                          </Badge>
                        </div>
                        <div className="text-muted-foreground">
                          {new Date(payment.date).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="invoices" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Invoices</CardTitle>
                <CardDescription>
                  Manage and track all invoices.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center border rounded-md">
                  <p className="text-muted-foreground">
                    Invoice management will be displayed here
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="budgets" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Campaign Budgets</CardTitle>
                <CardDescription>
                  Track and manage campaign budgets.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center border rounded-md">
                  <p className="text-muted-foreground">
                    Budget management will be displayed here
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Financial Reports</CardTitle>
                <CardDescription>
                  Generate and view financial reports.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center border rounded-md">
                  <p className="text-muted-foreground">
                    Financial reports will be displayed here
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default FinancesPage;
