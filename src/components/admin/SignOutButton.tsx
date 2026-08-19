"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function SignOutButton() {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      className="rounded-md px-2 py-1.5 text-left font-body text-sm text-slate transition-colors duration-150 hover:bg-ink/[0.05] hover:text-ink"
    >
      Sign out
    </button>
  );
}
