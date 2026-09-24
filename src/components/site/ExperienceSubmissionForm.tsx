"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { submitExperience } from "@/lib/queries/experience-submissions";

/**
 * Reader-facing intake for first-hand experience content (see
 * supabase/migrations/0035_add_experience_submissions.sql). Writes straight
 * to the database as a pending row — nothing here publishes automatically.
 * An editor reviews it and, if it holds up, hand-writes the FieldNotes copy
 * on the relevant page from what the reader described.
 */
export function ExperienceSubmissionForm({
  defaultPagePath,
  defaultPageLabel,
}: {
  defaultPagePath: string;
  defaultPageLabel?: string;
}) {
  const [pagePath, setPagePath] = useState(defaultPagePath);
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [contributorName, setContributorName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [portalStep, setPortalStep] = useState("");
  const [surprisedNotes, setSurprisedNotes] = useState("");
  const [timelineNotes, setTimelineNotes] = useState("");
  const [consent, setConsent] = useState(false);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!consent) {
      setErrorMsg("Please check the consent box to submit.");
      return;
    }
    setSaving(true);
    setErrorMsg(null);
    try {
      const supabase = createClient();
      await submitExperience(supabase, {
        page_path: pagePath,
        page_label: defaultPageLabel ?? null,
        is_anonymous: isAnonymous,
        contributor_name: isAnonymous ? null : contributorName || null,
        contact_email: contactEmail || null,
        portal_step: portalStep || null,
        surprised_notes: surprisedNotes,
        timeline_notes: timelineNotes || null,
        consent: true,
      });
      setDone(true);
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : "Could not submit. Try again.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-xl border border-status-open/30 bg-status-open/5 px-5 py-4 font-body text-sm text-ink">
        Thanks. This has gone to an editor for review. If it holds up, it
        may be published (anonymized if you asked for that) on the relevant
        page. We won&rsquo;t publish anything without checking it first.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-5">
      <label className="block">
        <span className="mb-1 block font-body text-xs font-semibold tracking-wide text-slate uppercase">
          Which page is this about?
        </span>
        <input
          required
          value={pagePath}
          onChange={(e) => setPagePath(e.target.value)}
          placeholder="/visas/student-500"
          className="w-full rounded-md border border-ink/20 bg-paper px-3 py-1.5 font-body text-sm text-ink placeholder:text-slate/60 focus-visible:border-status-open"
        />
      </label>

      <label className="block">
        <span className="mb-1 block font-body text-xs font-semibold tracking-wide text-slate uppercase">
          Which step, if any? (optional)
        </span>
        <input
          value={portalStep}
          onChange={(e) => setPortalStep(e.target.value)}
          placeholder="e.g. CoE upload, biometrics booking, VEVO check"
          className="w-full rounded-md border border-ink/20 bg-paper px-3 py-1.5 font-body text-sm text-ink placeholder:text-slate/60 focus-visible:border-status-open"
        />
      </label>

      <label className="block">
        <span className="mb-1 block font-body text-xs font-semibold tracking-wide text-slate uppercase">
          What surprised you, or what would you tell someone about to do this?
        </span>
        <textarea
          required
          value={surprisedNotes}
          onChange={(e) => setSurprisedNotes(e.target.value)}
          rows={5}
          placeholder="Be as specific as you can. Real details are what make this useful to the next person."
          className="w-full rounded-md border border-ink/20 bg-paper px-3 py-1.5 font-body text-sm text-ink placeholder:text-slate/60 focus-visible:border-status-open"
        />
      </label>

      <label className="block">
        <span className="mb-1 block font-body text-xs font-semibold tracking-wide text-slate uppercase">
          Rough timeline (optional)
        </span>
        <textarea
          value={timelineNotes}
          onChange={(e) => setTimelineNotes(e.target.value)}
          rows={3}
          placeholder="e.g. lodged mid-March, biometrics early April, grant early June"
          className="w-full rounded-md border border-ink/20 bg-paper px-3 py-1.5 font-body text-sm text-ink placeholder:text-slate/60 focus-visible:border-status-open"
        />
      </label>

      <div className="flex items-center gap-2">
        <input
          id="anon"
          type="checkbox"
          checked={isAnonymous}
          onChange={(e) => setIsAnonymous(e.target.checked)}
          className="h-4 w-4"
        />
        <label htmlFor="anon" className="font-body text-sm text-ink">
          Publish this anonymously (recommended)
        </label>
      </div>

      {!isAnonymous && (
        <label className="block">
          <span className="mb-1 block font-body text-xs font-semibold tracking-wide text-slate uppercase">
            Name to credit
          </span>
          <input
            value={contributorName}
            onChange={(e) => setContributorName(e.target.value)}
            className="w-full rounded-md border border-ink/20 bg-paper px-3 py-1.5 font-body text-sm text-ink focus-visible:border-status-open"
          />
        </label>
      )}

      <label className="block">
        <span className="mb-1 block font-body text-xs font-semibold tracking-wide text-slate uppercase">
          Email (optional, only so an editor can follow up, never published)
        </span>
        <input
          type="email"
          value={contactEmail}
          onChange={(e) => setContactEmail(e.target.value)}
          className="w-full rounded-md border border-ink/20 bg-paper px-3 py-1.5 font-body text-sm text-ink focus-visible:border-status-open"
        />
      </label>

      <div className="flex items-start gap-2">
        <input
          id="consent"
          type="checkbox"
          required
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-0.5 h-4 w-4"
        />
        <label htmlFor="consent" className="font-body text-sm text-ink">
          I&rsquo;m sharing this to potentially be published on Where To
          Apply, anonymized if I asked for that above.
        </label>
      </div>

      {errorMsg && <p className="font-body text-xs text-status-closed">{errorMsg}</p>}

      <div>
        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-ink px-4 py-2 font-body text-sm font-medium text-paper transition-opacity duration-150 hover:opacity-90 disabled:opacity-50"
        >
          {saving ? "Submitting…" : "Submit"}
        </button>
      </div>
    </form>
  );
}
