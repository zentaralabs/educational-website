import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { QuizForm } from "@/components/site/QuizForm";
import { breadcrumbJsonLd } from "@/lib/breadcrumb-jsonld";
import { listQuizOptions } from "@/lib/queries/public-quiz";

export const revalidate = 3600;

export const metadata = {
  title: "Which Australian University Is Right for You? (Quiz)",
  description:
    "Match yourself to real Australian universities by degree level, field of study, budget, IELTS, city, institution type, regional campus, and scholarships.",
  alternates: { canonical: "/quiz" },
};

export default async function QuizPage() {
  const { degreeLevels, subjects, cities } = await listQuizOptions();

  const breadcrumbs = [{ label: "Home", href: "/" }, { label: "University quiz" }];

  return (
    <main className="mx-auto w-full max-w-2xl px-6 pt-8 pb-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd(breadcrumbs)) }}
      />
      <Breadcrumbs items={breadcrumbs} />

      <h1 className="font-display text-3xl font-semibold text-ink text-balance">
        Find the right university for me
      </h1>
      <p className="mt-2 font-body text-base text-slate">
        A few quick questions, matched against real deadlines, costs, English
        requirements, and scholarships. Skip anything that does not matter to
        you. Not a lead-gen form.
      </p>

      <QuizForm
        degreeLevels={degreeLevels}
        subjects={subjects}
        cities={cities}
      />
    </main>
  );
}
