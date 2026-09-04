/** Matches the `category` values seeded into `visa_subclasses`. */
export const VISA_CATEGORY_LABELS: Record<string, string> = {
  student: "Student",
  graduate: "Graduate / post-study",
  skilled: "Skilled migration",
  "employer-sponsored": "Employer-sponsored",
  family: "Family & partner",
  "business-investor": "Business & investor",
  "working-holiday": "Working holiday",
  visitor: "Visitor",
  bridging: "Bridging",
  other: "Other",
};

/**
 * Display order for the /visas index category tabs. Student and
 * graduate come last here on purpose: the page already foregrounds
 * them in the study-to-PR pathway steps and the "core visas" table,
 * so the tab bar leads with the categories a reader would otherwise
 * have to scroll to find.
 */
export const VISA_CATEGORY_ORDER: string[] = [
  "working-holiday",
  "family",
  "employer-sponsored",
  "skilled",
  "visitor",
  "graduate",
  "student",
  "bridging",
  "business-investor",
  "other",
];
