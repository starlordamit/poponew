import React from "react";
import DashboardLayout from "../dashboard/layout/DashboardLayout";
import CampaignList from "../campaigns/CampaignList";

const CampaignsPage = () => {
  return (
    <DashboardLayout activeItem="Campaigns">
      <CampaignList />
    </DashboardLayout>
  );
};

export default CampaignsPage;
