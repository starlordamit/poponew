import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { PostgrestError } from "@supabase/supabase-js";

export function useSupabaseData<T>(
  tableName: string,
  options?: {
    columns?: string;
    filter?: { column: string; value: any };
    orderBy?: { column: string; ascending?: boolean };
    limit?: number;
    relationships?: string[];
  },
) {
  const [data, setData] = useState<T[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<PostgrestError | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      try {
        let query = supabase.from(tableName).select(options?.columns || "*");

        // Add relationships if specified
        if (options?.relationships && options.relationships.length > 0) {
          const relationshipString = options.relationships.join(",");
          query = supabase
            .from(tableName)
            .select(`${options?.columns || "*"}, ${relationshipString}`);
        }

        // Add filter if specified
        if (options?.filter) {
          query = query.eq(options.filter.column, options.filter.value);
        }

        // Add order by if specified
        if (options?.orderBy) {
          query = query.order(options.orderBy.column, {
            ascending: options.orderBy.ascending ?? true,
          });
        }

        // Add limit if specified
        if (options?.limit) {
          query = query.limit(options.limit);
        }

        const { data: result, error } = await query;

        if (error) {
          setError(error);
          setData(null);
        } else {
          setData(result as T[]);
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
  }, [
    tableName,
    options?.columns,
    options?.filter?.column,
    options?.filter?.value,
    options?.orderBy?.column,
    options?.orderBy?.ascending,
    options?.limit,
  ]);

  const refetch = async () => {
    setLoading(true);

    try {
      let query = supabase.from(tableName).select(options?.columns || "*");

      // Add relationships if specified
      if (options?.relationships && options.relationships.length > 0) {
        const relationshipString = options.relationships.join(",");
        query = supabase
          .from(tableName)
          .select(`${options?.columns || "*"}, ${relationshipString}`);
      }

      // Add filter if specified
      if (options?.filter) {
        query = query.eq(options.filter.column, options.filter.value);
      }

      // Add order by if specified
      if (options?.orderBy) {
        query = query.order(options.orderBy.column, {
          ascending: options.orderBy.ascending ?? true,
        });
      }

      // Add limit if specified
      if (options?.limit) {
        query = query.limit(options.limit);
      }

      const { data: result, error } = await query;

      if (error) {
        setError(error);
        setData(null);
      } else {
        setData(result as T[]);
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
