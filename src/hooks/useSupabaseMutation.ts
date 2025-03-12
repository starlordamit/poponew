import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { PostgrestError } from "@supabase/supabase-js";

type MutationFunction<T> = (
  data: T,
) => Promise<{ data: any; error: PostgrestError | null }>;

export function useSupabaseMutation<T>(
  tableName: string,
  operation: "insert" | "update" | "delete" = "insert",
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<PostgrestError | null>(null);

  const mutate = async (
    data: T,
    id?: string,
  ): Promise<{ data: any; error: PostgrestError | null }> => {
    setLoading(true);
    setError(null);

    try {
      let result;

      switch (operation) {
        case "insert":
          result = await supabase.from(tableName).insert(data).select();
          break;
        case "update":
          if (!id) throw new Error("ID is required for update operation");
          result = await supabase
            .from(tableName)
            .update(data)
            .eq("id", id)
            .select();
          break;
        case "delete":
          if (!id) throw new Error("ID is required for delete operation");
          result = await supabase.from(tableName).delete().eq("id", id);
          break;
        default:
          throw new Error(`Unsupported operation: ${operation}`);
      }

      if (result.error) {
        setError(result.error);
        return { data: null, error: result.error };
      }

      return { data: result.data, error: null };
    } catch (err) {
      console.error(`Error during ${operation} operation:`, err);
      const postgrestError = err as PostgrestError;
      setError(postgrestError);
      return { data: null, error: postgrestError };
    } finally {
      setLoading(false);
    }
  };

  return { mutate, loading, error };
}
