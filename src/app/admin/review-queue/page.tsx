import { getReviewQueue } from "@/lib/queries/review-queue";
import { createClient } from "@/lib/supabase/server";
import { ReviewQueueTable } from "./ReviewQueueTable";

export const dynamic = "force-dynamic";

export default async function ReviewQueuePage() {
  const supabase = await createClient();
  const items = await getReviewQueue(supabase);

  return (
    <div className="p-8">
      <h1 className="mb-6 font-display text-2xl font-semibold text-ink">
        Review queue
      </h1>
      <ReviewQueueTable items={items} />
    </div>
  );
}
