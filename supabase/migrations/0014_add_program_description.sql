-- Free-text "about this program" copy, written by admins and shown on each
-- program's own detail page (/universities/[slug]/programs/[programId]) —
-- distinct from admission_requirements/english_requirements, which are
-- entry-bar facts, not descriptive prose about the program itself.

alter table programs add column description text;

comment on column programs.description is
  'Admin-authored prose describing the program, shown on its public detail page.';
