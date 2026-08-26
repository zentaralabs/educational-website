import Link from "next/link";
import { ArrowUpRightIcon } from "@/components/site/icons";
import { listPublishedBlogPosts } from "@/lib/queries/public-blog-posts";

export const revalidate = 3600;

export const metadata = {
  title: "Blog",
  description:
    "Timely posts on deadline changes, policy updates, and application news — the fast-moving counterpart to our evergreen guides.",
  alternates: { canonical: "/blog" },
};

export default async function BlogIndexPage() {
  const posts = await listPublishedBlogPosts();

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-12">
      <h1 className="font-display text-3xl font-semibold text-ink text-balance">
        Blog
      </h1>
      <p className="mt-2 font-body text-base text-slate">
        Deadline changes, policy updates, and application news, as they happen.
      </p>

      {posts.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-ink/15 px-6 py-10 text-center">
          <p className="font-body text-base text-slate">
            No posts published yet — check back soon, or browse the{" "}
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
                className="group flex flex-col gap-1.5 rounded-2xl border border-ink/10 bg-ink/[0.02] p-5 transition-all duration-150 hover:-translate-y-0.5 hover:border-status-open/30 hover:bg-ink/[0.03] hover:shadow-sm sm:p-6"
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
