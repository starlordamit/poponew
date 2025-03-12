import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "../dashboard/layout/DashboardLayout";
import CampaignVideoForm from "../campaigns/CampaignVideoForm";
import { useToast } from "@/components/ui/use-toast";

const VideoEditPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  if (!id) {
    toast({
      title: "Error",
      description: "Video ID is missing. Redirecting to videos list.",
      variant: "destructive",
    });
    navigate("/campaigns");
    return null;
  }

  console.log("VideoEditPage rendering with ID:", id);

  return (
    <DashboardLayout activeItem="Campaigns">
      <CampaignVideoForm mode="edit" />
    </DashboardLayout>
  );
};

export default VideoEditPage;
