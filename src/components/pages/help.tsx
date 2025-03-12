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
import { Input } from "@/components/ui/input";
import {
  Search,
  HelpCircle,
  BookOpen,
  MessageSquare,
  FileText,
  Video,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const HelpPage = () => {
  return (
    <DashboardLayout activeItem="Help">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Help Center</h1>
          <p className="text-muted-foreground">
            Find answers to common questions and learn how to use the platform.
          </p>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search for help..."
            className="pl-10 py-6 text-lg"
          />
        </div>

        <Tabs defaultValue="faq" className="space-y-4">
          <TabsList className="grid grid-cols-4 gap-4">
            <TabsTrigger
              value="faq"
              className="flex flex-col items-center py-2 h-auto"
            >
              <HelpCircle className="h-5 w-5 mb-1" />
              FAQ
            </TabsTrigger>
            <TabsTrigger
              value="guides"
              className="flex flex-col items-center py-2 h-auto"
            >
              <BookOpen className="h-5 w-5 mb-1" />
              Guides
            </TabsTrigger>
            <TabsTrigger
              value="support"
              className="flex flex-col items-center py-2 h-auto"
            >
              <MessageSquare className="h-5 w-5 mb-1" />
              Support
            </TabsTrigger>
            <TabsTrigger
              value="documentation"
              className="flex flex-col items-center py-2 h-auto"
            >
              <FileText className="h-5 w-5 mb-1" />
              Documentation
            </TabsTrigger>
          </TabsList>

          <TabsContent value="faq" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Frequently Asked Questions</CardTitle>
                <CardDescription>
                  Find answers to the most common questions.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1">
                    <AccordionTrigger>
                      How do I create a new campaign?
                    </AccordionTrigger>
                    <AccordionContent>
                      To create a new campaign, navigate to the Campaigns
                      section from the sidebar, then click on the "Create
                      Campaign" button in the top right corner. Fill in the
                      required information in the form and click "Save" to
                      create your campaign.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-2">
                    <AccordionTrigger>
                      How do I add influencers to my campaign?
                    </AccordionTrigger>
                    <AccordionContent>
                      You can add influencers to your campaign by going to the
                      campaign details page and clicking on the "Assign
                      Influencer" button. You can then select influencers from
                      your roster or search for new ones to add to the campaign.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-3">
                    <AccordionTrigger>
                      How are payments processed?
                    </AccordionTrigger>
                    <AccordionContent>
                      Payments are processed through our secure payment system.
                      You can set up payment details for each influencer in the
                      campaign. Once the campaign deliverables are approved, you
                      can initiate payments from the Finance section.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-4">
                    <AccordionTrigger>
                      How do I track campaign performance?
                    </AccordionTrigger>
                    <AccordionContent>
                      Campaign performance can be tracked in the Analytics
                      section. You can view metrics such as reach, engagement,
                      and conversion rates. You can also generate custom reports
                      for specific campaigns or time periods.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-5">
                    <AccordionTrigger>
                      How do I manage user permissions?
                    </AccordionTrigger>
                    <AccordionContent>
                      User permissions can be managed in the Settings section
                      under User Management. You can assign different roles to
                      users such as Admin, Brand Manager, or Finance, each with
                      different levels of access to the platform.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="guides" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Getting Started Guides</CardTitle>
                <CardDescription>
                  Step-by-step tutorials to help you get started.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {[
                    {
                      title: "Setting Up Your Account",
                      description:
                        "Learn how to set up your account and profile.",
                      icon: <Video className="h-8 w-8 text-blue-500" />,
                    },
                    {
                      title: "Creating Your First Campaign",
                      description:
                        "A step-by-step guide to creating your first campaign.",
                      icon: <Video className="h-8 w-8 text-green-500" />,
                    },
                    {
                      title: "Managing Influencers",
                      description:
                        "Learn how to add and manage influencers in your roster.",
                      icon: <Video className="h-8 w-8 text-purple-500" />,
                    },
                    {
                      title: "Tracking Campaign Performance",
                      description:
                        "How to use analytics to track campaign performance.",
                      icon: <Video className="h-8 w-8 text-orange-500" />,
                    },
                  ].map((guide, index) => (
                    <div
                      key={index}
                      className="flex items-start p-4 border rounded-lg hover:bg-muted/50 cursor-pointer"
                    >
                      <div className="mr-4">{guide.icon}</div>
                      <div>
                        <h3 className="font-medium">{guide.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {guide.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="support" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Contact Support</CardTitle>
                <CardDescription>
                  Get help from our support team.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg">
                      <h3 className="font-medium mb-2">Email Support</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Send us an email and we'll get back to you within 24
                        hours.
                      </p>
                      <Button variant="outline" className="w-full">
                        <MessageSquare className="mr-2 h-4 w-4" />
                        support@influencerconnect.com
                      </Button>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h3 className="font-medium mb-2">Live Chat</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Chat with our support team in real-time during business
                        hours.
                      </p>
                      <Button className="w-full">
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Start Live Chat
                      </Button>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h3 className="font-medium mb-2">
                      Submit a Support Ticket
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Fill out the form below to submit a support ticket.
                    </p>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label htmlFor="name" className="text-sm font-medium">
                            Name
                          </label>
                          <Input id="name" placeholder="Your name" />
                        </div>
                        <div className="space-y-2">
                          <label
                            htmlFor="email"
                            className="text-sm font-medium"
                          >
                            Email
                          </label>
                          <Input
                            id="email"
                            type="email"
                            placeholder="Your email"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label
                          htmlFor="subject"
                          className="text-sm font-medium"
                        >
                          Subject
                        </label>
                        <Input
                          id="subject"
                          placeholder="Subject of your inquiry"
                        />
                      </div>
                      <div className="space-y-2">
                        <label
                          htmlFor="message"
                          className="text-sm font-medium"
                        >
                          Message
                        </label>
                        <textarea
                          id="message"
                          className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          placeholder="Describe your issue in detail"
                        />
                      </div>
                      <Button className="w-full md:w-auto">
                        Submit Ticket
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documentation" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Documentation</CardTitle>
                <CardDescription>
                  Comprehensive documentation for the platform.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  {[
                    {
                      title: "User Guide",
                      description: "Complete user guide for the platform.",
                      icon: <BookOpen className="h-8 w-8 text-blue-500" />,
                    },
                    {
                      title: "API Documentation",
                      description: "Documentation for the API endpoints.",
                      icon: <FileText className="h-8 w-8 text-green-500" />,
                    },
                    {
                      title: "Integration Guide",
                      description:
                        "Guide for integrating with other platforms.",
                      icon: <FileText className="h-8 w-8 text-purple-500" />,
                    },
                    {
                      title: "Best Practices",
                      description: "Best practices for influencer marketing.",
                      icon: <BookOpen className="h-8 w-8 text-orange-500" />,
                    },
                    {
                      title: "Release Notes",
                      description:
                        "Latest updates and changes to the platform.",
                      icon: <FileText className="h-8 w-8 text-red-500" />,
                    },
                    {
                      title: "Security Guide",
                      description: "Information about platform security.",
                      icon: <FileText className="h-8 w-8 text-teal-500" />,
                    },
                  ].map((doc, index) => (
                    <div
                      key={index}
                      className="flex flex-col p-4 border rounded-lg hover:bg-muted/50 cursor-pointer"
                    >
                      <div className="mb-2">{doc.icon}</div>
                      <h3 className="font-medium">{doc.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {doc.description}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default HelpPage;
