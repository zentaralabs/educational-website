import { NewVisaForm } from "./NewVisaForm";

export const dynamic = "force-dynamic";

export default function NewVisaPage() {
  return (
    <div className="p-8">
      <h1 className="mb-6 font-display text-2xl font-semibold text-ink">
        New visa subclass
      </h1>
      <NewVisaForm />
    </div>
  );
}
