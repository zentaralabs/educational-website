-- Structured visa streams for the redesigned /visas/[slug] layout.
--
-- `stream` (text) stays as the short human label used in listings and the
-- hero eyebrow. `streams` holds the per-stream cards shown in the sidebar:
-- an array of { name, description, duration } objects. Nullable — most
-- subclasses have a single stream and leave it null, and the template hides
-- the block when it is absent.

alter table visa_subclasses
  add column if not exists streams jsonb;

comment on column visa_subclasses.streams is
  'Array of { name, description, duration } stream cards. Null for single-stream visas.';
