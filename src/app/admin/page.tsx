import Link from "next/link";
import { ContentStatusBadge } from "@/components/admin/ContentStatusBadge";

// Widgets depend on new Date() (stale content, time-ago, upcoming cycles) —
// force per-request rendering so this doesn't get frozen at build time.
export const dynamic = "force-dynamic";
import { listRecentActivity } from "@/lib/queries/activity";
import { getStaleContent, getUpcomingDeadlines } from "@/lib/queries/dashboard";
import { getReviewQueue } from "@/lib/queries/review-queue";
import { createClient } from "@/lib/supabase/server";

function WidgetCard({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-md border border-ink/15 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-body text-xs font-semibold tracking-wide text-slate uppercase">
          {title}
        </h2>
        {action}
      </div>
      {children}
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return <p className="font-body text-sm text-slate">{label}</p>;
}

function timeAgo(iso: string, now: Date): string {
  const then = new Date(iso);
  const minutes = Math.floor((now.getTime() - then.getTime()) / 60000);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default async function AdminDashboard() {
  const now = new Date();
  const supabase = await createClient();
  const [stale, upcoming, reviewQueue, activity] = await Promise.all([
    getStaleContent(supabase, now),
    getUpcomingDeadlines(supabase, now),
    getReviewQueue(supabase),
    listRecentActivity(supabase, 5),
  ]);

  return (
    <div className="p-8">
      <h1 className="mb-6 font-display text-2xl font-semibold text-ink">
        Dashboard
      </h1>

      <div className="mb-6 flex flex-wrap gap-2">
        <Link
          href="/admin/universities"
          className="rounded-md bg-ink px-3 py-1.5 font-body text-sm font-medium text-paper transition-opacity duration-150 hover:opacity-90"
        >
          New university
        </Link>
        <Link
          href="/admin/deadlines"
          className="rounded-md border border-ink/20 px-3 py-1.5 font-body text-sm text-ink transition-colors duration-150 hover:border-status-open"
        >
          New deadline
        </Link>
        <Link
          href="/admin/guides"
          className="rounded-md border border-ink/20 px-3 py-1.5 font-body text-sm text-ink transition-colors duration-150 hover:border-status-open"
        >
          New guide
        </Link>
        <Link
          href="/admin/scholarships"
          className="rounded-md border border-ink/20 px-3 py-1.5 font-body text-sm text-ink transition-colors duration-150 hover:border-status-open"
        >
          New scholarship
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <WidgetCard
          title={`Review queue (${reviewQueue.length})`}
          action={
            <Link
              href="/admin/review-queue"
              className="font-body text-xs text-status-open hover:underline"
            >
              View all →
            </Link>
          }
        >
          {reviewQueue.length === 0 ? (
            <EmptyState label="Nothing awaiting review." />
          ) : (
            <ul className="flex flex-col gap-2">
              {reviewQueue.slice(0, 5).map((item) => (
                <li key={`${item.entityType}-${item.id}`}>
                  <Link
                    href={item.href}
                    className="flex items-center justify-between gap-3 font-body text-sm text-ink hover:underline"
                  >
                    <span className="truncate">{item.title}</span>
                    <ContentStatusBadge status={item.status} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </WidgetCard>

        <WidgetCard title={`Stale content (${stale.length})`}>
          {stale.length === 0 ? (
            <EmptyState label="Nothing overdue for a re-check." />
          ) : (
            <ul className="flex flex-col gap-2">
              {stale.slice(0, 5).map((item) => (
                <li key={`${item.entityType}-${item.id}`}>
                  <Link
                    href={item.href}
                    className="flex items-center justify-between gap-3 font-body text-sm text-ink hover:underline"
                  >
                    <span className="truncate">{item.title}</span>
                    <span className="shrink-0 font-utility text-xs text-status-closed">
                      {Math.floor(item.daysStale / 30)}mo stale
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </WidgetCard>

        <WidgetCard title={`Upcoming admissions cycles (${upcoming.length})`}>
          {upcoming.length === 0 ? (
            <EmptyState label="Nothing closing in the next 30 days." />
          ) : (
            <ul className="flex flex-col gap-2">
              {upcoming.map((d) => (
                <li
                  key={d.id}
                  className="flex items-center justify-between gap-3 font-body text-sm text-ink"
                >
                  <span className="truncate">
                    {d.universityName} — {d.deadlineType}
                  </span>
                  <span className="shrink-0 font-utility text-xs text-status-pending">
                    {d.daysUntil === 0 ? "today" : `in ${d.daysUntil}d`}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </WidgetCard>

        <WidgetCard title="Recent activity">
          {activity.length === 0 ? (
            <EmptyState label="No activity yet." />
          ) : (
            <ul className="flex flex-col gap-2.5">
              {activity.map((a) => (
                <li key={a.id} className="font-body text-sm text-ink">
                  <span className="text-slate">{a.author?.name ?? "Someone"}</span> —{" "}
                  {a.detail}
                  <span className="ml-2 font-utility text-xs text-slate">
                    {timeAgo(a.created_at, now)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </WidgetCard>
      </div>
    </div>
  );
}
