import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

export type ActivityRow = {
  id: number;
  entity_type: string;
  action: string;
  detail: string | null;
  created_at: string;
  author: { name: string } | null;
};

export async function listRecentActivity(
  supabase: SupabaseClient<Database>,
  limit = 5,
): Promise<ActivityRow[]> {
  const { data, error } = await supabase
    .from("activity_log")
    .select("id, entity_type, action, detail, created_at, author:authors(name)")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []) as unknown as ActivityRow[];
}

export async function logActivity(
  supabase: SupabaseClient<Database>,
  entry: Database["public"]["Tables"]["activity_log"]["Insert"],
) {
  const { error } = await supabase.from("activity_log").insert(entry);
  if (error) throw error;
}
