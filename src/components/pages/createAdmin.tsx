import React from "react";
import DirectAdminCreator from "../auth/DirectAdminCreator";

const CreateAdminPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <h1 className="text-2xl font-bold text-center mb-6">Admin Setup</h1>
        <DirectAdminCreator />
      </div>
    </div>
  );
};

export default CreateAdminPage;
