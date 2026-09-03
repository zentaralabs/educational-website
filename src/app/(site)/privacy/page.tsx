import { LegalPage } from "@/components/site/LegalPage";
import { pageMetadata } from "@/lib/page-metadata";

export const metadata = pageMetadata({
  title: "Privacy Policy",
  description: "How Where To Apply collects, uses, and protects visitor data.",
  path: "/privacy",
  type: "website",
});

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="September 3, 2026">
      <p>
        This policy explains what data Where To Apply (&ldquo;we&rdquo;,
        &ldquo;us&rdquo;) collects when you visit this site, and how it&rsquo;s
        used.
      </p>

      <h2>Information we collect</h2>
      <p>
        We don&rsquo;t require an account to browse deadlines, guides,
        university profiles, or scholarships, and we don&rsquo;t collect
        personal information unless you choose to give it to us, for
        example by emailing us a correction or question.
      </p>

      <h2>Analytics</h2>
      <p>
        We use Google Analytics (GA4) and Google Search Console to
        understand aggregate traffic: which pages are visited, roughly
        where visitors are located at the country level, and how people
        arrive at the site. This data is used only in aggregate to improve
        content and site structure; we don&rsquo;t attempt to identify
        individual visitors from it. Analytics only run after you accept
        the cookie consent banner shown on your first visit; visitors in the
        UK/EU are shown this choice before any non-essential cookie is set.
      </p>

      <h2>Cookies</h2>
      <p>
        Your consent choice itself is stored in your browser&rsquo;s local
        storage, not in a cookie, and never leaves your device. Analytics
        cookies (Google Analytics 4) are set only if you accept them via the
        consent banner. You can withdraw consent at any time by clearing this
        site&rsquo;s data in your browser, which brings the banner back on
        your next visit.
      </p>
      <p>
        If advertising is introduced, advertising cookies will be treated the
        same way: not set until you have accepted them, and, for visitors in
        the UK and EEA, gathered through a consent tool that meets the
        applicable consent requirements.
      </p>

      <h2>Advertising</h2>
      <p>
        This site may display ads served by third-party ad networks. Where
        those ads are served by Google AdSense, the following applies.
      </p>
      <ul>
        <li>
          Third-party vendors, including Google, use cookies to serve ads
          based on your prior visits to this website or other websites.
        </li>
        <li>
          Google&rsquo;s use of advertising cookies enables it and its
          partners to serve ads to you based on your visit to this site
          and/or other sites on the internet.
        </li>
        <li>
          You can opt out of personalised advertising by visiting{" "}
          <a
            href="https://www.google.com/settings/ads"
            target="_blank"
            rel="noopener noreferrer nofollow"
          >
            Google Ads Settings
          </a>
          . You can opt out of a third-party vendor&rsquo;s use of cookies for
          personalised advertising at{" "}
          <a
            href="https://www.aboutads.info/choices/"
            target="_blank"
            rel="noopener noreferrer nofollow"
          >
            aboutads.info
          </a>
          .
        </li>
        <li>
          More detail on how Google handles data from sites that use its
          services is at{" "}
          <a
            href="https://policies.google.com/technologies/partner-sites"
            target="_blank"
            rel="noopener noreferrer nofollow"
          >
            How Google uses information from sites or apps that use our
            services
          </a>
          .
        </li>
      </ul>
      <p>
        No advertising is served on this site at the time of writing. If and
        when it is, ads will be labelled and kept off the pages people use to
        make a decision &mdash; calculators, verified data tables, and visa
        and deadline reference pages. Advertising never influences which
        universities, scholarships, or providers appear, or in what order; see
        our <a href="/editorial-policy">editorial policy</a>.
      </p>

      <h2>Third-party links</h2>
      <p>
        Pages on this site link to official university, government, and
        scholarship-provider websites. Once you leave this site, their own
        privacy policies apply, and we have no control over their data
        practices.
      </p>

      <h2>Data retention and requests</h2>
      <p>
        We don&rsquo;t store personal data beyond what&rsquo;s needed to
        respond to a message you send us. To request deletion of any
        personal information you&rsquo;ve shared with us, email{" "}
        <a href="mailto:admin@wheretoapply.xyz">admin@wheretoapply.xyz</a>.
      </p>

      <h2>Changes to this policy</h2>
      <p>
        We&rsquo;ll update the date at the top of this page whenever this
        policy changes materially.
      </p>
    </LegalPage>
  );
}
