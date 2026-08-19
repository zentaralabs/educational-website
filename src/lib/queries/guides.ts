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

export async function getGuideRelatedLinks(
  supabase: SupabaseClient<Database>,
  guideId: string,
) {
  const [relatedGuides, relatedUniversities] = await Promise.all([
    supabase
      .from("guide_related_guides")
      .select("related_guide_id")
      .eq("guide_id", guideId),
    supabase
      .from("guide_related_universities")
      .select("related_university_id")
      .eq("guide_id", guideId),
  ]);

  if (relatedGuides.error) throw relatedGuides.error;
  if (relatedUniversities.error) throw relatedUniversities.error;

  return {
    relatedGuideIds: (relatedGuides.data ?? []).map((r) => r.related_guide_id),
    relatedUniversityIds: (relatedUniversities.data ?? []).map(
      (r) => r.related_university_id,
    ),
  };
}

export async function syncGuideRelatedGuides(
  supabase: SupabaseClient<Database>,
  guideId: string,
  relatedGuideIds: string[],
) {
  const { error: deleteError } = await supabase
    .from("guide_related_guides")
    .delete()
    .eq("guide_id", guideId);
  if (deleteError) throw deleteError;

  if (relatedGuideIds.length === 0) return;

  const { error: insertError } = await supabase
    .from("guide_related_guides")
    .insert(relatedGuideIds.map((related_guide_id) => ({ guide_id: guideId, related_guide_id })));
  if (insertError) throw insertError;
}

export async function syncGuideRelatedUniversities(
  supabase: SupabaseClient<Database>,
  guideId: string,
  relatedUniversityIds: string[],
) {
  const { error: deleteError } = await supabase
    .from("guide_related_universities")
    .delete()
    .eq("guide_id", guideId);
  if (deleteError) throw deleteError;

  if (relatedUniversityIds.length === 0) return;

  const { error: insertError } = await supabase
    .from("guide_related_universities")
    .insert(
      relatedUniversityIds.map((related_university_id) => ({
        guide_id: guideId,
        related_university_id,
      })),
    );
  if (insertError) throw insertError;
}
