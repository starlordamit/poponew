import React from "react";
import { useAuth } from "../../../supabase/auth";
import { AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface SimplePermissionGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const SimplePermissionGuard: React.FC<SimplePermissionGuardProps> = ({
  children,
  fallback,
}) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-40 w-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!user) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="flex flex-col items-center justify-center h-40 w-full border rounded-md bg-muted/10 p-6">
        <AlertCircle className="h-8 w-8 text-destructive mb-4" />
        <p className="text-destructive font-medium mb-2">Access Denied</p>
        <p className="text-muted-foreground text-center mb-4">
          You need to be logged in to access this feature.
        </p>
        <Button variant="outline" onClick={() => navigate("/login")}>
          Go to Login
        </Button>
      </div>
    );
  }

  return <>{children}</>;
};

export default SimplePermissionGuard;
