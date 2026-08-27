import type { SupabaseClient } from "@supabase/supabase-js";
import type { ContentStatus, Database } from "@/lib/supabase/types";

// ---- Visa subclasses -------------------------------------------------------

export type VisaSubclassListRow = {
  id: string;
  slug: string;
  code: string;
  name: string;
  category: string;
  status: ContentStatus;
  last_verified_at: string | null;
};

export async function listVisaSubclasses(
  supabase: SupabaseClient<Database>,
): Promise<VisaSubclassListRow[]> {
  const { data, error } = await supabase
    .from("visa_subclasses")
    .select("id, slug, code, name, category, status, last_verified_at")
    .order("code");
  if (error) throw error;
  return (data ?? []) as VisaSubclassListRow[];
}

export type VisaSubclassDetailRow =
  Database["public"]["Tables"]["visa_subclasses"]["Row"];

export async function getVisaSubclass(
  supabase: SupabaseClient<Database>,
  id: string,
): Promise<VisaSubclassDetailRow | null> {
  const { data, error } = await supabase
    .from("visa_subclasses")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return (data ?? null) as VisaSubclassDetailRow | null;
}

export async function createVisaSubclass(
  supabase: SupabaseClient<Database>,
  input: Pick<
    Database["public"]["Tables"]["visa_subclasses"]["Insert"],
    "slug" | "code" | "name" | "category" | "author_id"
  >,
): Promise<string> {
  const { data, error } = await supabase
    .from("visa_subclasses")
    .insert({ ...input, status: "draft" })
    .select("id")
    .single();
  if (error) throw error;
  return data.id;
}

export async function updateVisaSubclass(
  supabase: SupabaseClient<Database>,
  id: string,
  patch: Database["public"]["Tables"]["visa_subclasses"]["Update"],
) {
  const { error } = await supabase
    .from("visa_subclasses")
    .update(patch)
    .eq("id", id);
  if (error) throw error;
}

// ---- Invitation rounds ----------------------------------------------------

export type InvitationRoundListRow = {
  id: string;
  round_date: string;
  visa_code: string;
  stream: string | null;
  invitations_issued: number | null;
  min_points: number | null;
  is_estimated: boolean;
  status: ContentStatus;
};

export async function listInvitationRounds(
  supabase: SupabaseClient<Database>,
): Promise<InvitationRoundListRow[]> {
  const { data, error } = await supabase
    .from("invitation_rounds")
    .select(
      "id, round_date, visa_code, stream, invitations_issued, min_points, is_estimated, status",
    )
    .order("round_date", { ascending: false });
  if (error) throw error;
  return (data ?? []) as InvitationRoundListRow[];
}

export type InvitationRoundDetailRow =
  Database["public"]["Tables"]["invitation_rounds"]["Row"];

export async function getInvitationRound(
  supabase: SupabaseClient<Database>,
  id: string,
): Promise<InvitationRoundDetailRow | null> {
  const { data, error } = await supabase
    .from("invitation_rounds")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return (data ?? null) as InvitationRoundDetailRow | null;
}

export async function createInvitationRound(
  supabase: SupabaseClient<Database>,
  input: Pick<
    Database["public"]["Tables"]["invitation_rounds"]["Insert"],
    "round_date" | "visa_code"
  >,
): Promise<string> {
  const { data, error } = await supabase
    .from("invitation_rounds")
    .insert({ ...input, status: "draft" })
    .select("id")
    .single();
  if (error) throw error;
  return data.id;
}

export async function updateInvitationRound(
  supabase: SupabaseClient<Database>,
  id: string,
  patch: Database["public"]["Tables"]["invitation_rounds"]["Update"],
) {
  const { error } = await supabase
    .from("invitation_rounds")
    .update(patch)
    .eq("id", id);
  if (error) throw error;
}
