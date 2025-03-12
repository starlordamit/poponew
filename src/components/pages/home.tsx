import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Settings,
  User,
  Users,
  Building2,
  BarChart3,
  DollarSign,
} from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../supabase/auth";

export default function LandingPage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      <header className="fixed top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/" className="font-bold text-xl">
              InfluencerConnect CRM
            </Link>
          </div>
          <nav className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center gap-4">
                <Link to="/dashboard">
                  <Button variant="ghost">Dashboard</Button>
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`}
                          alt={user.email || ""}
                        />
                        <AvatarFallback>
                          {user.email?.[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="hidden md:inline-block">
                        {user.email}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onSelect={() => signOut()}>
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost">Sign In</Button>
                </Link>
                <Link to="/signup">
                  <Button>Get Started</Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4">
        <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center">
          <div className="relative">
            {/* Gradient orbs */}
            <div className="absolute -top-24 -z-10 h-[300px] w-[300px] rounded-full bg-purple-500/20 blur-[100px]" />
            <div className="absolute -right-24 -top-48 -z-10 h-[300px] w-[300px] rounded-full bg-blue-500/20 blur-[100px]" />

            <div className="flex flex-col items-center justify-center space-y-8 text-center">
              <h1 className="animate-fade-up bg-gradient-to-br from-foreground to-muted-foreground bg-clip-text text-6xl font-bold tracking-tight text-transparent sm:text-7xl">
                Brand-Influencer Management Platform
              </h1>

              <p className="max-w-[700px] animate-fade-up text-muted-foreground/80 md:text-xl">
                Streamline your influencer marketing campaigns with our
                comprehensive CRM solution.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 w-full max-w-5xl">
                <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center text-center">
                  <div className="bg-blue-100 p-3 rounded-full mb-4">
                    <Building2 className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">
                    Brand Management
                  </h3>
                  <p className="text-gray-600">
                    Organize and track all your brand partnerships in one
                    centralized location.
                  </p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center text-center">
                  <div className="bg-purple-100 p-3 rounded-full mb-4">
                    <Users className="h-8 w-8 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">
                    Influencer Roster
                  </h3>
                  <p className="text-gray-600">
                    Manage your influencer relationships and track performance
                    metrics.
                  </p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center text-center">
                  <div className="bg-green-100 p-3 rounded-full mb-4">
                    <BarChart3 className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">
                    Campaign Analytics
                  </h3>
                  <p className="text-gray-600">
                    Track campaign performance with detailed analytics and
                    reporting tools.
                  </p>
                </div>
              </div>

              <div className="mt-8">
                {!user && (
                  <Link to="/signup">
                    <Button size="lg" className="mr-4">
                      Get Started
                    </Button>
                  </Link>
                )}
                {user && (
                  <Link to="/dashboard">
                    <Button size="lg">Go to Dashboard</Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
