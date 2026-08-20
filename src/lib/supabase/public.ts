import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./types";

/**
 * Anon, cookie-free client for public SSG/ISR pages. A plain cookie-based
 * client (see server.ts) would force every render dynamic; this one carries
 * no request-scoped state, so Next can cache and revalidate it per-tag.
 *
 * Pass the same tag names the revalidate webhook produces (see
 * src/app/api/revalidate/route.ts) — e.g. `university:${slug}` and
 * `universities:list` — so an admin publish action invalidates exactly the
 * pages that read that row.
 */
export function createPublicClient(tags: string[] = []) {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: { persistSession: false },
      global: {
        fetch: (input, init) =>
          fetch(input, { ...init, next: { tags, revalidate: 3600 } }),
      },
    },
  );
}
