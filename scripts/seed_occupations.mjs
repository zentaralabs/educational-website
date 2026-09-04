import pg from "pg";
import fs from "fs";

const env = Object.fromEntries(
  fs
    .readFileSync(".env.local", "utf8")
    .split("\n")
    .filter((l) => l.includes("="))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i), l.slice(i + 1)];
    }),
);

// Bulk verification date for this seed. Only bump when the whole set has
// actually been re-checked against current sources.
const TODAY = "2026-09-05";

// Authorities, by URL, referenced below.
const ACS = "Australian Computer Society (ACS)";
const ACS_URL = "https://www.acs.org.au";
const EA = "Engineers Australia";
const EA_URL = "https://www.engineersaustralia.org.au";
const ANMAC = "Australian Nursing and Midwifery Accreditation Council (ANMAC)";
const ANMAC_URL = "https://www.anmac.org.au";
const CPA = "CPA Australia, Chartered Accountants ANZ, or the Institute of Public Accountants (applicant chooses one)";
const CPA_URL = "https://www.cpaaustralia.com.au";
const AITSL = "Australian Institute for Teaching and School Leadership (AITSL)";
const AITSL_URL = "https://www.aitsl.edu.au";
const AACA = "Architects Accreditation Council of Australia (AACA)";
const AACA_URL = "https://www.aaca.org.au";
const VETASSESS = "VETASSESS";
const VETASSESS_URL = "https://www.vetassess.com.au";
const PSYCH_BOARD = "Psychology Board of Australia";
const PSYCH_BOARD_URL = "https://www.psychologyboard.gov.au";
const APC = "Australian Physiotherapy Council";
const APC_URL = "https://physiocouncil.com.au";
const OTC = "Occupational Therapy Council of Australia";
const OTC_URL = "https://otcouncil.com.au";
const DIETITIANS_AUS = "Dietitians Australia";
const DIETITIANS_AUS_URL = "https://dietitiansaustralia.org.au";
const AVBC = "Australasian Veterinary Boards Council (AVBC)";
const AVBC_URL = "https://avbc.asn.au";

// Per-occupation source, matched to a per-ANZSCO-code lookup page that was
// actually checked against at least one other source (Home Affairs
// legislative-instrument summaries, ACS/Engineers Australia/ANMAC/AITSL/
// VETASSESS occupation pages, or a migration-agent summary of the current
// MLTSSL/STSOL/ROL/CSOL split) before being trusted. See scratchpad research
// notes in the task; anzscosearch.com's per-code pages were the fastest
// consistent cross-check and are cited as source_url below.
const src = (code) => `https://www.anzscosearch.com/${code}/`;

/**
 * List membership reflects the post Skills in Demand (Dec 2024) reform:
 * MLTSSL/STSOL still gate the points-tested 189/190/491 (plus 485 study
 * pathways), while CSOL gates the employer-sponsored 482 (Skills in Demand
 * visa)/186/494. An occupation can sit on more than one list. Where an
 * occupation's status on a given list could not be confirmed against two
 * sources, that flag is left false rather than guessed.
 */
