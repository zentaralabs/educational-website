import Link from "next/link";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { RelatedLinks } from "@/components/site/RelatedLinks";
import { WhyTrust } from "@/components/site/WhyTrust";
import { breadcrumbJsonLd } from "@/lib/breadcrumb-jsonld";
import { itemListJsonLd } from "@/lib/itemlist-jsonld";
import { listPublishedOccupations } from "@/lib/queries/public-occupations";
import { JsonLd } from "@/lib/json-ld";
import { pageMetadata } from "@/lib/page-metadata";

export const revalidate = 3600;

export const metadata = pageMetadata({
  title: "Skilled Occupations: Which Degree Leads to Which Job & Visa",
  description:
    "Every occupation we track for Australian skilled migration: ANZSCO code, MLTSSL/STSOL/ROL/CSOL list status, assessing authority, and the real university degrees that lead to it.",
  path: "/occupations",
  type: "website",
});

function listBadges(o: { mltssl: boolean; stsol: boolean; rol: boolean; csol: boolean }) {
  return [o.mltssl && "MLTSSL", o.stsol && "STSOL", o.rol && "ROL", o.csol && "CSOL"].filter(
    Boolean,
  ) as string[];
}

export default async function OccupationsIndexPage() {
  const occupations = await listPublishedOccupations();

  const breadcrumbs = [{ label: "Home", href: "/" }, { label: "Occupations" }];

  return (
    <main className="mx-auto w-full max-w-3xl px-6 pt-8 pb-16">
      <JsonLd data={breadcrumbJsonLd(breadcrumbs)} />
      {occupations.length > 0 && (
        <JsonLd
          data={itemListJsonLd({
            name: "Skilled occupations for Australian migration, by degree pathway",
            items: occupations.map((o) => ({ path: `/occupations/${o.slug}`, name: o.name })),
          })}
        />
      )}

      <Breadcrumbs items={breadcrumbs} />

      <h1 className="font-display text-3xl font-semibold text-ink text-balance">
        Skilled occupations: which degree leads where
      </h1>
      <p className="mt-3 max-w-2xl font-body text-base text-slate">
        Every occupation below carries its ANZSCO code, current skilled-migration
        list status (MLTSSL, STSOL, ROL, CSOL), and the assessing authority that
        checks it. Each occupation page also lists the real, published degree
        programs at Australian universities whose graduates typically pursue it,
        so you can work backwards from a career target to an actual course.
      </p>
      <p className="mt-2 max-w-2xl font-body text-sm text-slate">
        New to the list names?{" "}
        <Link
          href="/guides/skilled-occupation-lists-explained"
          className="text-status-open underline underline-offset-2"
        >
          Read what MLTSSL, STSOL, ROL, and CSOL each mean
        </Link>{" "}
        before you dig into occupations.
      </p>

      {occupations.length === 0 ? (
        <p className="mt-8 font-body text-base text-slate">No occupations published yet.</p>
      ) : (
        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          {occupations.map((o) => (
            <Link
              key={o.slug}
              href={`/occupations/${o.slug}`}
              className="rounded-xl border border-line bg-mist p-4 transition-all duration-150 hover:-translate-y-0.5 hover:border-status-open/30 hover:shadow-[0_14px_36px_-18px_rgba(22,35,63,0.28)]"
            >
              <p className="font-body text-sm font-semibold text-ink">
                {o.name}
                <span className="ml-2 font-utility text-[11px] font-normal text-slate">
                  ANZSCO {o.anzsco_code}
                </span>
              </p>
              {o.summary && (
                <p className="mt-1 font-body text-sm text-slate">{o.summary}</p>
              )}
              <div className="mt-2 flex flex-wrap gap-1.5">
                {listBadges(o).map((list) => (
                  <span
                    key={list}
                    className="rounded-full bg-ink/[0.05] px-2 py-0.5 font-utility text-[10px] text-slate"
                  >
                    {list}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      )}

      <RelatedLinks
        className="mt-12 border-t border-ink/10 pt-6"
        heading="Related"
        items={[
          { href: "/guides/skilled-occupation-lists-explained", label: "MLTSSL, STSOL, CSOL and ROL explained" },
          { href: "/visas/points-calculator", label: "Estimate your skilled migration points" },
          { href: "/study", label: "Browse programs by subject" },
        ]}
      />

      <WhyTrust className="mt-10" />
    </main>
  );
}
