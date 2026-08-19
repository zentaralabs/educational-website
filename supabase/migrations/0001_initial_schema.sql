-- University Guidance Platform — initial schema
-- Source of truth: /database-schema.md (implement exactly as specified)
-- User accounts (saved universities, alerts) intentionally deferred — see PROJECT_STATUS.md Section 10.1

-- ===========================================================================
-- Enums / lookup tables
-- ===========================================================================

create type content_status as enum ('draft', 'needs_review', 'verified', 'published', 'archived');

create table countries (
  id serial primary key,
  code text unique not null,        -- 'US', 'UK', 'CA', 'AU'
  name text not null
);

create table degree_levels (
  id serial primary key,
  name text unique not null         -- 'Undergraduate', 'Graduate', 'PhD', 'Foundation/Pathway'
);

create table application_platforms (
  id serial primary key,
  name text unique not null,        -- 'Common App', 'UCAS', 'OUAC', 'Direct'
  country_id int references countries(id)
);

create table deadline_types (
  id serial primary key,
  name text unique not null         -- 'Early Decision', 'Early Action', 'Regular Decision', 'Rolling'
);

-- ===========================================================================
-- Authors (byline / trust signal, also drives admin/editor role checks)
-- authors.id is expected to equal the corresponding auth.users.id (1:1 with
-- Supabase Auth) so RLS policies can key off auth.uid() directly.
-- ===========================================================================

create table authors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  bio text,
  credentials text,                 -- e.g. "Former admissions reader, State University"
  avatar_url text,
  is_admin boolean default false,
  created_at timestamptz default now()
);

-- ===========================================================================
-- Universities
-- ===========================================================================

create table universities (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  country_id int references countries(id) not null,
  city text,
  region text,                      -- state/province
  institution_type text,            -- 'public' | 'private'
  founded_year int,
  website_url text,

  -- Admissions
  acceptance_rate numeric(5,2),
  required_tests text[],            -- ['SAT','ACT'] / ['A-Levels'] etc.
  test_score_range text,            -- free text, since ranges vary by test type
  gpa_requirement text,
  required_documents text[],        -- ['SOP','2 LORs','Portfolio']
  application_platform_id int references application_platforms(id),

  -- Cost
  tuition_in_state numeric,
  tuition_out_state numeric,
  tuition_international numeric,
  est_cost_of_attendance numeric,

  -- Academic
  popular_majors text[],
  student_faculty_ratio text,

  -- Narrative (the differentiator content — NOT auto-templated)
  distinctive_summary text,         -- "what makes this school distinctive"
  international_student_notes text,

  -- Trust / workflow
  status content_status default 'draft',
  author_id uuid references authors(id),
  reviewed_by_id uuid references authors(id),
  last_verified_at date,
  source_urls text[],               -- official sources used for fact-checking

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table university_degree_levels (   -- many-to-many
  university_id uuid references universities(id) on delete cascade,
  degree_level_id int references degree_levels(id),
  primary key (university_id, degree_level_id)
);

-- ===========================================================================
-- Rankings
-- ===========================================================================

create table ranking_bodies (
  id serial primary key,
  name text unique not null,        -- 'QS World University Rankings', 'Times Higher Education', 'US News'
  website_url text
);

create table rankings (
  id uuid primary key default gen_random_uuid(),
  university_id uuid references universities(id) on delete cascade not null,
  ranking_body_id int references ranking_bodies(id) not null,
  rank int not null,
  category text,                    -- 'Overall' | 'Engineering' | 'Business' etc., nullable
  year int not null,
  source_url text not null,

  created_at timestamptz default now(),
  unique (university_id, ranking_body_id, category, year)
);

create index idx_rankings_university on rankings(university_id);

-- ===========================================================================
-- Deadlines
-- ===========================================================================

create table deadlines (
  id uuid primary key default gen_random_uuid(),
  university_id uuid references universities(id) on delete cascade not null,
  degree_level_id int references degree_levels(id) not null,
  deadline_type_id int references deadline_types(id) not null,
  deadline_date date not null,
  application_platform_id int references application_platforms(id),
  notes text,
  is_rolling boolean default false,

  -- Trust / workflow
  status content_status default 'draft',
  last_verified_at date,
  source_url text,

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Index for the calendar/filter views
create index idx_deadlines_date on deadlines(deadline_date);
create index idx_deadlines_university on deadlines(university_id);

-- ===========================================================================
-- Scholarships
-- ===========================================================================

create table scholarships (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  scope text not null,              -- 'university-specific' | 'national' | 'external/foundation'
  amount text,                      -- free text: often a range or "full tuition"
  eligibility text,
  deadline_date date,
  country_id int references countries(id),  -- for national/external scholarships not tied to one school
  external_url text,

  status content_status default 'draft',
  last_verified_at date,
  source_url text,

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Many-to-many: a scholarship may apply to multiple universities (or none, if national/external)
create table scholarship_universities (
  scholarship_id uuid references scholarships(id) on delete cascade,
  university_id uuid references universities(id) on delete cascade,
  primary key (scholarship_id, university_id)
);

-- ===========================================================================
-- Guides (evergreen / narrative content)
-- ===========================================================================

create table guides (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  category text not null,           -- 'how-to' | 'comparison' | 'country-guide' | 'test-prep'
  country_id int references countries(id), -- nullable: some guides are country-agnostic
  content text not null,            -- markdown body
  excerpt text,
  word_count int,

  author_id uuid references authors(id),
  reviewed_by_id uuid references authors(id),
  status content_status default 'draft',
  last_verified_at date,
  source_urls text[],

  -- QA checklist state (supports the "sound human" workflow)
  qa_facts_verified boolean default false,
  qa_sentence_variation_checked boolean default false,
  qa_firsthand_detail_added boolean default false,

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table guide_related_links (   -- manually curated internal linking
  guide_id uuid references guides(id) on delete cascade,
  related_guide_id uuid references guides(id) on delete cascade,
  related_university_id uuid references universities(id) on delete cascade,
  primary key (guide_id, related_guide_id, related_university_id)
);

-- ===========================================================================
-- Activity log (for the Dashboard "recent activity" widget)
-- ===========================================================================

create table activity_log (
  id bigserial primary key,
  author_id uuid references authors(id),
  entity_type text not null,        -- 'university' | 'deadline' | 'guide' | 'scholarship'
  entity_id uuid not null,
  action text not null,             -- 'created' | 'updated' | 'status_changed'
  detail text,
  created_at timestamptz default now()
);

-- ===========================================================================
-- updated_at triggers
-- ===========================================================================

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_updated_at before update on universities
  for each row execute function set_updated_at();
create trigger set_updated_at before update on deadlines
  for each row execute function set_updated_at();
create trigger set_updated_at before update on scholarships
  for each row execute function set_updated_at();
create trigger set_updated_at before update on guides
  for each row execute function set_updated_at();
