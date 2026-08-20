import Link from "next/link";
import { listPublishedBlogPosts } from "@/lib/queries/public-blog-posts";

export const revalidate = 3600;

export const metadata = {
  title: "Blog",
  description:
    "Timely posts on deadline changes, policy updates, and application news — the fast-moving counterpart to our evergreen guides.",
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
        <p className="mt-8 font-body text-base text-slate">No posts published yet.</p>
      ) : (
        <ul className="mt-8 flex flex-col gap-4">
          {posts.map((p) => (
            <li key={p.slug} className="border-b border-ink/10 pb-4">
              <Link href={`/blog/${p.slug}`} className="group">
                {p.published_at && (
                  <span className="font-utility text-xs font-semibold tracking-widest text-status-open uppercase">
                    {new Date(p.published_at).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                )}
                <h2 className="mt-1 font-display text-lg font-semibold text-ink group-hover:underline">
                  {p.title}
                </h2>
                {p.excerpt && (
                  <p className="mt-1 font-body text-base text-slate">{p.excerpt}</p>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
