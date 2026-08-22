-- Domestic students often face a different (usually simpler) general entry
-- bar than international students — e.g. a plain ATAR cutoff vs. secondary
-- schooling equivalence plus English proficiency. `academic_requirement`
-- (added in 0011) now serves as the international/general bar; this column
-- is the domestic override. Same fallback pattern as tuition_domestic:
-- null means "use the international/general text for domestic too".

alter table universities add column academic_requirement_domestic text;

comment on column universities.academic_requirement_domestic is
  'Domestic-specific general academic entry bar; null falls back to academic_requirement.';

comment on column universities.academic_requirement is
  'General university-wide academic entry bar in prose, used as the international default and as the domestic fallback when academic_requirement_domestic is null.';
