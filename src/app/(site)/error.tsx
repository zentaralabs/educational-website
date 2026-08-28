"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-16">
      <h1 className="font-display text-3xl font-semibold text-ink text-balance">
        Something went wrong on our end
      </h1>
      <p className="mt-4 font-body text-base leading-relaxed text-slate">
        This page failed to load. It is usually temporary. Try again, and if it
        keeps happening let us know at{" "}
        <a
          href="mailto:admin@wheretoapply.xyz"
          className="text-status-open underline underline-offset-2"
        >
          admin@wheretoapply.xyz
        </a>
        .
      </p>

      <div className="mt-8 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-lg bg-ink px-5 py-2.5 font-body text-sm font-semibold text-paper transition-transform duration-150 hover:-translate-y-0.5"
        >
          Try again
        </button>
        <Link
          href="/"
          className="rounded-lg border border-line bg-paper px-5 py-2.5 font-body text-sm font-medium text-ink transition-transform duration-150 hover:-translate-y-0.5"
        >
          Go to homepage
        </Link>
      </div>
    </main>
  );
}
