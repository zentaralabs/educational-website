"use client";

import { useState } from "react";
import { setExperienceSubmissionStatus } from "@/lib/queries/experience-submissions";
import { createClient } from "@/lib/supabase/client";
import type { ExperienceSubmissionRow } from "@/lib/queries/experience-submissions";
import type { ExperienceSubmissionStatus } from "@/lib/supabase/types";

const STATUS_STYLES: Record<ExperienceSubmissionStatus, string> = {
  pending: "bg-status-pending/10 text-status-pending",
  approved: "bg-status-open/10 text-status-open",
  rejected: "bg-status-closed/10 text-status-closed",
};

function Row({ item }: { item: ExperienceSubmissionRow }) {
  const [status, setStatus] = useState(item.status);
  const [adminNotes, setAdminNotes] = useState(item.admin_notes ?? "");
  const [saving, setSaving] = useState(false);
  const [expanded, setExpanded] = useState(false);

  async function save(next: ExperienceSubmissionStatus) {
    setSaving(true);
    try {
      const supabase = createClient();
      await setExperienceSubmissionStatus(supabase, item.id, next, adminNotes || null);
      setStatus(next);
    } finally {
      setSaving(false);
    }
  }

  return (
    <tr className="border-b border-ink/10 align-top text-sm last:border-b-0">
      <td className="px-3 py-2.5">
        <p className="font-medium text-ink">{item.page_label ?? item.page_path}</p>
        <p className="font-utility text-xs text-slate">{item.page_path}</p>
      </td>
      <td className="px-3 py-2.5 text-slate">
        {item.is_anonymous ? "Anonymous" : item.contributor_name || "—"}
      </td>
      <td className="px-3 py-2.5">
        <span className={`rounded px-1.5 py-0.5 font-utility text-xs font-semibold uppercase ${STATUS_STYLES[status]}`}>
          {status}
        </span>
      </td>
      <td className="px-3 py-2.5 text-slate">
        {new Date(item.created_at).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })}
      </td>
      <td className="px-3 py-2.5 text-right">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="font-body text-xs font-medium text-status-open hover:underline"
        >
          {expanded ? "Hide" : "Review →"}
        </button>
      </td>
      {expanded && (
        <td colSpan={5} className="border-t border-ink/10 bg-ink/[0.02] px-3 py-4">
          {item.portal_step && (
            <p className="mb-2 font-body text-sm text-ink">
              <span className="font-semibold">Step: </span>
              {item.portal_step}
            </p>
          )}
          <p className="mb-2 font-body text-sm whitespace-pre-wrap text-ink">
            <span className="font-semibold">What surprised them: </span>
            {item.surprised_notes}
          </p>
          {item.timeline_notes && (
            <p className="mb-2 font-body text-sm whitespace-pre-wrap text-ink">
              <span className="font-semibold">Timeline: </span>
              {item.timeline_notes}
            </p>
          )}
          {item.contact_email && (
            <p className="mb-2 font-body text-xs text-slate">
              Contact: {item.contact_email}
            </p>
          )}
          <textarea
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            placeholder="Editor notes (why approved/rejected, what got cut, etc.)"
            rows={2}
            className="mt-2 w-full max-w-xl rounded-md border border-ink/20 bg-paper px-3 py-1.5 font-body text-sm text-ink placeholder:text-slate/60 focus-visible:border-status-open"
          />
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              disabled={saving}
              onClick={() => save("approved")}
              className="rounded-md bg-status-open px-3 py-1.5 font-body text-xs font-medium text-paper disabled:opacity-50"
            >
              Approve
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={() => save("rejected")}
              className="rounded-md border border-ink/20 px-3 py-1.5 font-body text-xs font-medium text-ink disabled:opacity-50"
            >
              Reject
            </button>
            {status !== "pending" && (
              <button
                type="button"
                disabled={saving}
                onClick={() => save("pending")}
                className="rounded-md border border-ink/20 px-3 py-1.5 font-body text-xs font-medium text-slate disabled:opacity-50"
              >
                Reset to pending
              </button>
            )}
          </div>
        </td>
      )}
    </tr>
  );
}

export function ExperienceSubmissionsTable({
  items,
}: {
  items: ExperienceSubmissionRow[];
}) {
  if (items.length === 0) {
    return (
      <p className="font-body text-sm text-slate">
        No submissions yet.
      </p>
    );
  }

  return (
    <div className="overflow-hidden rounded-md border border-ink/15">
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="border-b border-ink/15 bg-ink/[0.03]">
            <th className="px-3 py-2 font-body text-xs font-semibold tracking-wide text-slate uppercase">Page</th>
            <th className="px-3 py-2 font-body text-xs font-semibold tracking-wide text-slate uppercase">From</th>
            <th className="px-3 py-2 font-body text-xs font-semibold tracking-wide text-slate uppercase">Status</th>
            <th className="px-3 py-2 font-body text-xs font-semibold tracking-wide text-slate uppercase">Submitted</th>
            <th className="px-3 py-2" />
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <Row key={item.id} item={item} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
