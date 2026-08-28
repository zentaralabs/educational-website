/** Rough reading time in whole minutes. ~225 wpm, floored at 1. */
export function readingMinutes(markdown: string): number {
  const words = markdown.trim().split(/\s+/).filter(Boolean).length;
  return readingMinutesFromWords(words);
}

/** Same, from a stored word count (e.g. blog_posts.word_count). */
export function readingMinutesFromWords(count: number | null | undefined): number {
  return Math.max(1, Math.round((count ?? 0) / 225));
}
