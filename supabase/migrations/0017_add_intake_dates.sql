-- Intake/semester start dates (e.g. "February, July") — needed now that
-- programs are being expanded from one flagship entry per university to a
-- representative catalog per institution, where intake timing is one of
-- the facts prospective students filter on. University-level column is a
-- default; the program-level column overrides it when a specific program's
-- intake differs from the school's general pattern (same null-fallback
-- pattern already used for tuition_domestic/application_url/ielts_overall).

alter table universities add column intake_dates text;
alter table programs add column intake_dates text;

comment on column universities.intake_dates is
  'General intake/semester start months for this university, free text (e.g. "February, July") — default shown when a program does not override it.';
comment on column programs.intake_dates is
  'Overrides universities.intake_dates for this specific program; null falls back to the university default.';
