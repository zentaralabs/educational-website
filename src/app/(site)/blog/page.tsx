import Link from "next/link";
import { ArrowUpRightIcon } from "@/components/site/icons";
import {
  listPublishedBlogPosts,
  listPublishedBlogTags,
  type PublicBlogPostListRow,
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
  if (!date) return null;
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function TagRow({ tags }: { tags: string[] | null }) {
  if (!tags || tags.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {tags.map((t, i) => (
        <span key={t} className="font-utility text-[0.7rem] tracking-wide text-slate uppercase">
          {t.replace(/-/g, " ")}
          {i < tags.length - 1 && <span className="ml-1.5 text-ink/20">/</span>}
        </span>
      ))}
    </div>
  );
}

function FeaturedPost({ post }: { post: PublicBlogPostListRow }) {
  return (
    <article className="border-b border-ink/15 pb-10">
      <p className="font-utility text-xs font-semibold tracking-widest text-status-open uppercase">
        Latest post
      </p>
      <h2 className="mt-3 font-display text-2xl font-semibold text-ink text-balance sm:text-3xl">
        <Link href={`/blog/${post.slug}`} className="hover:underline">
          {post.title}
        </Link>
      </h2>
      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 font-body text-sm text-slate">
        {formatDate(post.published_at) && (
          <time dateTime={post.published_at ?? undefined}>
            {formatDate(post.published_at)}
          </time>
        )}
        {post.author && (
          <>
            <span aria-hidden className="text-ink/25">·</span>
            <span>{post.author.name}</span>
          </>
        )}
      </div>
      {post.excerpt && (
        <p className="mt-4 max-w-2xl font-body text-base leading-relaxed text-slate">
          {post.excerpt}
        </p>
      )}
      <div className="mt-4 flex items-center gap-4">
        <Link
          href={`/blog/${post.slug}`}
          className="inline-flex items-center gap-1.5 font-body text-sm font-medium text-status-open hover:text-ink"
        >
          Read post
          <ArrowUpRightIcon className="h-3.5 w-3.5" />
        </Link>
        <TagRow tags={post.tags} />
      </div>
    </article>
  );
}

function PostRow({ post }: { post: PublicBlogPostListRow }) {
  return (
    <article className="group border-b border-line py-7">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-utility text-xs tracking-wide text-slate uppercase">
        {formatDate(post.published_at) && (
          <time dateTime={post.published_at ?? undefined}>
            {formatDate(post.published_at)}
          </time>
        )}
        {post.author && (
          <>
            <span aria-hidden className="text-ink/25">·</span>
            <span className="normal-case">{post.author.name}</span>
          </>
        )}
      </div>
      <h3 className="mt-2 font-display text-xl font-semibold text-ink text-balance">
        <Link href={`/blog/${post.slug}`} className="group-hover:underline">
          {post.title}
        </Link>
      </h3>
      {post.excerpt && (
        <p className="mt-2 max-w-2xl font-body text-[0.95rem] leading-relaxed text-slate">
          {post.excerpt}
        </p>
      )}
      <div className="mt-3">
        <TagRow tags={post.tags} />
      </div>
    </article>
  );
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

  // Feature the newest post only on the unfiltered index.
  const [lead, ...rest] = tag ? [] : posts;
  const listed = tag ? posts : rest;

  return (
    <main className="mx-auto w-full max-w-3xl px-6 pt-8 pb-16">
      <h1 className="font-display text-3xl font-semibold text-ink text-balance sm:text-4xl">
        The blog
      </h1>
      <p className="mt-2 max-w-2xl font-body text-base text-slate">
        Deadline changes, policy shifts, and application news as they happen, with
        the sourcing and dates you would expect from the guides.
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
            All posts
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
        <div className="mt-10">
          {lead && <FeaturedPost post={lead} />}
          {listed.length > 0 && (
            <div>
              {lead && (
                <p className="mt-10 mb-1 font-body text-xs font-semibold tracking-widest text-slate uppercase">
                  More posts
                </p>
              )}
              {listed.map((p) => (
                <PostRow key={p.slug} post={p} />
              ))}
            </div>
          )}
        </div>
      )}
    </main>
  );
}
