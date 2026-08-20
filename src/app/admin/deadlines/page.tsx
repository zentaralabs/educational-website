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
      <h1 className="mb-6 font-display text-2xl font-semibold text-ink">
        Deadlines
      </h1>

      <DeadlinesTable initialDeadlines={deadlines} lookups={lookups} />
    </div>
  );
}
