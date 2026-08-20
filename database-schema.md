# University Site — Supabase Schema Plan

Scope: US, UK, Canada, Australia. Built for Next.js (SSG/ISR), Supabase (Postgres), with a custom admin panel on top.

---

## Design principles behind this schema

- **Controlled vocabularies as lookup tables**, not free text — keeps filtering, bulk-edit, and faceted search reliable across hundreds of rows.
- **Shared `content_status` enum** across all content types, so the Review Queue admin screen works uniformly.
- **Freshness + trust fields on every fact-based table** (`last_verified_at`, `author_id`, `reviewed_by_id`, `source_url`) — supports both the "stale content" dashboard and E-E-A-T/trust signals for readers, Google, and AI answer engines.
- **Structured facts separated from narrative content** — deadlines/tuition/scores are queryable relational data; "what makes this distinctive" style writing lives in its own long-text field so it can be templated without becoming thin/duplicate content.

---

## Enums / lookup tables

```sql
-- Shared workflow status across all content types
-- 'archived' = soft-deleted: page stays live with an "outdated/closed" notice or 301,
-- preserving any backlinks/citations rather than hard-deleting the row
CREATE TYPE content_status AS ENUM ('draft', 'needs_review', 'verified', 'published', 'archived');

CREATE TABLE countries (
  id SERIAL PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,        -- 'US', 'UK', 'CA', 'AU'
  name TEXT NOT NULL
);

CREATE TABLE degree_levels (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL         -- 'Undergraduate', 'Graduate', 'PhD', 'Foundation/Pathway'
);

CREATE TABLE application_platforms (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,        -- 'Common App', 'UCAS', 'OUAC', 'Direct'
  country_id INT REFERENCES countries(id)
);

CREATE TABLE deadline_types (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL         -- 'Early Decision', 'Early Action', 'Regular Decision', 'Rolling'
);
```

---

## Authors (byline / trust signal)

