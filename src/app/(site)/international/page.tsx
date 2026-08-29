import Link from "next/link";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { ORIGIN_COUNTRIES } from "@/lib/origin-countries";

export const revalidate = 3600;

export const metadata = {
  title: "Study in Australia from Your Country",
  description:
    "Country-by-country guides to applying to Australian universities: what a year costs, how the application and student visa work, and what is different for applicants from each country.",
  alternates: { canonical: "/international" },
};

export default function InternationalHubPage() {
  const countries = Object.values(ORIGIN_COUNTRIES).sort((a, b) =>
    a.name.localeCompare(b.name),
  );

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "By country" },
  ];

  return (
    <main className="mx-auto w-full max-w-2xl px-6 pt-8 pb-16">
      <Breadcrumbs items={breadcrumbs} />

      <h1 className="mt-2 font-display text-3xl font-semibold text-ink text-balance sm:text-4xl">
        Study in Australia from your country
      </h1>

      <p className="mt-4 font-body text-base leading-relaxed text-ink">
        The generic steps are the same for everyone. What changes by country is
        the detail: whether you can apply to a university directly or must go
        through an agent, how your qualifications convert, how closely the
        student visa evidence is checked, and the deadlines. These guides cover
        that layer.
      </p>

      <ul className="mt-8 flex flex-col gap-3">
        {countries.map((c) => (
          <li key={c.slug}>
            <Link
              href={`/international/${c.slug}`}
              className="card card-hover group flex items-center justify-between gap-3 p-5"
            >
              <span className="font-display text-lg font-semibold text-ink group-hover:underline">
                Study in Australia from {c.name}
              </span>
              <span className="font-utility text-sm text-status-open">→</span>
            </Link>
          </li>
        ))}
      </ul>

      <p className="mt-8 font-body text-sm text-slate">
        More countries are being added. In the meantime, the{" "}
        <Link
          href="/guides"
          className="font-medium text-status-open underline underline-offset-2"
        >
          how-to guides
        </Link>{" "}
        and{" "}
        <Link
          href="/visas/student-500"
          className="font-medium text-status-open underline underline-offset-2"
        >
          student visa page
        </Link>{" "}
        cover the parts that are the same for everyone.
      </p>
    </main>
  );
}
