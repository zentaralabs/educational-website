import { NewRoundForm } from "./NewRoundForm";

export const dynamic = "force-dynamic";

export default function NewRoundPage() {
  return (
    <div className="p-8">
      <h1 className="mb-6 font-display text-2xl font-semibold text-ink">
        New invitation round
      </h1>
      <NewRoundForm />
    </div>
  );
}
