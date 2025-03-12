import React from "react";
import DashboardLayout from "../dashboard/layout/DashboardLayout";
import InfluencerList from "../influencers/InfluencerList";

const InfluencersPage = () => {
  return (
    <DashboardLayout activeItem="Influencers">
      <InfluencerList />
    </DashboardLayout>
  );
};

export default InfluencersPage;
