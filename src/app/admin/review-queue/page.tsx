import { getReviewQueue } from "@/lib/review-queue";
import { ReviewQueueTable } from "./ReviewQueueTable";

export default function ReviewQueuePage() {
  const items = getReviewQueue();

  return (
    <div className="p-8">
      <h1 className="mb-6 font-display text-2xl font-semibold text-ink">
        Review queue
      </h1>
      <ReviewQueueTable items={items} />
    </div>
  );
}
