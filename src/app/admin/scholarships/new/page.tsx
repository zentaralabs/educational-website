import { NewScholarshipForm } from "./NewScholarshipForm";

export default function NewScholarshipPage() {
  return (
    <div className="p-8">
      <h1 className="mb-6 font-display text-2xl font-semibold text-ink">
        New scholarship
      </h1>
      <NewScholarshipForm />
    </div>
  );
}
