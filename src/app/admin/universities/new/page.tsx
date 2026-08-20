import { listCountries } from "@/lib/queries/universities";
import { createClient } from "@/lib/supabase/server";
import { NewUniversityForm } from "./NewUniversityForm";

export default async function NewUniversityPage() {
  const supabase = await createClient();
  const countries = await listCountries(supabase);

  return (
    <div className="p-8">
      <h1 className="mb-6 font-display text-2xl font-semibold text-ink">
        New university
      </h1>
      <NewUniversityForm countries={countries} />
    </div>
  );
}
