import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { ExperienceSubmissionForm } from "@/components/site/ExperienceSubmissionForm";
import { breadcrumbJsonLd } from "@/lib/breadcrumb-jsonld";
import { JsonLd } from "@/lib/json-ld";
import { pageMetadata } from "@/lib/page-metadata";

export const metadata = pageMetadata({
  title: "Share Your Experience",
  description:
    "Went through an Australian university or visa application yourself? Share what actually happened — an editor reviews every submission before anything is published.",
  path: "/share-your-experience",
  type: "website",
});

const breadcrumbs = [
  { label: "Home", href: "/" },
  { label: "Share your experience" },
];

export default function ShareExperiencePage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; label?: string }>;
}) {
  return (
    <main className="mx-auto w-full max-w-2xl px-6 pt-8 pb-16">
      <JsonLd data={breadcrumbJsonLd(breadcrumbs)} />
      <Breadcrumbs items={breadcrumbs} />

      <h1 className="mt-4 font-display text-3xl font-semibold text-ink">
        Share your experience
      </h1>
      <p className="mt-3 max-w-xl font-body text-base leading-relaxed text-ink/90">
        Every guide on this site is written from official sources, not from
        going through the process ourselves. If you have — applying for a
        visa, uploading a CoE, booking biometrics, waiting on a grant — the
        specific, sometimes unglamorous details of what that was actually
        like are worth more to the next applicant than another summary of
        the rules. Real, ordinary, and a little rough beats polished.
      </p>
      <p className="mt-3 max-w-xl font-body text-sm text-slate">
        An editor reads every submission before anything goes on the site.
        Nothing is published automatically, and you can ask to stay
        anonymous.
      </p>

      <div className="mt-8 max-w-xl">
        <ExperienceFormWithDefaults searchParams={searchParams} />
      </div>
    </main>
  );
}

async function ExperienceFormWithDefaults({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; label?: string }>;
}) {
  const params = await searchParams;
  return (
    <ExperienceSubmissionForm
      defaultPagePath={params.page ?? ""}
      defaultPageLabel={params.label}
    />
  );
}
