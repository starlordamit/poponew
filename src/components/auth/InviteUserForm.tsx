import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, CheckCircle, AlertCircle, Copy, Mail } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useSuperAdmin } from "@/hooks/useSuperAdmin";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const InviteUserForm = () => {
  // No longer checking for super admin status since we've updated the permissions
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("manager");
  const [loading, setLoading] = useState(false);
  const [invitation, setInvitation] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setInvitation(null);

    try {
      // Create invitation in the database
      const { data, error } = await supabase
        .from("invitations")
        .insert({
          email,
          role,
          created_by: (await supabase.auth.getUser()).data.user?.id,
        })
        .select()
        .single();

      if (error) throw error;

      setInvitation(data);
      toast({
        title: "Invitation created",
        description: `Successfully created invitation for ${email}`,
      });
    } catch (err: any) {
      console.error("Error creating invitation:", err);
      setError(
        err.message || "An error occurred while creating the invitation",
      );
      toast({
        title: "Error",
        description: err.message || "Failed to create invitation",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyInvitationLink = () => {
    if (!invitation) return;

    const inviteUrl = `${window.location.origin}/accept-invite?token=${invitation.token}`;
    navigator.clipboard.writeText(inviteUrl);

    toast({
      title: "Link copied",
      description: "Invitation link copied to clipboard",
    });
  };

  const sendInvitationEmail = async () => {
    if (!invitation) return;

    try {
      const inviteUrl = `${window.location.origin}/accept-invite?token=${invitation.token}`;

      // Call a serverless function to send email (you would need to implement this)
      const { error } = await supabase.functions.invoke(
        "send-invitation-email",
        {
          body: { email: invitation.email, inviteUrl, role: invitation.role },
        },
      );

      if (error) throw error;

      toast({
        title: "Email sent",
        description: `Invitation email sent to ${invitation.email}`,
      });
    } catch (err: any) {
      console.error("Error sending invitation email:", err);
      toast({
        title: "Error",
        description:
          "Failed to send invitation email. You can still copy the link manually.",
        variant: "destructive",
      });
    }
  };

  // All authenticated users can now invite others

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Invite User</CardTitle>
      </CardHeader>
      <CardContent>
        {!invitation ? (
          <form onSubmit={handleInviteUser} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger id="role">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="operation_manager">
                    Operation Manager
                  </SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                  <SelectItem value="intern">Intern</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating
                  Invitation...
                </>
              ) : (
                "Create Invitation"
              )}
            </Button>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="p-3 bg-green-100 text-green-800 rounded-md flex items-start">
              <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Invitation Created!</p>
                <p className="text-sm">
                  Send this invitation link to the user:
                </p>
              </div>
            </div>

            <div className="p-3 border rounded-md bg-muted/10">
              <p className="text-sm font-medium mb-1">Invitation Details:</p>
              <p className="text-sm">Email: {invitation.email}</p>
              <p className="text-sm">Role: {invitation.role}</p>
              <p className="text-sm">
                Expires: {new Date(invitation.expires_at).toLocaleString()}
              </p>
            </div>

            <div className="flex space-x-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={copyInvitationLink}
              >
                <Copy className="mr-2 h-4 w-4" /> Copy Link
              </Button>
              <Button className="flex-1" onClick={sendInvitationEmail}>
                <Mail className="mr-2 h-4 w-4" /> Send Email
              </Button>
            </div>

            <Button
              variant="ghost"
              className="w-full"
              onClick={() => {
                setInvitation(null);
                setEmail("");
              }}
            >
              Create Another Invitation
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

export default InviteUserForm;
