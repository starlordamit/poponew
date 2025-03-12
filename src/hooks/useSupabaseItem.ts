import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { PostgrestError } from "@supabase/supabase-js";

export function useSupabaseItem<T>(
  tableName: string,
  id: string,
  options?: {
    columns?: string;
    relationships?: string[];
  },
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<PostgrestError | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        let query = supabase
          .from(tableName)
          .select(options?.columns || "*")
          .eq("id", id)
          .single();

        // Add relationships if specified
        if (options?.relationships && options.relationships.length > 0) {
          const relationshipString = options.relationships.join(",");
          query = supabase
            .from(tableName)
            .select(`${options?.columns || "*"}, ${relationshipString}`)
            .eq("id", id)
            .single();
        }

        const { data: result, error } = await query;

        if (error) {
          setError(error);
          setData(null);
        } else {
          setData(result as T);
          setError(null);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err as PostgrestError);
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [tableName, id, options?.columns]);

  const refetch = async () => {
    if (!id) return;

    setLoading(true);

    try {
      let query = supabase
        .from(tableName)
        .select(options?.columns || "*")
        .eq("id", id)
        .single();

      // Add relationships if specified
      if (options?.relationships && options.relationships.length > 0) {
        const relationshipString = options.relationships.join(",");
        query = supabase
          .from(tableName)
          .select(`${options?.columns || "*"}, ${relationshipString}`)
          .eq("id", id)
          .single();
      }

      const { data: result, error } = await query;

      if (error) {
        setError(error);
        setData(null);
      } else {
        setData(result as T);
        setError(null);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err as PostgrestError);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, refetch };
}
