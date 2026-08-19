// Placeholder data standing in for Supabase queries until the project is
// provisioned. Shape matches supabase/migrations/0001_initial_schema.sql —
// swap for real `.from("deadlines").select()` calls once wired up.

import type { ContentStatus } from "./mock-admin-data";

export const DEGREE_LEVELS = [
  "Undergraduate",
  "Graduate",
  "PhD",
  "Foundation/Pathway",
] as const;
export type DegreeLevel = (typeof DEGREE_LEVELS)[number];

export const DEADLINE_TYPES = [
  "Early Decision",
  "Early Action",
  "Regular Decision",
  "Rolling",
] as const;
export type DeadlineType = (typeof DEADLINE_TYPES)[number];

export const APPLICATION_PLATFORMS = [
  "Common App",
  "UCAS",
  "OUAC",
  "Direct",
] as const;
export type ApplicationPlatform = (typeof APPLICATION_PLATFORMS)[number];

export type MockDeadline = {
  id: string;
  universityName: string;
  universitySlug: string;
  country: "US" | "UK" | "CA" | "AU";
  degreeLevel: DegreeLevel;
  deadlineType: DeadlineType;
  deadlineDate: string; // YYYY-MM-DD
  isRolling: boolean;
  applicationPlatform: ApplicationPlatform;
  status: ContentStatus;
  lastVerifiedAt: string | null;
};

export const MOCK_DEADLINES: MockDeadline[] = [
  {
    id: "d1",
    universityName: "Massachusetts Institute of Technology",
    universitySlug: "mit",
    country: "US",
    degreeLevel: "Undergraduate",
    deadlineType: "Early Action",
    deadlineDate: "2026-11-01",
    isRolling: false,
    applicationPlatform: "Common App",
    status: "published",
    lastVerifiedAt: "2026-06-12",
  },
  {
    id: "d2",
    universityName: "Massachusetts Institute of Technology",
    universitySlug: "mit",
    country: "US",
    degreeLevel: "Undergraduate",
    deadlineType: "Regular Decision",
    deadlineDate: "2027-01-04",
    isRolling: false,
    applicationPlatform: "Common App",
    status: "published",
    lastVerifiedAt: "2026-06-12",
  },
  {
    id: "d3",
    universityName: "University of Oxford",
    universitySlug: "oxford",
    country: "UK",
    degreeLevel: "Undergraduate",
    deadlineType: "Regular Decision",
    deadlineDate: "2026-10-15",
    isRolling: false,
    applicationPlatform: "UCAS",
    status: "published",
    lastVerifiedAt: "2026-05-02",
  },
  {
    id: "d4",
    universityName: "University of Toronto",
    universitySlug: "university-of-toronto",
    country: "CA",
    degreeLevel: "Undergraduate",
    deadlineType: "Regular Decision",
    deadlineDate: "2027-01-15",
    isRolling: false,
    applicationPlatform: "OUAC",
    status: "needs_review",
    lastVerifiedAt: "2025-08-30",
  },
  {
    id: "d5",
    universityName: "University of Melbourne",
    universitySlug: "university-of-melbourne",
    country: "AU",
    degreeLevel: "Undergraduate",
    deadlineType: "Rolling",
    deadlineDate: "2026-12-01",
    isRolling: true,
    applicationPlatform: "Direct",
    status: "draft",
    lastVerifiedAt: null,
  },
  {
    id: "d6",
    universityName: "University of California, Los Angeles",
    universitySlug: "ucla",
    country: "US",
    degreeLevel: "Undergraduate",
    deadlineType: "Regular Decision",
    deadlineDate: "2026-11-30",
    isRolling: false,
    applicationPlatform: "Common App",
    status: "archived",
    lastVerifiedAt: "2024-11-01",
  },
  {
    id: "d7",
    universityName: "University of Oxford",
    universitySlug: "oxford",
    country: "UK",
    degreeLevel: "Graduate",
    deadlineType: "Rolling",
    deadlineDate: "2027-03-01",
    isRolling: true,
    applicationPlatform: "Direct",
    status: "published",
    lastVerifiedAt: "2026-05-02",
  },
  {
    id: "d8",
    universityName: "University of Toronto",
    universitySlug: "university-of-toronto",
    country: "CA",
    degreeLevel: "Graduate",
    deadlineType: "Early Decision",
    deadlineDate: "2026-09-10",
    isRolling: false,
    applicationPlatform: "OUAC",
    status: "published",
    lastVerifiedAt: "2026-06-20",
  },
];
