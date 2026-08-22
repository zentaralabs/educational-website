"use client";

import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import { ContentStatusBadge } from "@/components/admin/ContentStatusBadge";
import {
  createProgram,
  updateProgram,
  updateProgramStatus,
  type ProgramRow,
} from "@/lib/queries/programs";
import { updateUniversity, type UniversityDetailRow } from "@/lib/queries/universities";
import { revalidateProgram, revalidateUniversity } from "./actions";
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
  atar_requirement: string;
  academic_requirement: string;
  academic_requirement_domestic: string;
  required_tests: string;
  ielts_overall: string;
  ielts_listening: string;
  ielts_reading: string;
  ielts_writing: string;
  ielts_speaking: string;
  pte_overall: string;
  pte_listening: string;
  pte_reading: string;
  pte_writing: string;
  pte_speaking: string;
  tuition_in_state: string;
  tuition_out_state: string;
  tuition_international: string;
  tuition_domestic: string;
  tuition_domestic_is_csp: boolean;
  currency: string;
  apply_url: string;
  distinctive_summary: string;
  international_student_notes: string;
};

function numToStr(n: number | null | undefined): string {
  return n === null || n === undefined ? "" : String(n);
}

function strToNum(s: string): number | null {
  return s ? Number(s) : null;
}

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
    atar_requirement: u.atar_requirement ?? "",
    academic_requirement: u.academic_requirement ?? "",
    academic_requirement_domestic: u.academic_requirement_domestic ?? "",
    required_tests: (u.required_tests ?? []).join(", "),
    ielts_overall: numToStr(u.ielts_overall),
    ielts_listening: numToStr(u.ielts_listening),
    ielts_reading: numToStr(u.ielts_reading),
    ielts_writing: numToStr(u.ielts_writing),
    ielts_speaking: numToStr(u.ielts_speaking),
    pte_overall: numToStr(u.pte_overall),
    pte_listening: numToStr(u.pte_listening),
    pte_reading: numToStr(u.pte_reading),
    pte_writing: numToStr(u.pte_writing),
    pte_speaking: numToStr(u.pte_speaking),
    tuition_in_state: u.tuition_in_state !== null ? String(u.tuition_in_state) : "",
    tuition_out_state: u.tuition_out_state !== null ? String(u.tuition_out_state) : "",
    tuition_international:
      u.tuition_international !== null ? String(u.tuition_international) : "",
    tuition_domestic: u.tuition_domestic !== null ? String(u.tuition_domestic) : "",
    tuition_domestic_is_csp: u.tuition_domestic_is_csp ?? false,
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
    atar_requirement: form.atar_requirement || null,
    academic_requirement: form.academic_requirement || null,
    academic_requirement_domestic: form.academic_requirement_domestic || null,
    required_tests: form.required_tests
      ? form.required_tests.split(",").map((t) => t.trim()).filter(Boolean)
      : null,
    ielts_overall: strToNum(form.ielts_overall),
    ielts_listening: strToNum(form.ielts_listening),
    ielts_reading: strToNum(form.ielts_reading),
    ielts_writing: strToNum(form.ielts_writing),
    ielts_speaking: strToNum(form.ielts_speaking),
    pte_overall: strToNum(form.pte_overall),
    pte_listening: strToNum(form.pte_listening),
    pte_reading: strToNum(form.pte_reading),
    pte_writing: strToNum(form.pte_writing),
    pte_speaking: strToNum(form.pte_speaking),
    tuition_in_state: form.tuition_in_state ? Number(form.tuition_in_state) : null,
    tuition_out_state: form.tuition_out_state ? Number(form.tuition_out_state) : null,
    tuition_international: form.tuition_international
      ? Number(form.tuition_international)
      : null,
    tuition_domestic: form.tuition_domestic ? Number(form.tuition_domestic) : null,
    tuition_domestic_is_csp: form.tuition_domestic ? form.tuition_domestic_is_csp : null,
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
  universitySlug,
  degreeLevels,
  subjects,
  initialPrograms,
}: {
  universityId: string;
  universitySlug: string;
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
  const [tuitionDomesticIsCsp, setTuitionDomesticIsCsp] = useState(false);
  const [currency, setCurrency] = useState("");
  const [applicationUrl, setApplicationUrl] = useState("");
  const [description, setDescription] = useState("");
  const [admissionRequirements, setAdmissionRequirements] = useState("");
  const [englishRequirements, setEnglishRequirements] = useState("");
  const [ieltsOverall, setIeltsOverall] = useState("");
  const [ieltsListening, setIeltsListening] = useState("");
  const [ieltsReading, setIeltsReading] = useState("");
  const [ieltsWriting, setIeltsWriting] = useState("");
  const [ieltsSpeaking, setIeltsSpeaking] = useState("");
  const [pteOverall, setPteOverall] = useState("");
  const [pteListening, setPteListening] = useState("");
  const [pteReading, setPteReading] = useState("");
  const [pteWriting, setPteWriting] = useState("");
  const [pteSpeaking, setPteSpeaking] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tableQuery, setTableQuery] = useState("");
  const [tablePage, setTablePage] = useState(1);
  const formRef = useRef<HTMLFormElement>(null);

  const TABLE_PAGE_SIZE = 20;
  const filteredPrograms = useMemo(() => {
    const q = tableQuery.trim().toLowerCase();
    if (!q) return programs;
    return programs.filter((p) =>
      [p.name, p.degree_level?.name, p.subject?.name]
        .filter(Boolean)
        .some((field) => field!.toLowerCase().includes(q)),
    );
  }, [programs, tableQuery]);
  const tableTotalPages = Math.max(1, Math.ceil(filteredPrograms.length / TABLE_PAGE_SIZE));
  const tableCurrentPage = Math.min(tablePage, tableTotalPages);
  const pagedPrograms = filteredPrograms.slice(
    (tableCurrentPage - 1) * TABLE_PAGE_SIZE,
    tableCurrentPage * TABLE_PAGE_SIZE,
  );

  function resetForm() {
    setName("");
    setDegreeLevelId(String(degreeLevels[0]?.id ?? ""));
    setSubjectId("");
    setDurationYears("");
    setTuition("");
    setTuitionDomestic("");
    setTuitionDomesticIsCsp(false);
    setCurrency("");
    setApplicationUrl("");
    setDescription("");
    setAdmissionRequirements("");
    setEnglishRequirements("");
    setIeltsOverall("");
    setIeltsListening("");
    setIeltsReading("");
    setIeltsWriting("");
    setIeltsSpeaking("");
    setPteOverall("");
    setPteListening("");
    setPteReading("");
    setPteWriting("");
    setPteSpeaking("");
    setSourceUrl("");
  }

  function startEdit(p: ProgramRow) {
    setEditingId(p.id);
    setName(p.name);
    setDegreeLevelId(String(p.degree_level_id));
    setSubjectId(p.subject_id ? String(p.subject_id) : "");
    setDurationYears(p.duration_years !== null ? String(p.duration_years) : "");
    setTuition(p.tuition_international !== null ? String(p.tuition_international) : "");
    setTuitionDomestic(p.tuition_domestic !== null ? String(p.tuition_domestic) : "");
    setTuitionDomesticIsCsp(p.tuition_domestic_is_csp ?? false);
    setCurrency(p.currency ?? "");
    setApplicationUrl(p.application_url ?? "");
    setDescription(p.description ?? "");
    setAdmissionRequirements(p.admission_requirements ?? "");
    setEnglishRequirements(p.english_requirements ?? "");
    setIeltsOverall(numToStr(p.ielts_overall));
    setIeltsListening(numToStr(p.ielts_listening));
    setIeltsReading(numToStr(p.ielts_reading));
    setIeltsWriting(numToStr(p.ielts_writing));
    setIeltsSpeaking(numToStr(p.ielts_speaking));
    setPteOverall(numToStr(p.pte_overall));
    setPteListening(numToStr(p.pte_listening));
    setPteReading(numToStr(p.pte_reading));
    setPteWriting(numToStr(p.pte_writing));
    setPteSpeaking(numToStr(p.pte_speaking));
    setSourceUrl(p.source_url ?? "");
    setErrorMsg(null);
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function cancelEdit() {
    setEditingId(null);
    resetForm();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !degreeLevelId) return;
    setSaving(true);
    setErrorMsg(null);
    try {
      const supabase = createClient();
      const degree_level = degreeLevels.find((d) => d.id === Number(degreeLevelId)) ?? null;
      const subject = subjects.find((s) => s.id === Number(subjectId)) ?? null;
      const fields = {
        name: name.trim(),
        degree_level_id: Number(degreeLevelId),
        subject_id: subjectId ? Number(subjectId) : null,
        duration_years: durationYears ? Number(durationYears) : null,
        tuition_international: tuition ? Number(tuition) : null,
        tuition_domestic: tuitionDomestic ? Number(tuitionDomestic) : null,
        tuition_domestic_is_csp: tuitionDomestic ? tuitionDomesticIsCsp : null,
        currency: currency ? currency.toUpperCase() : null,
        application_url: applicationUrl || null,
        description: description || null,
        admission_requirements: admissionRequirements || null,
        english_requirements: englishRequirements || null,
        ielts_overall: strToNum(ieltsOverall),
        ielts_listening: strToNum(ieltsListening),
        ielts_reading: strToNum(ieltsReading),
        ielts_writing: strToNum(ieltsWriting),
        ielts_speaking: strToNum(ieltsSpeaking),
        pte_overall: strToNum(pteOverall),
        pte_listening: strToNum(pteListening),
        pte_reading: strToNum(pteReading),
        pte_writing: strToNum(pteWriting),
        pte_speaking: strToNum(pteSpeaking),
        source_url: sourceUrl || null,
      };

      let id: string;
      if (editingId) {
        id = editingId;
        await updateProgram(supabase, editingId, fields);
        setPrograms((prev) =>
          prev.map((p) =>
            p.id === editingId
              ? { ...p, ...fields, degree_level, subject, updated_at: new Date().toISOString() }
              : p,
          ),
        );
      } else {
        id = await createProgram(supabase, { university_id: universityId, ...fields });
        setPrograms((prev) => [
          ...prev,
          {
            id,
            university_id: universityId,
            ...fields,
            degree_level,
            subject,
            status: "draft",
            last_verified_at: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ]);
      }

      setEditingId(null);
      resetForm();
      try {
        await revalidateProgram(id, universitySlug);
      } catch (revalidateErr) {
        console.error("Failed to revalidate public program page:", revalidateErr);
      }
      router.refresh();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Could not save program");
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
      try {
        await revalidateProgram(programId, universitySlug);
      } catch (revalidateErr) {
        console.error("Failed to revalidate public program page:", revalidateErr);
      }
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
        <>
          {programs.length > TABLE_PAGE_SIZE && (
            <input
              type="search"
              value={tableQuery}
              onChange={(e) => {
                setTableQuery(e.target.value);
                setTablePage(1);
              }}
              placeholder={`Search ${programs.length} programs by name, level, or subject…`}
              className="mb-2 w-full rounded-md border border-ink/20 bg-paper px-3 py-1.5 font-body text-sm text-ink placeholder:text-slate/60 transition-colors duration-150 focus:border-status-open focus:outline-none"
            />
          )}
          <div className="mb-1 overflow-hidden rounded-md border border-ink/15">
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
              {pagedPrograms.map((p) => (
                <tr key={p.id} className="border-b border-ink/10 text-sm last:border-b-0">
                  <td className="px-3 py-2.5 text-ink">{p.name}</td>
                  <td className="px-3 py-2.5 text-slate">{p.degree_level?.name}</td>
                  <td className="px-3 py-2.5 text-slate">{p.subject?.name ?? "—"}</td>
                  <td className="px-3 py-2.5">
                    <ContentStatusBadge status={p.status} />
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => startEdit(p)}
                        className="font-body text-xs text-ink underline underline-offset-2"
                      >
                        Edit
                      </button>
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
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>

          {tableTotalPages > 1 && (
            <div className="mb-4 flex items-center justify-between">
              {tableCurrentPage > 1 ? (
                <button
                  type="button"
                  onClick={() => setTablePage(tableCurrentPage - 1)}
                  className="rounded-md border border-ink/20 px-3 py-1.5 font-body text-sm text-ink transition-colors duration-150 hover:border-status-open"
                >
                  ← Previous
                </button>
              ) : (
                <span />
              )}

              <span className="font-utility text-xs text-slate">
                Page {tableCurrentPage} of {tableTotalPages} ({filteredPrograms.length} programs)
              </span>

              {tableCurrentPage < tableTotalPages ? (
                <button
                  type="button"
                  onClick={() => setTablePage(tableCurrentPage + 1)}
                  className="rounded-md border border-ink/20 px-3 py-1.5 font-body text-sm text-ink transition-colors duration-150 hover:border-status-open"
                >
                  Next →
                </button>
              ) : (
                <span />
              )}
            </div>
          )}
        </>
      )}

      {editingId && (
        <p className="mb-2 font-body text-sm text-ink">
          Editing <strong className="font-semibold">{name}</strong> —{" "}
          <button
            type="button"
            onClick={cancelEdit}
            className="underline underline-offset-2 hover:text-status-closed"
          >
            cancel
          </button>
        </p>
      )}

      <form
        ref={formRef}
        onSubmit={handleSubmit}
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
        <label className="flex items-center gap-2 self-end pb-1.5">
          <input
            type="checkbox"
            checked={tuitionDomesticIsCsp}
            onChange={(e) => setTuitionDomesticIsCsp(e.target.checked)}
            disabled={!tuitionDomestic}
          />
          <span className="font-body text-xs text-slate">
            Domestic fee is a CSP (subsidised, limited) rate
          </span>
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
        <label className="block w-full">
          <span className="mb-1 block font-body text-xs font-semibold tracking-wide text-slate uppercase">
            Description (optional)
          </span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Prose shown on the program's own public page — what it covers, who it's for, notable features"
            rows={3}
            className="w-full rounded-md border border-ink/20 bg-paper px-2 py-1.5 font-body text-sm text-ink placeholder:text-slate/60"
          />
        </label>
        <label className="block w-full">
          <span className="mb-1 block font-body text-xs font-semibold tracking-wide text-slate uppercase">
            Admission requirements (optional)
          </span>
          <input
            value={admissionRequirements}
            onChange={(e) => setAdmissionRequirements(e.target.value)}
            placeholder="e.g. WAM 75% in a cognate bachelor's degree, plus 25 points of maths/statistics"
            className="w-full rounded-md border border-ink/20 bg-paper px-2 py-1.5 font-body text-sm text-ink placeholder:text-slate/60"
          />
        </label>
        <label className="block w-full">
          <span className="mb-1 block font-body text-xs font-semibold tracking-wide text-slate uppercase">
            English requirements (optional)
          </span>
          <input
            value={englishRequirements}
            onChange={(e) => setEnglishRequirements(e.target.value)}
            placeholder="e.g. IELTS 6.5 overall, no band below 6.0"
            className="w-full rounded-md border border-ink/20 bg-paper px-2 py-1.5 font-body text-sm text-ink placeholder:text-slate/60"
          />
        </label>
        <div className="w-full">
          <span className="mb-1 block font-body text-xs font-semibold tracking-wide text-slate uppercase">
            English test override (optional — blank falls back to university default)
          </span>
          <div className="flex flex-wrap gap-2">
            {(
              [
                ["IELTS overall", ieltsOverall, setIeltsOverall],
                ["IELTS listening", ieltsListening, setIeltsListening],
                ["IELTS reading", ieltsReading, setIeltsReading],
                ["IELTS writing", ieltsWriting, setIeltsWriting],
                ["IELTS speaking", ieltsSpeaking, setIeltsSpeaking],
                ["PTE overall", pteOverall, setPteOverall],
                ["PTE listening", pteListening, setPteListening],
                ["PTE reading", pteReading, setPteReading],
                ["PTE writing", pteWriting, setPteWriting],
                ["PTE speaking", pteSpeaking, setPteSpeaking],
              ] as [string, string, (v: string) => void][]
            ).map(([label, value, setValue]) => (
              <label key={label} className="block">
                <span className="mb-1 block font-body text-[10px] font-semibold tracking-wide text-slate uppercase">
                  {label}
                </span>
                <input
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  className="w-20 rounded-md border border-ink/20 bg-paper px-2 py-1.5 font-body text-sm text-ink"
                />
              </label>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-ink px-3 py-1.5 font-body text-sm font-medium text-paper transition-opacity duration-150 hover:opacity-90 disabled:opacity-50"
          >
            {saving ? "Saving…" : editingId ? "Save changes" : "Add program"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={cancelEdit}
              className="rounded-md border border-ink/20 px-3 py-1.5 font-body text-sm text-ink transition-colors duration-150 hover:border-status-closed"
            >
              Cancel
            </button>
          )}
        </div>
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
      try {
        await revalidateUniversity(form.slug, university.slug);
      } catch (revalidateErr) {
        console.error("Failed to revalidate public university page:", revalidateErr);
      }
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
        <div className="max-w-2xl">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Acceptance rate"
              value={form.acceptance_rate}
              onChange={(v) => set("acceptance_rate", v)}
              hint="Percent, e.g. 8.6"
            />
            <Field
              label="GPA requirement (international)"
              value={form.gpa_requirement}
              onChange={(v) => set("gpa_requirement", v)}
            />
            <Field
              label="ATAR requirement (domestic)"
              value={form.atar_requirement}
              onChange={(v) => set("atar_requirement", v)}
              hint="e.g. 70+ — shown to domestic visitors instead of GPA"
            />
            <Field
              label="Required tests"
              value={form.required_tests}
              onChange={(v) => set("required_tests", v)}
              hint="Comma-separated, e.g. SAT, ACT"
            />
          </div>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <div>
              <TextAreaField
                label="Academic requirement (international)"
                value={form.academic_requirement}
                onChange={(v) => set("academic_requirement", v)}
              />
              <p className="mt-1 font-body text-xs text-slate">
                General university-wide academic entry bar for international students
                (e.g. secondary schooling equivalent, minimum ATAR). Not a
                program-specific cutoff — those live under Academic → Admission
                requirements per program. Also used as the domestic fallback below
                when that field is left blank.
              </p>
            </div>
            <div>
              <TextAreaField
                label="Academic requirement (domestic)"
                value={form.academic_requirement_domestic}
                onChange={(v) => set("academic_requirement_domestic", v)}
              />
              <p className="mt-1 font-body text-xs text-slate">
                Overrides the international requirement for domestic visitors (e.g. a
                plain ATAR cutoff). Leave blank to reuse the international text for
                domestic too.
              </p>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="mb-1 font-body text-sm font-semibold text-ink">
              English test scores (default)
            </h3>
            <p className="mb-3 font-body text-xs text-slate">
              Applied to all programs unless a program sets its own override under
              Academic. International students only — hidden on the public site when
              a visitor selects &ldquo;domestic&rdquo;.
            </p>
            <div className="grid gap-4 sm:grid-cols-5">
              <Field
                label="IELTS overall"
                value={form.ielts_overall}
                onChange={(v) => set("ielts_overall", v)}
                hint="e.g. 6.5"
              />
              <Field
                label="IELTS listening"
                value={form.ielts_listening}
                onChange={(v) => set("ielts_listening", v)}
              />
              <Field
                label="IELTS reading"
                value={form.ielts_reading}
                onChange={(v) => set("ielts_reading", v)}
              />
              <Field
                label="IELTS writing"
                value={form.ielts_writing}
                onChange={(v) => set("ielts_writing", v)}
              />
              <Field
                label="IELTS speaking"
                value={form.ielts_speaking}
                onChange={(v) => set("ielts_speaking", v)}
              />
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-5">
              <Field
                label="PTE overall"
                value={form.pte_overall}
                onChange={(v) => set("pte_overall", v)}
                hint="e.g. 58"
              />
              <Field
                label="PTE listening"
                value={form.pte_listening}
                onChange={(v) => set("pte_listening", v)}
              />
              <Field
                label="PTE reading"
                value={form.pte_reading}
                onChange={(v) => set("pte_reading", v)}
              />
              <Field
                label="PTE writing"
                value={form.pte_writing}
                onChange={(v) => set("pte_writing", v)}
              />
              <Field
                label="PTE speaking"
                value={form.pte_speaking}
                onChange={(v) => set("pte_speaking", v)}
              />
            </div>
          </div>
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
          <label className="flex items-center gap-2 self-end pb-1.5">
            <input
              type="checkbox"
              checked={form.tuition_domestic_is_csp}
              onChange={(e) => set("tuition_domestic_is_csp", e.target.checked)}
              disabled={!form.tuition_domestic}
            />
            <span className="font-body text-xs text-slate">
              Domestic fee is a CSP (subsidised, limited) rate
            </span>
          </label>
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
          universitySlug={university.slug}
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
