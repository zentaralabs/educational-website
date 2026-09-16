/**
 * IELTS Academic <-> PTE Academic score concordance, and the PTE-to-CEFR
 * alignment, both taken directly from Pearson's official "PTE Academic
 * Score Guide (Institution)", July 2025 edition — the current version as
 * of this writing, built on the July 2025 concordance study (Hughes &
 * Clesham). Source: pearsonpte.com/content/dam/ELL/pte/pearsonpte/pdfs/
 * Score-Guide-Institution-PTE-Academic-July-2025-web.pdf
 *
 * Pearson publishes this as a *range* per IELTS band, not a single PTE
 * score, and says so explicitly: "score relationships between tests are
 * always an approximation." The ranges below are copied verbatim, not
 * derived or interpolated. Rows start at IELTS 4.5 (PTE 24) because that
 * is where Pearson's own table starts — there is no official concordance
 * published below that.
 */
export type ConcordanceRow = {
  ielts: number;
  pteMin: number;
  pteMax: number;
};

export const IELTS_PTE_CONCORDANCE: ConcordanceRow[] = [
  { ielts: 4.5, pteMin: 24, pteMax: 30 },
  { ielts: 5.0, pteMin: 31, pteMax: 38 },
  { ielts: 5.5, pteMin: 39, pteMax: 46 },
  { ielts: 6.0, pteMin: 47, pteMax: 54 },
  { ielts: 6.5, pteMin: 55, pteMax: 62 },
  { ielts: 7.0, pteMin: 63, pteMax: 70 },
  { ielts: 7.5, pteMin: 71, pteMax: 78 },
  { ielts: 8.0, pteMin: 79, pteMax: 85 },
  { ielts: 8.5, pteMin: 86, pteMax: 89 },
  { ielts: 9.0, pteMin: 90, pteMax: 90 },
];

export const PTE_MIN_MAPPED = IELTS_PTE_CONCORDANCE[0].pteMin;
export const PTE_MAX_MAPPED = IELTS_PTE_CONCORDANCE[IELTS_PTE_CONCORDANCE.length - 1].pteMax;

/** Exact PTE score -> the IELTS row whose range contains it, if any. */
export function ieltsRowForPte(pte: number): ConcordanceRow | null {
  return IELTS_PTE_CONCORDANCE.find((row) => pte >= row.pteMin && pte <= row.pteMax) ?? null;
}

/** IELTS band -> its PTE row (bands are the exact set Pearson publishes). */
export function rowForIelts(ielts: number): ConcordanceRow | null {
  return IELTS_PTE_CONCORDANCE.find((row) => row.ielts === ielts) ?? null;
}

/**
 * PTE overall score -> CEFR level, from the same Score Guide's appendix
 * (section 7). Independent of the IELTS concordance above — this is
 * Pearson's own alignment of PTE to the Council of Europe's CEFR scale.
 */
export function cefrForPte(pte: number): string {
  if (pte >= 85) return "C2";
  if (pte >= 76) return "C1";
  if (pte >= 59) return "B2";
  if (pte >= 43) return "B1";
  if (pte >= 30) return "A2";
  return "A1 or below";
}
