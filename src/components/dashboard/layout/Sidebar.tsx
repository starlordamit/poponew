import React from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Link } from "react-router-dom";
import {
  Home,
  LayoutDashboard,
  Building2,
  Users,
  Settings,
  HelpCircle,
  BarChart3,
  DollarSign,
  Video,
  Shield,
} from "lucide-react";

interface NavItem {
  icon: React.ReactNode;
  label: string;
  href: string;
}

interface SidebarProps {
  activeItem?: string;
}

const navItems: NavItem[] = [
  { icon: <Home size={20} />, label: "Home", href: "/" },
  {
    icon: <LayoutDashboard size={20} />,
    label: "Dashboard",
    href: "/dashboard",
  },
  { icon: <Building2 size={20} />, label: "Brands", href: "/brands" },
  { icon: <Users size={20} />, label: "Influencers", href: "/influencers" },
  { icon: <Video size={20} />, label: "Campaigns", href: "/campaigns" },
  { icon: <Users size={20} />, label: "Assignments", href: "/assignments" },
  { icon: <BarChart3 size={20} />, label: "Analytics", href: "/analytics" },
  { icon: <DollarSign size={20} />, label: "Finances", href: "/finances" },
];

const bottomItems: NavItem[] = [
  { icon: <Settings size={20} />, label: "Settings", href: "/settings" },
  { icon: <HelpCircle size={20} />, label: "Help", href: "/help" },
];

const Sidebar = ({ activeItem = "Dashboard" }: SidebarProps) => {
  return (
    <div className="w-[280px] h-full bg-background border-r flex flex-col">
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-2">InfluencerConnect</h2>
        <p className="text-sm text-muted-foreground">
          Brand-Influencer Management
        </p>
      </div>

      <ScrollArea className="flex-1 px-4">
        <div className="space-y-2">
          {navItems.map((item) => (
            <Link to={item.href} key={item.label}>
              <Button
                variant={item.label === activeItem ? "secondary" : "ghost"}
                className="w-full justify-start gap-2"
              >
                {item.icon}
                {item.label}
              </Button>
            </Link>
          ))}
        </div>

        <Separator className="my-4" />

        <div className="space-y-2">
          <h3 className="text-sm font-medium px-4 py-2">Campaign Status</h3>
          <Button variant="ghost" className="w-full justify-start gap-2">
            🟢 Active Campaigns
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-2">
            🔴 Pending Approval
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-2">
            🟡 In Progress
          </Button>
        </div>
      </ScrollArea>

      <div className="p-4 mt-auto border-t">
        {bottomItems.map((item) => (
          <Link to={item.href} key={item.label}>
            <Button
              variant={item.label === activeItem ? "secondary" : "ghost"}
              className="w-full justify-start gap-2 mb-2"
            >
              {item.icon}
              {item.label}
            </Button>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
