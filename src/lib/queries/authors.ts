import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

export type AuthorListRow = Database["public"]["Tables"]["authors"]["Row"] & {
  publishedCount: number;
};

export async function listAuthors(
  supabase: SupabaseClient<Database>,
): Promise<AuthorListRow[]> {
  const [authors, universities, guides] = await Promise.all([
    supabase.from("authors").select("*").order("name"),
    supabase.from("universities").select("author_id").eq("status", "published"),
    supabase.from("guides").select("author_id").eq("status", "published"),
  ]);

  if (authors.error) throw authors.error;
  if (universities.error) throw universities.error;
  if (guides.error) throw guides.error;

  const counts = new Map<string, number>();
  for (const row of [...(universities.data ?? []), ...(guides.data ?? [])]) {
    if (!row.author_id) continue;
    counts.set(row.author_id, (counts.get(row.author_id) ?? 0) + 1);
  }

  return (authors.data ?? []).map((a) => ({
    ...a,
    publishedCount: counts.get(a.id) ?? 0,
  }));
}

export async function getAuthor(
  supabase: SupabaseClient<Database>,
  id: string,
): Promise<Database["public"]["Tables"]["authors"]["Row"] | null> {
  const { data, error } = await supabase
    .from("authors")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export type AuthorPiece = {
  id: string;
  title: string;
  type: "university" | "guide";
  status: Database["public"]["Tables"]["universities"]["Row"]["status"];
};

export async function getAuthorPieces(
  supabase: SupabaseClient<Database>,
  authorId: string,
): Promise<AuthorPiece[]> {
  const [universities, guides] = await Promise.all([
    supabase
      .from("universities")
      .select("id, name, status")
      .eq("author_id", authorId)
      .order("name"),
    supabase
      .from("guides")
      .select("id, title, status")
      .eq("author_id", authorId)
      .order("title"),
  ]);

  if (universities.error) throw universities.error;
  if (guides.error) throw guides.error;

  return [
    ...(universities.data ?? []).map((u) => ({
      id: u.id,
      title: u.name,
      type: "university" as const,
      status: u.status,
    })),
    ...(guides.data ?? []).map((g) => ({
      id: g.id,
      title: g.title,
      type: "guide" as const,
      status: g.status,
    })),
  ];
}

export async function updateAuthor(
  supabase: SupabaseClient<Database>,
  id: string,
  patch: Pick<
    Database["public"]["Tables"]["authors"]["Update"],
    "name" | "bio" | "credentials" | "avatar_url"
  >,
) {
  const { error } = await supabase.from("authors").update(patch).eq("id", id);
  if (error) throw error;
}

export async function createAuthor(
  supabase: SupabaseClient<Database>,
  input: Pick<
    Database["public"]["Tables"]["authors"]["Insert"],
    "name" | "bio" | "credentials" | "avatar_url"
  >,
): Promise<string> {
  const { data, error } = await supabase
    .from("authors")
    .insert(input)
    .select("id")
    .single();
  if (error) throw error;
  return data.id;
}

export async function setAuthorRole(
  supabase: SupabaseClient<Database>,
  id: string,
  isAdmin: boolean,
) {
  const { error } = await supabase
    .from("authors")
    .update({ is_admin: isAdmin })
    .eq("id", id);
  if (error) throw error;
}
