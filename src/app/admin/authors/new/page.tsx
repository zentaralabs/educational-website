import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { NewAuthorForm } from "./NewAuthorForm";

export const dynamic = "force-dynamic";

export default async function NewAuthorPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: author } = await supabase
    .from("authors")
    .select("is_admin")
    .eq("id", user?.id ?? "")
    .maybeSingle();

  // Only admins can insert authors rows (see RLS "authors insert by admin").
  if (!author?.is_admin) redirect("/admin/authors");

  return (
    <div className="p-8">
      <h1 className="mb-6 font-display text-2xl font-semibold text-ink">
        New author
      </h1>
      <NewAuthorForm />
    </div>
  );
}
