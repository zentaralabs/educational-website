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

/**
 * Programs are fetched tagged `programs:list` (the university's program
 * list) and `program:${slug}` (its own detail page) — bust both directly on
 * create/publish/status-change so the program list and its detail page
 * don't wait on the webhook, same reasoning as revalidateUniversity above.
 */
export async function revalidateProgram(programSlug: string, universitySlug: string) {
  revalidateTag(`program:${programSlug}`, "max");
  revalidateTag("programs:list", "max");
  revalidatePath(`/universities/${universitySlug}`);
  revalidatePath(`/universities/${universitySlug}/programs/${programSlug}`);
}
