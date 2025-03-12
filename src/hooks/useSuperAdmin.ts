import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export function useSuperAdmin() {
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkSuperAdmin = async () => {
      try {
        setLoading(true);

        // Get current user
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) throw userError;
        if (!user) {
          setIsSuperAdmin(false);
          return;
        }

        // Check if user is a super admin
        const { data, error: roleError } = await supabase
          .from("user_roles")
          .select("is_super_admin")
          .eq("user_id", user.id)
          .eq("role", "admin")
          .single();

        if (roleError && roleError.code !== "PGRST116") {
          throw roleError;
        }

        setIsSuperAdmin(data?.is_super_admin === true);
      } catch (err: any) {
        console.error("Error checking super admin status:", err);
        setError(err.message);
        setIsSuperAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkSuperAdmin();
  }, []);

  return { isSuperAdmin, loading, error };
}
