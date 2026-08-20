import { LegalPage } from "@/components/site/LegalPage";

export const metadata = {
  title: "Contact",
  description: "How to reach Where To Apply with corrections, questions, or feedback.",
};

export default function ContactPage() {
  return (
    <LegalPage title="Contact" updated="August 20, 2026">
      <p>
        Spotted an outdated deadline, an incorrect figure, or a broken link?
        Corrections are the fastest way to help us keep this site accurate —
        please tell us which page, what&rsquo;s wrong, and a source if you
        have one.
      </p>

      <h2>Email</h2>
      <p>
        <a href="mailto:hello@wheretoapply.example">hello@wheretoapply.example</a>
      </p>

      <h2>What to include</h2>
      <ul>
        <li>The page URL</li>
        <li>What&rsquo;s outdated or incorrect</li>
        <li>A source, if you have one, so we can verify quickly</li>
      </ul>

      <p>
        We can&rsquo;t offer personalized admissions, financial, or legal
        advice — see our <a href="/disclaimer">disclaimer</a> — but we do
        read every message.
      </p>
    </LegalPage>
  );
}
