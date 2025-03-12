import React, { ReactNode } from "react";
import { UserButton } from "@/components/dashboard/UserButton";
import Sidebar from "./Sidebar";
import TopNavigation from "./TopNavigation";

interface DashboardLayoutProps {
  children: ReactNode;
  activeItem?: string;
}

const DashboardLayout = ({
  children,
  activeItem = "Dashboard",
}: DashboardLayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      <TopNavigation />
      <div className="flex h-[calc(100vh-64px)] mt-16">
        <Sidebar activeItem={activeItem} />
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto p-6 space-y-6">
            {children}
            <div className="w-0 h-0"></div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
