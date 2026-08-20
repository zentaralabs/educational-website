"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ContentStatusBadge } from "@/components/admin/ContentStatusBadge";
import { createProgram, updateProgramStatus, type ProgramRow } from "@/lib/queries/programs";
import { updateUniversity, type UniversityDetailRow } from "@/lib/queries/universities";
import { logActivity } from "@/lib/queries/activity";
import { createClient } from "@/lib/supabase/client";
import type { ContentStatus, Database } from "@/lib/supabase/types";

const TABS = [
  "Overview",
  "Admissions",
  "Cost & Aid",
  "Academic",
  "Narrative",
  "Meta",
] as const;
type Tab = (typeof TABS)[number];

type FormState = {
  name: string;
  slug: string;
  city: string;
  country_id: number;
  institution_type: string;
  website_url: string;
  acceptance_rate: string;
  gpa_requirement: string;
  required_tests: string;
  tuition_in_state: string;
  tuition_out_state: string;
  tuition_international: string;
  tuition_domestic: string;
  currency: string;
  apply_url: string;
  distinctive_summary: string;
  international_student_notes: string;
};

function toFormState(u: UniversityDetailRow): FormState {
  return {
    name: u.name,
    slug: u.slug,
    city: u.city ?? "",
    country_id: u.country_id,
    institution_type: u.institution_type ?? "",
    website_url: u.website_url ?? "",
    acceptance_rate: u.acceptance_rate !== null ? String(u.acceptance_rate) : "",
    gpa_requirement: u.gpa_requirement ?? "",
    required_tests: (u.required_tests ?? []).join(", "),
    tuition_in_state: u.tuition_in_state !== null ? String(u.tuition_in_state) : "",
    tuition_out_state: u.tuition_out_state !== null ? String(u.tuition_out_state) : "",
    tuition_international:
      u.tuition_international !== null ? String(u.tuition_international) : "",
    tuition_domestic: u.tuition_domestic !== null ? String(u.tuition_domestic) : "",
    currency: u.currency ?? "USD",
    apply_url: u.apply_url ?? "",
    distinctive_summary: u.distinctive_summary ?? "",
    international_student_notes: u.international_student_notes ?? "",
  };
}

function toPatch(
  form: FormState,
  status: ContentStatus,
): Database["public"]["Tables"]["universities"]["Update"] {
  return {
    name: form.name,
    slug: form.slug,
    city: form.city || null,
    country_id: form.country_id,
    institution_type: form.institution_type || null,
    website_url: form.website_url || null,
    acceptance_rate: form.acceptance_rate ? Number(form.acceptance_rate) : null,
    gpa_requirement: form.gpa_requirement || null,
    required_tests: form.required_tests
      ? form.required_tests.split(",").map((t) => t.trim()).filter(Boolean)
      : null,
    tuition_in_state: form.tuition_in_state ? Number(form.tuition_in_state) : null,
    tuition_out_state: form.tuition_out_state ? Number(form.tuition_out_state) : null,
    tuition_international: form.tuition_international
      ? Number(form.tuition_international)
      : null,
    tuition_domestic: form.tuition_domestic ? Number(form.tuition_domestic) : null,
    currency: form.currency || "USD",
    apply_url: form.apply_url || null,
    distinctive_summary: form.distinctive_summary || null,
    international_student_notes: form.international_student_notes || null,
    status,
    ...(status === "published" ? { last_verified_at: new Date().toISOString().slice(0, 10) } : {}),
  };
}

function Field({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block font-body text-xs font-semibold tracking-wide text-slate uppercase">
        {label}
      </span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-ink/20 bg-paper px-3 py-1.5 font-body text-sm text-ink focus-visible:border-status-open"
      />
      {hint && <span className="mt-1 block text-xs text-slate">{hint}</span>}
    </label>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1 block font-body text-xs font-semibold tracking-wide text-slate uppercase">
        {label}
      </span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={6}
        placeholder="Real, human-edited substance — not a data table with a paragraph wrapper."
        className="w-full resize-y rounded-md border border-ink/20 bg-paper px-3 py-2 font-body text-sm text-ink placeholder:text-slate/50 focus-visible:border-status-open"
      />
    </label>
  );
}

