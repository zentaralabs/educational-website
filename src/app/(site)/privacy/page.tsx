import { LegalPage } from "@/components/site/LegalPage";

export const metadata = {
  title: "Privacy Policy",
  description: "How Where To Apply collects, uses, and protects visitor data.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="August 20, 2026">
      <p>
        This policy explains what data Where To Apply (&ldquo;we&rdquo;,
        &ldquo;us&rdquo;) collects when you visit this site, and how it&rsquo;s
        used.
      </p>

      <h2>Information we collect</h2>
      <p>
        We don&rsquo;t require an account to browse deadlines, guides,
        university profiles, or scholarships, and we don&rsquo;t collect
        personal information unless you choose to give it to us — for
        example, by emailing us a correction or question.
      </p>

      <h2>Analytics</h2>
      <p>
        We use Google Analytics (GA4) and Google Search Console to
        understand aggregate traffic — which pages are visited, roughly
        where visitors are located at the country level, and how people
        arrive at the site. This data is used only in aggregate to improve
        content and site structure; we don&rsquo;t attempt to identify
        individual visitors from it. Analytics only run after you accept
        the cookie consent banner shown on your first visit; visitors in the
        UK/EU are shown this choice before any non-essential cookie is set.
      </p>

      <h2>Cookies</h2>
      <p>
        Essential cookies (e.g. remembering your consent choice) are set
        regardless. Analytics cookies are only set if you accept them via
        the consent banner. You can withdraw consent at any time by clearing
        your browser&rsquo;s cookies for this site.
      </p>

      <h2>Advertising</h2>
      <p>
        This site may display ads served by third-party ad networks (such as
        Google AdSense), which may use cookies to serve ads based on your
        visits to this and other sites. You can opt out of personalized
        advertising through your ad settings with the relevant provider.
      </p>

      <h2>Third-party links</h2>
      <p>
        Pages on this site link to official university, government, and
        scholarship-provider websites. Once you leave this site, their own
        privacy policies apply — we have no control over their data
        practices.
      </p>

      <h2>Data retention and requests</h2>
      <p>
        We don&rsquo;t store personal data beyond what&rsquo;s needed to
        respond to a message you send us. To request deletion of any
        personal information you&rsquo;ve shared with us, email{" "}
        <a href="mailto:hello@wheretoapply.example">hello@wheretoapply.example</a>.
      </p>

      <h2>Changes to this policy</h2>
      <p>
        We&rsquo;ll update the date at the top of this page whenever this
        policy changes materially.
      </p>
    </LegalPage>
  );
}
