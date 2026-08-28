import { LegalPage } from "@/components/site/LegalPage";

export const metadata = {
  title: "Editorial Policy",
  description:
    "How Where To Apply sources facts, verifies them, handles corrections, uses AI assistance, and keeps advertising separate from editorial.",
  alternates: { canonical: "/editorial-policy" },
};

export default function EditorialPolicyPage() {
  return (
    <LegalPage title="Editorial Policy" updated="August 28, 2026">
      <p>
        This page sets out how the content on Where To Apply is produced and
        maintained. The short version: every fact is tied to an official source
        and a date, narrative writing is edited by a person before it is
        published, and advertising has no say in what appears.
      </p>

      <h2>What counts as a fact here</h2>
      <p>
        Deadlines, tuition figures, application fees, entry requirements,
        English-test minimums, scholarship values, visa costs, and points-test
        values are treated as facts. Each one is checked against an official
        source at the time it is entered or updated: a university admissions or
        fees page, an application platform, or an Australian Government page such
        as the Department of Home Affairs. The source link and a
        &ldquo;last verified&rdquo; date appear on every page that carries these
        figures.
      </p>

      <h2>Why the dates matter</h2>
      <p>
        Most of these numbers change at least once a year. A
        &ldquo;last verified&rdquo; date more than a few months old means the
        figure was correct when checked but should be confirmed with the
        university or the Department before you rely on it. We re-check
        fast-moving pages, especially visa costs and the living-cost
        requirement, when a change is announced.
      </p>

      <h2>Guides and write-ups</h2>
      <p>
        The how-to guides, university profiles, and subject pages are drafted
        with AI assistance and then rewritten and fact-checked by a human editor
        before publishing. That means checking claims against primary sources,
        removing anything that cannot be supported, and rewriting for accuracy
        and plain language, not a light proofread. Analysis posts in the
        &ldquo;What we&rsquo;re watching&rdquo; category are labelled as
        estimates and state how confident we are.
      </p>

      <h2>Corrections</h2>
      <p>
        If something is wrong, email{" "}
        <a href="mailto:admin@wheretoapply.xyz">admin@wheretoapply.xyz</a> with
        the page URL, what is incorrect, and a source if you have one. Factual
        errors are fixed as soon as they are confirmed, and the
        &ldquo;last verified&rdquo; date is updated when we re-check the page.
      </p>

      <h2>Independence and advertising</h2>
      <p>
        Where To Apply is independent and is not a migration agency or an
        education agent. It does not place students or receive placement
        commissions. The site is supported by display advertising and, in some
        cases, affiliate or referral relationships with scholarship and
        financial-aid providers. Those relationships never affect whether
        something is included, how it is described, or where it ranks. A
        university, program, or scholarship appearing here is not an
        endorsement. See the <a href="/about">about page</a> and{" "}
        <a href="/disclaimer">disclaimer</a> for more.
      </p>

      <h2>What this site does not do</h2>
      <p>
        We do not give personalised admissions, financial, or immigration
        advice, and nothing here is a substitute for a university&rsquo;s
        admissions office, a licensed financial adviser, or a registered
        migration agent. See the <a href="/disclaimer">disclaimer</a>.
      </p>
    </LegalPage>
  );
}
