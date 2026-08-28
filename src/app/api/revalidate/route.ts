import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { pingIndexNow } from "@/lib/indexnow";

/**
 * Supabase Database Webhook target — configured to fire on UPDATE to
 * universities/deadlines/guides/scholarships where status = 'published'
 * (see supabase/migrations/0002_rls_policies.sql comment + PROJECT_STATUS.md
 * Section 3 for the revalidation pattern).
 *
 * Pages should fetch their data with `next: { tags: [...] }` using the same
 * tag names produced here, e.g. `university:${slug}` and `universities:list`,
 * so this route stays decoupled from the eventual URL structure.
 */

const ENTITY_TAG_PREFIX: Record<string, string> = {
  universities: "university",
  deadlines: "deadline",
  guides: "guide",
  scholarships: "scholarship",
  programs: "program",
  blog_posts: "blog_post",
  visa_subclasses: "visa",
  invitation_rounds: "invitation_round",
};

/**
 * Public URL(s) to submit to IndexNow for a given table change. Detail pages
 * are `${base}/${slug}`; the invitation-round tracker is a single dated page
 * with no slug. Returns [] for tables with no public-facing page.
 */
function indexNowPaths(table: string, slug: string | undefined): string[] {
  const detailBase: Record<string, string> = {
    universities: "/universities",
    guides: "/guides",
    scholarships: "/scholarships",
    blog_posts: "/blog",
    visa_subclasses: "/visas",
  };
  if (table === "invitation_rounds") {
    return ["/visas/invitation-rounds"];
  }
  const base = detailBase[table];
  if (!base) return [];
  return slug ? [base, `${base}/${slug}`] : [base];
}

type SupabaseWebhookPayload = {
  type: "INSERT" | "UPDATE" | "DELETE";
  table: string;
  record: Record<string, unknown> | null;
  old_record: Record<string, unknown> | null;
  schema: string;
};

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-revalidate-secret");
  if (!secret || secret !== process.env.REVALIDATE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let payload: SupabaseWebhookPayload;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const { table, record } = payload;

  const entityTagPrefix = ENTITY_TAG_PREFIX[table];
  if (!entityTagPrefix) {
    return NextResponse.json({ error: `unknown table: ${table}` }, { status: 400 });
  }

  const tags = [`${table}:list`];
  const slug = record?.slug as string | undefined;
  if (slug) tags.push(`${entityTagPrefix}:${slug}`);

  for (const tag of tags) revalidateTag(tag, "max");

  // Tell IndexNow (Bing/Yandex/etc.) the affected URL changed, so
  // time-sensitive pages — the SkillSelect invitation-round tracker above
  // all — get re-crawled in minutes rather than on the next scheduled pass.
  const paths = indexNowPaths(table, slug);
  const pinged = paths.length > 0 ? await pingIndexNow(paths) : false;

  return NextResponse.json({ revalidated: true, tags, indexNow: { paths, pinged } });
}
