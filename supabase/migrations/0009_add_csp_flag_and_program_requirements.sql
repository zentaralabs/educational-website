-- Marks whether a program's tuition_domestic figure is a Commonwealth
-- Supported Place (CSP) student-contribution rate rather than a full
-- domestic fee. Needed because CSP places are limited/competitive in
-- Australian postgrad coursework — showing that number without this flag
-- would misrepresent it as a guaranteed price for every domestic applicant.

alter table programs add column tuition_domestic_is_csp boolean;
alter table universities add column tuition_domestic_is_csp boolean;

comment on column programs.tuition_domestic_is_csp is
  'True when tuition_domestic is a Commonwealth Supported Place (subsidised, limited-availability) rate rather than the full domestic fee.';
comment on column universities.tuition_domestic_is_csp is
  'True when tuition_domestic is a Commonwealth Supported Place (subsidised, limited-availability) rate rather than the full domestic fee.';

-- Admission requirements are genuinely per-program (a WAM/GPA cutoff and
-- prerequisite subjects for one specific degree), not university-wide, so
-- reusing universities.gpa_requirement/required_tests for this would
-- misrepresent a single program's bar as the school's general standard.
-- Free text, matching the existing style of source_url-cited program facts.

alter table programs add column admission_requirements text;
alter table programs add column english_requirements text;

comment on column programs.admission_requirements is
  'Academic entry criteria for this specific program (e.g. WAM/GPA cutoff, prerequisite subjects) — not the university-wide bar.';
comment on column programs.english_requirements is
  'English proficiency test scores required for this specific program (e.g. IELTS/TOEFL/PTE minimums).';
