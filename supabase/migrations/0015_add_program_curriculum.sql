-- Course structure (semester-by-semester breakdown, unit codes) is
-- distinct from `description` (a short prose overview) — cramming both
-- into one field meant the curriculum's line-based structure either got
-- lost in prose or forced the overview text to carry list-like formatting
-- it wasn't designed for. Rendered in its own "Course structure" section.

alter table programs add column curriculum text;

comment on column programs.curriculum is
  'Admin-authored course/curriculum structure (e.g. semester-by-semester breakdown), one entry per line, shown in its own section on the program detail page — separate from the prose `description` overview.';
