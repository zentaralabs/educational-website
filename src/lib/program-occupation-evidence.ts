import type { ProgramOccupation } from "@/lib/queries/public-programs";

/**
 * `program_occupations` links occupations to a SUBJECT (scripts/
 * seed_program_occupations.mjs), so every program in a subject carries the
 * identical list: all ~1,000 business programs list "Accountant (General)",
 * every nursing and health program lists both Registered Nurse roles and
 * Physiotherapist, and so on. That is wrong for most programs and makes the
 * "Career & PR pathway" block near-identical across thousands of pages.
 *
 * This keeps an occupation on a program page only when the program's NAME
 * evidences it. Matching on the description was tried and rejected: it kept
 * Barrister on "Master of Environmental Law". Keyed by ANZSCO code.
 */
const OCCUPATION_EVIDENCE: Record<string, RegExp> = {
  // Business / accounting
  "221111": /account(ing|ancy|ant)|audit|taxation|\btax\b|\bcpa\b|forensic/i,
  "221113": /taxation|\btax\b|account(ing|ancy|ant)/i,
  "221112": /management account|account(ing|ancy|ant)|\bcma\b/i,
  "221211": /governance|company secretar|chartered secretar/i,
  "221213": /audit|account(ing|ancy|ant)/i,
  "221214": /audit|risk|account(ing|ancy|ant)/i,
  // Nursing and health
  "254412": /nurs/i,
  "254418": /nurs/i,
  "254414": /nurs/i,
  "254422": /mental health nurs|nurs/i,
  "254411": /nurse practitioner|advanced (practice|nursing)|nurs/i,
  "254111": /midwif/i,
  "252511": /physiotherap/i,
  "252411": /occupational therapy/i,
  "251111": /dietetic|nutrition and dietetics/i,
  // Engineering
  "233211": /civil|structural|infrastructure|construction/i,
  "233214": /structural|civil/i,
  "233512": /mechanical|mechatronic|aerospace|automotive/i,
  "233111": /chemical|process eng|biochemical/i,
  "233311": /electrical|power|energy/i,
  "233411": /electronic|telecommunication|mechatronic|communications eng/i,
  "233611": /mining/i,
  "233912": /agricultur/i,
  "233913": /biomedical|biomechanic/i,
  "233915": /environmental/i,
  // Education
  "241111": /early childhood|early years|pre-?primary/i,
  "241411": /secondary|teaching|education \(secondary|\bteach/i,
  "241213": /primary|teaching|\bteach/i,
  "241511": /special|inclusive|disabilit/i,
  // Psychology (registration needs postgraduate study, so name must say so)
  "272311": /clinical psycholog|psychology \(clinical|clinical neuro/i,
  "272312": /educational (and developmental )?psycholog|school psycholog/i,
  "272313": /organi[sz]ational psycholog|industrial.{0,12}psycholog/i,
  // IT / computer science / data
  "261111": /business analy|information systems|business information|information technology|\bict\b|\bit\b/i,
  "261112": /information systems|systems|information technology|computing|computer|software|\bict\b|\bit\b/i,
  "261312": /software|programming|computer science|computing|developer|application|web|mobile|information technology|\bit\b/i,
  "261313": /software|computer science|computing|engineering|information technology|\bit\b/i,
  "261315": /cyber|security/i,
  "262112": /cyber|security/i,
  "262111": /database|information systems|information technology|\bit\b/i,
  "262113": /network|systems|information technology|\bit\b|cloud/i,
  "263111": /network|telecommunication|information technology|computer|\bit\b/i,
  "224115": /data|analytics|machine learning|artificial intelligence|\bai\b|statistic/i,
  "224114": /data|analytics|statistic|business intelligence/i,
  "224113": /statistic|data|mathematic|analytics/i,
  // Architecture, design, law, other
  "232111": /(?<!landscape )architect/i,
  "232112": /landscape/i,
  "232411": /graphic|visual communication|communication design/i,
  "232312": /industrial design|product design/i,
  "232414": /web design|digital design|interaction design|multimedia|\bux\b/i,
  "271311": /bachelor of laws?|juris doctor|\bllb\b|\bjd\b|legal practice|laws \(/i,
  "271111": /bachelor of laws?|juris doctor|\bllb\b|\bjd\b|laws \(/i,
  "234312": /environment|sustainab|conservation|ecolog/i,
  "234313": /environment|ecolog|conservation|science/i,
  "234112": /agricultur|agri|crop|plant|animal|farm/i,
  "234111": /agricultur|agri|farm/i,
  "234711": /veterin/i,
  "224311": /econom/i,
  "141311": /hotel|hospitality|tourism|events?\b/i,
  "141111": /hospitality|restaurant|food|culinary|tourism/i,
  "234914": /physic/i,
};

const RESEARCH_NAME =
  /\b(doctor of philosophy|phd|master of philosophy|mphil)\b|by research|\(research\)/i;

/** Research degrees and pathway programs do not lead to a registered occupation directly. */
function isResearchOrPathway(programName: string, degreeLevel: string | null | undefined) {
  return (
    degreeLevel === "PhD" ||
    degreeLevel === "Foundation/Pathway" ||
    RESEARCH_NAME.test(programName)
  );
}

/**
 * Occupations the program's own name evidences. Empty for research and
 * pathway degrees, and when nothing in the name points at a listed career.
 */
export function filterOccupationsForProgram(
  occupations: ProgramOccupation[],
  programName: string,
  degreeLevel: string | null | undefined,
): ProgramOccupation[] {
  if (isResearchOrPathway(programName, degreeLevel)) return [];
  return occupations.filter((o) => {
    const code = o.occupation?.anzsco_code;
    return !!code && !!OCCUPATION_EVIDENCE[code]?.test(programName);
  });
}
