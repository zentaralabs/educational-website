import { notFound } from "next/navigation";
import { MOCK_UNIVERSITIES } from "@/lib/mock-admin-data";
import { MOCK_SCHOLARSHIPS } from "@/lib/mock-scholarships-data";
import { ScholarshipEditForm } from "./ScholarshipEditForm";

export default async function ScholarshipDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const scholarship = MOCK_SCHOLARSHIPS.find((s) => s.id === id);

  if (!scholarship) notFound();

  return (
    <div className="p-8">
      <ScholarshipEditForm
        scholarship={scholarship}
        universities={MOCK_UNIVERSITIES}
      />
    </div>
  );
}
