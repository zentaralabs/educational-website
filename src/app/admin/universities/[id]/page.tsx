import { notFound } from "next/navigation";
import { MOCK_UNIVERSITIES } from "@/lib/mock-admin-data";
import { UniversityEditForm } from "./UniversityEditForm";

export default async function UniversityDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const university = MOCK_UNIVERSITIES.find((u) => u.id === id);

  if (!university) notFound();

  return (
    <div className="p-8">
      <UniversityEditForm university={university} />
    </div>
  );
}
