-- Homepage email capture for deadline/visa-fee alerts. The site had zero
-- lead-capture surface on the homepage (flagged 2026-09-18) — this is just
-- the storage for it. Nothing currently sends the alerts described in the
-- signup copy; that's a separate, unbuilt sending pipeline (no ESP/mailer
-- is wired up anywhere in this codebase yet). Don't point the signup copy
-- at anything more specific than "we'll email you" until that exists.
create table email_subscribers (
  id uuid primary key default gen_random_uuid(),

  email text not null,             -- always stored lowercase/trimmed by the caller
  source text not null default 'homepage', -- where they signed up, for later segmentation

  created_at timestamptz default now()
);

create unique index idx_email_subscribers_email on email_subscribers(email);

alter table email_subscribers enable row level security;

-- Anyone can add their own email. Re-submitting the same address is a
-- silent no-op (see subscribeEmail's upsert/ignoreDuplicates), not an
-- error — resubmission shouldn't leak "you're already on the list."
create policy "public submit" on email_subscribers for insert
  with check (true);

create policy "staff read all" on email_subscribers for select using (is_staff());
create policy "admin delete" on email_subscribers for delete using (is_staff_admin());
