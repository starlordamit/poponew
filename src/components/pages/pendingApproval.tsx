import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { AlertCircle, Clock, LogOut } from "lucide-react";
import { useAuth } from "../../../supabase/auth";

const PendingApprovalPage = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="h-20 w-20 rounded-full bg-yellow-100 flex items-center justify-center">
            <Clock className="h-10 w-10 text-yellow-600" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Account Pending Approval
        </h1>

        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-yellow-600 mr-2 mt-0.5" />
            <p className="text-yellow-800 text-sm">
              Your account is currently pending approval from an administrator.
              You'll be notified once your account has been approved.
            </p>
          </div>
        </div>

        <p className="text-gray-600 mb-6">
          If you believe this is an error or have any questions, please contact
          your administrator.
        </p>

        <Button variant="outline" className="w-full" onClick={handleSignOut}>
          <LogOut className="h-4 w-4 mr-2" /> Sign Out
        </Button>
      </div>
    </div>
  );
};

export default PendingApprovalPage;
