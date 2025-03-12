import React from "react";
import DashboardLayout from "../dashboard/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, Users, Video, BarChart3, DollarSign } from "lucide-react";
import ActivityFeed from "../dashboard/ActivityFeed";

const Dashboard = () => {
  return (
    <DashboardLayout activeItem="Dashboard">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Brands</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">+2 from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Influencers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">145</div>
            <p className="text-xs text-muted-foreground">+12 from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Campaigns
            </CardTitle>
            <Video className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18</div>
            <p className="text-xs text-muted-foreground">+4 from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$45,231</div>
            <p className="text-xs text-muted-foreground">
              +20.1% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Recent Campaigns</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      name: "Summer Collection Launch",
                      brand: "Fashion Brand X",
                      status: "Active",
                      influencers: 12,
                    },
                    {
                      name: "Product Review Series",
                      brand: "Tech Company Y",
                      status: "Pending",
                      influencers: 8,
                    },
                    {
                      name: "Holiday Special",
                      brand: "Beauty Brand Z",
                      status: "Planning",
                      influencers: 15,
                    },
                    {
                      name: "App Promotion",
                      brand: "Software Inc.",
                      status: "Active",
                      influencers: 6,
                    },
                  ].map((campaign, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0"
                    >
                      <div>
                        <p className="font-medium">{campaign.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {campaign.brand}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-sm">
                          <span
                            className={`inline-block w-2 h-2 rounded-full mr-1 ${campaign.status === "Active" ? "bg-green-500" : campaign.status === "Pending" ? "bg-yellow-500" : "bg-blue-500"}`}
                          ></span>
                          {campaign.status}
                        </div>
                        <div className="text-sm">
                          {campaign.influencers} influencers
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Activity Feed</CardTitle>
              </CardHeader>
              <CardContent>
                <ActivityFeed />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center border rounded-md">
                <p className="text-muted-foreground">
                  Analytics charts will be displayed here
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center border rounded-md">
                <p className="text-muted-foreground">
                  Reports will be displayed here
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    title: "New influencer application",
                    time: "2 hours ago",
                    type: "info",
                  },
                  {
                    title: "Campaign approval needed",
                    time: "5 hours ago",
                    type: "warning",
                  },
                  {
                    title: "Payment processed successfully",
                    time: "1 day ago",
                    type: "success",
                  },
                  {
                    title: "Content revision requested",
                    time: "2 days ago",
                    type: "error",
                  },
                ].map((notification, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-4 border-b pb-4 last:border-0 last:pb-0"
                  >
                    <div
                      className={`w-2 h-2 mt-2 rounded-full ${notification.type === "info" ? "bg-blue-500" : notification.type === "warning" ? "bg-yellow-500" : notification.type === "success" ? "bg-green-500" : "bg-red-500"}`}
                    ></div>
                    <div>
                      <p className="font-medium">{notification.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {notification.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default Dashboard;
