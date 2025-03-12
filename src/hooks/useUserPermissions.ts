import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

// Define permission types
export type Permission =
  | "manage_brands"
  | "manage_influencers"
  | "manage_campaigns"
  | "manage_finances"
  | "view_finances"
  | "process_payments"
  | "view_brand_price"
  | "edit_deliverables"
  | "view_analytics"
  | "admin_settings"
  | "user_management";

// Define role types
export type UserRole =
  | "admin"
  | "manager"
  | "operation_manager"
  | "finance"
  | "intern";

// Default permissions for each role
const DEFAULT_ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: [
    "manage_brands",
    "manage_influencers",
    "manage_campaigns",
    "manage_finances",
    "view_finances",
    "process_payments",
    "view_brand_price",
    "edit_deliverables",
    "view_analytics",
    "admin_settings",
    "user_management",
  ],
  manager: [
    "manage_brands",
    "manage_influencers",
    "manage_campaigns",
    "manage_finances",
    "view_finances",
    "process_payments",
    "view_brand_price",
    "edit_deliverables",
    "view_analytics",
    "admin_settings",
  ],
  operation_manager: [
    "manage_influencers",
    "manage_campaigns",
    "edit_deliverables",
    "view_finances",
    "view_analytics",
  ],
  finance: [
    "view_finances",
    "manage_finances",
    "process_payments",
    "view_brand_price",
    "view_analytics",
  ],
  intern: ["manage_influencers", "edit_deliverables"],
};

export function useUserPermissions() {
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserPermissions = async () => {
      try {
        setLoading(true);

        // Get current user
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) throw userError;
        if (!user) {
          setError("User not authenticated");
          return;
        }

        // Get user role from database
        const { data: roleData, error: roleError } = await supabase
          .from("user_roles")
          .select("role, permissions")
          .eq("user_id", user.id)
          .single();

        if (roleError && roleError.code !== "PGRST116") {
          // PGRST116 is the error code for no rows returned
          throw roleError;
        }

        // If no role found in database, check user metadata
        let role: UserRole | null = null;
        let userPermissions: Permission[] = [];

        if (roleData) {
          role = roleData.role as UserRole;
          // Use custom permissions if available, otherwise use defaults
          userPermissions = roleData.permissions?.length
            ? (roleData.permissions as Permission[])
            : DEFAULT_ROLE_PERMISSIONS[role];
        } else if (user.app_metadata?.role) {
          // Fallback to app_metadata
          role = user.app_metadata.role as UserRole;
          userPermissions = DEFAULT_ROLE_PERMISSIONS[role] || [];
        } else if (user.user_metadata?.role) {
          // Fallback to user_metadata
          role = user.user_metadata.role as UserRole;
          userPermissions = DEFAULT_ROLE_PERMISSIONS[role] || [];
        }

        if (!role) {
          setError("User role not found");
          return;
        }

        setUserRole(role);
        setPermissions(userPermissions);
        setError(null);
      } catch (err) {
        console.error("Error fetching user permissions:", err);
        setError("Failed to load user permissions");
      } finally {
        setLoading(false);
      }
    };

    fetchUserPermissions();
  }, []);

  // Check if user has a specific permission
  const hasPermission = (permission: Permission): boolean => {
    return permissions.includes(permission);
  };

  // Check if user has any of the specified permissions
  const hasAnyPermission = (requiredPermissions: Permission[]): boolean => {
    return requiredPermissions.some((permission) =>
      permissions.includes(permission),
    );
  };

  // Check if user has all of the specified permissions
  const hasAllPermissions = (requiredPermissions: Permission[]): boolean => {
    return requiredPermissions.every((permission) =>
      permissions.includes(permission),
    );
  };

  return {
    userRole,
    permissions,
    loading,
    error,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
  };
}
