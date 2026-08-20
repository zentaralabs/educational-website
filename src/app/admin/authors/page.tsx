import Link from "next/link";
import { listAuthors } from "@/lib/queries/authors";
import { createClient } from "@/lib/supabase/server";
import { AuthorsTable } from "./AuthorsTable";

export const dynamic = "force-dynamic";

export default async function AuthorsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const [authors, { data: currentAuthor }] = await Promise.all([
    listAuthors(supabase),
    supabase.from("authors").select("is_admin").eq("id", user?.id ?? "").maybeSingle(),
  ]);

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold text-ink">Authors</h1>
        {currentAuthor?.is_admin && (
          <Link
            href="/admin/authors/new"
            className="rounded-md bg-ink px-3 py-1.5 font-body text-sm font-medium text-paper transition-opacity duration-150 hover:opacity-90"
          >
            New author
          </Link>
        )}
      </div>

      <AuthorsTable authors={authors} />
    </div>
  );
}
