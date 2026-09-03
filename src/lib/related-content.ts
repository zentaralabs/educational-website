/**
 * Curated internal-linking map. The `guide_related_guides` join table is
 * empty and the admin picker was never used, so cross-links between guides,
 * visa subclasses, and blog posts are defined here in code (same pattern as
 * `subjects.ts` and `collections.ts`). Every page type renders a "related"
 * block from these, so the important pages always link 3 to 6 siblings with
 * descriptive anchor text.
 */

export type RelatedLink = { href: string; label: string };

const GUIDE_LABEL: Record<string, string> = {
  "how-to-write-a-personal-statement": "Writing a personal statement",
  "how-to-ask-for-a-letter-of-recommendation": "Asking for a recommendation letter",
  "transferring-universities-without-losing-credits": "Transferring universities",
  "writing-a-scholarship-essay-that-gets-read": "Writing a scholarship essay",
  "commonwealth-supported-places-explained": "Commonwealth Supported Places (CSP)",
  "ielts-vs-pte-for-australian-university-admission": "IELTS vs PTE",
  "real-cost-of-studying-in-australia": "The real cost of studying in Australia",
  "study-to-permanent-residence-pathway-australia": "The study-to-PR pathway",
  "what-to-do-if-your-student-visa-is-refused": "If your student visa is refused",
  "how-the-australian-points-test-works": "How the points test works",
  "genuine-student-requirement-how-to-write-your-statement":
    "Writing a Genuine Student statement",
  "getting-a-skills-assessment-in-australia": "Getting a skills assessment",
  "choosing-a-regional-area-to-study-in-australia": "Studying in regional Australia",
  "proving-funds-for-an-australian-student-visa": "Proving your funds",
  "cricos-and-course-accreditation-explained": "CRICOS and AQF explained",
  "oshc-health-cover-for-international-students": "OSHC health cover",
  "working-while-you-study-in-australia": "Working while you study",
};

const VISA_LABEL: Record<string, string> = {
  "student-500": "Student visa (500)",
  "temporary-graduate-485": "Temporary Graduate visa (485)",
  "skilled-independent-189": "Skilled Independent visa (189)",
  "skilled-nominated-190": "Skilled Nominated visa (190)",
  "skilled-work-regional-491": "Skilled Work Regional visa (491)",
  "permanent-residence-skilled-regional-191":
    "Permanent Residence Skilled Regional (191)",
  "skills-in-demand-482": "Skills in Demand visa (482)",
  "employer-nomination-scheme-186": "Employer Nomination Scheme (186)",
  "skilled-employer-sponsored-regional-494":
    "Skilled Employer Sponsored Regional (494)",
  "partner-visa-820-801": "Partner visa, onshore (820/801)",
  "partner-visa-309-100": "Partner visa, offshore (309/100)",
  "visitor-visa-600": "Visitor visa (600)",
};

const g = (slug: string): RelatedLink => ({
  href: `/guides/${slug}`,
  label: GUIDE_LABEL[slug] ?? slug,
});
const v = (slug: string): RelatedLink => ({
  href: `/visas/${slug}`,
  label: VISA_LABEL[slug] ?? slug,
});

const ROUNDS: RelatedLink = {
  href: "/visas/invitation-rounds",
  label: "SkillSelect invitation rounds",
};
const CALCULATOR: RelatedLink = {
  href: "/visas/points-calculator",
  label: "Points calculator",
};
const SCHOLARSHIPS: RelatedLink = {
  href: "/scholarships",
  label: "Scholarships for Australia",
};
const COST_OF_LIVING: RelatedLink = {
  href: "/cost-of-living",
  label: "Cost of living by city",
};
const COUNTRY_HUB: RelatedLink = {
  href: "/international",
  label: "Applying from your country",
};
const FEB_INTAKE: RelatedLink = {
  href: "/deadlines/february-2027-intake",
  label: "February 2027 intake deadlines",
};

// ---------------------------------------------------------------------------
// Guides
// ---------------------------------------------------------------------------

