import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";
import type { EntityType } from "./review-queue";

const STALE_THRESHOLD_DAYS = 365;
const UPCOMING_WINDOW_DAYS = 30;

export type StaleItem = {
  id: string;
  entityType: EntityType;
  title: string;
  lastVerifiedAt: string;
  daysStale: number;
  href: string;
};

function daysBetween(iso: string, now: Date): number {
  const then = new Date(`${iso}T00:00:00`);
  return Math.floor((now.getTime() - then.getTime()) / (1000 * 60 * 60 * 24));
}

function cutoffDate(now: Date): string {
  const d = new Date(now);
  d.setDate(d.getDate() - STALE_THRESHOLD_DAYS);
  return d.toISOString().slice(0, 10);
}

export async function getStaleContent(
  supabase: SupabaseClient<Database>,
  now: Date = new Date(),
): Promise<StaleItem[]> {
  const cutoff = cutoffDate(now);

  const [universities, guides, scholarships] = await Promise.all([
    supabase
      .from("universities")
      .select("id, name, last_verified_at")
      .not("last_verified_at", "is", null)
      .lt("last_verified_at", cutoff),
    supabase
      .from("guides")
      .select("id, title, last_verified_at")
      .not("last_verified_at", "is", null)
      .lt("last_verified_at", cutoff),
    supabase
      .from("scholarships")
      .select("id, name, last_verified_at")
      .not("last_verified_at", "is", null)
      .lt("last_verified_at", cutoff),
  ]);

  if (universities.error) throw universities.error;
  if (guides.error) throw guides.error;
  if (scholarships.error) throw scholarships.error;

  const items: StaleItem[] = [
    ...(universities.data ?? []).map((u) => ({
      id: u.id,
      entityType: "university" as const,
      title: u.name,
      lastVerifiedAt: u.last_verified_at as string,
      daysStale: daysBetween(u.last_verified_at as string, now),
      href: `/admin/universities/${u.id}`,
    })),
    ...(guides.data ?? []).map((g) => ({
      id: g.id,
      entityType: "guide" as const,
      title: g.title,
      lastVerifiedAt: g.last_verified_at as string,
      daysStale: daysBetween(g.last_verified_at as string, now),
      href: `/admin/guides/${g.id}`,
    })),
    ...(scholarships.data ?? []).map((s) => ({
      id: s.id,
      entityType: "scholarship" as const,
      title: s.name,
      lastVerifiedAt: s.last_verified_at as string,
      daysStale: daysBetween(s.last_verified_at as string, now),
      href: `/admin/scholarships/${s.id}`,
    })),
  ];

  return items.sort((a, b) => b.daysStale - a.daysStale);
}

export type UpcomingDeadline = {
  id: string;
  universityName: string;
  deadlineType: string;
  deadlineDate: string;
  daysUntil: number;
};

export async function getUpcomingDeadlines(
  supabase: SupabaseClient<Database>,
  now: Date = new Date(),
): Promise<UpcomingDeadline[]> {
  const today = now.toISOString().slice(0, 10);
  const windowEnd = new Date(now);
  windowEnd.setDate(windowEnd.getDate() + UPCOMING_WINDOW_DAYS);
  const windowEndStr = windowEnd.toISOString().slice(0, 10);

  const { data, error } = await supabase
    .from("deadlines")
    .select("id, deadline_date, is_rolling, deadline_type:deadline_types(name), university:universities(name)")
    .eq("is_rolling", false)
    .gte("deadline_date", today)
    .lte("deadline_date", windowEndStr)
    .order("deadline_date");

  if (error) throw error;

  type DeadlineRow = {
    id: string;
    deadline_date: string;
    deadline_type: { name: string } | null;
    university: { name: string } | null;
  };
  const rows = (data ?? []) as unknown as DeadlineRow[];

  return rows.map((d) => ({
    id: d.id,
    universityName: d.university?.name ?? "—",
    deadlineType: d.deadline_type?.name ?? "",
    deadlineDate: d.deadline_date,
    daysUntil: -daysBetween(d.deadline_date, now),
  }));
}
