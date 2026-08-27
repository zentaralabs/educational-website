import { notFound } from "next/navigation";
import { getInvitationRound, listVisaSubclasses } from "@/lib/queries/visas";
import { createClient } from "@/lib/supabase/server";
import { RoundEditor } from "./RoundEditor";

export const dynamic = "force-dynamic";

export default async function RoundDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const [round, visas] = await Promise.all([
    getInvitationRound(supabase, id),
    listVisaSubclasses(supabase),
  ]);
  if (!round) notFound();

  return (
    <div className="p-8">
      <RoundEditor
        round={round}
        visaOptions={visas.map((v) => ({ id: v.id, label: `${v.code}: ${v.name}` }))}
      />
    </div>
  );
}
