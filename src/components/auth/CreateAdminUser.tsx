import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";

const CreateAdminUser = () => {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Get the Supabase URL from the client
      const supabaseUrl = supabase.supabaseUrl;

      // Call the edge function to create an admin user
      const response = await fetch(
        `${supabaseUrl}/functions/v1/add-admin-user`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${supabase.supabaseKey}`,
          },
          body: JSON.stringify({
            email,
            password,
            name,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create admin user");
      }

      setResult(data);
      toast({
        title: "Admin user created",
        description: `Successfully created admin user: ${email}`,
      });
    } catch (err: any) {
      console.error("Error creating admin user:", err);
      setError(
        err.message || "An error occurred while creating the admin user",
      );
      toast({
        title: "Error",
        description: err.message || "Failed to create admin user",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Create Admin User</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleCreateAdmin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="Admin User"
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
              "Create Admin User"
            )}
          </Button>
        </form>

        {error && (
          <div className="mt-4 p-3 bg-destructive/10 text-destructive rounded-md flex items-start">
            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Error</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        {result && (
          <div className="mt-4 p-3 bg-green-100 text-green-800 rounded-md flex items-start">
            <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Success!</p>
              <p className="text-sm">Admin user created successfully.</p>
              <p className="text-xs mt-1">User ID: {result.user?.id}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CreateAdminUser;
