import pg from "pg";
import fs from "fs";

// List the empty-description published programs for one university, as a JSON
// worklist for the description-writing pass. Usage:
//   node scripts/program_descriptions_pull.mjs "Bond University"

const env = Object.fromEntries(
  fs.readFileSync(".env.local", "utf8").split("\n").filter((l) => l.includes("="))
    .map((l) => { const i = l.indexOf("="); return [l.slice(0, i), l.slice(i + 1)]; }),
);

const uni = process.argv[2];
if (!uni) { console.error("pass a university name"); process.exit(1); }

const c = new pg.Client({ connectionString: env.DATABASE_URL });
await c.connect();
const { rows } = await c.query(
  `select p.id, p.name, dl.name as degree_level, s.name as subject,
     p.duration_years, p.tuition_international, p.currency,
     p.ielts_overall, p.admission_requirements, p.application_url, p.source_url
   from programs p
   join universities u on u.id = p.university_id
   left join degree_levels dl on dl.id = p.degree_level_id
   left join subjects s on s.id = p.subject_id
   where u.name = $1 and p.status = 'published'
     and (p.description is null or trim(p.description) = '')
   order by dl.name, p.name`,
  [uni],
);
fs.writeFileSync(
  `scripts/data/_worklist_${uni.replace(/\W+/g, "_")}.json`,
  JSON.stringify(rows, null, 2) + "\n",
);
console.log(`${rows.length} programs -> scripts/data/_worklist_${uni.replace(/\W+/g, "_")}.json`);
await c.end();
