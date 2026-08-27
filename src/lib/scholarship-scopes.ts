/** Matches the `scope` check on the scholarships table. */
export const SCHOLARSHIP_SCOPE_LABELS: Record<string, string> = {
  national: "National / government",
  "university-specific": "University-specific",
  "external/foundation": "External / foundation",
};

export const SCHOLARSHIP_SCOPE_ORDER = [
  "national",
  "university-specific",
  "external/foundation",
];
