import Link from "next/link";
import { LegalPage } from "@/components/site/LegalPage";
import { datasetJsonLd } from "@/lib/dataset-jsonld";
import { breadcrumbJsonLd } from "@/lib/breadcrumb-jsonld";
import { getDatasetStats } from "@/lib/queries/public-stats";
import { JsonLd } from "@/lib/json-ld";
import { pageMetadata } from "@/lib/page-metadata";

export const revalidate = 3600;

export const metadata = pageMetadata({
  title: "Methodology & Data Sources",
  description:
    "How Where To Apply builds and maintains its dataset of Australian university deadlines, tuition, English requirements, scholarships, and visa facts: sources, update cadence, coverage, and how to cite it.",
  path: "/methodology",
  type: "website",
});

/** Round down to a friendly floor so the figure never overstates coverage. */
function floorTo(n: number, step: number) {
  return Math.floor(n / step) * step;
}

export default async function MethodologyPage() {
  const stats = await getDatasetStats();

  const dataset = datasetJsonLd({
    name: "Where To Apply: Australian university admissions dataset",
    description:
      "Structured data on Australian universities for international students: application deadlines and intake windows, international tuition, application fees, English-test minimums (IELTS and PTE), selectivity, scholarships, and student and skilled-visa facts. Each fact is tied to an official source and a verification date.",
    url: "/methodology",
    keywords: [
      "Australian universities",
      "international students",
      "application deadlines",
      "tuition fees",
      "student visa",
      "IELTS",
      "PTE Academic",
      "scholarships",
      "skilled migration",
    ],
    temporalCoverage: "2024/..",
    variableMeasured: [
      "Application deadline date",
      "Intake month",
      "International tuition (annual)",
      "Application fee",
      "IELTS overall minimum",
      "PTE Academic overall minimum",
      "Selectivity band",
      "Scholarship value and eligibility",
      "Student visa (subclass 500) charge",
      "Financial capacity requirement",
    ],
  });

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Methodology" },
  ];

  return (
    <LegalPage title="Methodology & data sources" updated="August 29, 2026">
      <JsonLd data={dataset} />
      <JsonLd data={breadcrumbJsonLd(breadcrumbs)} />

      <p>
        Where To Apply is built on a structured dataset, not a pile of blog
        posts. This page explains what is in that dataset, where each figure
        comes from, how often it is re-checked, and how you can cite it.
      </p>

      <h2>What the dataset covers</h2>
      <p>
        Every launched country is covered end to end before the next one is
        added. Australia is live now. As of the last update the dataset holds:
      </p>
      <ul>
        <li>
          <strong>{floorTo(stats.universityCount, 10)}+ universities and
          higher-education providers</strong> that enrol international students,
          each with tuition, English requirements, intakes, campus location, and
          whether the campus counts as regional for migration.
        </li>
        <li>
          <strong>{floorTo(stats.deadlineCount, 10)}+ application deadlines and
          intake windows</strong>, split by intake and degree level, with firm
          calendar dates where a university publishes them and documented
          rolling-assessment notes where it does not.
        </li>
        <li>
          <strong>{floorTo(stats.scholarshipCount, 5)}+ scholarships</strong> for
          international students, with value, eligibility, and whether a separate
          application is needed.
        </li>
        <li>
          <strong>{stats.visaCount} visa subclasses</strong> relevant to
          studying and staying in Australia, with current charges, financial
          requirements, and work rights.
        </li>
        <li>
          Curated subject pages, cost-of-living figures for the major student
          cities, and a per-degree cost calculator built on the same numbers.
        </li>
      </ul>

      <h2>Where the figures come from</h2>
      <p>
        Each fact is sourced from a primary source at the time it is entered or
        updated:
      </p>
      <ul>
        <li>
          <strong>Deadlines and intakes</strong>: the university&rsquo;s own
          admissions, key-dates, or international-applicant pages, and
          application platforms such as UAC and SATAC.
        </li>
        <li>
          <strong>Tuition, application fees, and English minimums</strong>: the
          university&rsquo;s course-fee and entry-requirement pages. English
          minimums are recorded for both IELTS and PTE Academic.
        </li>
        <li>
          <strong>Visa charges, financial capacity, and work rights</strong>:
          the Australian Department of Home Affairs and the Department of Foreign
          Affairs and Trade.
        </li>
        <li>
          <strong>Scholarships</strong>: the provider&rsquo;s official
          scholarship listing.
        </li>
      </ul>
      <p>
        The source link and a &ldquo;last verified&rdquo; date appear on every
        page that carries these figures. Nothing that carries a number is
        published without a person checking it against the original source
        first. See the <Link href="/editorial-policy">editorial policy</Link> for
        the full process.
      </p>

      <h2>Selectivity, not acceptance rates</h2>
      <p>
        Australian universities do not publish admission rates the way US
        universities do, so any percentage would be an estimate dressed up as a
        fact. Instead we assign each institution one of four selectivity bands
        (highly selective, selective, competitive, broadly accessible) as an
        editorial judgement, based on the Group of Eight status, the breadth of
        entry pathways, whether entry is by audition or portfolio, and how far
        the competitive courses sit above the general bar. Each profile shows a
        one-line rationale for the band it carries. The band is an
        institution-wide read: individual courses such as medicine, law, and
        some design programs stay harder to enter than the band suggests.
      </p>

      <h2>Update cadence</h2>
      <p>
        Fee, deadline, and requirement pages are re-verified on a rolling
        quarterly cycle and immediately whenever a change is announced.
        Fast-moving figures, especially the student visa charge and the
        living-cost requirement, are checked as soon as the government updates
        them. The verification date on each page is the honest record of when it
        was last confirmed.
      </p>

      <h2>Known limits</h2>
      <ul>
        <li>
          Individual program pages are built from a broad course dataset that
          has not been fully verified line by line. They are marked as
          indicative and kept out of search until they are rebuilt with sourced
          content.
        </li>
        <li>
          Rolling-assessment universities have no fixed closing date. The
          guidance shown is the university&rsquo;s stated approach, not a
          deadline.
        </li>
        <li>
          &ldquo;Regional&rdquo; status is a heuristic on the campus city, not a
          postcode-level check against the official designated-area list.
        </li>
      </ul>

      <h2>Citing this data</h2>
      <p>
        The data is free to reference with attribution to Where To Apply and a
        link to the page you took the figure from. For each fact, cite the
        underlying official source shown on the page as well. This is general
        information, not admissions or migration advice, and it does not replace
        a university&rsquo;s admissions office or a registered migration agent.
      </p>

      <h2>Corrections</h2>
      <p>
        Found something out of date or wrong? Email{" "}
        <a href="mailto:admin@wheretoapply.xyz">admin@wheretoapply.xyz</a> with
        the page URL, the figure, and a source. Confirmed errors are fixed as
        soon as they are verified.
      </p>
    </LegalPage>
  );
}
