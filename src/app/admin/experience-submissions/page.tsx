import { listExperienceSubmissions } from "@/lib/queries/experience-submissions";
import { createClient } from "@/lib/supabase/server";
import { ExperienceSubmissionsTable } from "./ExperienceSubmissionsTable";

export const dynamic = "force-dynamic";

export default async function ExperienceSubmissionsPage() {
  const supabase = await createClient();
  const items = await listExperienceSubmissions(supabase);

  return (
    <div className="p-8">
      <h1 className="mb-1 font-display text-2xl font-semibold text-ink">
        Experience submissions
      </h1>
      <p className="mb-6 font-body text-sm text-slate">
        Reader-submitted first-hand accounts. Nothing here is published
        automatically — approve the ones that hold up, then hand-write the
        FieldNotes copy on the relevant page from what&rsquo;s approved.
      </p>
      <ExperienceSubmissionsTable items={items} />
    </div>
  );
}
