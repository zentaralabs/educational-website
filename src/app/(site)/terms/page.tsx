import { LegalPage } from "@/components/site/LegalPage";

export const metadata = {
  title: "Terms of Service",
  description: "The terms governing use of the Where To Apply website.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service" updated="August 20, 2026">
      <p>
        By using Where To Apply, you agree to these terms. If you don&rsquo;t
        agree, please don&rsquo;t use the site.
      </p>

      <h2>Use of content</h2>
      <p>
        The content on this site (deadline data, university profiles,
        guides, and comparisons) is provided for personal, non-commercial
        use in researching university applications. You may link to any
        page on this site. You may not scrape, republish, or redistribute
        our content in bulk, or represent it as your own, without our
        written permission.
      </p>

      <h2>No professional advice</h2>
      <p>
        Content on this site is informational only and is not official
        admissions, financial, immigration, or legal advice. See our{" "}
        <a href="/disclaimer">disclaimer</a> for details.
      </p>

      <h2>Accuracy</h2>
      <p>
        We work to keep deadlines, costs, and requirements current and
        sourced, but universities change these without notice, and we can
        make mistakes. Always verify time-sensitive information directly
        with the university before relying on it. We&rsquo;re not liable
        for decisions made based on information found on this site.
      </p>

      <h2>External links</h2>
      <p>
        This site links to official university and third-party websites. We
        don&rsquo;t control and aren&rsquo;t responsible for their content
        or availability.
      </p>

      <h2>Changes</h2>
      <p>
        We may update these terms as the site evolves. Continued use of the
        site after a change means you accept the updated terms.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about these terms can be sent to{" "}
        <a href="mailto:admin@wheretoapply.xyz">admin@wheretoapply.xyz</a>.
      </p>
    </LegalPage>
  );
}
