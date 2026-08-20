import { notFound } from "next/navigation";
import { listProgramsForUniversity } from "@/lib/queries/programs";
import { getUniversity, listCountries } from "@/lib/queries/universities";
import { listSubjects } from "@/lib/queries/vocab";
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

  const [university, countries, degreeLevels, programs, subjects] = await Promise.all([
    getUniversity(supabase, id),
    listCountries(supabase),
    supabase.from("degree_levels").select("id, name").order("id"),
    listProgramsForUniversity(supabase, id),
    listSubjects(supabase),
  ]);

  if (!university) notFound();

  return (
    <div className="p-8">
      <UniversityEditForm
        university={university}
        countries={countries}
        degreeLevels={degreeLevels.data ?? []}
        programs={programs}
        subjects={subjects}
      />
    </div>
  );
}
