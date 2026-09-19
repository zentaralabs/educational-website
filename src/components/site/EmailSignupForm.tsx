"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { subscribeEmail } from "@/lib/queries/email-subscribers";
import { trackEvent } from "@/lib/analytics";

export function EmailSignupForm({ source = "homepage" }: { source?: string }) {
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setErrorMsg(null);
    try {
      const supabase = createClient();
      await subscribeEmail(supabase, { email, source });
      trackEvent("email_signup", { source });
      setDone(true);
    } catch {
      setErrorMsg("Could not save that — try again.");
    } finally {
      setSaving(false);
    }
  }

  if (done) {
    return (
      <p className="font-body text-sm text-ink">
        You&rsquo;re on the list &mdash; we&rsquo;ll only email you when a
        deadline or visa rule actually changes.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-start gap-2">
      <label className="sr-only" htmlFor="email-signup-input">
        Email address
      </label>
      <input
        id="email-signup-input"
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        className="min-w-0 flex-1 rounded-md border border-ink/20 bg-paper px-3 py-1.5 font-body text-sm text-ink placeholder:text-slate/60 focus-visible:border-status-open"
      />
      <button
        type="submit"
        disabled={saving}
        className="flex-shrink-0 rounded-md bg-ink px-4 py-1.5 font-body text-sm font-medium text-paper transition-opacity duration-150 hover:opacity-90 disabled:opacity-50"
      >
        {saving ? "Saving…" : "Notify me"}
      </button>
      {errorMsg && (
        <p className="w-full font-body text-xs text-status-closed">
          {errorMsg}
        </p>
      )}
    </form>
  );
}
