-- Editorial value-add fields for university profiles, per the 2026-08-27
-- product review: profiles were "primarily a collection of facts" and needed
-- consistent original analysis (who a school suits, how to apply, an honest
-- first-year budget) that a university's own site doesn't provide.
--
-- All nullable. The public page degrades gracefully (section omitted, or a
-- generic AU-wide fallback for how_to_apply / living_cost_annual) when a
-- field is blank, same pattern as academic_requirement_domestic etc.

alter table universities
  add column who_is_it_for text,            -- markdown: "who should consider this university"
  add column how_to_apply text,             -- markdown steps; null falls back to a generic AU flow
  add column living_cost_annual numeric;    -- est. annual student living cost for this city (AUD);
                                            -- null falls back to the national indicative figure
