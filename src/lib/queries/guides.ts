import type { SupabaseClient } from "@supabase/supabase-js";
import type { ContentStatus, Database } from "@/lib/supabase/types";

export type GuideListRow = {
  id: string;
  slug: string;
  title: string;
  category: string;
  status: ContentStatus;
  qa_facts_verified: boolean;
  qa_sentence_variation_checked: boolean;
  qa_firsthand_detail_added: boolean;
  author: { name: string } | null;
};

export async function listGuides(
  supabase: SupabaseClient<Database>,
): Promise<GuideListRow[]> {
  const { data, error } = await supabase
    .from("guides")
    .select(
      "id, slug, title, category, status, qa_facts_verified, qa_sentence_variation_checked, qa_firsthand_detail_added, author:authors!author_id(name)",
    )
    .order("title");

  if (error) throw error;
  return (data ?? []) as unknown as GuideListRow[];
}

export type GuideDetailRow = Database["public"]["Tables"]["guides"]["Row"] & {
  author: { name: string } | null;
};

export async function getGuide(
  supabase: SupabaseClient<Database>,
  id: string,
): Promise<GuideDetailRow | null> {
  const { data, error } = await supabase
    .from("guides")
    .select("*, author:authors!author_id(name)")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data as unknown as GuideDetailRow | null;
}

export async function updateGuide(
  supabase: SupabaseClient<Database>,
  id: string,
  patch: Database["public"]["Tables"]["guides"]["Update"],
) {
  const { error } = await supabase.from("guides").update(patch).eq("id", id);
  if (error) throw error;
}
