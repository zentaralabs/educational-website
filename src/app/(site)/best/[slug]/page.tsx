import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { ArrowUpRightIcon } from "@/components/site/icons";
import { breadcrumbJsonLd } from "@/lib/breadcrumb-jsonld";
import { COLLECTIONS, getCollection } from "@/lib/collections";
import { listCollectionUniversities } from "@/lib/queries/public-collections";

export const revalidate = 3600;

export function generateStaticParams() {
  return COLLECTIONS.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const c = getCollection(slug);
  if (!c) return {};
  const url = `/best/${slug}`;
  return {
    title: c.title,
    description: c.metaDescription,
    alternates: { canonical: url },
    openGraph: { title: c.title, description: c.metaDescription, url, type: "article" },
    twitter: { card: "summary", title: c.title, description: c.metaDescription },
  };
}

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const collection = getCollection(slug);
  if (!collection) notFound();

  const universities = await listCollectionUniversities();
  const entries = collection.build(universities);

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Decision guides", href: "/best" },
    { label: collection.shortTitle },
  ];

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: collection.title,
    itemListElement: entries.map((e, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: e.name,
      url: `/universities/${e.slug}`,
    })),
  };

  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd(breadcrumbs)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
      <Breadcrumbs items={breadcrumbs} />

      <h1 className="font-display text-3xl font-semibold text-ink text-balance sm:text-4xl">
        {collection.title}
      </h1>

      <div className="mt-4 flex flex-col gap-3">
        {collection.intro.map((p) => (
          <p key={p.slice(0, 24)} className="font-body text-base leading-relaxed text-ink">
            {p}
          </p>
        ))}
      </div>

      {entries.length === 0 ? (
        <p className="mt-8 font-body text-base text-slate">
          Nothing in the dataset currently matches these criteria.
        </p>
      ) : (
        <ol className="mt-8 flex flex-col gap-3">
          {entries.map((e) => (
            <li key={e.slug}>
              <Link
                href={`/universities/${e.slug}`}
                className="group flex flex-col gap-1 rounded-2xl border border-line bg-mist p-5 transition-all duration-150 hover:-translate-y-0.5 hover:border-status-open/30 hover:shadow-[0_14px_36px_-18px_rgba(22,35,63,0.28)]"
              >
                <span className="flex items-start justify-between gap-3">
                  <span className="font-display text-lg font-semibold text-ink group-hover:underline">
                    {e.name}
                  </span>
                  <ArrowUpRightIcon className="mt-1 h-4 w-4 flex-shrink-0 text-slate transition-colors duration-150 group-hover:text-status-open" />
                </span>
                <span className="font-utility text-sm font-medium text-status-open">
                  {e.headline}
                </span>
                <span className="font-body text-sm text-slate">
                  {e.city ? `${e.city}. ` : ""}
                  {e.note}
                </span>
              </Link>
            </li>
          ))}
        </ol>
      )}

      <div className="mt-10 rounded-2xl border border-line bg-mist p-5">
        <h2 className="font-body text-xs font-semibold tracking-widest text-slate uppercase">
          How this list was built
        </h2>
        <p className="mt-2 font-body text-sm text-slate">{collection.methodology}</p>
      </div>

      <div className="mt-10 border-t border-ink/10 pt-6">
        <h2 className="mb-3 font-body text-xs font-semibold tracking-wide text-slate uppercase">
          Other decision guides
        </h2>
        <ul className="grid gap-2 sm:grid-cols-2">
          {COLLECTIONS.filter((c) => c.slug !== collection.slug).map((c) => (
            <li key={c.slug}>
              <Link
                href={`/best/${c.slug}`}
                className="block rounded-xl border border-line bg-mist px-4 py-3 font-body text-sm font-medium text-ink transition-all duration-150 hover:-translate-y-0.5 hover:border-status-open/30 hover:underline"
              >
                {c.shortTitle}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
