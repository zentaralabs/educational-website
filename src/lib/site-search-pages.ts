/**
 * Static, non-database pages worth surfacing directly in site search —
 * calculators, tools, and hub pages that a query like "points calculator"
 * or "wam calculator" should hit on their own, not just via guides that
 * happen to mention them.
 */
export type StaticSearchPage = {
  slug: string;
  name: string;
  description: string;
  href: string;
  /** Extra terms to match beyond the name itself. */
  keywords: string;
};

export const STATIC_SEARCH_PAGES: StaticSearchPage[] = [
  {
    slug: "points-calculator",
    name: "Points calculator",
    description: "Estimate your skilled migration score (189, 190, 491)",
    href: "/visas/points-calculator",
    keywords: "skilled migration points test 189 190 491 skillselect score",
  },
  {
    slug: "cost-calculator",
    name: "Cost calculator",
    description: "Full cost of your degree: tuition, rent, visa and flights",
    href: "/cost-calculator",
    keywords: "tuition rent visa flights budget total cost degree",
  },
  {
    slug: "wam-calculator",
    name: "WAM calculator",
    description: "Weighted Average Mark from your subject marks",
    href: "/wam-calculator",
    keywords: "weighted average mark gpa grade",
  },
  {
    slug: "quiz",
    name: "Course match quiz",
    description: "2-minute quiz to find a course match, not a lead-gen form",
    href: "/quiz",
    keywords: "course match find university quiz",
  },
  {
    slug: "deadlines",
    name: "Application deadlines",
    description: "Apply-by dates for every intake",
    href: "/deadlines",
    keywords: "intake dates apply by calendar closing",
  },
  {
    slug: "invitation-rounds",
    name: "SkillSelect invitation rounds",
    description: "SkillSelect cut-offs, round by round",
    href: "/visas/invitation-rounds",
    keywords: "skillselect eoi expression of interest cut-off round invite",
  },
  {
    slug: "compare-universities",
    name: "Compare universities",
    description: "Tuition, selectivity and entry, side by side",
    href: "/compare/universities",
    keywords: "compare side by side tuition selectivity entry",
  },
  {
    slug: "occupations",
    name: "Occupations",
    description: "Which degree leads to which skilled occupation",
    href: "/occupations",
    keywords: "occupation career pr pathway anzsco skilled",
  },
  {
    slug: "updates",
    name: "Updates",
    description: "Student visa & policy changes, dated and sourced",
    href: "/updates",
    keywords: "policy change news visa update announcement",
  },
  {
    slug: "visas",
    name: "All visa subclasses",
    description: "Student, graduate, skilled, family, working holiday",
    href: "/visas",
    keywords: "visa subclass list types",
  },
  {
    slug: "scholarships",
    name: "Scholarships",
    description: "Funding you can actually apply for",
    href: "/scholarships",
    keywords: "scholarship funding financial aid",
  },
  {
    slug: "best",
    name: "Best universities (shortlists)",
    description: "Ranked shortlists by field",
    href: "/best",
    keywords: "best top ranked shortlist affordable regional",
  },
  {
    slug: "cost-of-living",
    name: "Cost of living",
    description: "Monthly budgets by city",
    href: "/cost-of-living",
    keywords: "living costs rent budget city expenses",
  },
  {
    slug: "study",
    name: "Courses by subject",
    description: "Browse programs by subject",
    href: "/study",
    keywords: "subject field of study courses browse",
  },
  {
    slug: "international",
    name: "Applying from a specific country",
    description: "Study in Australia from India, Nepal, China and more",
    href: "/international",
    keywords: "applying from country origin nepal india china",
  },
];
