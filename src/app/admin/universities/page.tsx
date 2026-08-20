import Link from "next/link";
import { listCountries, listUniversities } from "@/lib/queries/universities";
import { createClient } from "@/lib/supabase/server";
import { UniversitiesTable } from "./UniversitiesTable";

export const dynamic = "force-dynamic";

export default async function UniversitiesPage() {
  const supabase = await createClient();
  const [universities, countries] = await Promise.all([
    listUniversities(supabase),
    listCountries(supabase),
  ]);

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold text-ink">
          Universities
        </h1>
        <Link
          href="/admin/universities/new"
          className="rounded-md bg-ink px-3 py-1.5 font-body text-sm font-medium text-paper transition-opacity duration-150 hover:opacity-90"
        >
          New university
        </Link>
      </div>

      <UniversitiesTable
        initialUniversities={universities}
        countries={countries}
      />
    </div>
  );
}
