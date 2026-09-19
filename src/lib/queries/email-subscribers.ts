import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

/**
 * Public write — used from the homepage signup form. Re-submitting the same
 * address is a silent no-op (caught 23505 unique-violation), never an
 * error, so the form can't be used to probe whether an address is already
 * subscribed.
 *
 * Deliberately plain insert() + explicit `return=minimal`, not upsert()
 * with `ignoreDuplicates`. Verified against this project's Supabase
 * gateway: combining `resolution=ignore-duplicates` with `return=minimal`
 * in one Prefer header (which is what upsert()'s ignoreDuplicates does)
 * silently fails to apply *either* preference, so the request falls back
 * to representation — which then 401s under this table's staff-only
 * SELECT policy, since email_subscribers has no anon-readable rows. A
 * bare `return=minimal` alone works fine; see git history for the
 * request-level verification if this ever needs re-checking.
 */
export async function subscribeEmail(
  supabase: SupabaseClient<Database>,
  input: { email: string; source?: string },
) {
  const email = input.email.trim().toLowerCase();
  const { error } = await supabase
    .from("email_subscribers")
    .insert({ email, source: input.source ?? "homepage" })
    .setHeader("Prefer", "return=minimal");
  if (error && error.code !== "23505") throw error;
}
