import { notFound } from "next/navigation";
import { getVisaSubclass } from "@/lib/queries/visas";
import { createClient } from "@/lib/supabase/server";
import { VisaEditor } from "./VisaEditor";

export const dynamic = "force-dynamic";

export default async function VisaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const visa = await getVisaSubclass(supabase, id);
  if (!visa) notFound();

  return (
    <div className="p-8">
      <VisaEditor visa={visa} />
    </div>
  );
}
