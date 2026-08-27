import { QuizForm } from "@/components/site/QuizForm";
import { listQuizOptions } from "@/lib/queries/public-quiz";

export const revalidate = 3600;

export const metadata = {
  title: "Find the Right University for Me",
  description:
    "Answer a few questions about country, degree level, budget, and institution type to get matched with real universities.",
  alternates: { canonical: "/quiz" },
};

export default async function QuizPage() {
  const { countries, degreeLevels } = await listQuizOptions();

  return (
    <main className="mx-auto w-full max-w-2xl px-6 pt-8 pb-16">
      <h1 className="font-display text-3xl font-semibold text-ink text-balance">
        Find the right university for me
      </h1>
      <p className="mt-2 font-body text-base text-slate">
        Four quick questions, matched against real deadlines, costs, and
        requirements. Not a lead-gen form.
      </p>

      <QuizForm countries={countries} degreeLevels={degreeLevels} />
    </main>
  );
}
