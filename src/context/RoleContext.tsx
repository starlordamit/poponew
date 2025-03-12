import React, { createContext, useContext, ReactNode } from "react";
import {
  useRoleBasedAccess,
  Permission,
  UserRole,
} from "@/hooks/useRoleBasedAccess";

interface RoleContextType {
  userRole: UserRole | null;
  permissions: Permission[];
  loading: boolean;
  error: string | null;
  hasPermission: (permission: Permission) => boolean;
  hasAnyPermission: (permissions: Permission[]) => boolean;
  hasAllPermissions: (permissions: Permission[]) => boolean;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export const RoleProvider = ({ children }: { children: ReactNode }) => {
  const roleAccess = useRoleBasedAccess();

  return (
    <RoleContext.Provider value={roleAccess}>{children}</RoleContext.Provider>
  );
};

export const useRole = (): RoleContextType => {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error("useRole must be used within a RoleProvider");
  }
  return context;
};
