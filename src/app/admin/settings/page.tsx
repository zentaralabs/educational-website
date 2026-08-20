import { redirect } from "next/navigation";
import { listAuthors } from "@/lib/queries/authors";
import {
  listApplicationPlatforms,
  listCountries,
  listDeadlineTypes,
  listDegreeLevels,
  listSubjects,
} from "@/lib/queries/vocab";
import { createClient } from "@/lib/supabase/server";
import { SettingsView } from "./SettingsView";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: currentAuthor } = await supabase
    .from("authors")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle();

  // Role management and controlled vocabularies are admin-only writes (see
  // RLS "lookups writable by admin" / "authors self-update"); editors can
  // still land here but see a read-only notice instead of the forms.
  if (!currentAuthor?.is_admin) {
    return (
      <div className="p-8">
        <h1 className="mb-2 font-display text-2xl font-semibold text-ink">
          Settings
        </h1>
        <p className="max-w-md font-body text-sm text-slate">
          Only admins can manage roles and controlled vocabularies. Ask an
          admin if something here needs to change.
        </p>
      </div>
    );
  }

  const [authors, countries, degreeLevels, deadlineTypes, applicationPlatforms, subjects] =
    await Promise.all([
      listAuthors(supabase),
      listCountries(supabase),
      listDegreeLevels(supabase),
      listDeadlineTypes(supabase),
      listApplicationPlatforms(supabase),
      listSubjects(supabase),
    ]);

  return (
    <div className="p-8">
      <h1 className="mb-6 font-display text-2xl font-semibold text-ink">
        Settings
      </h1>
      <SettingsView
        currentUserId={user.id}
        authors={authors}
        countries={countries}
        degreeLevels={degreeLevels}
        deadlineTypes={deadlineTypes}
        applicationPlatforms={applicationPlatforms}
        subjects={subjects}
      />
    </div>
  );
}
