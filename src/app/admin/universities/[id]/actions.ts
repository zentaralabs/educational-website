"use server";

import { revalidatePath, revalidateTag } from "next/cache";

/**
 * Public pages fetch universities tagged `university:${slug}` and
 * `universities:list` (see src/lib/supabase/public.ts) with a 1hr Data
 * Cache lifetime. The Supabase DB webhook (src/app/api/revalidate) is the
 * production path for busting that cache, but admin saves call this
 * directly too so edits show up immediately regardless of webhook config.
 */
export async function revalidateUniversity(slug: string, previousSlug?: string) {
  revalidateTag(`university:${slug}`, "max");
  revalidateTag("universities:list", "max");
  revalidatePath(`/universities/${slug}`);
  if (previousSlug && previousSlug !== slug) {
    revalidateTag(`university:${previousSlug}`, "max");
    revalidatePath(`/universities/${previousSlug}`);
  }
}
