// Placeholder data standing in for Supabase queries until the project is
// provisioned. Shape matches supabase/migrations/0001_initial_schema.sql —
// swap for real `.from("guides").select()` calls once wired up.

import type { ContentStatus } from "./mock-admin-data";

export const GUIDE_CATEGORIES = [
  "how-to",
  "comparison",
  "country-guide",
  "test-prep",
] as const;
export type GuideCategory = (typeof GUIDE_CATEGORIES)[number];

export type MockGuide = {
  id: string;
  slug: string;
  title: string;
  category: GuideCategory;
  country: "US" | "UK" | "CA" | "AU" | null;
  content: string;
  excerpt: string;
  author: string;
  status: ContentStatus;
  lastVerifiedAt: string | null;
  qaFactsVerified: boolean;
  qaSentenceVariationChecked: boolean;
  qaFirsthandDetailAdded: boolean;
  relatedGuideIds: string[];
  relatedUniversitySlugs: string[];
};

export const MOCK_GUIDES: MockGuide[] = [
  {
    id: "g1",
    slug: "how-to-write-a-personal-statement",
    title: "How to write a personal statement that doesn't sound like everyone else's",
    category: "how-to",
    country: null,
    content: `# How to write a personal statement that doesn't sound like everyone else's

Most personal statements read the same because most students start with the same prompt: "Tell me about yourself." That's the wrong starting point.

## Start with a specific moment, not a theme

Admissions readers see hundreds of essays about "passion for helping others" or "the day I discovered my love of science." What they don't see often is a specific, ungeneralizable detail — the exact thing that happened, in your words.

## Cut the first paragraph

If your essay still works after deleting the first paragraph, delete it. Most first paragraphs are throat-clearing.

## Read it out loud

If a sentence doesn't sound like something you'd say to a friend, rewrite it.`,
    excerpt:
      "Most personal statements read the same because most students start with the same prompt.",
    author: "Priya Nair",
    status: "published",
    lastVerifiedAt: "2026-04-10",
    qaFactsVerified: true,
    qaSentenceVariationChecked: true,
    qaFirsthandDetailAdded: true,
    relatedGuideIds: ["g2"],
    relatedUniversitySlugs: [],
  },
  {
    id: "g2",
    slug: "letters-of-recommendation-what-to-ask-for",
    title: "Letters of recommendation: what to actually ask your teacher for",
    category: "how-to",
    country: null,
    content: `# Letters of recommendation: what to actually ask your teacher for

Don't just ask "will you write me a letter." Give the teacher material to work with.

## Give them a one-page brag sheet

Specific projects, grades, moments in class they might not remember on their own.

## Ask early — at least a month out

Teachers write dozens of these. The earlier you ask, the more attention yours gets.`,
    excerpt: "Don't just ask \"will you write me a letter.\" Give the teacher material to work with.",
    author: "Marcus Webb",
    status: "needs_review",
    lastVerifiedAt: "2025-09-01",
    qaFactsVerified: true,
    qaSentenceVariationChecked: false,
    qaFirsthandDetailAdded: false,
    relatedGuideIds: ["g1"],
    relatedUniversitySlugs: [],
  },
  {
    id: "g3",
    slug: "us-vs-uk-applications",
    title: "US vs UK applications: the timeline difference that catches people out",
    category: "comparison",
    country: null,
    content: `# US vs UK applications: the timeline difference that catches people out

UCAS deadlines land months before most US Regular Decision deadlines. Students planning both often miss this.

## The core gap

UCAS: mid-October for Oxbridge and most competitive courses.
US Regular Decision: typically January.

That's a three-month head start UK applications need.`,
    excerpt: "UCAS deadlines land months before most US Regular Decision deadlines.",
    author: "Priya Nair",
    status: "draft",
    lastVerifiedAt: null,
    qaFactsVerified: false,
    qaSentenceVariationChecked: false,
    qaFirsthandDetailAdded: false,
    relatedGuideIds: [],
    relatedUniversitySlugs: ["oxford", "mit"],
  },
  {
    id: "g4",
    slug: "ielts-vs-toefl",
    title: "IELTS vs TOEFL: which one your target schools actually prefer",
    category: "test-prep",
    country: null,
    content: `# IELTS vs TOEFL: which one your target schools actually prefer

Both are accepted almost everywhere now, but individual departments sometimes have a soft preference. Check the department page, not just the general admissions page.`,
    excerpt: "Both are accepted almost everywhere now, but individual departments sometimes have a soft preference.",
    author: "Marcus Webb",
    status: "verified",
    lastVerifiedAt: "2026-02-14",
    qaFactsVerified: true,
    qaSentenceVariationChecked: true,
    qaFirsthandDetailAdded: false,
    relatedGuideIds: [],
    relatedUniversitySlugs: [],
  },
];
