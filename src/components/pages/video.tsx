import React from "react";
import { useParams } from "react-router-dom";
import DashboardLayout from "../dashboard/layout/DashboardLayout";
import CampaignVideoForm from "../campaigns/CampaignVideoForm";
import CampaignVideoDetail from "../campaigns/CampaignVideoDetail";

const VideoPage = () => {
  const { id } = useParams<{ id: string }>();

  // If id is "new", render the form in create mode
  if (id === "new") {
    return (
      <DashboardLayout activeItem="Campaigns">
        <CampaignVideoForm mode="create" />
      </DashboardLayout>
    );
  }

  // Otherwise, render the detail view
  return (
    <DashboardLayout activeItem="Campaigns">
      <CampaignVideoDetail />
    </DashboardLayout>
  );
};

export default VideoPage;
