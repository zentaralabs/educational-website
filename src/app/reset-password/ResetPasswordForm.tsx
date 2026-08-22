"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Status = "checking" | "ready" | "invalid" | "done";

export function ResetPasswordForm() {
  const router = useRouter();
  const [status, setStatus] = useState<Status>("checking");
  const [linkError, setLinkError] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Supabase's recovery link lands here with #error=... on an expired/used
    // link, or sets up a session (and fires PASSWORD_RECOVERY) on a valid one.
    // Queued (rather than called synchronously) so this reacts to the URL
    // like any other external-system read, not a plain render-time compute.
    const hashParams = new URLSearchParams(window.location.hash.slice(1));
    const hashError = hashParams.get("error_description");
    if (hashError) {
      queueMicrotask(() => {
        setLinkError(hashError.replace(/\+/g, " "));
        setStatus("invalid");
      });
      return;
    }

    const supabase = createClient();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setStatus("ready");
    });

    // The client parses the URL and establishes the session before this
    // effect runs, in most cases — this covers that race.
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setStatus((s) => (s === "checking" ? "ready" : s));
    });

    const timeout = setTimeout(() => {
      setStatus((s) => {
        if (s !== "checking") return s;
        setLinkError("This reset link is invalid or has expired.");
        return "invalid";
      });
    }, 3000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    setStatus("done");
    setTimeout(() => {
      router.push("/admin");
      router.refresh();
    }, 1500);
  }

  if (status === "checking") {
    return (
      <div className="w-full max-w-sm rounded-md border border-ink/15 p-6">
        <p className="font-body text-sm text-slate">Verifying reset link…</p>
      </div>
    );
  }

  if (status === "invalid") {
    return (
      <div className="flex w-full max-w-sm flex-col gap-4 rounded-md border border-ink/15 p-6">
        <h1 className="font-display text-xl font-semibold text-ink">
          Link invalid or expired
        </h1>
        <p className="font-body text-sm text-slate">{linkError}</p>
        <Link
          href="/forgot-password"
          className="font-body text-sm text-status-open underline underline-offset-2"
        >
          Request a new reset link
        </Link>
      </div>
    );
  }

  if (status === "done") {
    return (
      <div className="w-full max-w-sm rounded-md border border-ink/15 p-6">
        <h1 className="font-display text-xl font-semibold text-ink">
          Password updated
        </h1>
        <p className="mt-1 font-body text-sm text-slate">
          Taking you to the admin panel…
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
          Set a new password
        </h1>
      </div>

      <label className="block">
        <span className="mb-1 block font-body text-xs font-semibold tracking-wide text-slate uppercase">
          New password
        </span>
        <input
          type="password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-md border border-ink/20 bg-paper px-3 py-1.5 font-body text-sm text-ink focus-visible:border-status-open"
        />
      </label>

      <label className="block">
        <span className="mb-1 block font-body text-xs font-semibold tracking-wide text-slate uppercase">
          Confirm password
        </span>
        <input
          type="password"
          required
          minLength={8}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full rounded-md border border-ink/20 bg-paper px-3 py-1.5 font-body text-sm text-ink focus-visible:border-status-open"
        />
      </label>

      {error && <p className="font-body text-sm text-status-closed">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="rounded-md bg-ink px-3 py-2 font-body text-sm font-medium text-paper transition-opacity duration-150 hover:opacity-90 disabled:opacity-50"
      >
        {loading ? "Updating…" : "Update password"}
      </button>
    </form>
  );
}
