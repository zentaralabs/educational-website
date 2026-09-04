-- Occupation pathway data: which ANZSCO occupations a program of study leads
-- to, and whether those occupations sit on Australia's skilled-migration
-- lists (MLTSSL/STSOL/ROL/CSOL). This is the single most-asked question for
-- our core audience ("will this degree get me PR") and today there is no
-- structured answer anywhere on the site — only prose in SUBJECT_CONTENT
-- (src/lib/subjects.ts) at the 20-subject level. This migration adds a real
-- occupation reference table plus a program-level join, so program pages can
-- show a concrete "Career & PR pathway" module instead of generic subject
-- prose.
--
-- Two tables, same shape as the visas feature (0019):
--   occupations         -- evergreen reference: one row per ANZSCO occupation
--   program_occupations -- many-to-many: which occupations a program leads to

create table occupations (
  id uuid primary key default gen_random_uuid(),
  anzsco_code text unique not null,        -- '261313'
  name text not null,                      -- 'Software Engineer'
  slug text unique not null,               -- 'software-engineer-261313'
  skill_level int,                         -- ANZSCO skill level, 1 (highest) to 5

  assessing_authority text,                -- 'Australian Computer Society (ACS)'
  assessing_authority_url text,

  -- Skilled-migration occupation list membership. An occupation can sit on
  -- more than one list at once; these are independent flags, not an enum.
  mltssl boolean default false,            -- Medium and Long-term Strategic Skills List
  stsol boolean default false,             -- Short-term Skilled Occupation List
  rol boolean default false,               -- Regional Occupation List
  csol boolean default false,              -- Core Skills Occupation List (post-2024 reform, subclass 482/494)

  visa_pathway_note text,                  -- prose: which subclasses/streams this occupation realistically supports
  summary text,                            -- one-line description for cards

  status content_status default 'draft',
  last_verified_at date,
  source_url text,

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_occupations_slug on occupations(slug);

create trigger set_updated_at before update on occupations
  for each row execute function set_updated_at();

alter table occupations enable row level security;

create policy "public read published" on occupations for select using (status = 'published');
create policy "staff read all" on occupations for select using (is_staff());
create policy "admin write" on occupations for all using (is_staff_admin()) with check (is_staff_admin());
create policy "editor insert draft" on occupations for insert
  with check (is_staff() and status in ('draft', 'needs_review'));
create policy "editor update draft" on occupations for update
  using (is_staff() and status in ('draft', 'needs_review'))
  with check (is_staff() and status in ('draft', 'needs_review'));

-- program_occupations: a pure lookup join, not editorial content in its own
-- right (no content_status workflow) — same pattern as university_degree_levels
-- in 0001. Visibility is enforced by joining through programs/occupations,
-- both of which already carry their own published-only RLS.

create table program_occupations (
  id uuid primary key default gen_random_uuid(),
  program_id uuid references programs(id) on delete cascade not null,
  occupation_id uuid references occupations(id) on delete cascade not null,
  relevance text not null default 'primary' check (relevance in ('primary', 'related')),
  pathway_note text,                       -- program-specific override, e.g. accreditation caveat
  created_at timestamptz default now(),
  unique (program_id, occupation_id)
);

create index idx_program_occupations_program on program_occupations(program_id);
create index idx_program_occupations_occupation on program_occupations(occupation_id);

alter table program_occupations enable row level security;

create policy "public read all" on program_occupations for select using (true);
create policy "admin write" on program_occupations for all using (is_staff_admin()) with check (is_staff_admin());