const GUIDE_RELATED: Record<string, RelatedLink[]> = {
  "study-to-permanent-residence-pathway-australia": [
    g("how-the-australian-points-test-works"),
    g("getting-a-skills-assessment-in-australia"),
    g("choosing-a-regional-area-to-study-in-australia"),
    v("temporary-graduate-485"),
    v("skilled-independent-189"),
    ROUNDS,
  ],
  "how-the-australian-points-test-works": [
    g("study-to-permanent-residence-pathway-australia"),
    g("getting-a-skills-assessment-in-australia"),
    g("choosing-a-regional-area-to-study-in-australia"),
    v("skilled-independent-189"),
    v("skilled-nominated-190"),
    CALCULATOR,
  ],
  "genuine-student-requirement-how-to-write-your-statement": [
    g("proving-funds-for-an-australian-student-visa"),
    g("what-to-do-if-your-student-visa-is-refused"),
    g("cricos-and-course-accreditation-explained"),
    v("student-500"),
    FEB_INTAKE,
    COUNTRY_HUB,
  ],
  "getting-a-skills-assessment-in-australia": [
    g("how-the-australian-points-test-works"),
    g("study-to-permanent-residence-pathway-australia"),
    v("skilled-independent-189"),
    v("temporary-graduate-485"),
  ],
  "choosing-a-regional-area-to-study-in-australia": [
    g("how-the-australian-points-test-works"),
    g("real-cost-of-studying-in-australia"),
    v("skilled-work-regional-491"),
    v("permanent-residence-skilled-regional-191"),
    COST_OF_LIVING,
  ],
  "oshc-health-cover-for-international-students": [
    g("proving-funds-for-an-australian-student-visa"),
    g("real-cost-of-studying-in-australia"),
    g("working-while-you-study-in-australia"),
    v("student-500"),
  ],
  "proving-funds-for-an-australian-student-visa": [
    g("real-cost-of-studying-in-australia"),
    g("genuine-student-requirement-how-to-write-your-statement"),
    g("oshc-health-cover-for-international-students"),
    v("student-500"),
    COUNTRY_HUB,
  ],
  "cricos-and-course-accreditation-explained": [
    g("study-to-permanent-residence-pathway-australia"),
    g("getting-a-skills-assessment-in-australia"),
    g("commonwealth-supported-places-explained"),
    v("student-500"),
  ],
  "working-while-you-study-in-australia": [
    g("real-cost-of-studying-in-australia"),
    g("study-to-permanent-residence-pathway-australia"),
    v("student-500"),
    v("temporary-graduate-485"),
  ],
  "what-to-do-if-your-student-visa-is-refused": [
    g("genuine-student-requirement-how-to-write-your-statement"),
    g("proving-funds-for-an-australian-student-visa"),
    v("student-500"),
    COUNTRY_HUB,
  ],
  "commonwealth-supported-places-explained": [
    g("real-cost-of-studying-in-australia"),
    g("cricos-and-course-accreditation-explained"),
    SCHOLARSHIPS,
  ],
  "real-cost-of-studying-in-australia": [
    g("proving-funds-for-an-australian-student-visa"),
    g("working-while-you-study-in-australia"),
    g("commonwealth-supported-places-explained"),
    COST_OF_LIVING,
    SCHOLARSHIPS,
  ],
  "how-to-write-a-personal-statement": [
    g("how-to-ask-for-a-letter-of-recommendation"),
    g("writing-a-scholarship-essay-that-gets-read"),
    g("genuine-student-requirement-how-to-write-your-statement"),
  ],
  "how-to-ask-for-a-letter-of-recommendation": [
    g("how-to-write-a-personal-statement"),
    g("writing-a-scholarship-essay-that-gets-read"),
  ],
  "transferring-universities-without-losing-credits": [
    g("cricos-and-course-accreditation-explained"),
    g("what-to-do-if-your-student-visa-is-refused"),
    v("student-500"),
  ],
  "writing-a-scholarship-essay-that-gets-read": [
    g("how-to-write-a-personal-statement"),
    g("how-to-ask-for-a-letter-of-recommendation"),
    SCHOLARSHIPS,
  ],
  "ielts-vs-pte-for-australian-university-admission": [
    g("how-the-australian-points-test-works"),
    g("genuine-student-requirement-how-to-write-your-statement"),
    v("student-500"),
  ],
};

// ---------------------------------------------------------------------------
// Visa subclasses
// ---------------------------------------------------------------------------

