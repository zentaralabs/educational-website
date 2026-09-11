-- Let the anon (public) client read archived programs, not just published
-- ones. The program detail route now renders a "no longer offered" page for
-- an archived program instead of a 404 (see getArchivedProgramBySlug), which
-- needs to actually read the row. Archived course data is not sensitive, and
-- every other public query filters status = 'published' explicitly, so this
-- only widens what the one archived-by-slug lookup can see.

create policy "public read archived" on programs
  for select using (status = 'archived');
