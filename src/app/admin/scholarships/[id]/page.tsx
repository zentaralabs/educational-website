import { notFound } from "next/navigation";
import { getScholarship } from "@/lib/queries/scholarships";
import { listUniversities } from "@/lib/queries/universities";
import { createClient } from "@/lib/supabase/server";
import { ScholarshipEditForm } from "./ScholarshipEditForm";

export const dynamic = "force-dynamic";

export default async function ScholarshipDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [scholarship, universities] = await Promise.all([
    getScholarship(supabase, id),
    listUniversities(supabase),
  ]);

  if (!scholarship) notFound();

  return (
    <div className="p-8">
      <ScholarshipEditForm scholarship={scholarship} universities={universities} />
    </div>
  );
}
