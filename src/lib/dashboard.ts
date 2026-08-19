// Aggregates the "stale content" and "upcoming admissions cycle" dashboard
// widgets across content types. Once Supabase is wired up these become
// queries instead of in-memory filters over the mock arrays.

import { MOCK_UNIVERSITIES } from "./mock-admin-data";
import { MOCK_DEADLINES } from "./mock-deadlines-data";
import { MOCK_GUIDES } from "./mock-guides-data";
import { MOCK_SCHOLARSHIPS } from "./mock-scholarships-data";
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

export function getStaleContent(now: Date = new Date()): StaleItem[] {
  const items: StaleItem[] = [
    ...MOCK_UNIVERSITIES.filter((u) => u.lastVerifiedAt).map((u) => ({
      id: u.id,
      entityType: "university" as const,
      title: u.name,
      lastVerifiedAt: u.lastVerifiedAt as string,
      daysStale: daysBetween(u.lastVerifiedAt as string, now),
      href: `/admin/universities/${u.id}`,
    })),
    ...MOCK_GUIDES.filter((g) => g.lastVerifiedAt).map((g) => ({
      id: g.id,
      entityType: "guide" as const,
      title: g.title,
      lastVerifiedAt: g.lastVerifiedAt as string,
      daysStale: daysBetween(g.lastVerifiedAt as string, now),
      href: `/admin/guides/${g.id}`,
    })),
    ...MOCK_SCHOLARSHIPS.filter((s) => s.lastVerifiedAt).map((s) => ({
      id: s.id,
      entityType: "scholarship" as const,
      title: s.name,
      lastVerifiedAt: s.lastVerifiedAt as string,
      daysStale: daysBetween(s.lastVerifiedAt as string, now),
      href: `/admin/scholarships/${s.id}`,
    })),
  ];

  return items
    .filter((i) => i.daysStale >= STALE_THRESHOLD_DAYS)
    .sort((a, b) => b.daysStale - a.daysStale);
}

export type UpcomingDeadline = {
  id: string;
  universityName: string;
  deadlineType: string;
  deadlineDate: string;
  daysUntil: number;
};

export function getUpcomingDeadlines(
  now: Date = new Date(),
): UpcomingDeadline[] {
  return MOCK_DEADLINES.filter((d) => !d.isRolling)
    .map((d) => ({
      id: d.id,
      universityName: d.universityName,
      deadlineType: d.deadlineType,
      deadlineDate: d.deadlineDate,
      daysUntil: -daysBetween(d.deadlineDate, now),
    }))
    .filter((d) => d.daysUntil >= 0 && d.daysUntil <= UPCOMING_WINDOW_DAYS)
    .sort((a, b) => a.daysUntil - b.daysUntil);
}
