// Placeholder data standing in for Supabase queries until the project is
// provisioned. Shape matches supabase/migrations/0001_initial_schema.sql —
// swap for real `.from("scholarships").select()` calls once wired up.

import type { ContentStatus } from "./mock-admin-data";

export const SCHOLARSHIP_SCOPES = [
  "university-specific",
  "national",
  "external/foundation",
] as const;
export type ScholarshipScope = (typeof SCHOLARSHIP_SCOPES)[number];

export type MockScholarship = {
  id: string;
  name: string;
  scope: ScholarshipScope;
  amount: string;
  eligibility: string;
  deadlineDate: string | null;
  country: "US" | "UK" | "CA" | "AU" | null;
  externalUrl: string;
  status: ContentStatus;
  lastVerifiedAt: string | null;
  universitySlugs: string[];
};

export const MOCK_SCHOLARSHIPS: MockScholarship[] = [
  {
    id: "s1",
    name: "MIT Presidential Scholars Program",
    scope: "university-specific",
    amount: "Full tuition",
    eligibility: "Top 5% of admitted first-year class, awarded automatically",
    deadlineDate: null,
    country: "US",
    externalUrl: "https://mit.edu/financial-aid",
    status: "published",
    lastVerifiedAt: "2026-06-01",
    universitySlugs: ["mit"],
  },
  {
    id: "s2",
    name: "Rhodes Scholarship",
    scope: "external/foundation",
    amount: "Full funding for graduate study at Oxford",
    eligibility: "Exceptional intellect, character, and leadership; age and nationality restrictions apply",
    deadlineDate: "2026-10-01",
    country: "UK",
    externalUrl: "https://rhodeshouse.ox.ac.uk",
    status: "published",
    lastVerifiedAt: "2026-03-15",
    universitySlugs: ["oxford"],
  },
  {
    id: "s3",
    name: "Vanier Canada Graduate Scholarship",
    scope: "national",
    amount: "$50,000 CAD/year for 3 years",
    eligibility: "Doctoral students demonstrating leadership and academic excellence",
    deadlineDate: "2026-11-03",
    country: "CA",
    externalUrl: "https://vanier.gc.ca",
    status: "needs_review",
    lastVerifiedAt: "2025-11-20",
    universitySlugs: [],
  },
  {
    id: "s4",
    name: "Australia Awards Scholarship",
    scope: "national",
    amount: "Full tuition + living allowance",
    eligibility: "International students from eligible partner countries",
    deadlineDate: "2027-04-30",
    country: "AU",
    externalUrl: "https://australiaawards.gov.au",
    status: "draft",
    lastVerifiedAt: null,
    universitySlugs: ["university-of-melbourne"],
  },
  {
    id: "s5",
    name: "Toronto Excellence Award",
    scope: "university-specific",
    amount: "$10,000–$40,000 CAD, renewable",
    eligibility: "Entering first-year students with a 95%+ average",
    deadlineDate: "2026-12-01",
    country: "CA",
    externalUrl: "https://future.utoronto.ca/finances/",
    status: "verified",
    lastVerifiedAt: "2026-01-10",
    universitySlugs: ["university-of-toronto"],
  },
];
