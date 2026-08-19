import { notFound } from "next/navigation";
import { getUniversity, listCountries } from "@/lib/queries/universities";
import { createClient } from "@/lib/supabase/server";
import { UniversityEditForm } from "./UniversityEditForm";

export const dynamic = "force-dynamic";

export default async function UniversityDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [university, countries] = await Promise.all([
    getUniversity(supabase, id),
    listCountries(supabase),
  ]);

  if (!university) notFound();

  return (
    <div className="p-8">
      <UniversityEditForm university={university} countries={countries} />
    </div>
  );
}
