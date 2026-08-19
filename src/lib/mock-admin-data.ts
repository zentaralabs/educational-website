// Placeholder data standing in for Supabase queries until the project is
// provisioned. Shape matches supabase/migrations/0001_initial_schema.sql —
// swap for real `.from("universities").select()` calls once wired up.

export type ContentStatus =
  | "draft"
  | "needs_review"
  | "verified"
  | "published"
  | "archived";

export type MockUniversity = {
  id: string;
  slug: string;
  name: string;
  country: "US" | "UK" | "CA" | "AU";
  city: string;
  institutionType: "public" | "private";
  acceptanceRate: number | null;
  status: ContentStatus;
  lastVerifiedAt: string | null;
  author: string;
  distinctiveSummary: string;
  internationalStudentNotes: string;
  tuitionInState: number | null;
  tuitionOutState: number | null;
  tuitionInternational: number | null;
  gpaRequirement: string | null;
  requiredTests: string[];
  websiteUrl: string;
};

export const MOCK_UNIVERSITIES: MockUniversity[] = [
  {
    id: "1",
    slug: "mit",
    name: "Massachusetts Institute of Technology",
    country: "US",
    city: "Cambridge, MA",
    institutionType: "private",
    acceptanceRate: 4.05,
    status: "published",
    lastVerifiedAt: "2026-06-12",
    author: "Priya Nair",
    distinctiveSummary:
      "MIT's undergraduate admissions weight demonstrated problem-solving over polish — the essays are shorter and more specific than most peer schools.",
    internationalStudentNotes:
      "Need-blind for all applicants regardless of citizenship, a rarity among US private universities.",
    tuitionInState: null,
    tuitionOutState: 57590,
    tuitionInternational: 57590,
    gpaRequirement: "No hard cutoff; unweighted 4.0 is typical among admits",
    requiredTests: ["SAT", "ACT"],
    websiteUrl: "https://mit.edu",
  },
  {
    id: "2",
    slug: "oxford",
    name: "University of Oxford",
    country: "UK",
    city: "Oxford",
    institutionType: "public",
    acceptanceRate: 13.1,
    status: "published",
    lastVerifiedAt: "2026-05-02",
    author: "Priya Nair",
    distinctiveSummary:
      "The collegiate system means your day-to-day experience depends heavily on which of the 39 colleges you're assigned to.",
    internationalStudentNotes:
      "Requires the UCAS application plus course-specific written work and, for most courses, an admissions test.",
    tuitionInState: 9535,
    tuitionOutState: 9535,
    tuitionInternational: 38000,
    gpaRequirement: "A*AA typical offer at A-Level",
    requiredTests: ["A-Levels"],
    websiteUrl: "https://ox.ac.uk",
  },
  {
    id: "3",
    slug: "university-of-toronto",
    name: "University of Toronto",
    country: "CA",
    city: "Toronto, ON",
    institutionType: "public",
    acceptanceRate: 43,
    status: "needs_review",
    lastVerifiedAt: "2025-08-30",
    author: "Marcus Webb",
    distinctiveSummary: "",
    internationalStudentNotes: "",
    tuitionInState: 6590,
    tuitionOutState: 6590,
    tuitionInternational: 62430,
    gpaRequirement: "Low-to-mid 90s average for competitive programs",
    requiredTests: [],
    websiteUrl: "https://utoronto.ca",
  },
  {
    id: "4",
    slug: "university-of-melbourne",
    name: "University of Melbourne",
    country: "AU",
    city: "Melbourne, VIC",
    institutionType: "public",
    acceptanceRate: 70,
    status: "draft",
    lastVerifiedAt: null,
    author: "Marcus Webb",
    distinctiveSummary: "",
    internationalStudentNotes: "",
    tuitionInState: 8000,
    tuitionOutState: 8000,
    tuitionInternational: 45000,
    gpaRequirement: "ATAR varies by course, typically 80-95",
    requiredTests: [],
    websiteUrl: "https://unimelb.edu.au",
  },
  {
    id: "5",
    slug: "ucla",
    name: "University of California, Los Angeles",
    country: "US",
    city: "Los Angeles, CA",
    institutionType: "public",
    acceptanceRate: 8.6,
    status: "archived",
    lastVerifiedAt: "2024-11-01",
    author: "Priya Nair",
    distinctiveSummary:
      "Program was archived pending a data re-check after the 2025 admissions policy change — see review queue.",
    internationalStudentNotes: "",
    tuitionInState: 13804,
    tuitionOutState: 46326,
    tuitionInternational: 46326,
    gpaRequirement: "Weighted 4.5+ typical among admits",
    requiredTests: [],
    websiteUrl: "https://ucla.edu",
  },
];

export const COUNTRY_LABELS: Record<MockUniversity["country"], string> = {
  US: "United States",
  UK: "United Kingdom",
  CA: "Canada",
  AU: "Australia",
};
