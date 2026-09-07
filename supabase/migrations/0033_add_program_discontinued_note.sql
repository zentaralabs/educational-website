-- Optional editor note shown on the "no longer offered" page that an archived
-- program now renders instead of a 404 (see the program detail route). Used
-- for the handful of discontinued courses whose successor is unambiguous
-- (e.g. a graduate certificate folded into a master's); left null otherwise,
-- and the page falls back to same-subject alternatives.

alter table programs add column if not exists discontinued_note text;
