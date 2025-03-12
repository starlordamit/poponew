import React from "react";
import { useSuperAdminCheck } from "@/hooks/useSuperAdminCheck";
import { AlertCircle, Loader2, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface SuperAdminGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const SuperAdminGuard: React.FC<SuperAdminGuardProps> = ({
  children,
  fallback,
}) => {
  const { isSuperAdmin, loading, error } = useSuperAdminCheck();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-40 w-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Verifying super admin access...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-40 w-full">
        <AlertCircle className="h-8 w-8 text-destructive mb-4" />
        <p className="text-destructive font-medium mb-2">Access Error</p>
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button variant="outline" onClick={() => navigate("/")}>
          Return to Home
        </Button>
      </div>
    );
  }

  if (!isSuperAdmin) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="flex flex-col items-center justify-center h-64 w-full border rounded-md bg-muted/10 p-6">
        <Shield className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-xl font-bold mb-2">Super Admin Access Required</h2>
        <p className="text-muted-foreground text-center mb-4">
          You don't have super admin privileges. This area is restricted to
          super administrators only.
        </p>
        <Button variant="outline" onClick={() => navigate(-1)}>
          Go Back
        </Button>
      </div>
    );
  }

  return <>{children}</>;
};

export default SuperAdminGuard;
