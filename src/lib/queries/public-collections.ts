import { createPublicClient } from "@/lib/supabase/public";

const NATIONAL_LIVING_COST_AUD = 29_710;

export type CollectionUniversity = {
  slug: string;
  name: string;
  city: string | null;
  institution_type: string | null;
  living_cost_annual: number | null;
  who_is_it_for: string | null;
  /** Cheapest international tuition: university-level or the lowest published program. */
  minTuition: number | null;
  /** Estimated first-year budget low end (tuition + living + ~4k setup), rounded. */
  firstYearBudget: number | null;
  /** Distinct intake month names across the university and its programs. */
  intakes: string[];
  /** Slugs of published scholarships linked to this university that need no separate application. */
  automaticScholarships: { slug: string; name: string; amount: string | null }[];
  acceptanceRate: number | null;
  applicationFee: number | null;
  ieltsOverall: number | null;
};

type UniRow = {
  slug: string;
  name: string;
  city: string | null;
  institution_type: string | null;
  living_cost_annual: number | null;
  tuition_international: number | null;
  intake_dates: string | null;
  who_is_it_for: string | null;
  acceptance_rate: number | string | null;
  application_fee: number | string | null;
  ielts_overall: number | string | null;
};

type ProgRow = {
  tuition_international: number | null;
  intake_dates: string | null;
  university: { slug: string } | null;
};

type SchRow = {
  university: { slug: string; status: string } | null;
  scholarship: {
    slug: string | null;
    name: string;
    amount: string | null;
    status: string;
    separate_application: boolean | null;
  } | null;
};

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function parseMonths(text: string | null): string[] {
  if (!text) return [];
  return MONTHS.filter((m) => text.includes(m));
}

export async function listCollectionUniversities(): Promise<CollectionUniversity[]> {
  const supabase = createPublicClient([
    "universities:list",
    "programs:list",
    "scholarships:list",
  ]);

  const [unis, progs, schols] = await Promise.all([
    supabase
      .from("universities")
      .select(
        "slug, name, city, institution_type, living_cost_annual, tuition_international, intake_dates, who_is_it_for, acceptance_rate, application_fee, ielts_overall, country:countries!inner(is_launched)",
      )
      .eq("status", "published")
      .eq("country.is_launched", true),
    supabase
      .from("programs")
      .select(
        "tuition_international, intake_dates, university:universities!inner(slug, status, country:countries!inner(is_launched))",
      )
      .eq("status", "published")
      .eq("university.status", "published")
      .eq("university.country.is_launched", true),
    supabase
      .from("scholarship_universities")
      .select(
        "university:universities!inner(slug, status), scholarship:scholarships!inner(slug, name, amount, status, separate_application)",
      ),
  ]);

  if (unis.error) throw unis.error;
  if (progs.error) throw progs.error;
  if (schols.error) throw schols.error;

  const uniRows = (unis.data ?? []) as unknown as UniRow[];
  const progRows = (progs.data ?? []) as unknown as ProgRow[];
  const schRows = (schols.data ?? []) as unknown as SchRow[];

  const progsBySlug = new Map<string, ProgRow[]>();
  for (const p of progRows) {
    const slug = p.university?.slug;
    if (!slug) continue;
    const list = progsBySlug.get(slug) ?? [];
    list.push(p);
    progsBySlug.set(slug, list);
  }

  const autoSchBySlug = new Map<
    string,
    { slug: string; name: string; amount: string | null }[]
  >();
  for (const s of schRows) {
    if (s.university?.status !== "published") continue;
    if (!s.scholarship || s.scholarship.status !== "published") continue;
    if (s.scholarship.separate_application !== false) continue;
    if (!s.scholarship.slug) continue;
    const slug = s.university.slug;
    const list = autoSchBySlug.get(slug) ?? [];
    list.push({
      slug: s.scholarship.slug,
      name: s.scholarship.name,
      amount: s.scholarship.amount,
    });
    autoSchBySlug.set(slug, list);
  }

  return uniRows
    .map((u) => {
      const uniProgs = progsBySlug.get(u.slug) ?? [];
      const progTuitions = uniProgs
        .map((p) => p.tuition_international)
        .filter((n): n is number => typeof n === "number" && n > 0);
      const minTuition =
        u.tuition_international ??
        (progTuitions.length ? Math.min(...progTuitions) : null);

      const living = u.living_cost_annual ?? NATIONAL_LIVING_COST_AUD;
      const firstYearBudget = minTuition
        ? Math.round((minTuition + living + 4000) / 1000) * 1000
        : null;

      const intakes = new Set<string>(parseMonths(u.intake_dates));
      for (const p of uniProgs) for (const m of parseMonths(p.intake_dates)) intakes.add(m);

      return {
        slug: u.slug,
        name: u.name,
        city: u.city,
        institution_type: u.institution_type,
        living_cost_annual: u.living_cost_annual,
        who_is_it_for: u.who_is_it_for,
        minTuition,
        firstYearBudget,
        intakes: MONTHS.filter((m) => intakes.has(m)),
        automaticScholarships: autoSchBySlug.get(u.slug) ?? [],
        acceptanceRate:
          u.acceptance_rate == null ? null : Number(u.acceptance_rate),
        applicationFee:
          u.application_fee == null ? null : Number(u.application_fee),
        ieltsOverall:
          u.ielts_overall == null ? null : Number(u.ielts_overall),
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}
