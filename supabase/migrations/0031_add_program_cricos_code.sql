-- CRICOS course code on programs.
--
-- Context: the programs table was originally a one-off AI bulk import that
-- only ever covered a thin, uneven slice of each university's catalogue
-- (most universities sat at 8-14 programs; a real catalogue is 200-600).
-- The fix is a proper importer seeded from the Commonwealth Register of
-- Institutions and Courses for Overseas Students (CRICOS), the authoritative
-- national list of every course an international student can enrol in, per
-- provider (published monthly as open data on data.gov.au).
--
-- `cricos_code` is that course's CRICOS code (e.g. '079238M'). It is the
-- stable identifier we reconcile the register against on each refresh, and
-- it lets a program page link to the official CRICOS listing. Nullable:
-- pre-existing hand-written rows and non-CRICOS pathway rows have none.
--
-- Idempotent.

alter table programs add column if not exists cricos_code text;

create index if not exists idx_programs_cricos_code on programs (cricos_code)
  where cricos_code is not null;
