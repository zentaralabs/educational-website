/**
 * Safe JSON-LD serialisation.
 *
 * `JSON.stringify` escapes nothing that matters to an HTML parser: it leaves
 * `<`, `>` and `&` as literal characters. Dropping its output straight into
 * `dangerouslySetInnerHTML` therefore means any string that reaches a schema
 * block — a university name, a guide title, an FAQ answer, all of which come
 * from the database — can close the script element with `</scr` + `ipt>` and
 * open a real one. That is a stored-XSS path from any account with write
 * access to content, and from anything that can write to the database.
 *
 * Escaping those three characters (plus the two Unicode line terminators that
 * are legal in JSON but illegal in a JavaScript string literal) closes it.
 * The escapes are ordinary JSON \uXXXX sequences, so consumers parse the
 * identical object back out — Google Rich Results included.
 */
const ESCAPES: Record<string, string> = {
  "<": "\\u003c",
  ">": "\\u003e",
  "&": "\\u0026",
  "\u2028": "\\u2028",
  "\u2029": "\\u2029",
};

export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(
    /[<>&\u2028\u2029]/g,
    (char) => ESCAPES[char],
  );
}

/**
 * Renders one schema.org block. Use this everywhere instead of hand-rolling
 * `<script type="application/ld+json" dangerouslySetInnerHTML=...>` so the
 * escaping above can never be forgotten on a new page.
 */
export function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  );
}
