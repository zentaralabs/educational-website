import type { PolicyUpdateCategory } from "@/lib/supabase/types";
import { createPublicClient } from "@/lib/supabase/public";

export type PublicPolicyUpdate = {
  id: string;
  slug: string;
  title: string;
  category: PolicyUpdateCategory;
  announced_date: string;
  effective_date: string | null;
  summary: string;
  impact: string | null;
  affects: string[] | null;
  detail_url: string | null;
  source_urls: string[];
  is_estimated: boolean;
  last_verified_at: string | null;
};

const COLUMNS =
  "id, slug, title, category, announced_date, effective_date, summary, impact, affects, detail_url, source_urls, is_estimated, last_verified_at";

/** The whole log, newest change first — for the /updates page. */
export async function listPublishedPolicyUpdates(): Promise<PublicPolicyUpdate[]> {
  const supabase = createPublicClient(["policy_updates:list"]);
  const { data, error } = await supabase
    .from("policy_updates")
    .select(COLUMNS)
    .eq("status", "published")
    .order("announced_date", { ascending: false });

  if (error) throw error;
  return (data ?? []) as unknown as PublicPolicyUpdate[];
}

/**
 * The single most recent confirmed change — for the homepage strip. Excludes
 * `is_estimated` rows: the strip says "latest update", which should be
 * something that has actually happened.
 */
export async function listLatestPolicyUpdate(): Promise<PublicPolicyUpdate | null> {
  const supabase = createPublicClient(["policy_updates:list"]);
  const { data, error } = await supabase
    .from("policy_updates")
    .select(COLUMNS)
    .eq("status", "published")
    .eq("is_estimated", false)
    .order("announced_date", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return (data as unknown as PublicPolicyUpdate) ?? null;
}

/**
 * How long a change stays "fresh" enough to surface on the homepage. Past
 * this the /updates page still lists it, but the homepage strip is hidden so
 * it never shows a stale "latest update".
 */
const HOMEPAGE_STRIP_MAX_AGE_DAYS = 56;

export function isFreshForHomepage(update: Pick<PublicPolicyUpdate, "announced_date">): boolean {
  const ageMs = Date.now() - new Date(update.announced_date).getTime();
  return ageMs <= HOMEPAGE_STRIP_MAX_AGE_DAYS * 24 * 60 * 60 * 1000;
}
