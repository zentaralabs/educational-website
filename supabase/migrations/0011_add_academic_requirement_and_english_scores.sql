-- General academic entry requirement, university-wide (e.g. "completion of
-- Year 12 / secondary education with an ATAR of 80+"). Distinct from
-- gpa_requirement (a bare number/scale) and from programs.admission_requirements
-- (a specific program's WAM/GPA cutoff and prerequisites, per migration 0009).

alter table universities add column academic_requirement text;

comment on column universities.academic_requirement is
  'General university-wide academic entry bar in prose (e.g. secondary schooling equivalent, minimum ATAR) — not a program-specific cutoff.';

-- IELTS/PTE minimum scores, university-wide default. Stored per band so the
-- site can show "no band below X" style requirements, not just an overall
-- score. Programs get the same columns as an override: null means "use the
-- university default", set means "this program's own bar overrides it" —
-- same fallback pattern already used for tuition_domestic/tuition_international
-- and application_url on programs.

alter table universities add column ielts_overall numeric(2,1);
alter table universities add column ielts_listening numeric(2,1);
alter table universities add column ielts_reading numeric(2,1);
alter table universities add column ielts_writing numeric(2,1);
alter table universities add column ielts_speaking numeric(2,1);

alter table universities add column pte_overall smallint;
alter table universities add column pte_listening smallint;
alter table universities add column pte_reading smallint;
alter table universities add column pte_writing smallint;
alter table universities add column pte_speaking smallint;

comment on column universities.ielts_overall is 'Minimum IELTS overall band score required by default across all programs.';
comment on column universities.pte_overall is 'Minimum PTE Academic overall score (10-90 scale) required by default across all programs.';

alter table programs add column ielts_overall numeric(2,1);
alter table programs add column ielts_listening numeric(2,1);
alter table programs add column ielts_reading numeric(2,1);
alter table programs add column ielts_writing numeric(2,1);
alter table programs add column ielts_speaking numeric(2,1);

alter table programs add column pte_overall smallint;
alter table programs add column pte_listening smallint;
alter table programs add column pte_reading smallint;
alter table programs add column pte_writing smallint;
alter table programs add column pte_speaking smallint;

comment on column programs.ielts_overall is 'Overrides universities.ielts_overall for this program; null falls back to the university default.';
comment on column programs.pte_overall is 'Overrides universities.pte_overall for this program; null falls back to the university default.';
