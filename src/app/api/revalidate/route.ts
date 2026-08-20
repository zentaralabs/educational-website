import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

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
};

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

  return NextResponse.json({ revalidated: true, tags });
}
