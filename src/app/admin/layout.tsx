import Link from "next/link";

// TODO: gate this layout behind Supabase auth once the project exists —
// currently unauthenticated, admin routes are reachable by anyone.
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

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <aside className="w-56 shrink-0 border-r border-ink/10 bg-paper px-4 py-6">
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
      </aside>
      <div className="min-w-0 flex-1 bg-paper">{children}</div>
    </div>
  );
}