const occupations = [
  // ---------- ICT ----------
  {
    anzsco_code: "261313",
    name: "Software Engineer",
    skill_level: 1,
    assessing_authority: ACS,
    assessing_authority_url: ACS_URL,
    mltssl: true,
    stsol: false,
    rol: false,
    csol: true,
    visa_pathway_note:
      "On both MLTSSL and CSOL, so it supports the points-tested 189, 190, and 491 as well as the employer-sponsored 482 and 186. Needs an ACS skills assessment, which usually wants the degree plus one to two years of relevant work, or a Professional Year in ICT in place of some of that experience.",
    summary: "Designs, builds, and tests software systems. One of the most reliably nominated ICT occupations across every state.",
    source_url: src("261313"),
  },
  {
    anzsco_code: "261312",
    name: "Developer Programmer",
    skill_level: 1,
    assessing_authority: ACS,
    assessing_authority_url: ACS_URL,
    mltssl: true,
    stsol: false,
    rol: false,
    csol: true,
    visa_pathway_note: "On MLTSSL, so it supports the 189, 190, and 491. Assessed by the ACS on the same basis as Software Engineer. Also on CSOL, additionally supporting the employer-sponsored 482 and 186.",
    summary: "Writes and maintains application code from technical specifications, close in scope to Software Engineer.",
    source_url: "https://immi.homeaffairs.gov.au/Documents/core-sol.pdf",
  },
  {
    anzsco_code: "261111",
    name: "ICT Business Analyst",
    skill_level: 1,
    assessing_authority: ACS,
    assessing_authority_url: ACS_URL,
    mltssl: true,
    stsol: false,
    rol: false,
    csol: true,
    visa_pathway_note:
      "On both MLTSSL and CSOL, so it supports 189/190/491 and the employer-sponsored 482/186. Common landing occupation for IT and business-analytics graduates.",
    summary: "Bridges business requirements and IT delivery, translating processes into system specifications.",
    source_url: src("261111"),
  },
  {
    anzsco_code: "261112",
    name: "Systems Analyst",
    skill_level: 1,
    assessing_authority: ACS,
    assessing_authority_url: ACS_URL,
    mltssl: true,
    stsol: false,
    rol: false,
    csol: true,
    visa_pathway_note: "On MLTSSL, supporting the 189, 190, and 491, with an ACS skills assessment. Also on CSOL, additionally supporting the employer-sponsored 482 and 186.",
    summary: "Analyses and designs information systems and their integration into an organisation's operations.",
    source_url: "https://immi.homeaffairs.gov.au/Documents/core-sol.pdf",
  },
  {
    anzsco_code: "262112",
    name: "ICT Security Specialist",
    skill_level: 1,
    assessing_authority: ACS,
    assessing_authority_url: ACS_URL,
    mltssl: true,
    stsol: false,
    rol: false,
    csol: false,
    visa_pathway_note:
      "The code used for the points-tested 189, 190, and 491 pathways. Newer cyber security specialisations (Cyber Security Engineer, Cyber Security Analyst, and others) were split out of this code in 2021 to 2025 ANZSCO updates and sit on CSOL instead; picking the right code matters for which visa applies.",
    summary: "Broad ICT security occupation covering security architecture, policy, and operations.",
    source_url: src("262112"),
  },
  {
    anzsco_code: "261315",
    name: "Cyber Security Engineer",
    skill_level: 1,
    assessing_authority: ACS,
    assessing_authority_url: ACS_URL,
    mltssl: false,
    stsol: false,
    rol: false,
    csol: true,
    visa_pathway_note:
      "One of the newer cyber security ANZSCO codes created alongside Penetration Tester, Cyber Security Analyst, and others. Sits on CSOL, which supports the employer-sponsored 482 and 186, but is not currently on MLTSSL or STSOL, so it does not support the points-tested 189, 190, or 491 the way ICT Security Specialist (262112) does.",
    summary: "Designs and implements security controls for systems and networks. A CSOL-only cyber occupation, distinct from the older ICT Security Specialist code.",
    source_url: src("261315"),
  },
  {
    anzsco_code: "263111",
    name: "Computer Network and Systems Engineer",
    skill_level: 1,
    assessing_authority: ACS,
    assessing_authority_url: ACS_URL,
    mltssl: true,
    stsol: false,
    rol: false,
    csol: true,
    visa_pathway_note: "On both MLTSSL and CSOL, supporting 189/190/491 and the employer-sponsored 482/186.",
    summary: "Designs, implements, and manages computer networks and their integration with wider systems.",
    source_url: src("263111"),
  },
  {
    anzsco_code: "262111",
    name: "Database Administrator",
    skill_level: 1,
    assessing_authority: ACS,
    assessing_authority_url: ACS_URL,
    mltssl: false,
    stsol: true,
    rol: false,
    csol: true,
    visa_pathway_note:
      "On STSOL and CSOL, which supports the 190 and 491 (not the 189 on its own) plus the employer-sponsored 482/494/186.",
    summary: "Plans, installs, and maintains database management systems and their security and performance.",
    source_url: src("262111"),
  },
  {
    anzsco_code: "262113",
    name: "Systems Administrator",
    skill_level: 1,
    assessing_authority: ACS,
    assessing_authority_url: ACS_URL,
    mltssl: false,
    stsol: true,
    rol: false,
    csol: true,
    visa_pathway_note: "On STSOL, supporting the 190 and 491. Also on CSOL, additionally supporting the employer-sponsored 482 and 186.",
    summary: "Installs, configures, and maintains operating systems and server infrastructure.",
    source_url: "https://immi.homeaffairs.gov.au/Documents/core-sol.pdf",
  },
  {
    anzsco_code: "224115",
    name: "Data Scientist",
    skill_level: 1,
    assessing_authority: ACS,
    assessing_authority_url: ACS_URL,
    mltssl: false,
    stsol: false,
    rol: false,
    csol: true,
    visa_pathway_note:
      "A newer ANZSCO code (added 2022) that sits on CSOL only, supporting the employer-sponsored 482 and 186. Not on MLTSSL or STSOL, so it does not currently open the points-tested 189, 190, or 491, and no state nominates this exact code.",
    summary: "Builds statistical and machine-learning models from large datasets. Assessed by the ACS; CSOL-only for now.",
    source_url: src("224115"),
  },
  {
    anzsco_code: "224114",
    name: "Data Analyst",
    skill_level: 1,
    assessing_authority: ACS,
    assessing_authority_url: ACS_URL,
    mltssl: false,
    stsol: false,
    rol: false,
    csol: true,
    visa_pathway_note:
      "Added to ANZSCO alongside Data Scientist in 2022. Sits on CSOL only, supporting the employer-sponsored 482 and 186, not the points-tested 189, 190, or 491.",
    summary: "Interprets and reports on data to support business decisions, a lighter-weight sibling to Data Scientist.",
    source_url: src("224114"),
  },
  {
    anzsco_code: "224113",
    name: "Statistician",
    skill_level: 1,
    assessing_authority: VETASSESS,
    assessing_authority_url: VETASSESS_URL,
    mltssl: true,
    stsol: false,
    rol: false,
    csol: false,
    visa_pathway_note: "On MLTSSL, supporting the 189, 190, and 491, with a VETASSESS skills assessment.",
    summary: "Applies statistical theory and methods to collect, analyse, and interpret quantitative data.",
    source_url: src("224113"),
  },

  // ---------- Accounting ----------
  {
    anzsco_code: "221111",
    name: "Accountant (General)",
    skill_level: 1,
    assessing_authority: CPA,
    assessing_authority_url: CPA_URL,
    mltssl: true,
    stsol: false,
    rol: false,
    csol: true,
    visa_pathway_note:
      "On both MLTSSL and CSOL, so it supports 189/190/491 and the employer-sponsored 482/186. Needs an accredited accounting degree and a positive assessment from CPA Australia, CA ANZ, or the IPA.",
    summary: "General accounting occupation covering financial reporting, budgeting, and advisory work.",
    source_url: src("221111"),
  },
  {
    anzsco_code: "221112",
    name: "Management Accountant",
    skill_level: 1,
    assessing_authority: CPA,
    assessing_authority_url: CPA_URL,
    mltssl: true,
    stsol: false,
    rol: false,
    csol: true,
    visa_pathway_note: "On MLTSSL, supporting the 189, 190, and 491. Also on CSOL, additionally supporting the employer-sponsored 482 and 186.",
    summary: "Focuses on internal financial planning, budgeting, and performance analysis for an organisation.",
    source_url: "https://immi.homeaffairs.gov.au/Documents/core-sol.pdf",
  },
  {
    anzsco_code: "221113",
    name: "Taxation Accountant",
    skill_level: 1,
    assessing_authority: CPA,
    assessing_authority_url: CPA_URL,
    mltssl: true,
    stsol: false,
    rol: false,
    csol: true,
    visa_pathway_note: "On MLTSSL, supporting the 189, 190, and 491. Also on CSOL, additionally supporting the employer-sponsored 482 and 186.",
    summary: "Specialises in tax compliance and planning for individuals and businesses.",
    source_url: "https://immi.homeaffairs.gov.au/Documents/core-sol.pdf",
  },
  {
    anzsco_code: "221213",
    name: "External Auditor",
    skill_level: 1,
    assessing_authority: CPA,
    assessing_authority_url: CPA_URL,
    mltssl: true,
    stsol: false,
    rol: false,
    csol: true,
    visa_pathway_note: "On MLTSSL, supporting the 189, 190, and 491. Also on CSOL, additionally supporting the employer-sponsored 482 and 186.",
    summary: "Independently examines an organisation's financial records and controls.",
    source_url: "https://immi.homeaffairs.gov.au/Documents/core-sol.pdf",
  },
  {
    anzsco_code: "221214",
    name: "Internal Auditor",
    skill_level: 1,
    assessing_authority: CPA,
    assessing_authority_url: CPA_URL,
    mltssl: true,
    stsol: false,
    rol: false,
    csol: true,
    visa_pathway_note: "On MLTSSL, supporting the 189, 190, and 491. Also on CSOL, additionally supporting the employer-sponsored 482 and 186.",
    summary: "Reviews an organisation's own financial and operational controls from inside the business.",
    source_url: "https://immi.homeaffairs.gov.au/Documents/core-sol.pdf",
  },
  {
    anzsco_code: "221211",
    name: "Company Secretary",
    skill_level: 1,
    assessing_authority: VETASSESS,
    assessing_authority_url: VETASSESS_URL,
    mltssl: false,
    stsol: true,
    rol: false,
    csol: true,
    visa_pathway_note: "On STSOL and CSOL, supporting the 190, 491, and the employer-sponsored 482/494/186.",
    summary: "Handles a company's statutory, governance, and compliance obligations.",
    source_url: src("221211"),
  },

  // ---------- Nursing and allied health ----------
  {
    anzsco_code: "254412",
    name: "Registered Nurse (Aged Care)",
    skill_level: 1,
    assessing_authority: ANMAC,
    assessing_authority_url: ANMAC_URL,
    mltssl: true,
    stsol: false,
    rol: false,
    csol: true,
    visa_pathway_note:
      "On both MLTSSL and CSOL, supporting 189/190/491 and the employer-sponsored 482/186. Needs registration with the Nursing and Midwifery Board of Australia, assessed against ANMAC's standards.",
    summary: "Registered nurse specialising in the care of older people, one of the most consistently nominated health occupations.",
    source_url: src("254412"),
  },
  {
    anzsco_code: "254418",
    name: "Registered Nurse (Medical)",
    skill_level: 1,
    assessing_authority: ANMAC,
    assessing_authority_url: ANMAC_URL,
    mltssl: true,
    stsol: false,
    rol: false,
    csol: true,
    visa_pathway_note: "On MLTSSL, supporting the 189, 190, and 491, via ANMAC assessment and NMBA registration. Also on CSOL, additionally supporting the employer-sponsored 482 and 186.",
    summary: "Provides nursing care to patients with medical conditions requiring hospital-based intervention.",
    source_url: "https://immi.homeaffairs.gov.au/Documents/core-sol.pdf",
  },
  {
    anzsco_code: "254422",
    name: "Registered Nurse (Mental Health)",
    skill_level: 1,
    assessing_authority: ANMAC,
    assessing_authority_url: ANMAC_URL,
    mltssl: true,
    stsol: false,
    rol: false,
    csol: true,
    visa_pathway_note: "On MLTSSL, supporting the 189, 190, and 491, via ANMAC assessment and NMBA registration. Also on CSOL, additionally supporting the employer-sponsored 482 and 186.",
    summary: "Provides nursing care to patients experiencing mental illness, disorder, or crisis.",
    source_url: "https://immi.homeaffairs.gov.au/Documents/core-sol.pdf",
  },
  {
    anzsco_code: "254414",
    name: "Registered Nurse (Community Health)",
    skill_level: 1,
    assessing_authority: ANMAC,
    assessing_authority_url: ANMAC_URL,
    mltssl: true,
    stsol: false,
    rol: false,
    csol: true,
    visa_pathway_note: "On MLTSSL, supporting the 189, 190, and 491, via ANMAC assessment and NMBA registration. Also on CSOL, additionally supporting the employer-sponsored 482 and 186.",
    summary: "Delivers nursing care outside the hospital setting, including in clinics and home visits.",
    source_url: "https://immi.homeaffairs.gov.au/Documents/core-sol.pdf",
  },
  {
    anzsco_code: "254411",
    name: "Nurse Practitioner",
    skill_level: 1,
    assessing_authority: ANMAC,
    assessing_authority_url: ANMAC_URL,
    mltssl: true,
    stsol: false,
    rol: false,
    csol: true,
    visa_pathway_note:
      "On both MLTSSL and CSOL, supporting 189/190/491 and the employer-sponsored 482/186. Requires advanced NMBA endorsement on top of standard registration.",
    summary: "An advanced-practice registered nurse authorised to diagnose and prescribe within their specialty.",
    source_url: src("254411"),
  },
  {
    anzsco_code: "254111",
    name: "Midwife",
    skill_level: 1,
    assessing_authority: ANMAC,
    assessing_authority_url: ANMAC_URL,
    mltssl: true,
    stsol: false,
    rol: false,
    csol: true,
    visa_pathway_note: "On MLTSSL, supporting the 189, 190, and 491, via ANMAC assessment and NMBA registration. Also on CSOL, additionally supporting the employer-sponsored 482 and 186.",
    summary: "Provides care to women through pregnancy, birth, and the postnatal period.",
    source_url: "https://immi.homeaffairs.gov.au/Documents/core-sol.pdf",
  },
  {
    anzsco_code: "252511",
    name: "Physiotherapist",
    skill_level: 1,
    assessing_authority: APC,
    assessing_authority_url: APC_URL,
    mltssl: true,
    stsol: false,
    rol: false,
    csol: true,
    visa_pathway_note: "On MLTSSL, supporting the 189, 190, and 491, via an Australian Physiotherapy Council assessment. Also on CSOL, additionally supporting the employer-sponsored 482 and 186.",
    summary: "Assesses and treats movement and functional problems from injury, illness, or disability.",
    source_url: "https://immi.homeaffairs.gov.au/Documents/core-sol.pdf",
  },
  {
    anzsco_code: "252411",
    name: "Occupational Therapist",
    skill_level: 1,
    assessing_authority: OTC,
    assessing_authority_url: OTC_URL,
    mltssl: true,
    stsol: false,
    rol: false,
    csol: true,
    visa_pathway_note: "On MLTSSL, supporting the 189, 190, and 491, via an Occupational Therapy Council assessment. Also on CSOL, additionally supporting the employer-sponsored 482 and 186.",
    summary: "Helps people participate in daily activities and work despite injury, illness, or disability.",
    source_url: "https://immi.homeaffairs.gov.au/Documents/core-sol.pdf",
  },
  {
    anzsco_code: "251111",
    name: "Dietitian",
    skill_level: 1,
    assessing_authority: DIETITIANS_AUS,
    assessing_authority_url: DIETITIANS_AUS_URL,
    mltssl: true,
    stsol: false,
    rol: false,
    csol: true,
    visa_pathway_note: "On MLTSSL, supporting the 189, 190, and 491, via a Dietitians Australia assessment. Also on CSOL, additionally supporting the employer-sponsored 482 and 186.",
    summary: "Advises on food and nutrition to prevent and treat illness and promote health.",
    source_url: "https://immi.homeaffairs.gov.au/Documents/core-sol.pdf",
  },

  // ---------- Psychology ----------
  {
    anzsco_code: "272311",
    name: "Clinical Psychologist",
    skill_level: 1,
    assessing_authority: PSYCH_BOARD,
    assessing_authority_url: PSYCH_BOARD_URL,
    mltssl: true,
    stsol: false,
    rol: false,
    csol: true,
    visa_pathway_note: "On MLTSSL, supporting the 189, 190, and 491. Registration needs the full accredited sequence (accredited bachelor's, honours, then an accredited master's or doctorate), which takes several years beyond a first degree. Also on CSOL, additionally supporting the employer-sponsored 482 and 186.",
    summary: "Assesses and treats mental health conditions at an advanced clinical level.",
    source_url: "https://immi.homeaffairs.gov.au/Documents/core-sol.pdf",
  },
  {
    anzsco_code: "272312",
    name: "Educational Psychologist",
    skill_level: 1,
    assessing_authority: PSYCH_BOARD,
    assessing_authority_url: PSYCH_BOARD_URL,
    mltssl: true,
    stsol: false,
    rol: false,
    csol: true,
    visa_pathway_note: "On MLTSSL, supporting the 189, 190, and 491, subject to the same long registration pathway as other endorsed psychology areas. Also on CSOL, additionally supporting the employer-sponsored 482 and 186.",
    summary: "Applies psychology to learning, development, and behaviour in educational settings.",
    source_url: "https://immi.homeaffairs.gov.au/Documents/core-sol.pdf",
  },
  {
    anzsco_code: "272313",
    name: "Organisational Psychologist",
    skill_level: 1,
    assessing_authority: PSYCH_BOARD,
    assessing_authority_url: PSYCH_BOARD_URL,
    mltssl: true,
    stsol: false,
    rol: false,
    csol: true,
    visa_pathway_note: "On MLTSSL, supporting the 189, 190, and 491, subject to the same long registration pathway as other endorsed psychology areas. Also on CSOL, additionally supporting the employer-sponsored 482 and 186.",
    summary: "Applies psychology to workplace behaviour, performance, and organisational design.",
    source_url: "https://immi.homeaffairs.gov.au/Documents/core-sol.pdf",
  },

  // ---------- Law ----------
  {
    anzsco_code: "271311",
    name: "Solicitor",
    skill_level: 1,
    assessing_authority: VETASSESS,
    assessing_authority_url: VETASSESS_URL,
    mltssl: true,
    stsol: false,
    rol: false,
    csol: true,
    visa_pathway_note:
      "On both MLTSSL and CSOL, but a positive skills assessment is not the same as being able to practise. You must first be admitted to an Australian state legal profession, which for an overseas or JD graduate means passing the assessed academic subjects, completing Practical Legal Training, and being admitted by the state Supreme Court, before the occupation is realistically usable for a visa.",
    summary: "Legal practitioner providing advice and representation outside the courtroom advocacy role of a barrister.",
    source_url: src("271311"),
  },
  {
    anzsco_code: "271111",
    name: "Barrister",
    skill_level: 1,
    assessing_authority: "State or Territory Legal Admissions Authority",
    assessing_authority_url: null,
    mltssl: true,
    stsol: false,
    rol: false,
    csol: true,
    visa_pathway_note:
      "On both MLTSSL and CSOL, supporting the points-tested 189, 190, and 491 as well as the employer-sponsored 482 and 186. As with Solicitor, a positive skills assessment is not the same as being able to practise: you must be admitted to the bar in an Australian state or territory before the occupation is realistically usable for a visa. Assessed by the state or territory Legal Admissions Authority, not VETASSESS.",
    summary: "Specialist courtroom advocate, admitted separately from solicitors in most Australian states.",
    source_url: "https://immi.homeaffairs.gov.au/Documents/core-sol.pdf",
  },

  // ---------- Education ----------
  {
    anzsco_code: "241411",
    name: "Secondary School Teacher",
    skill_level: 1,
    assessing_authority: AITSL,
    assessing_authority_url: AITSL_URL,
    mltssl: true,
    stsol: false,
    rol: false,
    csol: true,
    visa_pathway_note:
      "On both MLTSSL and CSOL, supporting 189/190/491 and the employer-sponsored 482/186. Needs an AITSL skills assessment and registration with a state teacher regulatory authority (such as VIT or NESA) to work.",
    summary: "Teaches a subject or subjects to secondary students, one of the more consistently nominated teaching occupations.",
    source_url: src("241411"),
  },
  {
    anzsco_code: "241111",
    name: "Early Childhood (Pre-primary School) Teacher",
    skill_level: 1,
    assessing_authority: AITSL,
    assessing_authority_url: AITSL_URL,
    mltssl: true,
    stsol: false,
    rol: false,
    csol: true,
    visa_pathway_note: "On both MLTSSL and CSOL, supporting 189/190/491 and the employer-sponsored 482/186, via AITSL assessment and state registration.",
    summary: "Teaches and cares for children in the years before formal primary schooling.",
    source_url: src("241111"),
  },
  {
    anzsco_code: "241213",
    name: "Primary School Teacher",
    skill_level: 1,
    assessing_authority: AITSL,
    assessing_authority_url: AITSL_URL,
    mltssl: false,
    stsol: true,
    rol: false,
    csol: true,
    visa_pathway_note:
      "On STSOL and CSOL, so it supports the 190, 491, and the employer-sponsored 482/494/186, but not the 189 on its own. AITSL assesses at least one year of full-time equivalent primary-education study within the qualification.",
    summary: "Teaches a full curriculum to primary school students.",
    source_url: src("241213"),
  },
  {
    anzsco_code: "241511",
    name: "Special Needs Teacher",
    skill_level: 1,
    assessing_authority: AITSL,
    assessing_authority_url: AITSL_URL,
    mltssl: true,
    stsol: false,
    rol: false,
    csol: true,
    visa_pathway_note: "On MLTSSL, supporting the 189, 190, and 491, via AITSL assessment and state registration. Also on CSOL, additionally supporting the employer-sponsored 482 and 186.",
    summary: "Teaches students with additional learning, behavioural, or developmental needs.",
    source_url: "https://immi.homeaffairs.gov.au/Documents/core-sol.pdf",
  },

  // ---------- Architecture ----------
  {
    anzsco_code: "232111",
    name: "Architect",
    skill_level: 1,
    assessing_authority: AACA,
    assessing_authority_url: AACA_URL,
    mltssl: true,
    stsol: false,
    rol: false,
    csol: true,
    visa_pathway_note:
      "On both MLTSSL and CSOL, supporting 189/190/491 and the employer-sponsored 482/186. Full registration as an architect needs the accredited Master of Architecture plus logged practical experience and the Architectural Practice Examination, on top of the skills assessment.",
    summary: "Designs buildings and oversees their construction, assessed by the Architects Accreditation Council of Australia.",
    source_url: src("232111"),
  },
  {
    anzsco_code: "232112",
    name: "Landscape Architect",
    skill_level: 1,
    assessing_authority: AACA,
    assessing_authority_url: AACA_URL,
    mltssl: true,
    stsol: false,
    rol: false,
    csol: true,
    visa_pathway_note: "On MLTSSL, supporting the 189, 190, and 491, via an AACA assessment. Also on CSOL, additionally supporting the employer-sponsored 482 and 186.",
    summary: "Designs outdoor and public spaces, from parks to urban precincts.",
    source_url: "https://immi.homeaffairs.gov.au/Documents/core-sol.pdf",
  },

  // ---------- Design (arts-and-design) ----------
  {
    anzsco_code: "232411",
    name: "Graphic Designer",
    skill_level: 1,
    assessing_authority: VETASSESS,
    assessing_authority_url: VETASSESS_URL,
    mltssl: false,
    stsol: true,
    rol: false,
    csol: false,
    visa_pathway_note: "On STSOL, supporting the 190 and 491, not the 189 on its own.",
    summary: "Creates visual concepts for print and digital media to communicate ideas.",
    source_url: src("232411"),
  },
  {
    anzsco_code: "232312",
    name: "Industrial Designer",
    skill_level: 1,
    assessing_authority: VETASSESS,
    assessing_authority_url: VETASSESS_URL,
    mltssl: false,
    stsol: true,
    rol: false,
    csol: false,
    visa_pathway_note: "On STSOL, supporting the 190 and 491, not the 189 on its own.",
    summary: "Designs manufactured products, balancing function, cost, and appearance.",
    source_url: src("232312"),
  },
  {
    anzsco_code: "232414",
    name: "Web Designer",
    skill_level: 1,
    assessing_authority: VETASSESS,
    assessing_authority_url: VETASSESS_URL,
    mltssl: false,
    stsol: true,
    rol: false,
    csol: true,
    visa_pathway_note: "On STSOL, supporting the 190 and 491, not the 189 on its own. Also on CSOL, additionally supporting the employer-sponsored 482 and 186.",
    summary: "Designs the visual layout and user experience of websites.",
    source_url: "https://immi.homeaffairs.gov.au/Documents/core-sol.pdf",
  },

  // ---------- Engineering ----------
  {
    anzsco_code: "233211",
    name: "Civil Engineer",
    skill_level: 1,
    assessing_authority: EA,
    assessing_authority_url: EA_URL,
    mltssl: true,
    stsol: false,
    rol: false,
    csol: true,
    visa_pathway_note:
      "On both MLTSSL and CSOL, supporting 189/190/491 and the employer-sponsored 482/186. A degree accredited by Engineers Australia makes the skills assessment close to a formality; a non-accredited degree instead needs a Competency Demonstration Report.",
    summary: "Designs and oversees infrastructure such as roads, bridges, and water systems.",
    source_url: src("233211"),
  },
  {
    anzsco_code: "233214",
    name: "Structural Engineer",
    skill_level: 1,
    assessing_authority: EA,
    assessing_authority_url: EA_URL,
    mltssl: true,
    stsol: false,
    rol: false,
    csol: true,
    visa_pathway_note: "On MLTSSL, supporting the 189, 190, and 491, via Engineers Australia assessment. Also on CSOL, additionally supporting the employer-sponsored 482 and 186.",
    summary: "Designs the structural elements of buildings and infrastructure so they safely carry load.",
    source_url: "https://immi.homeaffairs.gov.au/Documents/core-sol.pdf",
  },
  {
    anzsco_code: "233512",
    name: "Mechanical Engineer",
    skill_level: 1,
    assessing_authority: EA,
    assessing_authority_url: EA_URL,
    mltssl: true,
    stsol: false,
    rol: false,
    csol: true,
    visa_pathway_note: "On both MLTSSL and CSOL, supporting 189/190/491 and the employer-sponsored 482/186.",
    summary: "Designs and maintains mechanical systems and machinery across manufacturing, energy, and infrastructure.",
    source_url: src("233512"),
  },
  {
    anzsco_code: "233311",
    name: "Electrical Engineer",
    skill_level: 1,
    assessing_authority: EA,
    assessing_authority_url: EA_URL,
    mltssl: true,
    stsol: false,
    rol: false,
    csol: true,
    visa_pathway_note: "On both MLTSSL and CSOL, supporting 189/190/491 and the employer-sponsored 482/186.",
    summary: "Designs and maintains electrical power, control, and distribution systems.",
    source_url: src("233311"),
  },
  {
    anzsco_code: "233411",
    name: "Electronics Engineer",
    skill_level: 1,
    assessing_authority: EA,
    assessing_authority_url: EA_URL,
    mltssl: true,
    stsol: false,
    rol: false,
    csol: true,
    visa_pathway_note: "On MLTSSL, supporting the 189, 190, and 491, via Engineers Australia assessment. Also on CSOL, additionally supporting the employer-sponsored 482 and 186.",
    summary: "Designs electronic circuits, devices, and systems, from consumer products to industrial controls.",
    source_url: "https://immi.homeaffairs.gov.au/Documents/core-sol.pdf",
  },
  {
    anzsco_code: "233111",
    name: "Chemical Engineer",
    skill_level: 1,
    assessing_authority: EA,
    assessing_authority_url: EA_URL,
    mltssl: true,
    stsol: false,
    rol: false,
    csol: true,
    visa_pathway_note: "On both MLTSSL and CSOL, supporting 189/190/491 and the employer-sponsored 482/186.",
    summary: "Designs and manages processes that convert raw materials into industrial and consumer products.",
    source_url: src("233111"),
  },
  {
    anzsco_code: "233915",
    name: "Environmental Engineer",
    skill_level: 1,
    assessing_authority: EA,
    assessing_authority_url: EA_URL,
    mltssl: true,
    stsol: false,
    rol: false,
    csol: true,
    visa_pathway_note: "On both MLTSSL and CSOL, supporting 189/190/491 and the employer-sponsored 482/186.",
    summary: "Applies engineering to manage pollution, water, waste, and environmental impact.",
    source_url: src("233915"),
  },
  {
    anzsco_code: "233611",
    name: "Mining Engineer (excluding Petroleum)",
    skill_level: 1,
    assessing_authority: EA,
    assessing_authority_url: EA_URL,
    mltssl: true,
    stsol: false,
    rol: false,
    csol: true,
    visa_pathway_note: "On MLTSSL, supporting the 189, 190, and 491, via Engineers Australia assessment. Also on CSOL, additionally supporting the employer-sponsored 482 and 186.",
    summary: "Plans and manages the extraction of minerals, a mainstay occupation in Western Australia and Queensland.",
    source_url: "https://immi.homeaffairs.gov.au/Documents/core-sol.pdf",
  },
  {
    anzsco_code: "233913",
    name: "Biomedical Engineer",
    skill_level: 1,
    assessing_authority: EA,
    assessing_authority_url: EA_URL,
    mltssl: true,
    stsol: false,
    rol: false,
    csol: true,
    visa_pathway_note: "On MLTSSL, supporting the 189, 190, and 491, via Engineers Australia assessment. Also on CSOL, additionally supporting the employer-sponsored 482 and 186.",
    summary: "Applies engineering principles to medical devices, equipment, and clinical systems.",
    source_url: "https://immi.homeaffairs.gov.au/Documents/core-sol.pdf",
  },
  {
    anzsco_code: "233912",
    name: "Agricultural Engineer",
    skill_level: 1,
    assessing_authority: EA,
    assessing_authority_url: EA_URL,
    mltssl: true,
    stsol: false,
    rol: false,
    csol: true,
    visa_pathway_note: "On MLTSSL and CSOL, supporting the points-tested 189, 190, and 491 as well as the employer-sponsored 482 and 186, via an Engineers Australia skills assessment.",
    summary: "Applies engineering to farming systems, irrigation, and agricultural machinery.",
    source_url: "https://immi.homeaffairs.gov.au/Documents/core-sol.pdf",
  },

  // ---------- Agriculture ----------
  {
    anzsco_code: "234111",
    name: "Agricultural Consultant",
    skill_level: 1,
    assessing_authority: VETASSESS,
    assessing_authority_url: VETASSESS_URL,
    mltssl: true,
    stsol: false,
    rol: false,
    csol: true,
    visa_pathway_note: "On MLTSSL, supporting the 189, 190, and 491, via VETASSESS assessment. Also on CSOL, additionally supporting the employer-sponsored 482 and 186.",
    summary: "Advises farmers and agribusinesses on production, land management, and business decisions.",
    source_url: "https://immi.homeaffairs.gov.au/Documents/core-sol.pdf",
  },
  {
    anzsco_code: "234112",
    name: "Agricultural Scientist",
    skill_level: 1,
    assessing_authority: VETASSESS,
    assessing_authority_url: VETASSESS_URL,
    mltssl: true,
    stsol: false,
    rol: true,
    csol: false,
    visa_pathway_note:
      "On both MLTSSL and ROL, so it supports 189/190/491 generally and gets an extra boost through the Skilled Work Regional (491) pathway if you study or work regionally.",
    summary: "Researches and improves crop, soil, and livestock systems, a mainstay of the regional universities' agriculture programs.",
    source_url: src("234112"),
  },
  {
    anzsco_code: "234711",
    name: "Veterinarian",
    skill_level: 1,
    assessing_authority: AVBC,
    assessing_authority_url: AVBC_URL,
    mltssl: true,
    stsol: false,
    rol: true,
    csol: true,
    visa_pathway_note: "On both MLTSSL and ROL, supporting 189/190/491 with a further boost through regional nomination. Needs registration with a state veterinary board, assessed nationally by the Australasian Veterinary Boards Council. Also on CSOL, additionally supporting the employer-sponsored 482 and 186.",
    summary: "Diagnoses and treats animal illness and injury, in genuine shortage across regional Australia.",
    source_url: "https://immi.homeaffairs.gov.au/Documents/core-sol.pdf",
  },

  // ---------- Environmental science ----------
  {
    anzsco_code: "234312",
    name: "Environmental Consultant",
    skill_level: 1,
    assessing_authority: VETASSESS,
    assessing_authority_url: VETASSESS_URL,
    mltssl: true,
    stsol: false,
    rol: false,
    csol: true,
    visa_pathway_note: "On MLTSSL, supporting the 189, 190, and 491. VETASSESS wants a bachelor's or higher in a highly relevant field plus at least a year of relevant post-qualification work. Also on CSOL, additionally supporting the employer-sponsored 482 and 186.",
    summary: "Advises government and industry on environmental policy, compliance, and impact.",
    source_url: "https://immi.homeaffairs.gov.au/Documents/core-sol.pdf",
  },
  {
    anzsco_code: "234313",
    name: "Environmental Research Scientist",
    skill_level: 1,
    assessing_authority: VETASSESS,
    assessing_authority_url: VETASSESS_URL,
    mltssl: true,
    stsol: false,
    rol: false,
    csol: false,
    visa_pathway_note: "On MLTSSL, supporting the 189, 190, and 491, via VETASSESS assessment.",
    summary: "Conducts research into environmental systems, ecosystems, and human impact.",
    source_url: src("234313"),
  },

  // ---------- Hospitality and tourism ----------
  {
    anzsco_code: "141311",
    name: "Hotel or Motel Manager",
    skill_level: 2,
    assessing_authority: VETASSESS,
    assessing_authority_url: VETASSESS_URL,
    mltssl: false,
    stsol: true,
    rol: false,
    csol: true,
    visa_pathway_note: "On STSOL, supporting the 190 and 491, not the 189 on its own. A weaker migration pathway than the technical fields; regional employment and nomination matter more here. Also on CSOL, additionally supporting the employer-sponsored 482 and 186.",
    summary: "Manages the day-to-day operations of a hotel or motel, from staffing to guest services.",
    source_url: "https://immi.homeaffairs.gov.au/Documents/core-sol.pdf",
  },
  {
    anzsco_code: "141111",
    name: "Cafe or Restaurant Manager",
    skill_level: 2,
    assessing_authority: VETASSESS,
    assessing_authority_url: VETASSESS_URL,
    mltssl: false,
    stsol: true,
    rol: false,
    csol: false,
    visa_pathway_note: "On STSOL, supporting the 190 and 491, not the 189 on its own.",
    summary: "Runs the daily operations of a cafe or restaurant, including staff, service, and stock.",
    source_url: src("141111"),
  },

  // ---------- Physics ----------
  {
    anzsco_code: "234914",
    name: "Physicist",
    skill_level: 1,
    assessing_authority: VETASSESS,
    assessing_authority_url: VETASSESS_URL,
    mltssl: true,
    stsol: false,
    rol: false,
    csol: true,
    visa_pathway_note: "On MLTSSL, supporting the 189, 190, and 491, via VETASSESS assessment. Most physics graduates who use this occupation have gone on to a research higher degree or specialised industry role. Also on CSOL, additionally supporting the employer-sponsored 482 and 186.",
    summary: "Studies the physical properties and behaviour of matter and energy, applied in research and industry.",
    source_url: "https://immi.homeaffairs.gov.au/Documents/core-sol.pdf",
  },

  // ---------- Economics ----------
  {
    anzsco_code: "224311",
    name: "Economist",
    skill_level: 1,
    assessing_authority: VETASSESS,
    assessing_authority_url: VETASSESS_URL,
    mltssl: true,
    stsol: false,
    rol: false,
    csol: false,
    visa_pathway_note: "On MLTSSL, supporting the 189, 190, and 491, via VETASSESS assessment.",
    summary: "Analyses economic data and trends to advise on policy, markets, or business strategy.",
    source_url: src("224311"),
  },
];

