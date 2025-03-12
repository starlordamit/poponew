import { useState, useEffect } from "react";
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
  | "admin_settings";

// Define role types
export type UserRole =
  | "admin"
  | "brand_manager"
  | "influencer_manager"
  | "finance"
  | "user";

export function useRoleBasedAccess() {
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserRole = async () => {
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
          setLoading(false);
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

        if (roleData) {
          setUserRole(roleData.role as UserRole);
          setPermissions((roleData.permissions as Permission[]) || []);
        } else {
          // Fallback to user metadata if no role in database
          const role = (user.user_metadata?.role as UserRole) || "user";
          setUserRole(role);
          setPermissions([]);
        }

        setError(null);
      } catch (err: any) {
        console.error("Error fetching user role:", err);
        setError("Failed to load user role");
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
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
