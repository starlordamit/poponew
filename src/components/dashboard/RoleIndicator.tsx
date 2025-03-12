import React from "react";
import { Badge } from "@/components/ui/badge";
import { useRole } from "@/context/RoleContext";
import { Shield, User, Building2, Users, DollarSign } from "lucide-react";

const RoleIndicator = () => {
  const { userRole, loading } = useRole();

  if (loading || !userRole) return null;

  const getRoleIcon = () => {
    switch (userRole) {
      case "admin":
        return <Shield className="h-3 w-3 mr-1" />;
      case "brand_manager":
        return <Building2 className="h-3 w-3 mr-1" />;
      case "influencer_manager":
        return <Users className="h-3 w-3 mr-1" />;
      case "finance":
        return <DollarSign className="h-3 w-3 mr-1" />;
      default:
        return <User className="h-3 w-3 mr-1" />;
    }
  };

  const getRoleBadgeColor = () => {
    switch (userRole) {
      case "admin":
        return "bg-purple-100 text-purple-800";
      case "brand_manager":
        return "bg-blue-100 text-blue-800";
      case "influencer_manager":
        return "bg-orange-100 text-orange-800";
      case "finance":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getRoleLabel = () => {
    switch (userRole) {
      case "admin":
        return "Admin";
      case "brand_manager":
        return "Brand Manager";
      case "influencer_manager":
        return "Influencer Manager";
      case "finance":
        return "Finance";
      default:
        return "User";
    }
  };

  return (
    <Badge className={`${getRoleBadgeColor()} flex items-center`}>
      {getRoleIcon()}
      {getRoleLabel()}
    </Badge>
  );
};

export default RoleIndicator;
