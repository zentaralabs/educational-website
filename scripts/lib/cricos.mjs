// Shared helpers for turning the CRICOS course register (Commonwealth Register
// of Institutions and Courses for Overseas Students, published monthly as open
// data on data.gov.au) into `programs` rows.
//
// The register is the authoritative national list of every course an overseas
// student can enrol in, per provider. It carries course name, CRICOS code,
// AQF level, field of education, duration and indicative fees -- but no
// marketing prose. So a row built from it is a real, verifiable catalogue
// entry that still needs an enrichment pass before it earns indexing.

// -------------------------------------------------------------------------
// CSV
// -------------------------------------------------------------------------

/** Minimal RFC-4180 CSV parser (quoted fields, escaped quotes, CRLF). */
export function parseCsv(text) {
  const rows = [];
  let field = "";
  let row = [];
  let quoted = false;
  const s = text.replace(/^﻿/, "");
  for (let i = 0; i < s.length; i += 1) {
    const c = s[i];
    if (quoted) {
      if (c === '"') {
        if (s[i + 1] === '"') {
          field += '"';
          i += 1;
        } else {
          quoted = false;
        }
      } else {
        field += c;
      }
    } else if (c === '"') {
      quoted = true;
    } else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (c !== "\r") {
      field += c;
    }
  }
  if (field.length || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

/** parseCsv + turn each data row into an object keyed by the header row. */
export function readCsvObjects(text) {
  const rows = parseCsv(text);
  const header = rows[0];
  return rows.slice(1).map((r) => {
    const o = {};
    header.forEach((h, i) => {
      o[h] = r[i] ?? "";
    });
    return o;
  });
}

// -------------------------------------------------------------------------
// Provider code -> our university slug
// -------------------------------------------------------------------------

// Keyed by CRICOS Provider Code. Only the 56 institutions the site publishes.
// A provider can hold more than one code (a separate polytechnic/pathway arm);
// each maps to whichever of our slugs it belongs to.
export const PROVIDER_SLUG = {
  "00098G": "unsw-sydney",
  "00026A": "university-of-sydney",
  "00008C": "monash-university",
  "00099F": "university-of-technology-sydney",
  "00122A": "rmit-university",
  "04249J": "adelaide-university",
  "00123M": "adelaide-university", // legacy Univ. of Adelaide code, still on some rows
  "00114A": "flinders-university",
  "00002J": "macquarie-university",
  "00109J": "university-of-newcastle",
  "00116K": "university-of-melbourne",
  "00120C": "australian-national-university",
  "00111D": "swinburne-university-of-technology",
  "00025B": "university-of-queensland",
  "00102E": "university-of-wollongong",
  "00301J": "curtin-university",
  "00126G": "university-of-western-australia",
  "00917K": "western-sydney-university",
  "00233E": "griffith-university",
  "00213J": "queensland-university-of-technology",
  "00124K": "victoria-university",
  "00125J": "murdoch-university",
  "00113B": "deakin-university",
  "00115M": "la-trobe-university",
  "00586B": "university-of-tasmania",
  "00212K": "university-of-canberra",
  "00103D": "federation-university-australia",
  "00017B": "bond-university",
  "00300K": "charles-darwin-university",
  "00279B": "edith-cowan-university",
  "03389E": "torrens-university-australia",
  "00004G": "australian-catholic-university",
  "01241G": "southern-cross-university",
  "01595D": "university-of-the-sunshine-coast",
  "01032F": "university-of-notre-dame-australia",
  "00003G": "university-of-new-england",
  "00117J": "james-cook-university",
  "00219C": "cquniversity-australia",
  "00005F": "charles-sturt-university",
  "00244B": "university-of-southern-queensland",
  "02225M": "university-of-southern-queensland",
  "01484M": "icms",
  "02426B": "kaplan-business-school",
  "00665C": "australian-institute-of-music",
  "01505M": "william-angliss-institute",
  "00724G": "melbourne-polytechnic",
  "03020E": "tafe-queensland",
  "01037A": "university-of-divinity",
  "00756M": "nida",
  "02731D": "avondale-university",
  // Multi-code providers we treat as one slug
  "02639M": "holmes-institute",
  "02767C": "holmes-institute",
  "02727M": "holmes-institute",
  "01545C": "melbourne-institute-of-technology",
  "03245K": "melbourne-institute-of-technology",
  // TAFEs / colleges by their registered provider code
  "00591E": "tafe-nsw", // Technical and Further Education Commission
  "02411J": "box-hill-institute",
  "02672K": "greenwich-college",
  "00020G": "south-metropolitan-tafe", // Dept of Training and Workforce Development (WA)
  // Not in the register under a matchable provider code, so their existing
  // hand-entered rows are left untouched (no CRICOS augmentation):
  //   australian-institute-of-business
  //   victoria-university-polytechnic (02475D "Victoria University" is a
  //     separate business-college registration, not the Melbourne TAFE arm)
};

// -------------------------------------------------------------------------
// Course Level -> degree_levels.name  (the 4 rows: Undergraduate / Graduate /
// PhD / Foundation/Pathway).  null => exclude the row.
// -------------------------------------------------------------------------

const LEVEL_MAP = {
  "Bachelor Degree": "Undergraduate",
  "Bachelor Honours Degree": "Undergraduate",
  "Associate Degree": "Undergraduate",
  Diploma: "Undergraduate",
  "Advanced Diploma": "Undergraduate",
  "Masters Degree (Coursework)": "Graduate",
  "Masters Degree (Extended)": "Graduate",
  "Masters Degree (Research)": "Graduate",
  "Graduate Diploma": "Graduate",
  "Graduate Certificate": "Graduate",
  "Doctoral Degree": "PhD",
};

/**
 * Resolve the degree level for a CRICOS row. A row flagged as Foundation
 * Studies is a pathway regardless of its nominal AQF level. Certificate I-IV,
 * Non-AQF award, secondary and short-course rows return null (excluded).
 */
export function degreeLevelFor(row) {
  if ((row["Foundation Studies"] || "").trim() === "Yes") return "Foundation/Pathway";
  return LEVEL_MAP[(row["Course Level"] || "").trim()] ?? null;
}

// -------------------------------------------------------------------------
// Field of Education -> subjects.slug  (our 21 subjects). null => leave unset.
// Keyed by the 4-digit ASCED narrow-field prefix.
// -------------------------------------------------------------------------

const NARROW_SUBJECT = {
  "0101": "mathematics",
  "0103": "physics",
  "0109": "biology-and-life-sciences",
  "0200": "information-technology",
  "0201": "computer-science",
  "0203": "information-technology",
  "0299": "information-technology",
  "0300": "engineering",
  "0301": "engineering",
  "0303": "engineering",
  "0305": "engineering",
  "0307": "engineering",
  "0309": "engineering",
  "0311": "engineering",
  "0313": "engineering",
  "0315": "engineering",
  "0317": "engineering",
  "0399": "engineering",
  "0400": "architecture",
  "0401": "architecture",
  "0403": "architecture",
  "0501": "agriculture",
  "0503": "agriculture",
  "0505": "agriculture",
  "0507": "agriculture",
  "0509": "environmental-science",
  "0599": "agriculture",
  "0600": "nursing-and-health-sciences",
  "0601": "nursing-and-health-sciences",
  "0603": "nursing-and-health-sciences",
  "0605": "nursing-and-health-sciences",
  "0607": "nursing-and-health-sciences",
  "0609": "nursing-and-health-sciences",
  "0611": "nursing-and-health-sciences",
  "0613": "nursing-and-health-sciences",
  "0615": "nursing-and-health-sciences",
  "0617": "nursing-and-health-sciences",
  "0619": "nursing-and-health-sciences",
  "0699": "nursing-and-health-sciences",
  "0700": "education",
  "0701": "education",
  "0703": "education",
  "0799": "education",
  "0800": "business",
  "0801": "business",
  "0803": "business",
  "0805": "business",
  "0807": "hospitality-and-tourism",
  "0809": "business",
  "0811": "business",
  "0899": "business",
  "0901": "political-science-and-international-relations",
  "0905": "psychology",
  "0907": "psychology",
  "0909": "law",
  "0911": "law",
  "0919": "economics",
  "0921": "biology-and-life-sciences",
  "1000": "music-and-performing-arts",
  "1001": "music-and-performing-arts",
  "1003": "arts-and-design",
  "1005": "arts-and-design",
  "1007": "communications-and-media",
  "1099": "arts-and-design",
  "1101": "hospitality-and-tourism",
};

/** subjects.slug for a CRICOS row, from its primary field of education. */
export function subjectSlugFor(row) {
  const narrow = (row["Field of Education 1 Narrow Field"] || "").trim().slice(0, 4);
  return NARROW_SUBJECT[narrow] ?? null;
}

// -------------------------------------------------------------------------
// Fees / duration
// -------------------------------------------------------------------------

/** "$127,500.00" -> 127500 ; "" -> null */
export function parseMoney(s) {
  const n = Number(String(s).replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) && n > 0 ? n : null;
}

/**
 * CRICOS "Tuition Fee" is whole-of-course. Our `tuition_international` column
 * is an indicative annual figure, so annualise by the course length and round
 * to the nearest $100. Returns null when either input is missing or the course
 * is shorter than a semester (fee-per-year is meaningless for a 12-week
 * bridging unit).
 */
export function annualTuition(totalFee, durationWeeks) {
  const fee = parseMoney(totalFee);
  const weeks = Number(durationWeeks);
  if (!fee || !Number.isFinite(weeks) || weeks < 26) return null;
  const annual = Math.round(fee / (weeks / 52) / 100) * 100;
  // Register fee fields are inconsistently populated (placeholders, per-year
  // vs whole-of-course, $0). Anything outside a plausible band for an
  // international award is more likely bad data than a real bargain, so drop
  // it and let the university-level tuition fall through on the page.
  if (annual < 8000 || annual > 150000) return null;
  return annual;
}

/** Duration in weeks -> years, one decimal. null when absent. */
export function durationYears(durationWeeks) {
  const weeks = Number(durationWeeks);
  if (!Number.isFinite(weeks) || weeks <= 0) return null;
  return Math.round((weeks / 52) * 10) / 10;
}

// -------------------------------------------------------------------------
// Name handling
// -------------------------------------------------------------------------

/** Loose key for matching a CRICOS course name against an existing program. */
export function normalizeName(name) {
  return String(name)
    .toLowerCase()
    .replace(/\(.*?\)/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\b(the|a|an|of|in|and|for|with)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Combined / double degrees. The site deliberately does not carry these as
 * their own rows (62 were archived as permutations in the 2026-08 cleanup),
 * so the importer skips them too.
 */
export function isCombinedDegree(name) {
  const n = String(name);
  // A slash plus two or more award words is always a combined/pathway pairing
  // ("Diploma in Science/ Bachelor of Medical Science", "PhD/Masters ...").
  if (n.includes("/")) {
    const awards = (n.match(/(bachelor|master|doctor|doctoral|phd|diploma)/gi) || []).length;
    if (awards >= 2) return true;
  }
  if (/\bcombined\b/i.test(n)) return true;
  return (
    /\b(Bachelor|Master|Doctor)\b[^/]*\/[^/]*\b(Bachelor|Master|Doctor|Diploma)\b/i.test(n) ||
    /\b(Bachelor|Master)\b[^,]*\band\s+(Bachelor|Master)\b/i.test(n) ||
    /\bBachelor of\b.+\bBachelor of\b/i.test(n) ||
    /\bMaster of\b.+\bMaster of\b/i.test(n) ||
    /\bBachelor\b.+\bMaster\b/i.test(n) ||
    /\bMaster of\b.+\b(Doctor of|PhD)\b/i.test(n) ||
    /\bdouble degree\b/i.test(n)
  );
}

/** Em dashes are a house-style violation on the public site. */
export function stripEmDash(s) {
  return typeof s === "string" ? s.replace(/\s*[—–]\s*/g, " - ") : s;
}

const KEEP_UPPER = new Set(["MBA", "IT", "ICT", "TESOL", "GIS", "VET", "HDR", "PhD"]);

/**
 * Course names in the register are sometimes ALL CAPS or all lower case, and
 * carry stray double spaces / a missing space after "Bachelor". Normalise to
 * the site's Title Case without mangling acronyms.
 */
export function tidyName(raw) {
  let s = stripEmDash(String(raw).trim())
    .replace(/\bBachelorof\b/gi, "Bachelor of")
    .replace(/\bMasterof\b/gi, "Master of")
    .replace(/\bPhilsophy\b/gi, "Philosophy")
    .replace(/\s+/g, " ")
    .replace(/\s+([,)])/g, "$1")
    .replace(/\(\s+/g, "(");
  const letters = s.replace(/[^A-Za-z]/g, "");
  const isAllCaps = letters.length > 3 && letters === letters.toUpperCase();
  const isAllLower = letters.length > 3 && letters === letters.toLowerCase();
  if (isAllCaps || isAllLower) {
    s = s.replace(/[A-Za-z][A-Za-z'.-]*/g, (w) => {
      const u = w.toUpperCase();
      if (KEEP_UPPER.has(u)) return u;
      const lower = w.toLowerCase();
      if (/^(of|the|and|in|for|with|to|by|a|an|or|on)$/.test(lower)) return lower;
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    });
    s = s.charAt(0).toUpperCase() + s.slice(1);
  }
  return s;
}
