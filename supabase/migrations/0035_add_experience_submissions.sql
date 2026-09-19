-- Reader-submitted first-hand experience (portal screenshots described in
-- text, "what surprised us" notes, rough timelines) — the raw intake behind
-- the FieldNotes component (src/components/site/FieldNotes.tsx). Closes the
-- "zero first-hand Experience signals" E-E-A-T gap flagged 2026-09-13: the
-- site has no genuine applicant-walkthrough content and no way to collect
-- it, since every other content type on this site is written top-down by
-- the editorial team rather than submitted by readers.
--
-- Deliberately NOT public-readable and NOT auto-published. A submission is
-- one person's unverified account — publishing it straight to a live page
-- would break the site's entire "every fact checked by a human" premise
-- (see /about, /editorial-policy). An editor reviews each one here, then
-- hand-writes the FieldNotes copy on the target page from what holds up,
-- the same "AI/reader draft in, human rewrite out" pattern used for guides.
create table experience_submissions (
  id uuid primary key default gen_random_uuid(),

  -- Which live page this is about, e.g. '/visas/student-500'. Free text
  -- rather than an FK: submissions should work from any content page
  -- (a visa, a guide, a university), not just visa_subclasses rows.
  page_path text not null,
  page_label text,                          -- 'Subclass 500 student visa' — for the admin list

  is_anonymous boolean not null default true,
  contributor_name text,                    -- only used/shown if is_anonymous = false
  contact_email text,                       -- for editor follow-up only, never published

  portal_step text,                         -- 'CoE upload', 'Biometrics booking', ...
  surprised_notes text not null,            -- the core "what surprised us" account
  timeline_notes text,                      -- optional rough dates, in their own words

  consent boolean not null default false,   -- must be explicitly checked to submit

  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  admin_notes text,                         -- editor's own notes, e.g. why rejected

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_experience_submissions_status on experience_submissions(status, created_at);

create trigger set_updated_at before update on experience_submissions
  for each row execute function set_updated_at();

alter table experience_submissions enable row level security;

-- Anyone can submit, but only a genuinely consented, pending row — never
-- self-approve, never post as someone else's already-reviewed submission.
create policy "public submit" on experience_submissions for insert
  with check (consent = true and status = 'pending');

create policy "staff read all" on experience_submissions for select using (is_staff());
create policy "admin write" on experience_submissions for update using (is_staff_admin()) with check (is_staff_admin());
create policy "admin delete" on experience_submissions for delete using (is_staff_admin());
