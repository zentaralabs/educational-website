import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleMeta } from "@/components/site/ArticleMeta";
import { ArticleShell } from "@/components/site/ArticleShell";
import { FaqSection } from "@/components/site/FaqSection";
import { GuideContent } from "@/components/site/GuideContent";
import { LastVerified } from "@/components/site/LastVerified";
import { ArrowUpRightIcon, CheckBadgeIcon } from "@/components/site/icons";
import { breadcrumbJsonLd } from "@/lib/breadcrumb-jsonld";
import { extractFaqItems } from "@/lib/extract-faq";
import { faqJsonLd } from "@/lib/faq";
import {
  getPublishedBlogPost,
  listPublishedBlogPosts,
  listPublishedBlogPostSlugs,
} from "@/lib/queries/public-blog-posts";
import { readingMinutes } from "@/lib/reading";
import { extractToc } from "@/lib/toc";

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
    twitter: { card: "summary_large_image", title, description },
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

  const faqItems = extractFaqItems(post.content).map((f) => ({ q: f.question, a: f.answer }));
  const toc = extractToc(post.content);
  const more = (await listPublishedBlogPosts())
    .filter((p) => p.slug !== post.slug)
    .slice(0, 4);

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Blog", href: "/blog" },
    { label: post.title },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    datePublished: post.published_at ?? undefined,
    dateModified: post.last_verified_at ?? undefined,
    author: post.author ? { "@type": "Person", name: post.author.name } : undefined,
  };
  const jsonLdBlocks: Record<string, unknown>[] = [jsonLd, breadcrumbJsonLd(breadcrumbs)];
  if (faqItems.length > 0) jsonLdBlocks.push(faqJsonLd(faqItems));

  return (
    <>
      {jsonLdBlocks.map((block, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(block) }}
        />
      ))}

      <ArticleShell
        breadcrumbs={breadcrumbs}
        eyebrow="Blog"
        title={post.title}
        meta={
          <>
            <ArticleMeta
              author={post.author}
              reviewedBy={post.reviewed_by}
              readingMinutes={readingMinutes(post.content)}
              date={post.published_at}
              dateLabel="Published"
            />
            {post.tags && post.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {post.tags.map((t) => (
                  <Link
                    key={t}
                    href={`/blog?tag=${encodeURIComponent(t)}`}
                    className="rounded-full border border-ink/15 px-2.5 py-0.5 font-utility text-xs text-slate transition-colors duration-150 hover:border-status-open/40 hover:text-ink"
                  >
                    {t.replace(/-/g, " ")}
                  </Link>
                ))}
              </div>
            )}
          </>
        }
        toc={toc}
        footer={
          <>
            <div className="mt-10 flex items-start gap-2 rounded-xl bg-status-open/5 px-4 py-3">
              <CheckBadgeIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-status-open" />
              <LastVerified date={post.last_verified_at} sources={post.source_urls} />
            </div>

            {faqItems.length > 0 && (
              <FaqSection heading="Common questions" items={faqItems} />
            )}

            {more.length > 0 && (
              <div className="mt-12 border-t border-line pt-8">
                <h2 className="mb-4 font-body text-xs font-semibold tracking-widest text-slate uppercase">
                  More from the blog
                </h2>
                <ul className="grid gap-3 sm:grid-cols-2">
                  {more.map((p) => (
                    <li key={p.slug}>
                      <Link
                        href={`/blog/${p.slug}`}
                        className="group flex items-center justify-between gap-2 rounded-xl border border-line bg-paper px-4 py-3 transition-all duration-150 hover:-translate-y-0.5 hover:border-status-open/40 hover:shadow-[0_14px_36px_-18px_rgba(22,35,63,0.28)]"
                      >
                        <span className="font-body text-sm font-medium text-ink">{p.title}</span>
                        <ArrowUpRightIcon className="h-3.5 w-3.5 flex-shrink-0 text-slate transition-colors duration-150 group-hover:text-status-open" />
                      </Link>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/blog"
                  className="mt-5 inline-block font-body text-sm text-status-open underline underline-offset-2 hover:text-ink"
                >
                  All posts
                </Link>
              </div>
            )}
          </>
        }
      >
        <GuideContent content={post.content} />
      </ArticleShell>
    </>
  );
}
