import React from "react";
import DashboardLayout from "../dashboard/layout/DashboardLayout";
import AssignmentList from "../assignments/AssignmentList";

const AssignmentsPage = () => {
  return (
    <DashboardLayout activeItem="Assignments">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Direct Assignments</h1>
          <p className="text-muted-foreground">
            Manage direct assignments between brands and influencers
          </p>
        </div>
        <AssignmentList />
      </div>
    </DashboardLayout>
  );
};

export default AssignmentsPage;
