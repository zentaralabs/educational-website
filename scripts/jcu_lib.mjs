// Shared extraction helpers for handbook.jcu.edu.au CourseLoop pageContent JSON.

function stripHtml(s) {
  if (!s) return "";
  return s
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/ /g, " ")
    .replace(/\s+/g, " ")
    .replace(/—|–/g, ",") // house rule: no em/en dashes anywhere
    .replace(/\.([a-zA-Z])/g, ". $1") // source occasionally concatenates two sentences with no space
    .trim();
}

// Walk requirements[].requirements[] and bucket by sub_domain.
export function extractRequirements(pc) {
  const admissionBits = [];
  const englishBits = [];
  const placementBits = [];
  for (const group of pc.requirements || []) {
    for (const req of group.requirements || []) {
      const sub = req.sub_domain || "";
      const text = stripHtml(req.description);
      if (!text) continue;
      if (/english language proficiency/i.test(sub)) {
        englishBits.push(text);
      } else if (group.domain === "Entry Requirements" && req.type?.value === "Admission") {
        admissionBits.push(text);
      } else if (/placement|professional experience/i.test(sub)) {
        placementBits.push(text);
      }
    }
  }
  return {
    admission: admissionBits.join(" "),
    english: englishBits.join(" "),
    placement: placementBits.join(" "),
  };
}

// Recursively flatten curriculumStructure.container into a readable outline
// of grouping titles + subject codes (real official unit codes, no titles
// available from this endpoint without a per-subject fetch).
export function flattenCurriculum(cs) {
  if (!cs || !cs.container) return "";
  const lines = [];
  function walk(node, path) {
    const title = node.title;
    const cp = node.credit_points;
    const codes = (node.relationship || [])
      .map((r) => r.child_record?.value)
      .filter(Boolean)
      .map((v) => v.replace(/^Subject:\s*/, ""));
    if (title && codes.length) {
      lines.push(`${path.concat(title).join(", ")} (${codes.join(", ")})`);
    } else if (title && !node.container?.length) {
      // leaf group with no subjects listed directly
    }
    for (const child of node.container || []) {
      walk(child, title ? path.concat(title) : path);
    }
  }
  walk(cs, []);
  return lines.join("; ");
}

export function extractFields(pc) {
  const { admission, english, placement } = extractRequirements(pc);
  const curriculum = flattenCurriculum(pc.curriculumStructure);
  return {
    title: pc.title,
    code: pc.code,
    credit_points: pc.credit_points,
    academic_org: pc.academic_org,
    duration_ft_std: pc.duration_ft_std,
    notes: stripHtml(pc.notes),
    majors_minors: stripHtml(pc.majors_minors),
    specialisations: stripHtml(pc.specialisations),
    professional_accreditation: stripHtml(pc.professional_accreditation),
    admission_requirements: admission,
    english_requirements: english,
    placement,
    curriculum,
    cricos_code: pc.cricos_code,
    international_students: stripHtml(typeof pc.international_students === "string" ? pc.international_students : JSON.stringify(pc.international_students || "")),
  };
}
