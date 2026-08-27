import Link from "next/link";
import { ContentStatusBadge } from "@/components/admin/ContentStatusBadge";
import { listInvitationRounds, listVisaSubclasses } from "@/lib/queries/visas";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function VisasPage() {
  const supabase = await createClient();
  const [visas, rounds] = await Promise.all([
    listVisaSubclasses(supabase),
    listInvitationRounds(supabase),
  ]);

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold text-ink">Visas</h1>
        <div className="flex gap-2">
          <Link
            href="/admin/visas/rounds/new"
            className="rounded-md border border-ink/20 px-3 py-1.5 font-body text-sm font-medium text-ink hover:border-status-open"
          >
            New round
          </Link>
          <Link
            href="/admin/visas/new"
            className="rounded-md bg-ink px-3 py-1.5 font-body text-sm font-medium text-paper transition-opacity duration-150 hover:opacity-90"
          >
            New subclass
          </Link>
        </div>
      </div>

      <h2 className="mb-3 font-body text-xs font-semibold tracking-wide text-slate uppercase">
        Subclasses ({visas.length})
      </h2>
      <div className="mb-10 overflow-hidden rounded-md border border-ink/15">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-ink/15 bg-ink/[0.03] font-body text-xs tracking-wide text-slate uppercase">
              <th className="px-3 py-2">Code</th>
              <th className="px-3 py-2">Name</th>
              <th className="px-3 py-2">Category</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Verified</th>
            </tr>
          </thead>
          <tbody>
            {visas.map((v) => (
              <tr
                key={v.id}
                className="border-b border-ink/10 last:border-b-0 hover:bg-ink/[0.02]"
              >
                <td className="px-3 py-2.5 font-utility text-ink">{v.code}</td>
                <td className="px-3 py-2.5">
                  <Link
                    href={`/admin/visas/${v.id}`}
                    className="font-medium text-ink hover:underline"
                  >
                    {v.name}
                  </Link>
                  <div className="font-utility text-xs text-slate">/{v.slug}</div>
                </td>
                <td className="px-3 py-2.5 text-slate">{v.category}</td>
                <td className="px-3 py-2.5">
                  <ContentStatusBadge status={v.status} />
                </td>
                <td className="px-3 py-2.5 font-utility text-xs text-slate">
                  {v.last_verified_at ?? "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="mb-3 font-body text-xs font-semibold tracking-wide text-slate uppercase">
        Invitation rounds ({rounds.length})
      </h2>
      <div className="overflow-hidden rounded-md border border-ink/15">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-ink/15 bg-ink/[0.03] font-body text-xs tracking-wide text-slate uppercase">
              <th className="px-3 py-2">Date</th>
              <th className="px-3 py-2">Visa</th>
              <th className="px-3 py-2">Stream</th>
              <th className="px-3 py-2">Invitations</th>
              <th className="px-3 py-2">Min pts</th>
              <th className="px-3 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {rounds.map((r) => (
              <tr
                key={r.id}
                className="border-b border-ink/10 last:border-b-0 hover:bg-ink/[0.02]"
              >
                <td className="px-3 py-2.5 font-utility text-ink">
                  <Link
                    href={`/admin/visas/rounds/${r.id}`}
                    className="hover:underline"
                  >
                    {r.round_date}
                  </Link>
                  {r.is_estimated && (
                    <span className="ml-1 text-xs text-status-pending">est.</span>
                  )}
                </td>
                <td className="px-3 py-2.5 font-utility text-ink">{r.visa_code}</td>
                <td className="px-3 py-2.5 text-slate">{r.stream ?? "—"}</td>
                <td className="px-3 py-2.5 font-utility text-ink">
                  {r.invitations_issued ?? "—"}
                </td>
                <td className="px-3 py-2.5 font-utility text-ink">
                  {r.min_points ?? "—"}
                </td>
                <td className="px-3 py-2.5">
                  <ContentStatusBadge status={r.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
