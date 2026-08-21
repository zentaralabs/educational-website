-- Lets an archived university's old slug redirect to its replacement (e.g.
-- the Adelaide University / UniSA merger) instead of 404ing. Kept as its own
-- small table rather than a self-referencing column on `universities`,
-- because the redirect needs to be publicly readable even though the old
-- university row itself is archived (and archived rows aren't visible to
-- the public RLS policy) — a tiny standalone mapping table sidesteps that
-- without loosening RLS on the main table.

create table university_redirects (
  old_slug text primary key,
  new_slug text not null,
  created_at timestamptz default now()
);

comment on table university_redirects is
  'Old university slug -> current slug, for when two schools merge or one is renamed. The old university row stays archived (not deleted) for history; the public site redirects instead of 404ing.';

alter table university_redirects enable row level security;

create policy "public read" on university_redirects for select using (true);
create policy "admin write" on university_redirects for all using (is_staff_admin()) with check (is_staff_admin());
