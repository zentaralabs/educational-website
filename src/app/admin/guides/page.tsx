import { MOCK_GUIDES } from "@/lib/mock-guides-data";
import { GuidesTable } from "./GuidesTable";

export default function GuidesPage() {
  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold text-ink">
          Guides
        </h1>
        <button
          type="button"
          className="rounded-md bg-ink px-3 py-1.5 font-body text-sm font-medium text-paper transition-opacity duration-150 hover:opacity-90"
        >
          New guide
        </button>
      </div>

      <GuidesTable guides={MOCK_GUIDES} />
    </div>
  );
}
