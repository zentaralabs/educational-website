// Mirror of src/lib/slug.ts for use in seed/build scripts (which can't import
// the TS app source). Keep the two in step.
export function slugify(text) {
  return String(text)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
