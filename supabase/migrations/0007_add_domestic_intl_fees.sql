-- Domestic/international fee split + per-program application links.
--
-- Countries beyond the US (UK, Canada, Australia) price tuition as
-- "domestic" vs "international" rather than in-state/out-of-state, and
-- programs.tuition_international was the only fee column that existed —
-- there was no domestic figure and no way to link straight to a program's
-- application page. This is additive; existing rows are untouched (new
-- columns default to null except currency, which defaults to the 'USD'
-- assumption every existing row was already priced in).

alter table universities add column tuition_domestic numeric;
alter table universities add column currency text not null default 'USD';
alter table universities add column apply_url text;

alter table programs add column tuition_domestic numeric;
alter table programs add column currency text;
alter table programs add column application_url text;

comment on column universities.currency is
  'ISO 4217 code the tuition_* columns on this row are priced in, e.g. AUD, GBP, CAD, USD.';
comment on column universities.tuition_domestic is
  'Domestic-student tuition (home-country rate) — the AU/UK/CA analogue of tuition_in_state.';
comment on column universities.apply_url is
  'Direct link to the university''s application portal (fallback when a program has no application_url of its own).';

comment on column programs.tuition_domestic is
  'Optional per-program override for domestic-student tuition; falls back to universities.tuition_domestic when null.';
comment on column programs.currency is
  'Optional per-program override; falls back to universities.currency when null.';
comment on column programs.application_url is
  'Direct link to apply for this specific program; falls back to universities.apply_url when null.';