const VISA_RELATED: Record<string, RelatedLink[]> = {
  "student-500": [
    g("genuine-student-requirement-how-to-write-your-statement"),
    g("proving-funds-for-an-australian-student-visa"),
    g("working-while-you-study-in-australia"),
    FEB_INTAKE,
    COUNTRY_HUB,
    v("temporary-graduate-485"),
  ],
  "temporary-graduate-485": [
    g("study-to-permanent-residence-pathway-australia"),
    g("getting-a-skills-assessment-in-australia"),
    g("how-the-australian-points-test-works"),
    v("student-500"),
    v("skilled-independent-189"),
    v("skills-in-demand-482"),
  ],
  "skilled-independent-189": [
    g("how-the-australian-points-test-works"),
    g("getting-a-skills-assessment-in-australia"),
    g("study-to-permanent-residence-pathway-australia"),
    v("skilled-nominated-190"),
    v("skilled-work-regional-491"),
    ROUNDS,
    CALCULATOR,
  ],
  "skilled-nominated-190": [
    g("how-the-australian-points-test-works"),
    g("getting-a-skills-assessment-in-australia"),
    g("choosing-a-regional-area-to-study-in-australia"),
    v("skilled-independent-189"),
    v("skilled-work-regional-491"),
    CALCULATOR,
  ],
  "skilled-work-regional-491": [
    g("choosing-a-regional-area-to-study-in-australia"),
    g("how-the-australian-points-test-works"),
    g("getting-a-skills-assessment-in-australia"),
    v("permanent-residence-skilled-regional-191"),
    v("skilled-nominated-190"),
    v("skilled-independent-189"),
    CALCULATOR,
  ],
  "permanent-residence-skilled-regional-191": [
    g("choosing-a-regional-area-to-study-in-australia"),
    g("study-to-permanent-residence-pathway-australia"),
    v("skilled-work-regional-491"),
    v("skilled-employer-sponsored-regional-494"),
  ],
  "skills-in-demand-482": [
    g("getting-a-skills-assessment-in-australia"),
    g("study-to-permanent-residence-pathway-australia"),
    v("employer-nomination-scheme-186"),
    v("temporary-graduate-485"),
    v("skilled-employer-sponsored-regional-494"),
  ],
  "employer-nomination-scheme-186": [
    g("getting-a-skills-assessment-in-australia"),
    g("study-to-permanent-residence-pathway-australia"),
    v("skills-in-demand-482"),
    v("temporary-graduate-485"),
  ],
  "skilled-employer-sponsored-regional-494": [
    g("choosing-a-regional-area-to-study-in-australia"),
    g("getting-a-skills-assessment-in-australia"),
    v("permanent-residence-skilled-regional-191"),
    v("skills-in-demand-482"),
  ],
  "partner-visa-820-801": [v("partner-visa-309-100")],
  "partner-visa-309-100": [v("partner-visa-820-801")],
  "visitor-visa-600": [
    v("student-500"),
    g("proving-funds-for-an-australian-student-visa"),
  ],
};

// ---------------------------------------------------------------------------
// Blog posts
// ---------------------------------------------------------------------------

const BLOG_RELATED: Record<string, RelatedLink[]> = {
  "189-invitation-rounds-move-to-quarterly-2025-26": [
    ROUNDS,
    g("how-the-australian-points-test-works"),
    v("skilled-independent-189"),
  ],
  "skillselect-round-4-june-2026-subclass-189": [
    ROUNDS,
    CALCULATOR,
    g("how-the-australian-points-test-works"),
    v("skilled-independent-189"),
    v("skilled-nominated-190"),
  ],
  "skills-in-demand-visa-replaces-tss": [
    v("skills-in-demand-482"),
    v("employer-nomination-scheme-186"),
    g("study-to-permanent-residence-pathway-australia"),
  ],
  "485-graduate-visa-age-limit-drops-to-35": [
    v("temporary-graduate-485"),
    g("study-to-permanent-residence-pathway-australia"),
    g("working-while-you-study-in-australia"),
  ],
  "2025-26-state-nomination-allocations-190-491": [
    v("skilled-nominated-190"),
    v("skilled-work-regional-491"),
    g("how-the-australian-points-test-works"),
    g("choosing-a-regional-area-to-study-in-australia"),
  ],
  "what-we-are-watching-points-test-review": [
    g("how-the-australian-points-test-works"),
    CALCULATOR,
    v("skilled-independent-189"),
  ],
  "australia-student-visa-fee-increase-2026": [
    v("student-500"),
    g("proving-funds-for-an-australian-student-visa"),
    g("real-cost-of-studying-in-australia"),
  ],
  "adelaide-university-merger-what-it-means": [
    { href: "/universities/adelaide-university", label: "Adelaide University profile" },
    { href: "/compare/universities", label: "Compare universities" },
    g("real-cost-of-studying-in-australia"),
    FEB_INTAKE,
  ],
  "genuine-student-test-explained": [
    g("genuine-student-requirement-how-to-write-your-statement"),
    g("proving-funds-for-an-australian-student-visa"),
    v("student-500"),
  ],
};

// ---------------------------------------------------------------------------

export function guideRelated(slug: string): RelatedLink[] {
  return GUIDE_RELATED[slug] ?? [];
}

export function visaRelated(slug: string): RelatedLink[] {
  return VISA_RELATED[slug] ?? [];
}

export function blogRelated(slug: string): RelatedLink[] {
  return BLOG_RELATED[slug] ?? [];
}
