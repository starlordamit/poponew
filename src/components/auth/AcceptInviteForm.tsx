import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, CheckCircle, AlertCircle, UserPlus } from "lucide-react";
import { supabase } from "@/lib/supabase";
import AuthLayout from "./AuthLayout";

const AcceptInviteForm = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();
  const { toast } = useToast();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [validatingToken, setValidatingToken] = useState(true);
  const [invitation, setInvitation] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Validate the invitation token
  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setError("Invalid invitation link. No token provided.");
        setValidatingToken(false);
        return;
      }

      try {
        // Check if the invitation exists and is valid
        const { data, error } = await supabase
          .from("invitations")
          .select("*")
          .eq("token", token)
          .is("used_at", null)
          .gt("expires_at", new Date().toISOString())
          .single();

        if (error) throw error;
        if (!data) throw new Error("Invitation not found or has expired");

        setInvitation(data);
        setEmail(data.email);
      } catch (err: any) {
        console.error("Error validating invitation:", err);
        setError(err.message || "Invalid or expired invitation");
      } finally {
        setValidatingToken(false);
      }
    };

    validateToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      // 1. Create the user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role: invitation.role,
          },
        },
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("Failed to create user");

      // 2. Add user role to the database
      const { error: roleError } = await supabase.from("user_roles").insert({
        user_id: authData.user.id,
        role: invitation.role,
        permissions: getDefaultPermissionsForRole(invitation.role),
      });

      if (roleError) throw roleError;

      // 3. Mark the invitation as used
      const { error: inviteError } = await supabase
        .from("invitations")
        .update({ used_at: new Date().toISOString() })
        .eq("id", invitation.id);

      if (inviteError) throw inviteError;

      // Success! Redirect to login page
      toast({
        title: "Account created",
        description:
          "Your account has been created successfully. You can now log in.",
      });

      navigate("/login");
    } catch (err: any) {
      console.error("Error accepting invitation:", err);
      setError(err.message || "An error occurred while creating your account");
      toast({
        title: "Error",
        description: err.message || "Failed to create account",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Get default permissions for a role
  const getDefaultPermissionsForRole = (role: string): string[] => {
    switch (role) {
      case "admin":
        return [
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
        ];
      case "manager":
        return [
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
        ];
      case "operation_manager":
        return [
          "manage_influencers",
          "manage_campaigns",
          "edit_deliverables",
          "view_finances",
          "view_analytics",
        ];
      case "finance":
        return [
          "view_finances",
          "manage_finances",
          "process_payments",
          "view_brand_price",
          "view_analytics",
        ];
      case "intern":
        return ["manage_influencers", "edit_deliverables"];
      default:
        return [];
    }
  };

  if (validatingToken) {
    return (
      <AuthLayout>
        <Card className="w-full">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">
              Validating Invitation
            </CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </CardContent>
        </Card>
      </AuthLayout>
    );
  }

  if (error && !invitation) {
    return (
      <AuthLayout>
        <Card className="w-full">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center text-destructive">
              Invalid Invitation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center py-4">
              <AlertCircle className="h-12 w-12 text-destructive mb-4" />
              <p className="text-center mb-4">{error}</p>
              <Button onClick={() => navigate("/login")}>Go to Login</Button>
            </div>
          </CardContent>
        </Card>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <Card className="w-full">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center flex items-center justify-center gap-2">
            <UserPlus className="h-5 w-5" /> Accept Invitation
          </CardTitle>
          {invitation && (
            <CardDescription className="text-center">
              You've been invited to join as a{" "}
              <span className="font-medium">{invitation.role}</span>
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                disabled
                className="bg-muted/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating
                  Account...
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </AuthLayout>
  );
};

export default AcceptInviteForm;
