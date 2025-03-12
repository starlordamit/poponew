import React from "react";
import DashboardLayout from "../dashboard/layout/DashboardLayout";
import UserManagement from "../users/UserManagement";
import SimplePermissionGuard from "../auth/SimplePermissionGuard";

const UsersPage = () => {
  return (
    <DashboardLayout activeItem="Users">
      <SimplePermissionGuard>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold">User Management</h1>
            <p className="text-muted-foreground">
              Manage users and their permissions
            </p>
          </div>
          <UserManagement />
        </div>
      </SimplePermissionGuard>
    </DashboardLayout>
  );
};

export default UsersPage;
