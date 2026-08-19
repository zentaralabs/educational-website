import { notFound } from "next/navigation";
import { getGuide, getGuideRelatedLinks, listGuides } from "@/lib/queries/guides";
import { listUniversities } from "@/lib/queries/universities";
import { createClient } from "@/lib/supabase/server";
import { GuideEditor } from "./GuideEditor";

export const dynamic = "force-dynamic";

export default async function GuideDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [guide, allGuides, universities, relatedLinks] = await Promise.all([
    getGuide(supabase, id),
    listGuides(supabase),
    listUniversities(supabase),
    getGuideRelatedLinks(supabase, id),
  ]);

  if (!guide) notFound();

  const otherGuides = allGuides.filter((g) => g.id !== id);

  return (
    <div className="p-8">
      <GuideEditor
        guide={guide}
        otherGuides={otherGuides}
        universities={universities}
        relatedLinks={relatedLinks}
      />
    </div>
  );
}
