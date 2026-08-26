import { LegalPage } from "@/components/site/LegalPage";

export const metadata = {
  title: "Disclaimer",
  description:
    "Where To Apply provides informational content only — not official admissions, financial, or legal advice.",
  alternates: { canonical: "/disclaimer" },
};

export default function DisclaimerPage() {
  return (
    <LegalPage title="Disclaimer" updated="August 20, 2026">
      <p>
        Where To Apply provides general information about university
        admissions, deadlines, costs, and scholarships for informational
        purposes only. Nothing on this site constitutes official admissions
        guidance, financial advice, immigration/visa advice, or legal
        advice, and nothing here should be treated as a substitute for
        consulting a university&rsquo;s official admissions office, a
        licensed financial advisor, or a qualified immigration attorney.
      </p>

      <h2>Accuracy</h2>
      <p>
        We fact-check every deadline, cost figure, and requirement against
        an official source at the time it&rsquo;s verified, and we show a
        &ldquo;last verified&rdquo; date and source link on every
        fact-bearing page. Universities change deadlines, tuition, and
        requirements without notice, and errors can occur despite our
        process. Always confirm time-sensitive details — especially
        deadlines — directly with the university or application platform
        before acting on them.
      </p>

      <h2>No guarantee of outcomes</h2>
      <p>
        Acceptance rates, rankings, and admissions statistics shown on this
        site are historical or aggregated figures. They do not predict or
        guarantee any individual applicant&rsquo;s outcome.
      </p>

      <h2>Third-party links</h2>
      <p>
        This site links to official university websites, application
        platforms, and scholarship providers. We don&rsquo;t control and
        aren&rsquo;t responsible for the content, accuracy, or availability
        of those external sites.
      </p>

      <h2>No official affiliation</h2>
      <p>
        Where To Apply is an independent, privately operated resource. We
        are not affiliated with, endorsed by, or officially connected to
        any university, government body, or application platform referenced
        on this site.
      </p>
    </LegalPage>
  );
}
