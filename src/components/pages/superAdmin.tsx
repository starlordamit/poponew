import React from "react";
import SuperAdminSetup from "../auth/SuperAdminSetup";

const SuperAdminPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <h1 className="text-2xl font-bold text-center mb-6">
          Super Admin Setup
        </h1>
        <SuperAdminSetup />
      </div>
    </div>
  );
};

export default SuperAdminPage;
