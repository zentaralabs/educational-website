import { MOCK_UNIVERSITIES } from "@/lib/mock-admin-data";
import { UniversitiesTable } from "./UniversitiesTable";

export default function UniversitiesPage() {
  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold text-ink">
          Universities
        </h1>
        <button
          type="button"
          className="rounded-md bg-ink px-3 py-1.5 font-body text-sm font-medium text-paper transition-opacity duration-150 hover:opacity-90"
        >
          New university
        </button>
      </div>

      <UniversitiesTable initialUniversities={MOCK_UNIVERSITIES} />
    </div>
  );
}
