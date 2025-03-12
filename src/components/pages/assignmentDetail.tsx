import React from "react";
import DashboardLayout from "../dashboard/layout/DashboardLayout";
import AssignmentDetail from "../assignments/AssignmentDetail";

const AssignmentDetailPage = () => {
  return (
    <DashboardLayout activeItem="Assignments">
      <AssignmentDetail />
    </DashboardLayout>
  );
};

export default AssignmentDetailPage;
