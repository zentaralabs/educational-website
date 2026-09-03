-- A dated, sourced log of Australian policy changes that affect people
-- applying to study here: student-visa charges, Ministerial Directions,
-- post-study work rights, English-test recognition, PR settings, and
-- university-sector policy. Rendered at /updates and surfaced as a one-line
-- "latest update" strip on the homepage.
--
-- Generalises the invitation_rounds pattern (migration 0019): a structured
-- row, not a blog post. A change captured as "what changed / effective when /
-- who it affects / official source / last verified" is faster to publish,
-- faster for a visitor to scan for "does this affect me", and harder for an
-- AI answer to displace than a 300-word article.
--
-- SkillSelect round *numbers* stay in invitation_rounds; a structural change
-- to how rounds work can appear in both, linked via detail_url.

create table policy_updates (
  id uuid primary key default gen_random_uuid(),
  -- Doubles as the /updates#<slug> anchor and the idempotent upsert key.
  slug text unique not null,
  title text not null,                       -- 'Student visa application charge rises to A$2,000'
  category text not null check (category in (
    'student-visa',
    'post-study-work',
    'fees-and-charges',
    'english-language',
    'pr-pathway',
    'university-sector',
    'other'
  )),
  -- Drives ordering. When the change was announced / published.
  announced_date date not null,
  -- When it takes effect. Null = already in effect, or no dated start yet.
  effective_date date,
  summary text not null,                      -- 1-3 plain sentences: what changed
  impact text,                               -- optional: what an applicant should do about it
  affects text[],                            -- audience chips: '{"Student visa applicants","Nepal & India"}'
  -- Optional internal link to a blog post or guide carrying the fuller analysis.
  detail_url text,
  source_urls text[] not null,               -- official primary sources, at least one
  -- Announced-but-not-in-force, or an expected change we are flagging early.
  -- Same relaxed-bar convention as invitation_rounds.is_estimated.
  is_estimated boolean default false,

  status content_status default 'draft',
  last_verified_at date,

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_policy_updates_announced on policy_updates(announced_date desc);

create trigger set_updated_at before update on policy_updates
  for each row execute function set_updated_at();

-- RLS — identical shape to invitation_rounds / guides / blog_posts.
alter table policy_updates enable row level security;

create policy "public read published" on policy_updates for select using (status = 'published');
create policy "staff read all" on policy_updates for select using (is_staff());
create policy "admin write" on policy_updates for all using (is_staff_admin()) with check (is_staff_admin());
create policy "editor insert draft" on policy_updates for insert
  with check (is_staff() and status in ('draft', 'needs_review'));
create policy "editor update draft" on policy_updates for update
  using (is_staff() and status in ('draft', 'needs_review'))
  with check (is_staff() and status in ('draft', 'needs_review'));
