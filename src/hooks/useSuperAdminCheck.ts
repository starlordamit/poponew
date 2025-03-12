import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export function useSuperAdminCheck() {
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkSuperAdminStatus = async () => {
      try {
        setLoading(true);

        // Get current user
        const { data: userData, error: userError } =
          await supabase.auth.getUser();

        if (userError) throw userError;
        if (!userData.user) {
          setIsSuperAdmin(false);
          return;
        }

        // Call the edge function to check super admin status
        const { data, error } = await supabase.functions.invoke(
          "check-super-admin",
          {
            body: { userId: userData.user.id },
          },
        );

        if (error) throw error;

        setIsSuperAdmin(data.isSuperAdmin === true);
      } catch (err: any) {
        console.error("Error checking super admin status:", err);
        setError(err.message || "Failed to verify super admin status");
        setIsSuperAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkSuperAdminStatus();
  }, []);

  return { isSuperAdmin, loading, error };
}
