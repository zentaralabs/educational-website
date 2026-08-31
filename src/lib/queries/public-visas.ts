import { createPublicClient } from "@/lib/supabase/public";
import type { Database } from "@/lib/supabase/types";

export type PublicVisaListRow = {
  slug: string;
  code: string;
  name: string;
  category: string;
  stream: string | null;
  short_description: string | null;
  is_points_tested: boolean;
  min_points: number | null;
  stay_period: string | null;
  leads_to_pr: boolean;
  base_application_charge: string | null;
  processing_time: string | null;
  last_verified_at: string | null;
};

const LIST_COLUMNS =
  "slug, code, name, category, stream, short_description, is_points_tested, min_points, stay_period, leads_to_pr, base_application_charge, processing_time, last_verified_at";

export async function listPublishedVisas(): Promise<PublicVisaListRow[]> {
  const supabase = createPublicClient(["visa_subclasses:list"]);
  const { data, error } = await supabase
    .from("visa_subclasses")
    .select(LIST_COLUMNS)
    .eq("status", "published")
    .order("code");
  if (error) throw error;
  return (data ?? []) as PublicVisaListRow[];
}

export async function listPublishedVisaSlugs(): Promise<string[]> {
  const rows = await listPublishedVisas();
  return rows.map((r) => r.slug);
}

/** slug + updated_at for the sitemap's per-page `lastmod`. */
export async function listPublishedVisaSlugsForSitemap(): Promise<
  { slug: string; updatedAt: string | null }[]
> {
  const supabase = createPublicClient(["visa_subclasses:list"]);
  const { data, error } = await supabase
    .from("visa_subclasses")
    .select("slug, updated_at")
    .eq("status", "published");
  if (error) throw error;
  return ((data ?? []) as { slug: string; updated_at: string | null }[]).map(
    (r) => ({ slug: r.slug, updatedAt: r.updated_at }),
  );
}

export type PublicVisaRow = Database["public"]["Tables"]["visa_subclasses"]["Row"] & {
  author: { name: string; bio: string | null; credentials: string | null } | null;
  reviewed_by: { name: string } | null;
};

export async function getPublishedVisa(slug: string): Promise<PublicVisaRow | null> {
  const supabase = createPublicClient([`visa:${slug}`, "visa_subclasses:list"]);
  const { data, error } = await supabase
    .from("visa_subclasses")
    .select(
      "*, author:authors!author_id(name, bio, credentials), reviewed_by:authors!reviewed_by_id(name)",
    )
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  if (error) throw error;
  return data as unknown as PublicVisaRow | null;
}

export type PublicInvitationRound = {
  id: string;
  round_date: string;
  visa_code: string;
  stream: string | null;
  invitations_issued: number | null;
  min_points: number | null;
  occupation_notes: string | null;
  program_year: string | null;
  notes: string | null;
  is_estimated: boolean;
  last_verified_at: string | null;
  source_url: string | null;
  visa: { slug: string; name: string } | null;
};

const ROUND_COLUMNS =
  "id, round_date, visa_code, stream, invitations_issued, min_points, occupation_notes, program_year, notes, is_estimated, last_verified_at, source_url, visa:visa_subclasses!visa_subclass_id(slug, name)";

export async function listPublishedInvitationRounds(opts: {
  visaCode?: string;
  limit?: number;
} = {}): Promise<PublicInvitationRound[]> {
  const supabase = createPublicClient(["invitation_rounds:list"]);
  let query = supabase
    .from("invitation_rounds")
    .select(ROUND_COLUMNS)
    .eq("status", "published")
    .order("round_date", { ascending: false });

  if (opts.visaCode) query = query.eq("visa_code", opts.visaCode);
  if (opts.limit) query = query.limit(opts.limit);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as unknown as PublicInvitationRound[];
}
