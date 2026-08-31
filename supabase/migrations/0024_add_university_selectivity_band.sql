-- Selectivity is now a hand-assigned editorial band, not a value derived from
-- acceptance_rate. The 2026-08-31 data-accuracy review found that every
-- Australian institution carried an acceptance_rate that was an unsourced
-- third-party estimate, and that peer institutions landed in different
-- qualitative bands purely from that estimate noise (e.g. UNSW "Selective"
-- vs Melbourne "Competitive"). Australian universities do not publish
-- US-style admission rates, so a percentage there is false precision.
--
-- selectivity_band: one of four tiers, assigned per institution by an editor
--   (see scripts/seed_university_selectivity.mjs) with a short rationale.
-- selectivity_note: that one-line rationale, shown on the profile page.
-- acceptance_rate is kept as an internal research field only and is no longer
--   rendered anywhere on the public site.

alter table universities
  add column selectivity_band text
    check (selectivity_band in (
      'highly-selective', 'selective', 'competitive', 'broadly-accessible'
    )),
  add column selectivity_note text;

comment on column universities.acceptance_rate is
  'Internal research note only. Not shown on the public site. Public selectivity comes from selectivity_band.';
comment on column universities.selectivity_band is
  'Hand-assigned editorial selectivity tier. See scripts/seed_university_selectivity.mjs.';
