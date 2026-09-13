-- First-hand "what we found" content for a visa page, editor-written from
-- approved experience_submissions rows (migration 0035) or the editor's own
-- verified portal observations. Deliberately separate from `content` (the
-- official-source explainer): this is the FieldNotes block
-- (src/components/site/FieldNotes.tsx) and must never be confused with, or
-- overwrite, the fact-checked reference content.
alter table visa_subclasses add column field_notes text;
alter table visa_subclasses add column field_notes_observed_at date;
