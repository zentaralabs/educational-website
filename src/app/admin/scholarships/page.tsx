import { MOCK_SCHOLARSHIPS } from "@/lib/mock-scholarships-data";
import { ScholarshipsTable } from "./ScholarshipsTable";

export default function ScholarshipsPage() {
  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold text-ink">
          Scholarships
        </h1>
        <button
          type="button"
          className="rounded-md bg-ink px-3 py-1.5 font-body text-sm font-medium text-paper transition-opacity duration-150 hover:opacity-90"
        >
          New scholarship
        </button>
      </div>

      <ScholarshipsTable scholarships={MOCK_SCHOLARSHIPS} />
    </div>
  );
}
