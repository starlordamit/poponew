import React from "react";
import { useUserPermissions, Permission } from "@/hooks/useUserPermissions";
import { AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface PermissionGuardProps {
  children: React.ReactNode;
  requiredPermissions: Permission[];
  requireAll?: boolean;
  fallback?: React.ReactNode;
}

const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  requiredPermissions,
  requireAll = false,
  fallback,
}) => {
  const { loading, error, hasAnyPermission, hasAllPermissions } =
    useUserPermissions();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-40 w-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Checking permissions...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-40 w-full">
        <AlertCircle className="h-8 w-8 text-destructive mb-4" />
        <p className="text-destructive font-medium mb-2">Permission Error</p>
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button variant="outline" onClick={() => navigate("/")}>
          Return to Home
        </Button>
      </div>
    );
  }

  const hasPermission = requireAll
    ? hasAllPermissions(requiredPermissions)
    : hasAnyPermission(requiredPermissions);

  if (!hasPermission) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="flex flex-col items-center justify-center h-40 w-full border rounded-md bg-muted/10 p-6">
        <AlertCircle className="h-8 w-8 text-destructive mb-4" />
        <p className="text-destructive font-medium mb-2">Access Denied</p>
        <p className="text-muted-foreground text-center mb-4">
          You don't have permission to access this feature.
          {requireAll
            ? " All of the following permissions are required: "
            : " At least one of the following permissions is required: "}
          <span className="font-medium">{requiredPermissions.join(", ")}</span>
        </p>
        <Button variant="outline" onClick={() => navigate(-1)}>
          Go Back
        </Button>
      </div>
    );
  }

  return <>{children}</>;
};

export default PermissionGuard;
