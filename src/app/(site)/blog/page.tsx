import Link from "next/link";
import { BlogCard } from "@/components/site/BlogCard";
import { RssIcon } from "@/components/site/icons";
import {
  listPublishedBlogPosts,
  listPublishedBlogTags,
} from "@/lib/queries/public-blog-posts";
import { readingMinutesFromWords } from "@/lib/reading";

export const revalidate = 3600;

export const metadata = {
  title: "Blog",
  description:
    "Timely posts on deadline changes, policy updates, and application news, the fast-moving counterpart to our evergreen guides.",
  alternates: {
    canonical: "/blog",
    types: { "application/rss+xml": "/blog/feed.xml" },
  },
};

const TAG_LABELS: Record<string, string> = {
  "what-we-are-watching": "What we're watching",
};

function tagLabel(tag: string) {
  if (TAG_LABELS[tag]) return TAG_LABELS[tag];
  const words = tag.replace(/-/g, " ");
  return words.charAt(0).toUpperCase() + words.slice(1);
}

function buildHref(tag: string | undefined, page: number): string {
  const params = new URLSearchParams();
  if (tag) params.set("tag", tag);
  if (page > 1) params.set("page", String(page));
  const qs = params.toString();
  return qs ? `/blog?${qs}` : "/blog";
}

export default async function BlogIndexPage({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string; page?: string }>;
}) {
  const { tag, page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  const [{ rows, totalCount, pageSize }, tags] = await Promise.all([
    listPublishedBlogPosts({ tag, page }),
    listPublishedBlogTags(),
  ]);
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  // Feature the newest post only on the unfiltered first page.
  const showFeatured = page === 1 && !tag && rows.length > 0;
  const featured = showFeatured ? rows[0] : null;
  const gridPosts = showFeatured ? rows.slice(1) : rows;

  return (
    <main className="mx-auto w-full max-w-4xl px-6 pt-8 pb-16">
      <h1 className="font-display text-3xl font-semibold text-ink text-balance sm:text-4xl">
        The blog
      </h1>
      <p className="mt-2 max-w-2xl font-body text-base text-slate">
        Deadline changes, policy shifts, and application news as they happen.
      </p>
      <a
        href="/blog/feed.xml"
        className="mt-2 inline-flex items-center gap-1.5 font-body text-sm text-status-open underline underline-offset-2 hover:text-ink"
      >
        <RssIcon className="h-3.5 w-3.5" />
        RSS feed
      </a>

      {tags.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-2">
          {[
            { key: "", label: "All posts", href: "/blog", active: !tag },
            ...tags.map((t) => ({
              key: t,
              label: tagLabel(t),
              href: `/blog?tag=${encodeURIComponent(t)}`,
              active: tag === t,
            })),
          ].map((pill) => (
            <Link
              key={pill.key}
              href={pill.href}
              className={`rounded-full px-3.5 py-1.5 font-body text-sm transition-colors duration-150 ${
                pill.active
                  ? "bg-ink font-medium text-paper"
                  : "bg-mist text-slate hover:bg-ink/[0.06] hover:text-ink"
              }`}
            >
              {pill.label}
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

      {rows.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-ink/15 px-6 py-10 text-center">
          <p className="font-body text-base text-slate">
            {page > 1 ? (
              <>
                Nothing on this page.{" "}
                <Link href={buildHref(tag, page - 1)} className="text-status-open underline underline-offset-2">
                  Go back
                </Link>
                .
              </>
            ) : (
              <>
                No posts here yet. Browse the{" "}
                <Link href="/guides" className="text-status-open underline underline-offset-2">
                  evergreen guides
                </Link>{" "}
                in the meantime.
              </>
            )}
          </p>
        </div>
      ) : (
        <>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {featured && (
              <BlogCard
                href={`/blog/${featured.slug}`}
                title={featured.title}
                excerpt={featured.excerpt}
                tags={featured.tags}
                date={featured.published_at}
                author={featured.author?.name}
                readingMinutes={readingMinutesFromWords(featured.word_count)}
                featured
              />
            )}
            {gridPosts.map((p) => (
              <BlogCard
                key={p.slug}
                href={`/blog/${p.slug}`}
                title={p.title}
                excerpt={p.excerpt}
                tags={p.tags}
                date={p.published_at}
                author={p.author?.name}
                readingMinutes={readingMinutesFromWords(p.word_count)}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-10 flex items-center justify-between border-t border-line pt-4">
              {page > 1 ? (
                <Link
                  href={buildHref(tag, page - 1)}
                  className="rounded-md border border-ink/20 px-3 py-1.5 font-body text-sm text-ink transition-colors duration-150 hover:border-status-open"
                >
                  Previous
                </Link>
              ) : (
                <span />
              )}
              <span className="font-utility text-xs text-slate">
                Page {page} of {totalPages}
              </span>
              {page < totalPages ? (
                <Link
                  href={buildHref(tag, page + 1)}
                  className="rounded-md border border-ink/20 px-3 py-1.5 font-body text-sm text-ink transition-colors duration-150 hover:border-status-open"
                >
                  Next
                </Link>
              ) : (
                <span />
              )}
            </div>
          )}
        </>
      )}
    </main>
  );
}
