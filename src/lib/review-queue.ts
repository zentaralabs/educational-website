// Aggregates draft/needs_review rows across all content types into one
// unified queue — PROJECT_STATUS.md Section 6.7. Once Supabase is wired up,
// this becomes a query unioning the four tables on the shared
// `content_status` enum instead of merging in-memory mock arrays.

import { MOCK_UNIVERSITIES, type ContentStatus } from "./mock-admin-data";
import { MOCK_DEADLINES } from "./mock-deadlines-data";
import { MOCK_GUIDES } from "./mock-guides-data";
import { MOCK_SCHOLARSHIPS } from "./mock-scholarships-data";

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

export function getReviewQueue(): ReviewQueueItem[] {
  const items: ReviewQueueItem[] = [
    ...MOCK_UNIVERSITIES.filter((u) => REVIEWABLE.includes(u.status)).map(
      (u) => ({
        id: u.id,
        entityType: "university" as const,
        title: u.name,
        status: u.status,
        lastVerifiedAt: u.lastVerifiedAt,
        author: u.author,
        href: `/admin/universities/${u.id}`,
      }),
    ),
    ...MOCK_DEADLINES.filter((d) => REVIEWABLE.includes(d.status)).map(
      (d) => ({
        id: d.id,
        entityType: "deadline" as const,
        title: `${d.universityName} — ${d.deadlineType}`,
        status: d.status,
        lastVerifiedAt: d.lastVerifiedAt,
        author: null,
        href: `/admin/deadlines`,
      }),
    ),
    ...MOCK_GUIDES.filter((g) => REVIEWABLE.includes(g.status)).map((g) => ({
      id: g.id,
      entityType: "guide" as const,
      title: g.title,
      status: g.status,
      lastVerifiedAt: g.lastVerifiedAt,
      author: g.author,
      href: `/admin/guides/${g.id}`,
    })),
    ...MOCK_SCHOLARSHIPS.filter((s) => REVIEWABLE.includes(s.status)).map(
      (s) => ({
        id: s.id,
        entityType: "scholarship" as const,
        title: s.name,
        status: s.status,
        lastVerifiedAt: s.lastVerifiedAt,
        author: null,
        href: `/admin/scholarships/${s.id}`,
      }),
    ),
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
