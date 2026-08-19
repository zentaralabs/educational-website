import { notFound } from "next/navigation";
import { MOCK_UNIVERSITIES } from "@/lib/mock-admin-data";
import { MOCK_GUIDES } from "@/lib/mock-guides-data";
import { GuideEditor } from "./GuideEditor";

export default async function GuideDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const guide = MOCK_GUIDES.find((g) => g.id === id);

  if (!guide) notFound();

  const otherGuides = MOCK_GUIDES.filter((g) => g.id !== id);

  return (
    <div className="p-8">
      <GuideEditor
        guide={guide}
        otherGuides={otherGuides}
        universities={MOCK_UNIVERSITIES}
      />
    </div>
  );
}
