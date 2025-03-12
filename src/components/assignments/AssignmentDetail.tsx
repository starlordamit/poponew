import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { useData } from "@/context/DataContext";
import { useRoleBasedAccess } from "@/hooks/useRoleBasedAccess";
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  DollarSign,
  Calendar,
  MessageSquare,
  Edit,
  Trash2,
  Building2,
  User,
} from "lucide-react";

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

const AssignmentDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { brands, influencers, campaigns } = useData();
  const { userRole, hasPermission } = useRoleBasedAccess();

  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [responseMessage, setResponseMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Fetch assignment data
  useEffect(() => {
    const fetchAssignment = async () => {
      if (!id) return;

      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("direct_assignments")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;
        setAssignment(data as Assignment);
        if (data.response_message) {
          setResponseMessage(data.response_message);
        }
      } catch (err) {
        console.error("Error fetching assignment:", err);
        toast({
          title: "Error",
          description: "Failed to load assignment details. Please try again.",
          variant: "destructive",
        });
        navigate("/assignments");
      } finally {
        setLoading(false);
      }
    };

    fetchAssignment();
  }, [id, navigate, toast]);

  // Get brand details
  const getBrand = () => {
    if (!assignment) return null;
    return brands.find((b) => b.id === assignment.brand_id);
  };

  // Get influencer details
  const getInfluencer = () => {
    if (!assignment) return null;
    return influencers.find((i) => i.id === assignment.influencer_id);
  };

  // Get campaign details
  const getCampaign = () => {
    if (!assignment || !assignment.campaign_id) return null;
    return campaigns.find((c) => c.id === assignment.campaign_id);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
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
        return <Clock className="h-5 w-5 mr-2" />;
      case "accepted":
        return <CheckCircle className="h-5 w-5 mr-2" />;
      case "declined":
        return <XCircle className="h-5 w-5 mr-2" />;
      case "completed":
        return <CheckCircle className="h-5 w-5 mr-2" />;
      default:
        return null;
    }
  };

  // Handle response submission (accept/decline)
  const handleSubmitResponse = async (newStatus: "accepted" | "declined") => {
    if (!assignment) return;

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from("direct_assignments")
        .update({
          status: newStatus,
          response_message: responseMessage,
          updated_at: new Date().toISOString(),
          updated_by: (await supabase.auth.getUser()).data.user?.id,
        })
        .eq("id", assignment.id);

      if (error) throw error;

      toast({
        title:
          newStatus === "accepted"
            ? "Assignment Accepted"
            : "Assignment Declined",
        description:
          newStatus === "accepted"
            ? "You have successfully accepted this assignment."
            : "You have declined this assignment.",
      });

      // Update local state
      setAssignment({
        ...assignment,
        status: newStatus,
        response_message: responseMessage,
        updated_at: new Date().toISOString(),
      });
    } catch (err) {
      console.error("Error updating assignment:", err);
      toast({
        title: "Error",
        description: "Failed to update assignment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Handle assignment deletion
  const handleDeleteAssignment = async () => {
    if (!assignment) return;

    try {
      const { error } = await supabase
        .from("direct_assignments")
        .delete()
        .eq("id", assignment.id);

      if (error) throw error;

      toast({
        title: "Assignment deleted",
        description: "The assignment has been deleted successfully.",
      });

      navigate("/assignments");
    } catch (err) {
      console.error("Error deleting assignment:", err);
      toast({
        title: "Error",
        description: "Failed to delete assignment. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle mark as completed
  const handleMarkAsCompleted = async () => {
    if (!assignment) return;

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from("direct_assignments")
        .update({
          status: "completed",
          updated_at: new Date().toISOString(),
          updated_by: (await supabase.auth.getUser()).data.user?.id,
        })
        .eq("id", assignment.id);

      if (error) throw error;

      toast({
        title: "Assignment Completed",
        description: "The assignment has been marked as completed.",
      });

      // Update local state
      setAssignment({
        ...assignment,
        status: "completed",
        updated_at: new Date().toISOString(),
      });
    } catch (err) {
      console.error("Error updating assignment:", err);
      toast({
        title: "Error",
        description: "Failed to update assignment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="text-center py-10">
        <p>Assignment not found.</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => navigate("/assignments")}
        >
          Back to Assignments
        </Button>
      </div>
    );
  }

  const brand = getBrand();
  const influencer = getInfluencer();
  const campaign = getCampaign();

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/assignments")}
          className="mr-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        <h1 className="text-2xl font-bold">Assignment Details</h1>
      </div>

      {/* Status Banner */}
      <div
        className={`p-4 rounded-lg ${getStatusBadgeColor(assignment.status)} flex items-center justify-between`}
      >
        <div className="flex items-center">
          {getStatusIcon(assignment.status)}
          <span className="font-medium">
            Status:{" "}
            {assignment.status.charAt(0).toUpperCase() +
              assignment.status.slice(1)}
          </span>
        </div>
        {assignment.status === "accepted" && hasPermission("manage_brands") && (
          <Button
            size="sm"
            onClick={handleMarkAsCompleted}
            disabled={submitting}
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <CheckCircle className="h-4 w-4 mr-2" />
            )}
            Mark as Completed
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Assignment Information</CardTitle>
              <CardDescription>
                Details about this brand-influencer assignment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Assignment Details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Created</p>
                  <p className="font-medium flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    {formatDate(assignment.created_at)}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Last Updated</p>
                  <p className="font-medium flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    {formatDate(assignment.updated_at)}
                  </p>
                </div>
              </div>

              {/* Campaign Information (if available) */}
              {campaign && (
                <div className="p-4 border rounded-md bg-muted/10">
                  <h3 className="font-medium mb-2">Campaign Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">
                        Campaign Name
                      </p>
                      <p className="font-medium">{campaign.name}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">
                        Campaign Status
                      </p>
                      <Badge variant="outline">{campaign.status}</Badge>
                    </div>
                    {campaign.start_date && campaign.end_date && (
                      <div className="col-span-2 space-y-1">
                        <p className="text-sm text-muted-foreground">
                          Campaign Period
                        </p>
                        <p className="font-medium">
                          {new Date(campaign.start_date).toLocaleDateString()}{" "}
                          to {new Date(campaign.end_date).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Compensation */}
              {assignment.compensation && (
                <div className="p-4 border rounded-md bg-muted/10">
                  <h3 className="font-medium mb-2 flex items-center">
                    <DollarSign className="h-4 w-4 mr-1 text-muted-foreground" />
                    Compensation
                  </h3>
                  <p className="text-xl font-bold">
                    ${assignment.compensation.toFixed(2)}
                  </p>
                </div>
              )}

              {/* Brand Message */}
              {assignment.message && (
                <div className="space-y-2">
                  <h3 className="font-medium flex items-center">
                    <MessageSquare className="h-4 w-4 mr-2 text-muted-foreground" />
                    Message from Brand
                  </h3>
                  <div className="p-4 border rounded-md bg-muted/10">
                    <p className="whitespace-pre-wrap">{assignment.message}</p>
                  </div>
                </div>
              )}

              {/* Influencer Response */}
              {assignment.response_message && (
                <div className="space-y-2">
                  <h3 className="font-medium flex items-center">
                    <MessageSquare className="h-4 w-4 mr-2 text-muted-foreground" />
                    Response from Influencer
                  </h3>
                  <div className="p-4 border rounded-md bg-muted/10">
                    <p className="whitespace-pre-wrap">
                      {assignment.response_message}
                    </p>
                  </div>
                </div>
              )}

              {/* Response Form (for pending assignments) */}
              {assignment.status === "pending" &&
                userRole === "influencer_manager" && (
                  <div className="space-y-4 border-t pt-4">
                    <h3 className="font-medium">Respond to this Assignment</h3>
                    <Textarea
                      placeholder="Enter your response message (optional)"
                      value={responseMessage}
                      onChange={(e) => setResponseMessage(e.target.value)}
                      className="min-h-[100px]"
                    />
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => handleSubmitResponse("declined")}
                        disabled={submitting}
                      >
                        {submitting ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <XCircle className="h-4 w-4 mr-2" />
                        )}
                        Decline
                      </Button>
                      <Button
                        className="flex-1"
                        onClick={() => handleSubmitResponse("accepted")}
                        disabled={submitting}
                      >
                        {submitting ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <CheckCircle className="h-4 w-4 mr-2" />
                        )}
                        Accept
                      </Button>
                    </div>
                  </div>
                )}
            </CardContent>
            {hasPermission("manage_brands") && (
              <CardFooter className="flex justify-end space-x-2 border-t pt-4">
                <Button
                  variant="outline"
                  onClick={() => navigate(`/assignments/${assignment.id}/edit`)}
                >
                  <Edit className="h-4 w-4 mr-2" /> Edit
                </Button>
                <Button variant="destructive" onClick={handleDeleteAssignment}>
                  <Trash2 className="h-4 w-4 mr-2" /> Delete
                </Button>
              </CardFooter>
            )}
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Brand Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center">
                <Building2 className="h-4 w-4 mr-2" /> Brand
              </CardTitle>
            </CardHeader>
            <CardContent>
              {brand ? (
                <div className="flex items-center space-x-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={brand.logo_url || ""} alt={brand.name} />
                    <AvatarFallback>{brand.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{brand.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {brand.industry || "No industry specified"}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">
                  Brand information not available
                </p>
              )}
              {brand && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-4"
                  onClick={() => navigate(`/brand/${brand.id}`)}
                >
                  View Brand Profile
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Influencer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center">
                <User className="h-4 w-4 mr-2" /> Influencer
              </CardTitle>
            </CardHeader>
            <CardContent>
              {influencer ? (
                <div className="flex items-center space-x-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={influencer.profile_picture || ""}
                      alt={influencer.name}
                    />
                    <AvatarFallback>{influencer.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{influencer.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {influencer.social_handle || "No handle specified"}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">
                  Influencer information not available
                </p>
              )}
              {influencer && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-4"
                  onClick={() => navigate(`/influencer/${influencer.id}`)}
                >
                  View Influencer Profile
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AssignmentDetail;
