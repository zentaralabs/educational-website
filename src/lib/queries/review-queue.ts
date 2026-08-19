import type { SupabaseClient } from "@supabase/supabase-js";
import type { ContentStatus, Database } from "@/lib/supabase/types";

export type EntityType = "university" | "deadline" | "guide" | "scholarship";

export type ReviewQueueItem = {
  id: string;
  entityType: EntityType;
  title: string;
  status: ContentStatus;
  lastVerifiedAt: string | null;
  author: string | null;
  href: string;
};

const REVIEWABLE: ContentStatus[] = ["draft", "needs_review"];

export async function getReviewQueue(
  supabase: SupabaseClient<Database>,
): Promise<ReviewQueueItem[]> {
  const [universities, deadlines, guides, scholarships] = await Promise.all([
    supabase
      .from("universities")
      .select("id, name, status, last_verified_at, author:authors!author_id(name)")
      .in("status", REVIEWABLE),
    supabase
      .from("deadlines")
      .select("id, status, last_verified_at, deadline_type:deadline_types(name), university:universities(name)")
      .in("status", REVIEWABLE),
    supabase
      .from("guides")
      .select("id, title, status, last_verified_at, author:authors!author_id(name)")
      .in("status", REVIEWABLE),
    supabase
      .from("scholarships")
      .select("id, name, status, last_verified_at")
      .in("status", REVIEWABLE),
  ]);

  if (universities.error) throw universities.error;
  if (deadlines.error) throw deadlines.error;
  if (guides.error) throw guides.error;
  if (scholarships.error) throw scholarships.error;

  type UniversityRow = {
    id: string;
    name: string;
    status: ContentStatus;
    last_verified_at: string | null;
    author: { name: string } | null;
  };
  type DeadlineRow = {
    id: string;
    status: ContentStatus;
    last_verified_at: string | null;
    deadline_type: { name: string } | null;
    university: { name: string } | null;
  };
  type GuideRow = {
    id: string;
    title: string;
    status: ContentStatus;
    last_verified_at: string | null;
    author: { name: string } | null;
  };
  type ScholarshipRow = {
    id: string;
    name: string;
    status: ContentStatus;
    last_verified_at: string | null;
  };

  const universityRows = (universities.data ?? []) as unknown as UniversityRow[];
  const deadlineRows = (deadlines.data ?? []) as unknown as DeadlineRow[];
  const guideRows = (guides.data ?? []) as unknown as GuideRow[];
  const scholarshipRows = (scholarships.data ?? []) as unknown as ScholarshipRow[];

  const items: ReviewQueueItem[] = [
    ...universityRows.map((u) => ({
      id: u.id,
      entityType: "university" as const,
      title: u.name,
      status: u.status,
      lastVerifiedAt: u.last_verified_at,
      author: u.author?.name ?? null,
      href: `/admin/universities/${u.id}`,
    })),
    ...deadlineRows.map((d) => ({
      id: d.id,
      entityType: "deadline" as const,
      title: `${d.university?.name ?? "Deadline"} — ${d.deadline_type?.name ?? ""}`,
      status: d.status,
      lastVerifiedAt: d.last_verified_at,
      author: null,
      href: `/admin/deadlines`,
    })),
    ...guideRows.map((g) => ({
      id: g.id,
      entityType: "guide" as const,
      title: g.title,
      status: g.status,
      lastVerifiedAt: g.last_verified_at,
      author: g.author?.name ?? null,
      href: `/admin/guides/${g.id}`,
    })),
    ...scholarshipRows.map((s) => ({
      id: s.id,
      entityType: "scholarship" as const,
      title: s.name,
      status: s.status,
      lastVerifiedAt: s.last_verified_at,
      author: null,
      href: `/admin/scholarships/${s.id}`,
    })),
  ];

  // Oldest-first: never-verified rows are the highest priority, then
  // ascending by last_verified_at.
  return items.sort((a, b) => {
    if (a.lastVerifiedAt === b.lastVerifiedAt) return 0;
    if (a.lastVerifiedAt === null) return -1;
    if (b.lastVerifiedAt === null) return 1;
    return a.lastVerifiedAt.localeCompare(b.lastVerifiedAt);
  });
}
