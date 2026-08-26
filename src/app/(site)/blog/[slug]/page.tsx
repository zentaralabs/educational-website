import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { GuideContent } from "@/components/site/GuideContent";
import { LastVerified } from "@/components/site/LastVerified";
import { breadcrumbJsonLd } from "@/lib/breadcrumb-jsonld";
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
    <main className="mx-auto w-full max-w-2xl px-6 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd(breadcrumbs)) }}
      />

      <Breadcrumbs items={breadcrumbs} />

      {post.published_at && (
        <p className="font-utility text-xs font-semibold tracking-widest text-status-open uppercase">
          {new Date(post.published_at).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </p>
      )}
      <h1 className="mt-1 font-display text-3xl font-semibold text-ink text-balance">
        {post.title}
      </h1>

      {post.author && (
        <p className="mt-3 font-body text-sm text-slate">
          By {post.author.name}
          {post.author.credentials && ` — ${post.author.credentials}`}
          {post.reviewed_by && <>, reviewed by {post.reviewed_by.name}</>}
        </p>
      )}

      {post.tags && post.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {post.tags.map((t) => (
            <span
              key={t}
              className="rounded-sm border border-ink/15 px-2 py-0.5 font-utility text-xs text-slate"
            >
              {t}
            </span>
          ))}
        </div>
      )}

      <div className="mt-6">
        <GuideContent content={post.content} />
      </div>

      <div className="mt-10 border-t border-ink/10 pt-4">
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
