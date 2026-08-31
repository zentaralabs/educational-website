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
  other: "Other",
};

/** Display order for the /visas index. */
export const VISA_CATEGORY_ORDER: string[] = [
  "student",
  "graduate",
  "skilled",
  "employer-sponsored",
  "family",
  "business-investor",
  "working-holiday",
  "visitor",
  "other",
];
