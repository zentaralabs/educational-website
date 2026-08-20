-- Programs — structured degree offerings per university (e.g. "Bachelor of
-- Computer Science", "Master of Data Science"), addressing the course/subject
-- gap flagged in PROJECT_STATUS.md Section 12: `universities.popular_majors`
-- is a loose text array, not real per-program data (own degree type, tuition,
-- duration). This is additive — existing tables/data are untouched.

create table programs (
  id uuid primary key default gen_random_uuid(),
  university_id uuid references universities(id) on delete cascade not null,
  name text not null,                     -- 'Bachelor of Computer Science'
  degree_level_id int references degree_levels(id) not null,
  field_of_study text,                    -- free text, e.g. 'Computer Science' — no controlled vocabulary yet
  duration_years numeric(3,1),

  -- Optional per-program override; falls back to the university-level
  -- tuition_international on universities when null.
  tuition_international numeric,

  -- Trust / workflow — same pattern as deadlines/scholarships/guides
  status content_status default 'draft',
  last_verified_at date,
  source_url text,

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_programs_university on programs(university_id);

create trigger set_updated_at before update on programs
  for each row execute function set_updated_at();

-- RLS — identical shape to deadlines/scholarships/guides (0002_rls_policies.sql):
-- public reads published only, staff read everything, admin full write,
-- editors can insert/update draft or needs_review rows but can't publish.

alter table programs enable row level security;

create policy "public read published" on programs for select using (status = 'published');
create policy "staff read all" on programs for select using (is_staff());
create policy "admin write" on programs for all using (is_staff_admin()) with check (is_staff_admin());

create policy "editor insert draft" on programs for insert
  with check (is_staff() and status in ('draft', 'needs_review'));
create policy "editor update draft" on programs for update
  using (is_staff() and status in ('draft', 'needs_review'))
  with check (is_staff() and status in ('draft', 'needs_review'));
