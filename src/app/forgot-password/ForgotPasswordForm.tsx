"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    setSent(true);
  }

  if (sent) {
    return (
      <div className="flex w-full max-w-sm flex-col gap-4 rounded-md border border-ink/15 p-6">
        <h1 className="font-display text-xl font-semibold text-ink">
          Check your email
        </h1>
        <p className="font-body text-sm text-slate">
          If an account exists for {email}, a password reset link is on its
          way. It expires within an hour, so use it soon after it arrives.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full max-w-sm flex-col gap-4 rounded-md border border-ink/15 p-6"
    >
      <div>
        <h1 className="font-display text-xl font-semibold text-ink">
          Reset password
        </h1>
        <p className="mt-1 font-body text-sm text-slate">
          Enter your admin email and we&rsquo;ll send you a reset link.
        </p>
      </div>

      <label className="block">
        <span className="mb-1 block font-body text-xs font-semibold tracking-wide text-slate uppercase">
          Email
        </span>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-md border border-ink/20 bg-paper px-3 py-1.5 font-body text-sm text-ink focus-visible:border-status-open"
        />
      </label>

      {error && <p className="font-body text-sm text-status-closed">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="rounded-md bg-ink px-3 py-2 font-body text-sm font-medium text-paper transition-opacity duration-150 hover:opacity-90 disabled:opacity-50"
      >
        {loading ? "Sending…" : "Send reset link"}
      </button>
    </form>
  );
}
