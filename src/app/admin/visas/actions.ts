"use server";

import { revalidatePath, revalidateTag } from "next/cache";

/**
 * Public visa pages fetch tagged `visa:${slug}` and `visa_subclasses:list`
 * (see src/lib/queries/public-visas.ts). Same reasoning as
 * revalidateUniversity: the Supabase webhook is the production path, but
 * admin saves bust the cache directly so edits show immediately.
 */
export async function revalidateVisa(slug: string, previousSlug?: string) {
  revalidateTag(`visa:${slug}`, "max");
  revalidateTag("visa_subclasses:list", "max");
  revalidatePath(`/visas/${slug}`);
  revalidatePath("/visas");
  if (previousSlug && previousSlug !== slug) {
    revalidateTag(`visa:${previousSlug}`, "max");
    revalidatePath(`/visas/${previousSlug}`);
  }
}

export async function revalidateInvitationRounds() {
  revalidateTag("invitation_rounds:list", "max");
  revalidatePath("/visas/invitation-rounds");
}
