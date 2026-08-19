-- Row-Level Security
-- Roles (per PROJECT_STATUS.md Section 6 / database-schema.md):
--   is_admin = true  -> full access, can publish
--   editor           -> scoped write to draft/needs_review, cannot set status = 'published'
--   anon (public)    -> read-only, only rows where status = 'published'
--
-- authors.id is expected to equal auth.uid() for staff accounts (see 0001 comment),
-- so role checks join authors on auth.uid() rather than needing a separate mapping table.

create or replace function is_staff_admin()
returns boolean as $$
  select coalesce(
    (select is_admin from authors where id = auth.uid()),
    false
  );
$$ language sql stable security definer set search_path = public;

create or replace function is_staff()
returns boolean as $$
  select exists (select 1 from authors where id = auth.uid());
$$ language sql stable security definer set search_path = public;

-- Lookup/vocabulary tables: public read, admin-only write.
alter table countries enable row level security;
alter table degree_levels enable row level security;
alter table application_platforms enable row level security;
alter table deadline_types enable row level security;
alter table ranking_bodies enable row level security;

create policy "lookups readable by everyone" on countries for select using (true);
create policy "lookups readable by everyone" on degree_levels for select using (true);
create policy "lookups readable by everyone" on application_platforms for select using (true);
create policy "lookups readable by everyone" on deadline_types for select using (true);
create policy "lookups readable by everyone" on ranking_bodies for select using (true);

create policy "lookups writable by admin" on countries for all
  using (is_staff_admin()) with check (is_staff_admin());
create policy "lookups writable by admin" on degree_levels for all
  using (is_staff_admin()) with check (is_staff_admin());
create policy "lookups writable by admin" on application_platforms for all
  using (is_staff_admin()) with check (is_staff_admin());
create policy "lookups writable by admin" on deadline_types for all
  using (is_staff_admin()) with check (is_staff_admin());
create policy "lookups writable by admin" on ranking_bodies for all
  using (is_staff_admin()) with check (is_staff_admin());

-- authors: public read (bylines), self or admin write.
alter table authors enable row level security;

create policy "authors readable by everyone" on authors for select using (true);
create policy "authors self-update" on authors for update
  using (id = auth.uid() or is_staff_admin())
  with check (id = auth.uid() or is_staff_admin());
create policy "authors insert by admin" on authors for insert
  with check (is_staff_admin());
create policy "authors delete by admin" on authors for delete
  using (is_staff_admin());

-- Content tables: public can read only published rows; editors can write
-- draft/needs_review rows but not set status = 'published'; admins have full access.
-- Applies to: universities, deadlines, scholarships, guides, rankings.

alter table universities enable row level security;
alter table deadlines enable row level security;
alter table scholarships enable row level security;
alter table guides enable row level security;
alter table rankings enable row level security;
alter table university_degree_levels enable row level security;
alter table scholarship_universities enable row level security;
alter table guide_related_links enable row level security;
alter table activity_log enable row level security;

-- Public read: published only
create policy "public read published" on universities for select using (status = 'published');
create policy "public read published" on deadlines for select using (status = 'published');
create policy "public read published" on scholarships for select using (status = 'published');
create policy "public read published" on guides for select using (status = 'published');

-- Staff read: everything (needed for admin panel, incl. drafts/review queue)
create policy "staff read all" on universities for select using (is_staff());
create policy "staff read all" on deadlines for select using (is_staff());
create policy "staff read all" on scholarships for select using (is_staff());
create policy "staff read all" on guides for select using (is_staff());

-- Admin: full write access
create policy "admin write" on universities for all using (is_staff_admin()) with check (is_staff_admin());
create policy "admin write" on deadlines for all using (is_staff_admin()) with check (is_staff_admin());
create policy "admin write" on scholarships for all using (is_staff_admin()) with check (is_staff_admin());
create policy "admin write" on guides for all using (is_staff_admin()) with check (is_staff_admin());

-- Editor: insert/update rows that are draft or needs_review only (no publishing)
create policy "editor insert draft" on universities for insert
  with check (is_staff() and status in ('draft', 'needs_review'));
create policy "editor update draft" on universities for update
  using (is_staff() and status in ('draft', 'needs_review'))
  with check (is_staff() and status in ('draft', 'needs_review'));

create policy "editor insert draft" on deadlines for insert
  with check (is_staff() and status in ('draft', 'needs_review'));
create policy "editor update draft" on deadlines for update
  using (is_staff() and status in ('draft', 'needs_review'))
  with check (is_staff() and status in ('draft', 'needs_review'));

create policy "editor insert draft" on scholarships for insert
  with check (is_staff() and status in ('draft', 'needs_review'));
create policy "editor update draft" on scholarships for update
  using (is_staff() and status in ('draft', 'needs_review'))
  with check (is_staff() and status in ('draft', 'needs_review'));

create policy "editor insert draft" on guides for insert
  with check (is_staff() and status in ('draft', 'needs_review'));
create policy "editor update draft" on guides for update
  using (is_staff() and status in ('draft', 'needs_review'))
  with check (is_staff() and status in ('draft', 'needs_review'));

-- Rankings: no status field of its own — gated by staff/admin only (public reads
-- rankings joined through a published university at the query layer).
create policy "staff read rankings" on rankings for select using (is_staff());
create policy "public read rankings" on rankings for select using (true);
create policy "admin write rankings" on rankings for all using (is_staff_admin()) with check (is_staff_admin());

-- Join tables: readable by everyone (facts, no sensitive data), writable by staff.
create policy "public read" on university_degree_levels for select using (true);
create policy "staff write" on university_degree_levels for all using (is_staff()) with check (is_staff());

create policy "public read" on scholarship_universities for select using (true);
create policy "staff write" on scholarship_universities for all using (is_staff()) with check (is_staff());

create policy "public read" on guide_related_links for select using (true);
create policy "staff write" on guide_related_links for all using (is_staff()) with check (is_staff());

-- Activity log: staff-only, insert by any staff member, no public access.
create policy "staff read activity" on activity_log for select using (is_staff());
create policy "staff insert activity" on activity_log for insert with check (is_staff());
