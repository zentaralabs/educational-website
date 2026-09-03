"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

/**
 * `?next=` decides where a successful sign-in lands, and it comes from the
 * URL, so it is attacker-controlled: `/login?next=https://evil.example` (or
 * the protocol-relative `//evil.example`) would otherwise turn this form into
 * an open redirect on a domain the victim just typed a password into — the
 * standard setup for a credential-phishing hop.
 *
 * Only a single-slash, same-origin path is allowed through; anything else
 * falls back to the admin dashboard.
 */
function safeNext(raw: string | null): string {
  if (!raw) return "/admin";
  // Reject absolute URLs, protocol-relative URLs, and backslash variants that
  // some browsers normalise to "//".
  if (!raw.startsWith("/") || raw.startsWith("//") || raw.startsWith("/\\")) {
    return "/admin";
  }
  return raw;
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    router.push(safeNext(searchParams.get("next")));
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full max-w-sm flex-col gap-4 rounded-md border border-ink/15 p-6"
    >
      <div>
        <h1 className="font-display text-xl font-semibold text-ink">
          Admin sign in
        </h1>
        <p className="mt-1 font-body text-sm text-slate">
          University Guidance Platform
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

      <label className="block">
        <span className="mb-1 block font-body text-xs font-semibold tracking-wide text-slate uppercase">
          Password
        </span>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-md border border-ink/20 bg-paper px-3 py-1.5 font-body text-sm text-ink focus-visible:border-status-open"
        />
      </label>

      {error && (
        <p className="font-body text-sm text-status-closed">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="rounded-md bg-ink px-3 py-2 font-body text-sm font-medium text-paper transition-opacity duration-150 hover:opacity-90 disabled:opacity-50"
      >
        {loading ? "Signing in…" : "Sign in"}
      </button>

      <Link
        href="/forgot-password"
        className="text-center font-body text-sm text-slate underline underline-offset-2 hover:text-ink"
      >
        Forgot password?
      </Link>
    </form>
  );
}
