/**
 * Curated internal-linking map. The `guide_related_guides` join table is
 * empty and the admin picker was never used, so cross-links between guides,
 * visa subclasses, and blog posts are defined here in code (same pattern as
 * `subjects.ts` and `collections.ts`). Every long-form page renders a
 * "related" block from these, so every guide, visa, and blog post links 3 to
 * 6 siblings with descriptive anchor text and no page is a dead end.
 *
 * Cannibalisation routing (see GROWTH_PLAN.md): for each query cluster one
 * page is the canonical target and the rest link up to it.
 *   - Intake timing: /deadlines/{feb,july}-2027-intake are canonical; the
 *     "february or july" guide is the decision page and links both hubs.
 *   - Regional study: the regional-area guide is canonical for the concept;
 *     the /best regional collection is the "see the universities" companion.
 *   - How to apply: the without-an-agent guide is canonical for the generic
 *     process; /international/{country}/how-to-apply for the per-country one.
 */

export type RelatedLink = { href: string; label: string };

const GUIDE_LABEL: Record<string, string> = {
  "applying-to-australian-universities-without-an-agent": "Applying without an agent",
  "australia-student-visa-cost": "Student visa cost breakdown",
  "bringing-family-on-an-australian-student-visa": "Bringing your partner and children",
  "check-australian-university-student-visa-priority": "Check a university's visa priority",
  "choosing-a-regional-area-to-study-in-australia": "Studying in regional Australia",
  "commonwealth-supported-places-explained": "Commonwealth Supported Places (CSP)",
  "cricos-and-course-accreditation-explained": "CRICOS and AQF explained",
  "february-vs-july-intake-in-australia": "February or July intake",
  "first-month-in-australia-international-student-checklist": "Your first month in Australia",
  "genuine-student-requirement-how-to-write-your-statement":
    "Writing a Genuine Student statement",
  "genuine-student-statement-examples": "Genuine Student statement examples",
  "getting-a-skills-assessment-in-australia": "Getting a skills assessment",
  "getting-your-qualifications-recognised-in-australia":
    "Getting your qualifications recognised",
  "how-the-australian-points-test-works": "How the points test works",
  "how-to-ask-for-a-letter-of-recommendation": "Asking for a recommendation letter",
  "how-to-write-a-personal-statement": "Writing a personal statement",
  "ielts-vs-pte-for-australian-university-admission": "IELTS vs PTE",
  "moving-money-to-australia-for-the-student-visa": "Moving money to Australia",
  "oshc-health-cover-for-international-students": "OSHC health cover",
  "permanent-residence-to-australian-citizenship": "From PR to citizenship",
  "proving-funds-for-an-australian-student-visa": "Proving your funds",
  "real-cost-of-studying-in-australia": "The real cost of studying in Australia",
  "study-gaps-and-the-australian-student-visa": "Study gaps and the student visa",
  "study-to-permanent-residence-pathway-australia": "The study-to-PR pathway",
  "studying-in-australia-without-ielts": "Studying without IELTS",
  "temporary-graduate-visa-485-guide": "The 485 graduate visa, explained",
  "training-visa-407-vs-skills-in-demand-visa-482": "407 Training vs 482 Skills in Demand",
  "transferring-universities-without-losing-credits": "Transferring universities",
  "what-to-do-if-your-student-visa-is-refused": "If your student visa is refused",
  "which-australian-courses-lead-to-permanent-residence": "Courses that lead to PR",
  "why-study-in-australia": "Why study in Australia",
  "work-and-holiday-visa-462-ballot": "The Work and Holiday (462) ballot",
  "working-while-you-study-in-australia": "Working while you study",
  "writing-a-scholarship-essay-that-gets-read": "Writing a scholarship essay",
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
  "training-visa-407": "Training visa (407)",
  "partner-visa-820-801": "Partner visa, onshore (820/801)",
  "partner-visa-309-100": "Partner visa, offshore (309/100)",
  "work-holiday-462": "Work and Holiday visa (462)",
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
const COST_CALC: RelatedLink = {
  href: "/cost-calculator",
  label: "Total cost calculator",
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
const DEADLINES: RelatedLink = {
  href: "/deadlines",
  label: "Application deadline calendar",
};
const FEB_INTAKE: RelatedLink = {
  href: "/deadlines/february-2027-intake",
  label: "February 2027 intake deadlines",
};
const JULY_INTAKE: RelatedLink = {
  href: "/deadlines/july-2027-intake",
  label: "July 2027 intake deadlines",
};
const REGIONAL_UNIS: RelatedLink = {
  href: "/best/regional-australian-universities-for-skilled-migration",
  label: "Regional universities for skilled migration",
};
const AFFORDABLE_UNIS: RelatedLink = {
  href: "/best/affordable-australian-universities-for-international-students",
  label: "Most affordable universities",
};
const applyFrom = (country: string, name: string): RelatedLink => ({
  href: `/international/${country}/how-to-apply`,
  label: `How to apply from ${name}`,
});

// ---------------------------------------------------------------------------
// Guides. Every published guide has an entry so none renders an empty
// "Keep reading" block.
// ---------------------------------------------------------------------------

const GUIDE_RELATED: Record<string, RelatedLink[]> = {
  "study-to-permanent-residence-pathway-australia": [
    g("how-the-australian-points-test-works"),
    g("getting-a-skills-assessment-in-australia"),
    g("which-australian-courses-lead-to-permanent-residence"),
    g("choosing-a-regional-area-to-study-in-australia"),
    v("temporary-graduate-485"),
    ROUNDS,
  ],
  "which-australian-courses-lead-to-permanent-residence": [
    g("study-to-permanent-residence-pathway-australia"),
    g("getting-a-skills-assessment-in-australia"),
    g("how-the-australian-points-test-works"),
    v("temporary-graduate-485"),
    CALCULATOR,
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
    g("genuine-student-statement-examples"),
    g("proving-funds-for-an-australian-student-visa"),
    g("what-to-do-if-your-student-visa-is-refused"),
    g("study-gaps-and-the-australian-student-visa"),
    v("student-500"),
    COUNTRY_HUB,
  ],
  "genuine-student-statement-examples": [
    g("genuine-student-requirement-how-to-write-your-statement"),
    g("proving-funds-for-an-australian-student-visa"),
    g("study-gaps-and-the-australian-student-visa"),
    g("what-to-do-if-your-student-visa-is-refused"),
    v("student-500"),
    COUNTRY_HUB,
  ],
  "study-gaps-and-the-australian-student-visa": [
    g("genuine-student-requirement-how-to-write-your-statement"),
    g("genuine-student-statement-examples"),
    g("what-to-do-if-your-student-visa-is-refused"),
    v("student-500"),
  ],
  "getting-a-skills-assessment-in-australia": [
    g("how-the-australian-points-test-works"),
    g("study-to-permanent-residence-pathway-australia"),
    g("getting-your-qualifications-recognised-in-australia"),
    v("skilled-independent-189"),
    v("temporary-graduate-485"),
  ],
  "getting-your-qualifications-recognised-in-australia": [
    g("cricos-and-course-accreditation-explained"),
    g("getting-a-skills-assessment-in-australia"),
    g("studying-in-australia-without-ielts"),
    v("student-500"),
    COUNTRY_HUB,
  ],
  "choosing-a-regional-area-to-study-in-australia": [
    g("how-the-australian-points-test-works"),
    g("study-to-permanent-residence-pathway-australia"),
    g("real-cost-of-studying-in-australia"),
    v("skilled-work-regional-491"),
    REGIONAL_UNIS,
    COST_OF_LIVING,
  ],
  "oshc-health-cover-for-international-students": [
    g("real-cost-of-studying-in-australia"),
    g("proving-funds-for-an-australian-student-visa"),
    g("first-month-in-australia-international-student-checklist"),
    v("student-500"),
  ],
  "proving-funds-for-an-australian-student-visa": [
    g("real-cost-of-studying-in-australia"),
    g("moving-money-to-australia-for-the-student-visa"),
    g("genuine-student-requirement-how-to-write-your-statement"),
    v("student-500"),
    COST_CALC,
    COUNTRY_HUB,
  ],
  "moving-money-to-australia-for-the-student-visa": [
    g("proving-funds-for-an-australian-student-visa"),
    g("australia-student-visa-cost"),
    g("real-cost-of-studying-in-australia"),
    COUNTRY_HUB,
    COST_CALC,
  ],
  "australia-student-visa-cost": [
    g("real-cost-of-studying-in-australia"),
    g("proving-funds-for-an-australian-student-visa"),
    g("moving-money-to-australia-for-the-student-visa"),
    v("student-500"),
    COST_CALC,
  ],
  "real-cost-of-studying-in-australia": [
    g("proving-funds-for-an-australian-student-visa"),
    g("australia-student-visa-cost"),
    g("working-while-you-study-in-australia"),
    COST_CALC,
    COST_OF_LIVING,
    AFFORDABLE_UNIS,
  ],
  "cricos-and-course-accreditation-explained": [
    g("getting-your-qualifications-recognised-in-australia"),
    g("study-to-permanent-residence-pathway-australia"),
    g("commonwealth-supported-places-explained"),
    v("student-500"),
  ],
  "commonwealth-supported-places-explained": [
    g("real-cost-of-studying-in-australia"),
    g("cricos-and-course-accreditation-explained"),
    g("which-australian-courses-lead-to-permanent-residence"),
    SCHOLARSHIPS,
  ],
  "working-while-you-study-in-australia": [
    g("real-cost-of-studying-in-australia"),
    g("bringing-family-on-an-australian-student-visa"),
    g("study-to-permanent-residence-pathway-australia"),
    v("student-500"),
    v("temporary-graduate-485"),
  ],
  "bringing-family-on-an-australian-student-visa": [
    g("working-while-you-study-in-australia"),
    g("proving-funds-for-an-australian-student-visa"),
    g("real-cost-of-studying-in-australia"),
    v("student-500"),
  ],
  "what-to-do-if-your-student-visa-is-refused": [
    g("genuine-student-requirement-how-to-write-your-statement"),
    g("genuine-student-statement-examples"),
    g("proving-funds-for-an-australian-student-visa"),
    v("student-500"),
    COUNTRY_HUB,
  ],
  "applying-to-australian-universities-without-an-agent": [
    g("getting-your-qualifications-recognised-in-australia"),
    g("genuine-student-requirement-how-to-write-your-statement"),
    g("check-australian-university-student-visa-priority"),
    applyFrom("nepal", "Nepal"),
    applyFrom("india", "India"),
    FEB_INTAKE,
  ],
  "february-vs-july-intake-in-australia": [
    FEB_INTAKE,
    JULY_INTAKE,
    DEADLINES,
    g("applying-to-australian-universities-without-an-agent"),
    v("student-500"),
    COUNTRY_HUB,
  ],
  "check-australian-university-student-visa-priority": [
    g("genuine-student-requirement-how-to-write-your-statement"),
    g("proving-funds-for-an-australian-student-visa"),
    g("what-to-do-if-your-student-visa-is-refused"),
    v("student-500"),
    FEB_INTAKE,
  ],
  "first-month-in-australia-international-student-checklist": [
    g("oshc-health-cover-for-international-students"),
    g("working-while-you-study-in-australia"),
    g("real-cost-of-studying-in-australia"),
    v("student-500"),
    COST_OF_LIVING,
  ],
  "temporary-graduate-visa-485-guide": [
    g("study-to-permanent-residence-pathway-australia"),
    g("getting-a-skills-assessment-in-australia"),
    g("how-the-australian-points-test-works"),
    v("temporary-graduate-485"),
    v("skilled-independent-189"),
    ROUNDS,
  ],
  "training-visa-407-vs-skills-in-demand-visa-482": [
    g("study-to-permanent-residence-pathway-australia"),
    g("getting-a-skills-assessment-in-australia"),
    v("training-visa-407"),
    v("skills-in-demand-482"),
    v("employer-nomination-scheme-186"),
  ],
  "permanent-residence-to-australian-citizenship": [
    g("study-to-permanent-residence-pathway-australia"),
    g("which-australian-courses-lead-to-permanent-residence"),
    v("skilled-independent-189"),
    v("permanent-residence-skilled-regional-191"),
  ],
  "work-and-holiday-visa-462-ballot": [
    g("why-study-in-australia"),
    v("work-holiday-462"),
    v("student-500"),
    v("visitor-visa-600"),
  ],
  "why-study-in-australia": [
    g("study-to-permanent-residence-pathway-australia"),
    g("real-cost-of-studying-in-australia"),
    g("february-vs-july-intake-in-australia"),
    v("student-500"),
    COUNTRY_HUB,
  ],
  "studying-in-australia-without-ielts": [
    g("ielts-vs-pte-for-australian-university-admission"),
    g("getting-your-qualifications-recognised-in-australia"),
    g("genuine-student-requirement-how-to-write-your-statement"),
    v("student-500"),
  ],
  "ielts-vs-pte-for-australian-university-admission": [
    g("studying-in-australia-without-ielts"),
    g("how-the-australian-points-test-works"),
    g("genuine-student-requirement-how-to-write-your-statement"),
    v("student-500"),
  ],
  "transferring-universities-without-losing-credits": [
    g("cricos-and-course-accreditation-explained"),
    g("getting-your-qualifications-recognised-in-australia"),
    g("what-to-do-if-your-student-visa-is-refused"),
    v("student-500"),
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
  "writing-a-scholarship-essay-that-gets-read": [
    g("how-to-write-a-personal-statement"),
    g("how-to-ask-for-a-letter-of-recommendation"),
    SCHOLARSHIPS,
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
    g("applying-to-australian-universities-without-an-agent"),
    FEB_INTAKE,
    v("temporary-graduate-485"),
  ],
  "temporary-graduate-485": [
    g("temporary-graduate-visa-485-guide"),
    g("study-to-permanent-residence-pathway-australia"),
    g("getting-a-skills-assessment-in-australia"),
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
    REGIONAL_UNIS,
  ],
  "permanent-residence-skilled-regional-191": [
    g("choosing-a-regional-area-to-study-in-australia"),
    g("study-to-permanent-residence-pathway-australia"),
    g("permanent-residence-to-australian-citizenship"),
    v("skilled-work-regional-491"),
    v("skilled-employer-sponsored-regional-494"),
  ],
  "skills-in-demand-482": [
    g("training-visa-407-vs-skills-in-demand-visa-482"),
    g("getting-a-skills-assessment-in-australia"),
    g("study-to-permanent-residence-pathway-australia"),
    v("employer-nomination-scheme-186"),
    v("temporary-graduate-485"),
    v("skilled-employer-sponsored-regional-494"),
  ],
  "employer-nomination-scheme-186": [
    g("getting-a-skills-assessment-in-australia"),
    g("permanent-residence-to-australian-citizenship"),
    v("skills-in-demand-482"),
    v("temporary-graduate-485"),
  ],
  "skilled-employer-sponsored-regional-494": [
    g("choosing-a-regional-area-to-study-in-australia"),
    g("getting-a-skills-assessment-in-australia"),
    v("permanent-residence-skilled-regional-191"),
    v("skills-in-demand-482"),
    REGIONAL_UNIS,
  ],
  "training-visa-407": [
    g("training-visa-407-vs-skills-in-demand-visa-482"),
    g("getting-a-skills-assessment-in-australia"),
    v("skills-in-demand-482"),
    v("temporary-graduate-485"),
  ],
  "partner-visa-820-801": [
    v("partner-visa-309-100"),
    g("bringing-family-on-an-australian-student-visa"),
  ],
  "partner-visa-309-100": [
    v("partner-visa-820-801"),
    g("bringing-family-on-an-australian-student-visa"),
  ],
  "work-holiday-462": [
    g("work-and-holiday-visa-462-ballot"),
    g("why-study-in-australia"),
    v("student-500"),
    v("visitor-visa-600"),
  ],
  "visitor-visa-600": [
    v("student-500"),
    g("proving-funds-for-an-australian-student-visa"),
    g("why-study-in-australia"),
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
    g("training-visa-407-vs-skills-in-demand-visa-482"),
    g("study-to-permanent-residence-pathway-australia"),
  ],
  "485-graduate-visa-age-limit-drops-to-35": [
    v("temporary-graduate-485"),
    g("temporary-graduate-visa-485-guide"),
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
    g("australia-student-visa-cost"),
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
    g("genuine-student-statement-examples"),
    g("proving-funds-for-an-australian-student-visa"),
    v("student-500"),
  ],
  "ministerial-direction-115-student-visa-priority": [
    g("check-australian-university-student-visa-priority"),
    g("genuine-student-requirement-how-to-write-your-statement"),
    v("student-500"),
    FEB_INTAKE,
  ],
  "student-visa-refusal-rate-20-year-high-2026": [
    g("what-to-do-if-your-student-visa-is-refused"),
    g("genuine-student-requirement-how-to-write-your-statement"),
    g("proving-funds-for-an-australian-student-visa"),
    v("student-500"),
  ],
  "ministerial-direction-119-skilled-visa-priorities": [
    g("how-the-australian-points-test-works"),
    g("study-to-permanent-residence-pathway-australia"),
    v("skills-in-demand-482"),
    ROUNDS,
  ],
  "why-65-points-wont-get-you-a-skilled-visa-2026": [
    g("how-the-australian-points-test-works"),
    CALCULATOR,
    ROUNDS,
    v("skilled-independent-189"),
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