function ProgramsPanel({
  universityId,
  degreeLevels,
  subjects,
  initialPrograms,
}: {
  universityId: string;
  degreeLevels: { id: number; name: string }[];
  subjects: { id: number; name: string }[];
  initialPrograms: ProgramRow[];
}) {
  const router = useRouter();
  const [programs, setPrograms] = useState(initialPrograms);
  const [name, setName] = useState("");
  const [degreeLevelId, setDegreeLevelId] = useState(String(degreeLevels[0]?.id ?? ""));
  const [subjectId, setSubjectId] = useState("");
  const [durationYears, setDurationYears] = useState("");
  const [tuition, setTuition] = useState("");
  const [tuitionDomestic, setTuitionDomestic] = useState("");
  const [currency, setCurrency] = useState("");
  const [applicationUrl, setApplicationUrl] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !degreeLevelId) return;
    setSaving(true);
    setErrorMsg(null);
    try {
      const supabase = createClient();
      const id = await createProgram(supabase, {
        university_id: universityId,
        name: name.trim(),
        degree_level_id: Number(degreeLevelId),
        subject_id: subjectId ? Number(subjectId) : null,
        duration_years: durationYears ? Number(durationYears) : null,
        tuition_international: tuition ? Number(tuition) : null,
        tuition_domestic: tuitionDomestic ? Number(tuitionDomestic) : null,
        currency: currency ? currency.toUpperCase() : null,
        application_url: applicationUrl || null,
        source_url: sourceUrl || null,
      });
      const degree_level = degreeLevels.find((d) => d.id === Number(degreeLevelId)) ?? null;
      const subject = subjects.find((s) => s.id === Number(subjectId)) ?? null;
      setPrograms((prev) => [
        ...prev,
        {
          id,
          university_id: universityId,
          name: name.trim(),
          degree_level_id: Number(degreeLevelId),
          degree_level,
          subject_id: subjectId ? Number(subjectId) : null,
          subject,
          duration_years: durationYears ? Number(durationYears) : null,
          tuition_international: tuition ? Number(tuition) : null,
          tuition_domestic: tuitionDomestic ? Number(tuitionDomestic) : null,
          currency: currency ? currency.toUpperCase() : null,
          application_url: applicationUrl || null,
          status: "draft",
          last_verified_at: null,
          source_url: sourceUrl || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]);
      setName("");
      setSubjectId("");
      setDurationYears("");
      setTuition("");
      setTuitionDomestic("");
      setCurrency("");
      setApplicationUrl("");
      setSourceUrl("");
      router.refresh();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Could not add program");
    } finally {
      setSaving(false);
    }
  }

  async function handleStatusChange(programId: string, status: ContentStatus) {
    setBusyId(programId);
    setErrorMsg(null);
    try {
      const supabase = createClient();
      await updateProgramStatus(supabase, programId, status);
      setPrograms((prev) =>
        prev.map((p) => (p.id === programId ? { ...p, status } : p)),
      );
      router.refresh();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Update failed");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="max-w-2xl">
      <p className="mb-4 font-body text-sm text-slate">
        Structured degree offerings (e.g. &ldquo;Bachelor of Computer
        Science&rdquo;) shown on the public profile, separate from the free-text
        popular majors below.
      </p>

      {programs.length > 0 && (
        <div className="mb-4 overflow-hidden rounded-md border border-ink/15">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-ink/15 bg-ink/[0.03]">
                <th className="px-3 py-2 font-body text-xs font-semibold tracking-wide text-slate uppercase">
                  Program
                </th>
                <th className="px-3 py-2 font-body text-xs font-semibold tracking-wide text-slate uppercase">
                  Degree
                </th>
                <th className="px-3 py-2 font-body text-xs font-semibold tracking-wide text-slate uppercase">
                  Subject
                </th>
                <th className="px-3 py-2 font-body text-xs font-semibold tracking-wide text-slate uppercase">
                  Status
                </th>
                <th className="px-3 py-2 font-body text-xs font-semibold tracking-wide text-slate uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {programs.map((p) => (
                <tr key={p.id} className="border-b border-ink/10 text-sm last:border-b-0">
                  <td className="px-3 py-2.5 text-ink">{p.name}</td>
                  <td className="px-3 py-2.5 text-slate">{p.degree_level?.name}</td>
                  <td className="px-3 py-2.5 text-slate">{p.subject?.name ?? "—"}</td>
                  <td className="px-3 py-2.5">
                    <ContentStatusBadge status={p.status} />
                  </td>
                  <td className="px-3 py-2.5">
                    {p.status !== "published" ? (
                      <button
                        type="button"
                        disabled={busyId === p.id}
                        onClick={() => handleStatusChange(p.id, "published")}
                        className="font-body text-xs text-status-open underline underline-offset-2 disabled:opacity-50"
                      >
                        Publish
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={busyId === p.id}
                        onClick={() => handleStatusChange(p.id, "archived")}
                        className="font-body text-xs text-slate underline underline-offset-2 hover:text-status-closed disabled:opacity-50"
                      >
                        Archive
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <form
        onSubmit={handleAdd}
        className="flex flex-wrap items-end gap-3 rounded-md border border-ink/15 bg-ink/[0.02] p-4"
      >
        <label className="block">
          <span className="mb-1 block font-body text-xs font-semibold tracking-wide text-slate uppercase">
            Name
          </span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Bachelor of Computer Science"
            className="min-w-48 rounded-md border border-ink/20 bg-paper px-2 py-1.5 font-body text-sm text-ink placeholder:text-slate/60"
          />
        </label>
        <label className="block">
          <span className="mb-1 block font-body text-xs font-semibold tracking-wide text-slate uppercase">
            Degree level
          </span>
          <select
            value={degreeLevelId}
            onChange={(e) => setDegreeLevelId(e.target.value)}
            className="rounded-md border border-ink/20 bg-paper px-2 py-1.5 font-body text-sm text-ink"
          >
            {degreeLevels.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block font-body text-xs font-semibold tracking-wide text-slate uppercase">
            Subject
          </span>
          <select
            value={subjectId}
            onChange={(e) => setSubjectId(e.target.value)}
            className="rounded-md border border-ink/20 bg-paper px-2 py-1.5 font-body text-sm text-ink"
          >
            <option value="">None</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block font-body text-xs font-semibold tracking-wide text-slate uppercase">
            Duration (yrs)
          </span>
          <input
            value={durationYears}
            onChange={(e) => setDurationYears(e.target.value)}
            placeholder="4"
            className="w-20 rounded-md border border-ink/20 bg-paper px-2 py-1.5 font-body text-sm text-ink placeholder:text-slate/60"
          />
        </label>
        <label className="block">
          <span className="mb-1 block font-body text-xs font-semibold tracking-wide text-slate uppercase">
            Tuition (intl., optional)
          </span>
          <input
            value={tuition}
            onChange={(e) => setTuition(e.target.value)}
            placeholder="Falls back to university tuition"
            className="rounded-md border border-ink/20 bg-paper px-2 py-1.5 font-body text-sm text-ink placeholder:text-slate/60"
          />
        </label>
        <label className="block">
          <span className="mb-1 block font-body text-xs font-semibold tracking-wide text-slate uppercase">
            Tuition (domestic, optional)
          </span>
          <input
            value={tuitionDomestic}
            onChange={(e) => setTuitionDomestic(e.target.value)}
            placeholder="Falls back to university tuition"
            className="rounded-md border border-ink/20 bg-paper px-2 py-1.5 font-body text-sm text-ink placeholder:text-slate/60"
          />
        </label>
        <label className="block">
          <span className="mb-1 block font-body text-xs font-semibold tracking-wide text-slate uppercase">
            Currency (optional)
          </span>
          <input
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            placeholder="Falls back to university currency"
            className="w-40 rounded-md border border-ink/20 bg-paper px-2 py-1.5 font-body text-sm text-ink placeholder:text-slate/60"
          />
        </label>
        <label className="block">
          <span className="mb-1 block font-body text-xs font-semibold tracking-wide text-slate uppercase">
            Application URL (optional)
          </span>
          <input
            value={applicationUrl}
            onChange={(e) => setApplicationUrl(e.target.value)}
            placeholder="Falls back to university apply URL"
            className="min-w-56 rounded-md border border-ink/20 bg-paper px-2 py-1.5 font-body text-sm text-ink placeholder:text-slate/60"
          />
        </label>
        <label className="block">
          <span className="mb-1 block font-body text-xs font-semibold tracking-wide text-slate uppercase">
            Source URL
          </span>
          <input
            value={sourceUrl}
            onChange={(e) => setSourceUrl(e.target.value)}
            placeholder="Official page the fee was verified against"
            className="min-w-56 rounded-md border border-ink/20 bg-paper px-2 py-1.5 font-body text-sm text-ink placeholder:text-slate/60"
          />
        </label>
        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-ink px-3 py-1.5 font-body text-sm font-medium text-paper transition-opacity duration-150 hover:opacity-90 disabled:opacity-50"
        >
          {saving ? "Adding…" : "Add program"}
        </button>
        {errorMsg && (
          <p className="w-full font-body text-xs text-status-closed">{errorMsg}</p>
        )}
      </form>
    </div>
  );
}

export function UniversityEditForm({
  university,
  countries,
  degreeLevels,
  programs,
  subjects,
}: {
  university: UniversityDetailRow;
  countries: { id: number; code: string; name: string }[];
  degreeLevels: { id: number; name: string }[];
  programs: ProgramRow[];
  subjects: { id: number; name: string }[];
}) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("Overview");
  const [form, setForm] = useState<FormState>(() => toFormState(university));
  const [status, setStatus] = useState<ContentStatus>(university.status);
  const [saving, setSaving] = useState<"draft" | "publish" | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function save(targetStatus: ContentStatus, kind: "draft" | "publish") {
    setSaving(kind);
    setErrorMsg(null);
    setMessage(null);
    try {
      const supabase = createClient();
      await updateUniversity(supabase, university.id, toPatch(form, targetStatus));
      const {
        data: { user },
      } = await supabase.auth.getUser();
      await logActivity(supabase, {
        author_id: user?.id ?? null,
        entity_type: "university",
        entity_id: university.id,
        action: kind === "publish" ? "status_changed" : "updated",
        detail:
          kind === "publish"
            ? `Published ${form.name}`
            : `Saved draft: ${form.name}`,
      });
      setStatus(targetStatus);
      setMessage(targetStatus === "published" ? "Published." : "Draft saved.");
      router.refresh();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(null);
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">
            {university.name}
          </h1>
          <div className="mt-1 flex items-center gap-2">
            <ContentStatusBadge status={status} />
            <span className="font-utility text-xs text-slate">
              /{university.slug}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {message && (
            <span className="font-body text-xs text-status-open">{message}</span>
          )}
          {errorMsg && (
            <span className="font-body text-xs text-status-closed">{errorMsg}</span>
          )}
          <button
            type="button"
            disabled={saving !== null}
            onClick={() => save("draft", "draft")}
            className="rounded-md border border-ink/20 px-3 py-1.5 font-body text-sm text-ink transition-colors duration-150 hover:border-status-open disabled:opacity-50"
          >
            {saving === "draft" ? "Saving…" : "Save draft"}
          </button>
          <button
            type="button"
            disabled={saving !== null}
            onClick={() => save("published", "publish")}
            className="rounded-md bg-status-open px-3 py-1.5 font-body text-sm font-medium text-paper transition-opacity duration-150 hover:opacity-90 disabled:opacity-50"
          >
            {saving === "publish" ? "Publishing…" : "Publish"}
          </button>
        </div>
      </div>

      <div className="mb-6 flex gap-1 border-b border-ink/15">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`-mb-px border-b-2 px-3 py-2 font-body text-sm transition-colors duration-150 ${
              tab === t
                ? "border-ink font-medium text-ink"
                : "border-transparent text-slate hover:text-ink"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Overview" && (
        <div className="grid max-w-2xl gap-4 sm:grid-cols-2">
          <Field label="Name" value={form.name} onChange={(v) => set("name", v)} />
          <Field label="Slug" value={form.slug} onChange={(v) => set("slug", v)} />
          <Field label="City" value={form.city} onChange={(v) => set("city", v)} />
          <label className="block">
            <span className="mb-1 block font-body text-xs font-semibold tracking-wide text-slate uppercase">
              Country
            </span>
            <select
              value={form.country_id}
              onChange={(e) => set("country_id", Number(e.target.value))}
              className="w-full rounded-md border border-ink/20 bg-paper px-3 py-1.5 font-body text-sm text-ink"
            >
              {countries.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <Field
            label="Institution type"
            value={form.institution_type}
            onChange={(v) => set("institution_type", v)}
          />
          <Field
            label="Website"
            value={form.website_url}
            onChange={(v) => set("website_url", v)}
          />
        </div>
      )}

      {tab === "Admissions" && (
        <div className="grid max-w-2xl gap-4 sm:grid-cols-2">
          <Field
            label="Acceptance rate"
            value={form.acceptance_rate}
            onChange={(v) => set("acceptance_rate", v)}
            hint="Percent, e.g. 8.6"
          />
          <Field
            label="GPA requirement"
            value={form.gpa_requirement}
            onChange={(v) => set("gpa_requirement", v)}
          />
          <Field
            label="Required tests"
            value={form.required_tests}
            onChange={(v) => set("required_tests", v)}
            hint="Comma-separated, e.g. SAT, ACT"
          />
        </div>
      )}

      {tab === "Cost & Aid" && (
        <div className="grid max-w-2xl gap-4 sm:grid-cols-2">
          <Field
            label="Tuition (in-state)"
            value={form.tuition_in_state}
            onChange={(v) => set("tuition_in_state", v)}
            hint="US only"
          />
          <Field
            label="Tuition (out-of-state)"
            value={form.tuition_out_state}
            onChange={(v) => set("tuition_out_state", v)}
            hint="US only"
          />
          <Field
            label="Tuition (international)"
            value={form.tuition_international}
            onChange={(v) => set("tuition_international", v)}
          />
          <Field
            label="Tuition (domestic)"
            value={form.tuition_domestic}
            onChange={(v) => set("tuition_domestic", v)}
            hint="AU/UK/CA home-student rate"
          />
          <Field
            label="Currency"
            value={form.currency}
            onChange={(v) => set("currency", v.toUpperCase())}
            hint="ISO code, e.g. AUD, GBP, CAD, USD"
          />
          <Field
            label="Apply URL"
            value={form.apply_url}
            onChange={(v) => set("apply_url", v)}
            hint="Fallback application link when a program has none of its own"
          />
        </div>
      )}

      {tab === "Academic" && (
        <ProgramsPanel
          universityId={university.id}
          degreeLevels={degreeLevels}
          subjects={subjects}
          initialPrograms={programs}
        />
      )}

      {tab === "Narrative" && (
        <div className="grid max-w-2xl gap-5">
          <TextAreaField
            label="Distinctive summary"
            value={form.distinctive_summary}
            onChange={(v) => set("distinctive_summary", v)}
          />
          <TextAreaField
            label="International student notes"
            value={form.international_student_notes}
            onChange={(v) => set("international_student_notes", v)}
          />
        </div>
      )}

      {tab === "Meta" && (
        <div className="grid max-w-2xl gap-4 sm:grid-cols-2">
          <div>
            <span className="mb-1 block font-body text-xs font-semibold tracking-wide text-slate uppercase">
              Author
            </span>
            <p className="font-body text-sm text-ink">
              {university.author?.name ?? "Unassigned"}
            </p>
          </div>
          <div>
            <span className="mb-1 block font-body text-xs font-semibold tracking-wide text-slate uppercase">
              Last verified
            </span>
            <p className="font-utility text-sm text-ink">
              {university.last_verified_at ?? "never"}
            </p>
          </div>
          <div>
            <span className="mb-1 block font-body text-xs font-semibold tracking-wide text-slate uppercase">
              Status
            </span>
            <ContentStatusBadge status={status} />
          </div>
        </div>
      )}
    </div>
  );
}
