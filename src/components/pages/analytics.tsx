import React from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart3,
  LineChart,
  PieChart,
  Download,
  Calendar,
} from "lucide-react";

const AnalyticsPage = () => {
  return (
    <DashboardLayout activeItem="Analytics">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
            <p className="text-muted-foreground">
              Track performance metrics and campaign analytics.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Select defaultValue="last30days">
              <SelectTrigger className="w-[180px]">
                <Calendar className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="last7days">Last 7 days</SelectItem>
                <SelectItem value="last30days">Last 30 days</SelectItem>
                <SelectItem value="last90days">Last 90 days</SelectItem>
                <SelectItem value="lastYear">Last year</SelectItem>
                <SelectItem value="custom">Custom range</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Reach</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4.2M</div>
              <p className="text-xs text-muted-foreground">
                +12% from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Engagement Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3.8%</div>
              <p className="text-xs text-muted-foreground">
                +0.5% from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Conversion Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2.1%</div>
              <p className="text-xs text-muted-foreground">
                +0.3% from last month
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="campaigns">Campaign Performance</TabsTrigger>
            <TabsTrigger value="influencers">Influencer Analytics</TabsTrigger>
            <TabsTrigger value="roi">ROI Analysis</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="col-span-2">
                <CardHeader>
                  <CardTitle>Performance Overview</CardTitle>
                  <CardDescription>
                    Monthly reach and engagement metrics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] flex items-center justify-center border rounded-md">
                    <div className="flex flex-col items-center">
                      <LineChart className="h-16 w-16 text-muted-foreground mb-2" />
                      <p className="text-muted-foreground">
                        Performance chart will be displayed here
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Top Performing Campaigns</CardTitle>
                  <CardDescription>Based on engagement rate</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[250px] flex items-center justify-center border rounded-md">
                    <div className="flex flex-col items-center">
                      <BarChart3 className="h-16 w-16 text-muted-foreground mb-2" />
                      <p className="text-muted-foreground">
                        Campaign chart will be displayed here
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Audience Demographics</CardTitle>
                  <CardDescription>Age and gender distribution</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[250px] flex items-center justify-center border rounded-md">
                    <div className="flex flex-col items-center">
                      <PieChart className="h-16 w-16 text-muted-foreground mb-2" />
                      <p className="text-muted-foreground">
                        Demographics chart will be displayed here
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="campaigns" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Campaign Performance</CardTitle>
                <CardDescription>
                  Detailed metrics for all campaigns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] flex items-center justify-center border rounded-md">
                  <div className="flex flex-col items-center">
                    <BarChart3 className="h-16 w-16 text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">
                      Campaign performance data will be displayed here
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="influencers" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Influencer Analytics</CardTitle>
                <CardDescription>
                  Performance metrics by influencer
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] flex items-center justify-center border rounded-md">
                  <div className="flex flex-col items-center">
                    <LineChart className="h-16 w-16 text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">
                      Influencer analytics will be displayed here
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="roi" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>ROI Analysis</CardTitle>
                <CardDescription>Return on investment metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] flex items-center justify-center border rounded-md">
                  <div className="flex flex-col items-center">
                    <PieChart className="h-16 w-16 text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">
                      ROI analysis will be displayed here
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default AnalyticsPage;
