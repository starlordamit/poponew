import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { useData } from "@/context/DataContext";
import { useRoleBasedAccess } from "@/hooks/useRoleBasedAccess";
import {
  Search,
  Plus,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  Filter,
  ArrowUpDown,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import CreateAssignmentDialog from "./CreateAssignmentDialog";

interface Assignment {
  id: string;
  brand_id: string;
  influencer_id: string;
  campaign_id: string | null;
  status: string;
  message: string | null;
  compensation: number | null;
  response_message: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
}

const AssignmentList = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { brands, influencers, campaigns } = useData();
  const { userRole, hasPermission } = useRoleBasedAccess();

  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredAssignments, setFilteredAssignments] = useState<Assignment[]>(
    [],
  );
  const [activeTab, setActiveTab] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [sortField, setSortField] = useState<string>("created_at");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // Fetch assignments
  useEffect(() => {
    const fetchAssignments = async () => {
      setLoading(true);
      try {
        let query = supabase
          .from("direct_assignments")
          .select("*")
          .order(sortField, { ascending: sortDirection === "asc" });

        // If user is a brand manager, only show assignments for their brands
        if (userRole === "brand_manager") {
          // In a real app, you would filter by brands the manager has access to
          // For now, we'll show all assignments as a simplification
        }

        const { data, error } = await query;

        if (error) throw error;
        setAssignments(data as Assignment[]);
        setFilteredAssignments(data as Assignment[]);
      } catch (err) {
        console.error("Error fetching assignments:", err);
        toast({
          title: "Error",
          description: "Failed to load assignments. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAssignments();
  }, [toast, userRole, sortField, sortDirection]);

  // Filter assignments based on search query and active tab
  useEffect(() => {
    let filtered = [...assignments];

    // Filter by tab
    if (activeTab !== "all") {
      filtered = filtered.filter(
        (assignment) => assignment.status === activeTab,
      );
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((assignment) => {
        const brand = brands.find((b) => b.id === assignment.brand_id);
        const influencer = influencers.find(
          (i) => i.id === assignment.influencer_id,
        );
        const campaign = campaigns.find((c) => c.id === assignment.campaign_id);

        return (
          brand?.name.toLowerCase().includes(query) ||
          influencer?.name.toLowerCase().includes(query) ||
          campaign?.name.toLowerCase().includes(query) ||
          assignment.status.toLowerCase().includes(query)
        );
      });
    }

    setFilteredAssignments(filtered);
  }, [assignments, searchQuery, activeTab, brands, influencers, campaigns]);

  // Get brand name by ID
  const getBrandName = (brandId: string) => {
    const brand = brands.find((b) => b.id === brandId);
    return brand?.name || "Unknown Brand";
  };

  // Get influencer name by ID
  const getInfluencerName = (influencerId: string) => {
    const influencer = influencers.find((i) => i.id === influencerId);
    return influencer?.name || "Unknown Influencer";
  };

  // Get campaign name by ID
  const getCampaignName = (campaignId: string | null) => {
    if (!campaignId) return "No Campaign";
    const campaign = campaigns.find((c) => c.id === campaignId);
    return campaign?.name || "Unknown Campaign";
  };

  // Get status badge color
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "accepted":
        return "bg-green-100 text-green-800";
      case "declined":
        return "bg-red-100 text-red-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 mr-1" />;
      case "accepted":
        return <CheckCircle className="h-4 w-4 mr-1" />;
      case "declined":
        return <XCircle className="h-4 w-4 mr-1" />;
      case "completed":
        return <CheckCircle className="h-4 w-4 mr-1" />;
      default:
        return null;
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Handle sort change
  const handleSort = (field: string) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  // Handle assignment deletion
  const handleDeleteAssignment = async (assignmentId: string) => {
    try {
      const { error } = await supabase
        .from("direct_assignments")
        .delete()
        .eq("id", assignmentId);

      if (error) throw error;

      toast({
        title: "Assignment deleted",
        description: "The assignment has been deleted successfully.",
      });

      // Refresh assignments
      setAssignments(assignments.filter((a) => a.id !== assignmentId));
    } catch (err) {
      console.error("Error deleting assignment:", err);
      toast({
        title: "Error",
        description: "Failed to delete assignment. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <CreateAssignmentDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onAssignmentCreated={(newAssignment) => {
          setAssignments([newAssignment, ...assignments]);
          toast({
            title: "Assignment created",
            description: "The assignment has been created successfully.",
          });
        }}
      />

      <div className="flex justify-between items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search assignments..."
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
          {hasPermission("manage_brands") && (
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> New Assignment
            </Button>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">
            All
            <Badge className="ml-2 bg-gray-100 text-gray-800">
              {assignments.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="pending">
            Pending
            <Badge className="ml-2 bg-yellow-100 text-yellow-800">
              {assignments.filter((a) => a.status === "pending").length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="accepted">
            Accepted
            <Badge className="ml-2 bg-green-100 text-green-800">
              {assignments.filter((a) => a.status === "accepted").length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="declined">
            Declined
            <Badge className="ml-2 bg-red-100 text-red-800">
              {assignments.filter((a) => a.status === "declined").length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed
            <Badge className="ml-2 bg-blue-100 text-blue-800">
              {assignments.filter((a) => a.status === "completed").length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>
                {activeTab === "all"
                  ? "All Assignments"
                  : `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Assignments`}
              </CardTitle>
              <CardDescription>
                {activeTab === "all"
                  ? "View all direct assignments between brands and influencers"
                  : `View ${activeTab} assignments between brands and influencers`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredAssignments.length === 0 ? (
                <div className="text-center py-10 border rounded-lg bg-muted/20">
                  <p className="text-muted-foreground">
                    No assignments found.{" "}
                    {hasPermission("manage_brands") &&
                      "Create your first assignment to get started."}
                  </p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <div className="grid grid-cols-7 bg-muted/50 p-4 text-sm font-medium">
                    <div
                      className="col-span-2 flex items-center cursor-pointer"
                      onClick={() => handleSort("influencer_id")}
                    >
                      Influencer <ArrowUpDown className="ml-2 h-4 w-4" />
                    </div>
                    <div
                      className="col-span-2 flex items-center cursor-pointer"
                      onClick={() => handleSort("brand_id")}
                    >
                      Brand <ArrowUpDown className="ml-2 h-4 w-4" />
                    </div>
                    <div
                      className="flex items-center cursor-pointer"
                      onClick={() => handleSort("compensation")}
                    >
                      Compensation <ArrowUpDown className="ml-2 h-4 w-4" />
                    </div>
                    <div
                      className="flex items-center cursor-pointer"
                      onClick={() => handleSort("status")}
                    >
                      Status <ArrowUpDown className="ml-2 h-4 w-4" />
                    </div>
                    <div
                      className="flex items-center cursor-pointer"
                      onClick={() => handleSort("created_at")}
                    >
                      Date <ArrowUpDown className="ml-2 h-4 w-4" />
                    </div>
                  </div>
                  <div className="divide-y">
                    {filteredAssignments.map((assignment) => (
                      <div
                        key={assignment.id}
                        className="grid grid-cols-7 items-center p-4"
                      >
                        <div className="col-span-2 flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage
                              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${getInfluencerName(assignment.influencer_id)}`}
                              alt={getInfluencerName(assignment.influencer_id)}
                            />
                            <AvatarFallback>
                              {getInfluencerName(
                                assignment.influencer_id,
                              ).charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">
                              {getInfluencerName(assignment.influencer_id)}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {getCampaignName(assignment.campaign_id)}
                            </div>
                          </div>
                        </div>
                        <div className="col-span-2">
                          <div className="font-medium">
                            {getBrandName(assignment.brand_id)}
                          </div>
                        </div>
                        <div className="font-medium">
                          {assignment.compensation
                            ? `$${assignment.compensation.toFixed(2)}`
                            : "Not set"}
                        </div>
                        <div>
                          <Badge
                            className={`flex items-center ${getStatusBadgeColor(assignment.status)}`}
                          >
                            {getStatusIcon(assignment.status)}
                            {assignment.status.charAt(0).toUpperCase() +
                              assignment.status.slice(1)}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">
                            {formatDate(assignment.created_at)}
                          </span>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() =>
                                  navigate(`/assignments/${assignment.id}`)
                                }
                              >
                                <Eye className="mr-2 h-4 w-4" /> View Details
                              </DropdownMenuItem>
                              {hasPermission("manage_brands") && (
                                <DropdownMenuItem
                                  onClick={() =>
                                    navigate(
                                      `/assignments/${assignment.id}/edit`,
                                    )
                                  }
                                >
                                  <Edit className="mr-2 h-4 w-4" /> Edit
                                </DropdownMenuItem>
                              )}
                              {hasPermission("manage_brands") && (
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() =>
                                    handleDeleteAssignment(assignment.id)
                                  }
                                >
                                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AssignmentList;