function slugify(name, code) {
  const base = name
    .toLowerCase()
    .trim()
    .replace(/\s*&\s*/g, "-and-")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `${base}-${code}`;
}

const client = new pg.Client({
  connectionString: env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

try {
  await client.connect();

  let inserted = 0;
  let updated = 0;

  for (const o of occupations) {
    const slug = slugify(o.name, o.anzsco_code);
    const fields = { ...o, slug };
    const cols = Object.keys(fields);
    const vals = cols.map((c) => fields[c]);
    const placeholders = cols.map((_, i) => `$${i + 1}`);

    const res = await client.query(
      `insert into occupations (${cols.join(", ")}, status, last_verified_at)
       values (${placeholders.join(", ")}, 'published', $${cols.length + 1})
       on conflict (anzsco_code) do update set
         ${cols.filter((c) => c !== "anzsco_code").map((c) => `${c} = excluded.${c}`).join(", ")},
         status = 'published', last_verified_at = excluded.last_verified_at, updated_at = now()
       returning id, anzsco_code, (xmax = 0) as inserted`,
      [...vals, TODAY],
    );
    const row = res.rows[0];
    if (row.inserted) inserted += 1;
    else updated += 1;
    console.log(row.inserted ? "inserted" : "updated", row.anzsco_code, o.name);
  }

  console.log(`done. inserted=${inserted} updated=${updated} total=${occupations.length}`);
} catch (e) {
  console.error("ERR", e.message);
  process.exit(1);
} finally {
  await client.end();
}
