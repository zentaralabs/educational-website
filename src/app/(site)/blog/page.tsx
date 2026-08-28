import Link from "next/link";
import { PostCard } from "@/components/site/PostCard";
import {
  listPublishedBlogPosts,
  listPublishedBlogTags,
} from "@/lib/queries/public-blog-posts";

export const revalidate = 3600;

export const metadata = {
  title: "Blog",
  description:
    "Timely posts on deadline changes, policy updates, and application news, the fast-moving counterpart to our evergreen guides.",
  alternates: { canonical: "/blog" },
};

const TAG_LABELS: Record<string, string> = {
  "what-we-are-watching": "What we're watching",
};

function tagLabel(tag: string) {
  return TAG_LABELS[tag] ?? tag.replace(/-/g, " ");
}

function formatDate(date: string | null) {
  if (!date) return undefined;
  return new Date(date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default async function BlogIndexPage({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string }>;
}) {
  const { tag } = await searchParams;
  const [posts, tags] = await Promise.all([
    listPublishedBlogPosts({ tag }),
    listPublishedBlogTags(),
  ]);

  // Only lead with a featured post on the unfiltered index.
  const [lead, ...rest] = tag ? [] : posts;
  const listed = tag ? posts : rest;

  return (
    <main className="mx-auto w-full max-w-3xl px-6 pt-8 pb-16">
      <h1 className="font-display text-3xl font-semibold text-ink text-balance sm:text-4xl">
        Blog
      </h1>
      <p className="mt-2 max-w-2xl font-body text-base text-slate">
        Deadline changes, policy updates, and application news, as they happen.
      </p>

      {tags.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-2">
          <Link
            href="/blog"
            className={`rounded-full border px-3 py-1 font-utility text-xs transition-colors duration-150 ${
              !tag
                ? "border-status-open bg-status-open/10 text-ink"
                : "border-ink/15 text-slate hover:border-status-open/40"
            }`}
          >
            All
          </Link>
          {tags.map((t) => (
            <Link
              key={t}
              href={`/blog?tag=${encodeURIComponent(t)}`}
              className={`rounded-full border px-3 py-1 font-utility text-xs transition-colors duration-150 ${
                tag === t
                  ? "border-status-open bg-status-open/10 text-ink"
                  : "border-ink/15 text-slate hover:border-status-open/40"
              }`}
            >
              {tagLabel(t)}
            </Link>
          ))}
        </div>
      )}

      {tag === "what-we-are-watching" && (
        <p className="mt-5 rounded-xl border border-status-pending/30 bg-status-pending/5 px-4 py-3 font-body text-sm text-slate">
          These posts are analysis, not reporting. Each one lays out a change we
          think is coming, the evidence for it, and how confident we are. Nothing
          here is confirmed government policy until we say it is and cite the
          source.
        </p>
      )}

      {posts.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-ink/15 px-6 py-10 text-center">
          <p className="font-body text-base text-slate">
            No posts here yet. Browse the{" "}
            <Link href="/guides" className="text-status-open underline underline-offset-2">
              evergreen guides
            </Link>{" "}
            in the meantime.
          </p>
        </div>
      ) : (
        <div className="mt-8 flex flex-col gap-4">
          {lead && (
            <PostCard
              href={`/blog/${lead.slug}`}
              eyebrow={
                lead.published_at ? `Latest · ${formatDate(lead.published_at)}` : "Latest"
              }
              title={lead.title}
              excerpt={lead.excerpt}
              featured
            />
          )}
          {listed.map((p) => (
            <PostCard
              key={p.slug}
              href={`/blog/${p.slug}`}
              eyebrow={formatDate(p.published_at)}
              title={p.title}
              excerpt={p.excerpt}
            />
          ))}
        </div>
      )}
    </main>
  );
}
