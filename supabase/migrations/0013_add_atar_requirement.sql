-- Domestic Australian applicants are assessed on ATAR (0-99.95), not GPA —
-- these aren't the same scale and one can't be derived from the other, so
-- unlike academic_requirement_domestic this isn't a "falls back to the
-- international field" override; it's a distinct metric shown only to
-- domestic visitors, same as gpa_requirement is shown only to international.

alter table universities add column atar_requirement text;

comment on column universities.atar_requirement is
  'Domestic (ATAR-based) entry requirement, e.g. "70+". Shown instead of gpa_requirement for domestic visitors — no fallback between the two since the scales are unrelated.';
