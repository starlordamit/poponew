import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, CheckCircle, AlertCircle, Shield } from "lucide-react";
import { supabase } from "@/lib/supabase";

const SuperAdminSetup = () => {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateSuperAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // 1. Create user with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role: "admin",
          },
        },
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("Failed to create user");

      // 2. Add super admin role directly to the database
      const { error: roleError } = await supabase.from("user_roles").insert({
        user_id: authData.user.id,
        role: "admin",
        is_super_admin: true,
        permissions: [
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
      });

      if (roleError) throw roleError;

      setSuccess(true);
      toast({
        title: "Super Admin created",
        description: `Successfully created super admin user: ${email}`,
      });
    } catch (err: any) {
      console.error("Error creating super admin:", err);
      setError(
        err.message || "An error occurred while creating the super admin user",
      );
      toast({
        title: "Error",
        description: err.message || "Failed to create super admin user",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" /> Create Super Admin
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!success ? (
          <form onSubmit={handleCreateSuperAdmin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="Super Admin"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
              />
              <p className="text-xs text-muted-foreground">
                Password must be at least 8 characters long
              </p>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...
                </>
              ) : (
                "Create Super Admin"
              )}
            </Button>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-green-100 text-green-800 rounded-md flex items-start">
              <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Super Admin Created!</p>
                <p className="text-sm">
                  The super admin user has been created successfully.
                </p>
                <p className="text-sm mt-2">Email: {email}</p>
              </div>
            </div>

            <Button
              className="w-full"
              onClick={() => {
                setSuccess(false);
                setEmail("");
                setPassword("");
                setName("");
              }}
            >
              Create Another Super Admin
            </Button>
          </div>
        )}

        {error && (
          <div className="mt-4 p-3 bg-destructive/10 text-destructive rounded-md flex items-start">
            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Error</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SuperAdminSetup;
