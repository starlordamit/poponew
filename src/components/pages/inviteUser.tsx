import React from "react";
import DashboardLayout from "../dashboard/layout/DashboardLayout";
import InviteUserForm from "../auth/InviteUserForm";
import PermissionGuard from "../auth/PermissionGuard";

const InviteUserPage = () => {
  return (
    <DashboardLayout activeItem="Users">
      <PermissionGuard
        requiredPermissions={["user_management"]}
        fallback={
          <div className="flex flex-col items-center justify-center h-64 w-full border rounded-md bg-muted/10 p-6">
            <AlertCircle className="h-12 w-12 text-destructive mb-4" />
            <h2 className="text-xl font-bold mb-2">Access Denied</h2>
            <p className="text-muted-foreground text-center mb-4">
              You don't have permission to invite users. This feature is
              restricted to administrators only.
            </p>
            <p className="text-sm text-muted-foreground">
              Error code: not_admin
            </p>
          </div>
        }
      >
        <div className="max-w-md mx-auto py-8">
          <InviteUserForm />
        </div>
      </PermissionGuard>
    </DashboardLayout>
  );
};

export default InviteUserPage;
