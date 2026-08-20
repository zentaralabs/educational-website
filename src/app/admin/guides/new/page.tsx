import { listCountries } from "@/lib/queries/universities";
import { createClient } from "@/lib/supabase/server";
import { NewGuideForm } from "./NewGuideForm";

export default async function NewGuidePage() {
  const supabase = await createClient();
  const countries = await listCountries(supabase);

  return (
    <div className="p-8">
      <h1 className="mb-6 font-display text-2xl font-semibold text-ink">
        New guide
      </h1>
      <NewGuideForm countries={countries} />
    </div>
  );
}
