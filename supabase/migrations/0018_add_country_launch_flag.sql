-- Launch scope flag: the site is being brought up country-by-country,
-- starting with Australia (the only country with real program-level depth
-- today — see PROJECT_STATUS.md's 2026-08-27 country-sweep note). Every
-- public query/page filters on this so un-launched countries' content
-- stays in the DB (ready for its own fact-checking pass) without being
-- surfaced on the live site, sitemap, or search.
alter table countries add column if not exists is_launched boolean not null default false;

update countries set is_launched = true where code = 'AU';
