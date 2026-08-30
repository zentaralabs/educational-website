import type { Metadata } from "next";
import { Fraunces, Public_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from "@/components/site/Analytics";
import { CookieConsentBanner } from "@/components/site/CookieConsentBanner";
import { SITE_DESCRIPTION, SITE_NAME, SITE_SAME_AS, SITE_URL } from "@/lib/site-config";

/** Site-wide publisher identity. Given a stable @id so page-level schema
 * (Article, Dataset, ItemList) can reference it as publisher. */
const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${SITE_URL}/#organization`,
  name: SITE_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/logo.png`,
  email: "admin@wheretoapply.xyz",
  description: SITE_DESCRIPTION,
  sameAs: SITE_SAME_AS,
  founder: { "@type": "Person", name: "Roman Lama" },
  foundingDate: "2026",
  knowsAbout: [
    "University admissions in Australia",
    "International student tuition and scholarships",
    "Australian student and skilled migration visas",
    "University application deadlines",
  ],
};

const fraunces = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  // opsz drives the display look; SOFT/WONK add the character that keeps
  // the headings from reading as plain bold body serif.
  axes: ["SOFT", "WONK", "opsz"],
});

const publicSans = Public_Sans({
  variable: "--font-body",
  subsets: ["latin"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-utility",
  weight: ["400", "500", "600"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `University Deadlines, Admissions & Costs | ${SITE_NAME}`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "en_US",
    url: "/",
    title: `University Deadlines, Admissions & Costs | ${SITE_NAME}`,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: `University Deadlines, Admissions & Costs | ${SITE_NAME}`,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
  },
  verification: {
    yandex: "454dbe084fa754b9",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${publicSans.variable} ${ibmPlexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-paper text-ink font-body">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        {children}
        <CookieConsentBanner />
        <Analytics />
      </body>
    </html>
  );
}
