import { listDeadlineLookups, listDeadlines } from "@/lib/queries/deadlines";
import { createClient } from "@/lib/supabase/server";
import { DeadlinesTable } from "./DeadlinesTable";

export const dynamic = "force-dynamic";

export default async function DeadlinesPage() {
  const supabase = await createClient();
  const [deadlines, lookups] = await Promise.all([
    listDeadlines(supabase),
    listDeadlineLookups(supabase),
  ]);

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

      <DeadlinesTable initialDeadlines={deadlines} lookups={lookups} />
    </div>
  );
}
