import Link from "next/link";
import { ArrowUpRightIcon } from "@/components/site/icons";
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

  return (
    <main className="mx-auto w-full max-w-3xl px-6 pt-8 pb-16">
      <h1 className="font-display text-3xl font-semibold text-ink text-balance">
        Blog
      </h1>
      <p className="mt-2 font-body text-base text-slate">
        Deadline changes, policy updates, and application news, as they happen.
      </p>

      {tags.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-2">
          <Link
            href="/blog"
            className={`rounded-full border px-3 py-1 font-utility text-xs transition-colors ${
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
              className={`rounded-full border px-3 py-1 font-utility text-xs transition-colors ${
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
        <div className="mt-8 rounded-2xl border border-dashed border-ink/15 px-6 py-10 text-center">
          <p className="font-body text-base text-slate">
            No posts here yet, browse the{" "}
            <Link href="/guides" className="text-status-open underline underline-offset-2">
              evergreen guides
            </Link>{" "}
            in the meantime.
          </p>
        </div>
      ) : (
        <ul className="mt-8 flex flex-col gap-4">
          {posts.map((p) => (
            <li key={p.slug}>
              <Link
                href={`/blog/${p.slug}`}
                className="group flex flex-col gap-1.5 rounded-2xl border border-line bg-mist p-5 transition-all duration-150 hover:-translate-y-0.5 hover:border-status-open/30 hover:shadow-[0_14px_36px_-18px_rgba(22,35,63,0.28)] sm:p-6"
              >
                {p.published_at && (
                  <span className="flex items-center gap-2 font-utility text-xs font-semibold tracking-widest text-status-open uppercase">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-status-open" />
                    {new Date(p.published_at).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                )}
                <span className="flex items-start justify-between gap-3">
                  <h2 className="font-display text-lg font-semibold text-ink text-balance group-hover:underline">
                    {p.title}
                  </h2>
                  <ArrowUpRightIcon className="mt-1 h-4 w-4 flex-shrink-0 text-slate transition-colors duration-150 group-hover:text-status-open" />
                </span>
                {p.excerpt && (
                  <p className="font-body text-base text-slate">{p.excerpt}</p>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
