import React from "react";
import { useParams } from "react-router-dom";
import DashboardLayout from "../dashboard/layout/DashboardLayout";
import InfluencerDetail from "../influencers/InfluencerDetail";

const InfluencerPage = () => {
  const { id } = useParams<{ id: string }>();

  if (!id) {
    return (
      <DashboardLayout activeItem="Influencers">
        <div className="text-center py-10">
          <p>Influencer ID is required.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout activeItem="Influencers">
      <InfluencerDetail />
    </DashboardLayout>
  );
};

export default InfluencerPage;
