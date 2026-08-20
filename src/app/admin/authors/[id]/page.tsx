import { notFound } from "next/navigation";
import { getAuthor, getAuthorPieces } from "@/lib/queries/authors";
import { createClient } from "@/lib/supabase/server";
import { AuthorEditForm } from "./AuthorEditForm";

export const dynamic = "force-dynamic";

export default async function AuthorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [author, pieces] = await Promise.all([
    getAuthor(supabase, id),
    getAuthorPieces(supabase, id),
  ]);

  if (!author) notFound();

  return (
    <div className="p-8">
      <AuthorEditForm author={author} pieces={pieces} />
    </div>
  );
}
