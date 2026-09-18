import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

/**
 * Public write — used from the homepage signup form. Re-submitting the same
 * address is a silent no-op (ignoreDuplicates), never an error, so the form
 * can't be used to probe whether an address is already subscribed.
 */
export async function subscribeEmail(
  supabase: SupabaseClient<Database>,
  input: { email: string; source?: string },
) {
  const email = input.email.trim().toLowerCase();
  const { error } = await supabase
    .from("email_subscribers")
    .upsert(
      { email, source: input.source ?? "homepage" },
      { onConflict: "email", ignoreDuplicates: true },
    );
  if (error) throw error;
}
