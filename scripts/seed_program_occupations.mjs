import pg from "pg";
import fs from "fs";

const env = Object.fromEntries(
  fs
    .readFileSync(".env.local", "utf8")
    .split("\n")
    .filter((l) => l.includes("="))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i), l.slice(i + 1)];
    }),
);

/**
 * Curated subject -> occupation mapping. Keyed by `subjects.slug`.
 * `primary` gets relevance='primary' (the 1-2 clearest outcomes for that
 * field), everything in `related` gets relevance='related'.
 *
 * Subjects deliberately absent (zero occupations) because SUBJECT_CONTENT
 * (src/lib/subjects.ts) itself says the field maps weakly or not at all onto
 * the skilled lists: communications-and-media, political-science-and-
 * international-relations, music-and-performing-arts, biology-and-life-
 * sciences. Forcing a match there would make the data less trustworthy, not
 * more.
 */
const subjectOccupations = {
  "computer-science": {
    primary: ["261313", "261312"],
    related: ["261111", "261112", "262112", "261315", "263111", "224115"],
  },
  "information-technology": {
    primary: ["261312", "261111"],
    related: ["261313", "261112", "262112", "263111", "262111", "262113"],
  },
  "data-science": {
    primary: ["224115", "224114"],
    related: ["224113", "261111"],
  },
  business: {
    primary: ["221111", "221113"],
    related: ["221112", "221213", "221214", "221211"],
  },
  "nursing-and-health-sciences": {
    primary: ["254412", "254418"],
    related: ["254422", "254414", "254411", "254111", "252511", "252411", "251111"],
  },
  psychology: {
    primary: ["272311"],
    related: ["272312", "272313"],
  },
  law: {
    primary: ["271311"],
    related: ["271111"],
  },
  education: {
    primary: ["241411", "241111"],
    related: ["241213", "241511"],
  },
  "arts-and-design": {
    primary: ["232411"],
    related: ["232312", "232414"],
  },
  architecture: {
    primary: ["232111"],
    related: ["232112"],
  },
  engineering: {
    primary: ["233211", "233512"],
    related: ["233311", "233411", "233111", "233214", "233915", "233611", "233913", "233912"],
  },
  agriculture: {
    primary: ["234112"],
    related: ["234111", "234711", "233912"],
  },
  "environmental-science": {
    primary: ["234312"],
    related: ["234313", "233915"],
  },
  "hospitality-and-tourism": {
    primary: ["141311"],
    related: ["141111"],
  },
  mathematics: {
    primary: ["224113"],
    related: ["224115"],
  },
  physics: {
    primary: ["234914"],
    related: [],
  },
  economics: {
    primary: ["224311"],
    related: [],
  },
};

const client = new pg.Client({
  connectionString: env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

try {
  await client.connect();

  const subjectRows = await client.query("select id, slug from subjects");
  const subjectIdBySlug = Object.fromEntries(subjectRows.rows.map((r) => [r.slug, r.id]));

  const occRows = await client.query("select id, anzsco_code from occupations");
  const occIdByCode = Object.fromEntries(occRows.rows.map((r) => [r.anzsco_code, r.id]));

  let linksCreated = 0;
  let linksSkipped = 0;
  const zeroMatchSubjects = [];

  for (const [subjectSlug, mapping] of Object.entries(subjectOccupations)) {
    const subjectId = subjectIdBySlug[subjectSlug];
    if (!subjectId) {
      console.log("WARN: no subject found for slug", subjectSlug);
      continue;
    }

    const programsRes = await client.query(
      "select id from programs where subject_id = $1 and status = 'published'",
      [subjectId],
    );
    const programIds = programsRes.rows.map((r) => r.id);

    if (programIds.length === 0) {
      console.log(`subject ${subjectSlug}: no published programs, skipping`);
      continue;
    }

    const entries = [
      ...mapping.primary.map((code) => ({ code, relevance: "primary" })),
      ...mapping.related.map((code) => ({ code, relevance: "related" })),
    ];

    if (entries.length === 0) {
      zeroMatchSubjects.push(subjectSlug);
      continue;
    }

    let subjectLinks = 0;
    for (const programId of programIds) {
      for (const { code, relevance } of entries) {
        const occupationId = occIdByCode[code];
        if (!occupationId) {
          console.log("WARN: no occupation found for anzsco_code", code);
          continue;
        }
        const res = await client.query(
          `insert into program_occupations (program_id, occupation_id, relevance)
           values ($1, $2, $3)
           on conflict (program_id, occupation_id) do nothing
           returning id`,
          [programId, occupationId, relevance],
        );
        if (res.rows.length > 0) {
          linksCreated += 1;
          subjectLinks += 1;
        } else {
          linksSkipped += 1;
        }
      }
    }
    console.log(`subject ${subjectSlug}: ${programIds.length} programs, ${subjectLinks} links created`);
  }

  console.log(`done. linksCreated=${linksCreated} linksSkipped(existing)=${linksSkipped}`);
  console.log("subjects with zero occupation mapping:", zeroMatchSubjects.join(", ") || "none");
} catch (e) {
  console.error("ERR", e.message);
  process.exit(1);
} finally {
  await client.end();
}
