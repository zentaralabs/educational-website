-- Blog posts — timely posts (policy/deadline changes), separate from the
-- evergreen `guides` table per the site structure in PROJECT_STATUS.md
-- Section 4 (/blog/ was always scoped, just never built). Kept as its own
-- table rather than a `guides.category = 'blog'` value: blog posts are
-- chronological/dated (need a real `published_at` for ordering) while
-- guides are evergreen reference content — mixing them would force every
-- guides list/filter view to branch on category to know whether a date or
-- the QA checklist even applies.

create table blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  content text not null,            -- markdown body
  excerpt text,
  tags text[],
  word_count int,

  author_id uuid references authors(id),
  reviewed_by_id uuid references authors(id),
  status content_status default 'draft',
  published_at timestamptz,         -- set on publish; drives chronological ordering
  last_verified_at date,            -- still useful: policy/deadline posts can go stale
  source_urls text[],

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_blog_posts_published_at on blog_posts(published_at desc);

create trigger set_updated_at before update on blog_posts
  for each row execute function set_updated_at();

-- RLS — identical shape to guides/deadlines/scholarships/programs.

alter table blog_posts enable row level security;

create policy "public read published" on blog_posts for select using (status = 'published');
create policy "staff read all" on blog_posts for select using (is_staff());
create policy "admin write" on blog_posts for all using (is_staff_admin()) with check (is_staff_admin());

create policy "editor insert draft" on blog_posts for insert
  with check (is_staff() and status in ('draft', 'needs_review'));
create policy "editor update draft" on blog_posts for update
  using (is_staff() and status in ('draft', 'needs_review'))
  with check (is_staff() and status in ('draft', 'needs_review'));
