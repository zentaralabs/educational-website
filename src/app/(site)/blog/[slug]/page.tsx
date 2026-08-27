import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { GuideContent } from "@/components/site/GuideContent";
import { LastVerified } from "@/components/site/LastVerified";
import { CheckBadgeIcon } from "@/components/site/icons";
import { breadcrumbJsonLd } from "@/lib/breadcrumb-jsonld";
import { authorInitials } from "@/lib/format";
import {
  getPublishedBlogPost,
  listPublishedBlogPostSlugs,
} from "@/lib/queries/public-blog-posts";

export const revalidate = 3600;

export async function generateStaticParams() {
  const slugs = await listPublishedBlogPostSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPublishedBlogPost(slug);
  if (!post) return {};
  const title = post.title;
  const description = post.excerpt ?? post.content.slice(0, 155);
  const url = `/blog/${slug}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: "article",
      publishedTime: post.published_at ?? undefined,
      modifiedTime: post.last_verified_at ?? undefined,
    },
    twitter: { card: "summary", title, description },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPublishedBlogPost(slug);
  if (!post) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    datePublished: post.published_at ?? undefined,
    dateModified: post.last_verified_at ?? undefined,
    author: post.author ? { "@type": "Person", name: post.author.name } : undefined,
  };

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Blog", href: "/blog" },
    { label: post.title },
  ];

  return (
    <main className="mx-auto w-full max-w-2xl px-6 pt-8 pb-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd(breadcrumbs)) }}
      />

      <Breadcrumbs items={breadcrumbs} />

      <div className="rounded-2xl bg-gradient-to-br from-ink/[0.04] via-ink/[0.02] to-transparent p-6 sm:p-8">
        {post.published_at && (
          <p className="flex items-center gap-2 font-utility text-xs font-semibold tracking-widest text-status-open uppercase">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-status-open" />
            {new Date(post.published_at).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        )}
        <h1 className="mt-2 font-display text-3xl font-semibold text-ink text-balance sm:text-4xl">
          {post.title}
        </h1>

        {post.author && (
          <div className="mt-4 flex items-center gap-3">
            <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-ink font-utility text-xs font-semibold text-paper">
              {authorInitials(post.author.name)}
            </span>
            <p className="font-body text-sm text-slate">
              By <span className="font-medium text-ink">{post.author.name}</span>
              {post.author.credentials && ` — ${post.author.credentials}`}
              {post.reviewed_by && <>, reviewed by {post.reviewed_by.name}</>}
            </p>
          </div>
        )}

        {post.tags && post.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {post.tags.map((t) => (
              <span
                key={t}
                className="rounded-full border border-ink/15 bg-paper px-2.5 py-0.5 font-utility text-xs text-slate"
              >
                {t}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="mt-8">
        <GuideContent content={post.content} />
      </div>

      <div className="mt-10 flex items-center gap-2 rounded-xl bg-status-open/5 px-4 py-3">
        <CheckBadgeIcon className="h-4 w-4 flex-shrink-0 text-status-open" />
        <LastVerified date={post.last_verified_at} sources={post.source_urls} />
      </div>

      <Link
        href="/blog"
        className="mt-8 inline-block font-body text-sm text-slate underline underline-offset-2 hover:text-ink"
      >
        ← Back to blog
      </Link>
    </main>
  );
}
