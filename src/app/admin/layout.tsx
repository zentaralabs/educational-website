import Link from "next/link";
import { redirect } from "next/navigation";
import { SignOutButton } from "@/components/admin/SignOutButton";
import { createClient } from "@/lib/supabase/server";

const NAV = [
  { label: "Dashboard", href: "/admin" },
  { label: "Universities", href: "/admin/universities" },
  { label: "Deadlines", href: "/admin/deadlines" },
  { label: "Scholarships", href: "/admin/scholarships" },
  { label: "Guides", href: "/admin/guides" },
  { label: "Authors", href: "/admin/authors" },
  { label: "Review queue", href: "/admin/review-queue" },
  { label: "Settings", href: "/admin/settings" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Middleware already redirects unauthenticated requests, but this layout
  // also renders for client-side navigations middleware doesn't intercept —
  // check again here as defense-in-depth.
  if (!user) redirect("/login");

  const { data: author } = await supabase
    .from("authors")
    .select("name, is_admin")
    .eq("id", user.id)
    .single();

  // Authenticated but not a staff member (no authors row) — not authorized
  // for the admin panel at all.
  if (!author) redirect("/login?error=not_staff");

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-56 shrink-0 flex-col border-r border-ink/10 bg-paper px-4 py-6">
        <div className="mb-8 px-2 font-display text-lg font-semibold text-ink">
          Admin
        </div>
        <nav className="flex flex-col gap-0.5">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-2 py-1.5 font-body text-sm text-slate transition-colors duration-150 hover:bg-ink/[0.05] hover:text-ink"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="mt-auto border-t border-ink/10 pt-3">
          <p className="px-2 font-body text-xs text-slate">
            {author.name} · {author.is_admin ? "Admin" : "Editor"}
          </p>
          <SignOutButton />
        </div>
      </aside>
      <div className="min-w-0 flex-1 bg-paper">{children}</div>
    </div>
  );
}
