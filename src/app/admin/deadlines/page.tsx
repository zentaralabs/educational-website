import { MOCK_DEADLINES } from "@/lib/mock-deadlines-data";
import { DeadlinesTable } from "./DeadlinesTable";

export default function DeadlinesPage() {
  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold text-ink">
          Deadlines
        </h1>
        <button
          type="button"
          className="rounded-md bg-ink px-3 py-1.5 font-body text-sm font-medium text-paper transition-opacity duration-150 hover:opacity-90"
        >
          New deadline
        </button>
      </div>

      <DeadlinesTable initialDeadlines={MOCK_DEADLINES} />
    </div>
  );
}
