import { LegalPage } from "@/components/site/LegalPage";
import { breadcrumbJsonLd } from "@/lib/breadcrumb-jsonld";

export const metadata = {
  title: { absolute: "About Where To Apply" },
  description:
    "Why Where To Apply exists, how content is fact-checked, and who writes it.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <LegalPage title="About Where To Apply" updated="August 20, 2026">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([{ label: "Home", href: "/" }, { label: "About" }]),
          ),
        }}
      />
      <p>
        Where To Apply exists because application deadlines, requirements,
        and costs for studying abroad are scattered across hundreds of
        university websites, each formatted differently and each easy to
        miss a change on. We aggregate that information into one place,
        structured and kept current, so applicants and families can plan
        without hunting through a dozen admissions portals.
      </p>

      <h2>Who runs this site</h2>
      <p>
        Where To Apply is written and maintained by Roman Lama, working from
        Nepal. It is an independent project, not a migration agency or an
        education agent, and it does not place students or take placement
        commissions from any university. It began as a way to keep track of the
        deadline, cost, and requirement details that are scattered across dozens
        of university and government pages, and it is kept current the same way:
        by checking each figure against its official source.
      </p>

      <h2>How we fact-check</h2>
      <p>
        Every deadline, tuition figure, and admissions requirement on this
        site is sourced from an official university page, application
        platform, or government source at the time it was verified. We link
        that source and show a &ldquo;last verified&rdquo; date on every
        fact-bearing page. Nothing is generated without a human checking it
        against the original source first. Our{" "}
        <a href="/editorial-policy">editorial policy</a> has the full process,
        the <a href="/methodology">methodology page</a> covers the dataset and
        its sources, and the <a href="/disclaimer">disclaimer</a> covers what
        that does and doesn&rsquo;t guarantee.
      </p>

      <h2>Narrative content</h2>
      <p>
        Guides and university write-ups are drafted with AI assistance and
        then substantively rewritten and fact-checked by a human editor
        before publishing, not lightly proofread. Real bylines are on every
        guide and university profile so you know who stands behind it.
      </p>

      <h2>How this site is funded</h2>
      <p>
        Where To Apply is supported by display advertising and, in some
        cases, affiliate or referral relationships with scholarship and
        financial-aid providers. Editorial content is not influenced by
        those relationships. A scholarship or program appearing on this
        site is not an endorsement, and inclusion criteria are the same
        whether or not a relationship exists.
      </p>
    </LegalPage>
  );
}