```sql
CREATE TABLE authors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  bio TEXT,
  credentials TEXT,                 -- e.g. "Former admissions reader, State University"
  avatar_url TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## Universities

```sql
CREATE TABLE universities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  country_id INT REFERENCES countries(id) NOT NULL,
  city TEXT,
  region TEXT,                      -- state/province
  institution_type TEXT,            -- 'public' | 'private'
  founded_year INT,
  website_url TEXT,

  -- Admissions
  acceptance_rate NUMERIC(5,2),
  required_tests TEXT[],            -- ['SAT','ACT'] / ['A-Levels'] etc.
  test_score_range TEXT,            -- free text, since ranges vary by test type
  gpa_requirement TEXT,
  required_documents TEXT[],        -- ['SOP','2 LORs','Portfolio']
  application_platform_id INT REFERENCES application_platforms(id),

  -- Cost
  tuition_in_state NUMERIC,
  tuition_out_state NUMERIC,
  tuition_international NUMERIC,
  est_cost_of_attendance NUMERIC,

  -- Academic
  popular_majors TEXT[],
  student_faculty_ratio TEXT,

  -- Narrative (the differentiator content — NOT auto-templated)
  distinctive_summary TEXT,         -- "what makes this school distinctive"
  international_student_notes TEXT,

  -- Trust / workflow
  status content_status DEFAULT 'draft',
  author_id UUID REFERENCES authors(id),
  reviewed_by_id UUID REFERENCES authors(id),
  last_verified_at DATE,
  source_urls TEXT[],               -- official sources used for fact-checking

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE university_degree_levels (   -- many-to-many
  university_id UUID REFERENCES universities(id) ON DELETE CASCADE,
  degree_level_id INT REFERENCES degree_levels(id),
  PRIMARY KEY (university_id, degree_level_id)
);
```

---

## Programs

Added in migration `0004_add_programs.sql`. Structured per-university degree
offerings — addresses the "course/subject" gap noted in PROJECT_STATUS.md
Section 12: `universities.popular_majors` is a loose text array, not real
program data. `field_of_study` is still free text, not a controlled
vocabulary (no `subjects` lookup table yet).

```sql
CREATE TABLE programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  university_id UUID REFERENCES universities(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,                -- 'Bachelor of Computer Science'
  degree_level_id INT REFERENCES degree_levels(id) NOT NULL,
  field_of_study TEXT,               -- free text, e.g. 'Computer Science'
  duration_years NUMERIC(3,1),
  tuition_international NUMERIC,     -- optional per-program override; falls
                                      -- back to universities.tuition_international

  status content_status DEFAULT 'draft',
  last_verified_at DATE,
  source_url TEXT,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

---

## Rankings

Structured, sourced, dated — enables trend display ("up 3 places since last year") and keeps every ranking claim citable, which matters for both reader trust and AI-answer-engine citation (see GEO notes).

```sql
CREATE TABLE ranking_bodies (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,        -- 'QS World University Rankings', 'Times Higher Education', 'US News'
  website_url TEXT
);

CREATE TABLE rankings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  university_id UUID REFERENCES universities(id) ON DELETE CASCADE NOT NULL,
  ranking_body_id INT REFERENCES ranking_bodies(id) NOT NULL,
  rank INT NOT NULL,
  category TEXT,                    -- 'Overall' | 'Engineering' | 'Business' etc., nullable
  year INT NOT NULL,
  source_url TEXT NOT NULL,

  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (university_id, ranking_body_id, category, year)
);

CREATE INDEX idx_rankings_university ON rankings(university_id);
```

---

## Deadlines

```sql
CREATE TABLE deadlines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  university_id UUID REFERENCES universities(id) ON DELETE CASCADE NOT NULL,
  degree_level_id INT REFERENCES degree_levels(id) NOT NULL,
  deadline_type_id INT REFERENCES deadline_types(id) NOT NULL,
  deadline_date DATE NOT NULL,
  application_platform_id INT REFERENCES application_platforms(id),
  notes TEXT,
  is_rolling BOOLEAN DEFAULT FALSE,

  -- Trust / workflow
  status content_status DEFAULT 'draft',
  last_verified_at DATE,
  source_url TEXT,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index for the calendar/filter views
CREATE INDEX idx_deadlines_date ON deadlines(deadline_date);
CREATE INDEX idx_deadlines_university ON deadlines(university_id);
```

---

## Scholarships

```sql
CREATE TABLE scholarships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  scope TEXT NOT NULL,              -- 'university-specific' | 'national' | 'external/foundation'
  amount TEXT,                      -- free text: often a range or "full tuition"
  eligibility TEXT,
  deadline_date DATE,
  country_id INT REFERENCES countries(id),  -- for national/external scholarships not tied to one school
  external_url TEXT,

  status content_status DEFAULT 'draft',
  last_verified_at DATE,
  source_url TEXT,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Many-to-many: a scholarship may apply to multiple universities (or none, if national/external)
CREATE TABLE scholarship_universities (
  scholarship_id UUID REFERENCES scholarships(id) ON DELETE CASCADE,
  university_id UUID REFERENCES universities(id) ON DELETE CASCADE,
  PRIMARY KEY (scholarship_id, university_id)
);
```

---

## Guides (evergreen / narrative content)

```sql
CREATE TABLE guides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL,           -- 'how-to' | 'comparison' | 'country-guide' | 'test-prep'
  country_id INT REFERENCES countries(id), -- nullable: some guides are country-agnostic
  content TEXT NOT NULL,            -- markdown body
  excerpt TEXT,
  word_count INT,

  author_id UUID REFERENCES authors(id),
  reviewed_by_id UUID REFERENCES authors(id),
  status content_status DEFAULT 'draft',
  last_verified_at DATE,
  source_urls TEXT[],

  -- QA checklist state (supports the "sound human" workflow)
  qa_facts_verified BOOLEAN DEFAULT FALSE,
  qa_sentence_variation_checked BOOLEAN DEFAULT FALSE,
  qa_firsthand_detail_added BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE guide_related_links (   -- manually curated internal linking
  guide_id UUID REFERENCES guides(id) ON DELETE CASCADE,
  related_guide_id UUID REFERENCES guides(id) ON DELETE CASCADE,
  related_university_id UUID REFERENCES universities(id) ON DELETE CASCADE,
  PRIMARY KEY (guide_id, related_guide_id, related_university_id)
);
```

---

## Activity log (for the Dashboard "recent activity" widget)

```sql
CREATE TABLE activity_log (
  id BIGSERIAL PRIMARY KEY,
  author_id UUID REFERENCES authors(id),
  entity_type TEXT NOT NULL,        -- 'university' | 'deadline' | 'guide' | 'scholarship'
  entity_id UUID NOT NULL,
  action TEXT NOT NULL,             -- 'created' | 'updated' | 'status_changed'
  detail TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## Row-Level Security (RLS) notes

- `authors` table drives role checks: `is_admin = true` for full write access; editors get scoped write access to `draft`/`needs_review` rows only, can't directly set `status = 'published'`.
- Public (anon) role: read-only access, and only to rows where `status = 'published'`.
- Webhooks: on `UPDATE` to `universities`, `deadlines`, or `guides` where `status = 'published'`, fire a Postgres webhook → Next.js ISR revalidation API route for the affected slug(s).

---

## Confirmed decisions

1. **Rankings**: dedicated `rankings` + `ranking_bodies` tables, supporting multiple ranking bodies and categories per university, sourced and dated per entry.
2. **Scholarships**: many-to-many via `scholarship_universities`, plus a `scope` field so national/external scholarships (not tied to any single school) are properly modeled — these are high-value content for both users and monetization (affiliate/lead-gen).
3. **Deletion**: soft-delete only, via `status = 'archived'`. Preserves URLs and any backlinks/citations; supports redirects or "this program has closed" notices instead of 404s.

## Still open

- **User accounts** (saved universities, deadline alerts, personalized dashboard) — raised as a stickiness feature; not yet modeled in this schema. Needs its own `users`, `saved_universities`, and `notification_preferences` tables if greenlit — recommend deciding scope before the initial build rather than retrofitting.
