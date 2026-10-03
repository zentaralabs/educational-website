export function LegalPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-12">
      <h1 className="page-title">
        {title}
      </h1>
      <p className="mt-2 font-utility text-xs text-slate">Last updated {updated}</p>
      <div className="prose-guide mt-8 font-body text-base leading-relaxed text-ink">
        {children}
      </div>
    </main>
  );
}
