-- Australian visa subclass reference + SkillSelect invitation-round tracker.
-- See PROJECT_STATUS.md's 2026-08-27 note ("visa subclasses").
--
-- Not country-gated the way universities/programs are (no country_id, no
-- is_launched join): this content is Australia-specific by nature and only
-- exists because Australia is the launched country. If a second country ever
-- gets its own visa content, revisit with a country_id column then rather
-- than pretending the current rows are country-agnostic.
--
-- Two tables, mirroring the guides/blog_posts split:
--   visa_subclasses   -- evergreen reference: one row per subclass (189, 485, ...)
--   invitation_rounds -- chronological/dated SkillSelect round results

create table visa_subclasses (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,               -- 'skilled-independent-189'
  code text not null,                      -- '189'
  name text not null,                      -- 'Skilled Independent visa'
  -- 'skilled' | 'graduate' | 'student' | 'employer-sponsored' | 'family'
  -- | 'business-investor' | 'visitor' | 'other'
  category text not null,
  stream text,                             -- 'Points-tested', 'Family Sponsored', ...
  short_description text,                   -- one-liner for cards + meta description
  summary text,                            -- answer-first opening paragraph

  is_points_tested boolean default false,
  min_points int,                          -- current pass mark if points-tested (usually 65)
  stay_period text,                        -- 'Permanent', '5 years', '18 months', ...
  leads_to_pr boolean default false,
  pr_pathway text,                         -- prose: how (or whether) this leads to PR

  base_application_charge text,             -- 'AUD 4,765' — free text (instalments/satellites vary)
  processing_time text,                     -- '5 to 12 months' — free text, Home Affairs quotes ranges
  age_limit text,                           -- 'Under 45 at invitation'
  english_requirement text,
  work_experience_requirement text,
  occupation_list text,                     -- 'MLTSSL' | 'STSOL' | 'ROL' | 'CSOL' | null

  eligibility text,                         -- markdown: who it's for / key criteria
  conditions text,                          -- markdown: visa conditions (8503, 8547, ...)
  content text,                             -- markdown: full explainer body

  status content_status default 'draft',
  author_id uuid references authors(id),
  reviewed_by_id uuid references authors(id),
  last_verified_at date,
  source_urls text[],

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table invitation_rounds (
  id uuid primary key default gen_random_uuid(),
  round_date date not null,
  -- Kept as free text, not an FK: some rounds report on streams that aren't
  -- modelled as their own subclass row (e.g. "491 Family Sponsored"), and the
  -- soft link below is enough for "rounds for this visa" lookups.
  visa_code text not null,                  -- '189' | '190' | '491'
  visa_subclass_id uuid references visa_subclasses(id) on delete set null,
  stream text,                              -- 'Points-tested', 'Family Sponsored', 'State/Territory nominated'
  invitations_issued int,
  min_points int,
  occupation_notes text,                    -- 'Trades 65 · Health/Education 75+ · ICT 90+'
  program_year text,                        -- '2025-26'
  notes text,
  -- Projected/approximate rounds flagged per this project's relaxed-bar
  -- convention (PROJECT_STATUS.md Section 13) so the UI can label them.
  is_estimated boolean default false,

  status content_status default 'draft',
  last_verified_at date,
  source_url text,

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_invitation_rounds_date on invitation_rounds(round_date desc);
create index idx_invitation_rounds_visa_code on invitation_rounds(visa_code);
create index idx_invitation_rounds_subclass on invitation_rounds(visa_subclass_id);

create trigger set_updated_at before update on visa_subclasses
  for each row execute function set_updated_at();
create trigger set_updated_at before update on invitation_rounds
  for each row execute function set_updated_at();

-- RLS — identical shape to guides/blog_posts/programs.

alter table visa_subclasses enable row level security;
alter table invitation_rounds enable row level security;

create policy "public read published" on visa_subclasses for select using (status = 'published');
create policy "staff read all" on visa_subclasses for select using (is_staff());
create policy "admin write" on visa_subclasses for all using (is_staff_admin()) with check (is_staff_admin());
create policy "editor insert draft" on visa_subclasses for insert
  with check (is_staff() and status in ('draft', 'needs_review'));
create policy "editor update draft" on visa_subclasses for update
  using (is_staff() and status in ('draft', 'needs_review'))
  with check (is_staff() and status in ('draft', 'needs_review'));

create policy "public read published" on invitation_rounds for select using (status = 'published');
create policy "staff read all" on invitation_rounds for select using (is_staff());
create policy "admin write" on invitation_rounds for all using (is_staff_admin()) with check (is_staff_admin());
create policy "editor insert draft" on invitation_rounds for insert
  with check (is_staff() and status in ('draft', 'needs_review'));
create policy "editor update draft" on invitation_rounds for update
  using (is_staff() and status in ('draft', 'needs_review'))
  with check (is_staff() and status in ('draft', 'needs_review'));
