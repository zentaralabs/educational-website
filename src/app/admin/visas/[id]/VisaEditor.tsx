"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ContentStatusBadge } from "@/components/admin/ContentStatusBadge";
import { logActivity } from "@/lib/queries/activity";
import type { VisaSubclassDetailRow } from "@/lib/queries/visas";
import { updateVisaSubclass } from "@/lib/queries/visas";
import { createClient } from "@/lib/supabase/client";
import type { ContentStatus } from "@/lib/supabase/types";
import { VISA_CATEGORY_ORDER } from "@/lib/visa-categories";
import { revalidateVisa } from "../actions";

const inputCls =
  "w-full rounded-md border border-ink/20 bg-paper px-3 py-1.5 font-body text-sm text-ink focus-visible:border-status-open";
const areaCls =
  "w-full resize-y rounded-md border border-ink/20 bg-paper px-3 py-2 font-utility text-sm text-ink focus-visible:border-status-open";
const labelCls =
  "mb-1 block font-body text-xs font-semibold tracking-wide text-slate uppercase";

export function VisaEditor({ visa }: { visa: VisaSubclassDetailRow }) {
  const router = useRouter();
  const [f, setF] = useState({
    slug: visa.slug,
    code: visa.code,
    name: visa.name,
    category: visa.category,
    stream: visa.stream ?? "",
    short_description: visa.short_description ?? "",
    summary: visa.summary ?? "",
    is_points_tested: visa.is_points_tested,
    min_points: visa.min_points?.toString() ?? "",
    stay_period: visa.stay_period ?? "",
    leads_to_pr: visa.leads_to_pr,
    pr_pathway: visa.pr_pathway ?? "",
    base_application_charge: visa.base_application_charge ?? "",
    processing_time: visa.processing_time ?? "",
    age_limit: visa.age_limit ?? "",
    english_requirement: visa.english_requirement ?? "",
    work_experience_requirement: visa.work_experience_requirement ?? "",
    occupation_list: visa.occupation_list ?? "",
    eligibility: visa.eligibility ?? "",
    conditions: visa.conditions ?? "",
    content: visa.content ?? "",
    source_urls: (visa.source_urls ?? []).join("\n"),
  });
  const [status, setStatus] = useState<ContentStatus>(visa.status);
  const [saving, setSaving] = useState<"draft" | "publish" | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  function set<K extends keyof typeof f>(key: K, value: (typeof f)[K]) {
    setF((prev) => ({ ...prev, [key]: value }));
  }

  async function save(targetStatus: ContentStatus, kind: "draft" | "publish") {
    if (/—/.test(f.summary + f.content + f.eligibility + f.conditions + f.pr_pathway)) {
      setErrorMsg("Remove em dashes before saving (house style).");
      return;
    }
    setSaving(kind);
    setErrorMsg(null);
    setMessage(null);
    try {
      const supabase = createClient();
      await updateVisaSubclass(supabase, visa.id, {
        slug: f.slug,
        code: f.code,
        name: f.name,
        category: f.category,
        stream: f.stream || null,
        short_description: f.short_description || null,
        summary: f.summary || null,
        is_points_tested: f.is_points_tested,
        min_points: f.min_points ? Number(f.min_points) : null,
        stay_period: f.stay_period || null,
        leads_to_pr: f.leads_to_pr,
        pr_pathway: f.pr_pathway || null,
        base_application_charge: f.base_application_charge || null,
        processing_time: f.processing_time || null,
        age_limit: f.age_limit || null,
        english_requirement: f.english_requirement || null,
        work_experience_requirement: f.work_experience_requirement || null,
        occupation_list: f.occupation_list || null,
        eligibility: f.eligibility || null,
        conditions: f.conditions || null,
        content: f.content || null,
        source_urls: f.source_urls
          ? f.source_urls.split("\n").map((s) => s.trim()).filter(Boolean)
          : null,
        status: targetStatus,
        ...(targetStatus === "published"
          ? { last_verified_at: new Date().toISOString().slice(0, 10) }
          : {}),
      });
      const {
        data: { user },
      } = await supabase.auth.getUser();
      await logActivity(supabase, {
        author_id: user?.id ?? null,
        entity_type: "visa",
        entity_id: visa.id,
        action: kind === "publish" ? "status_changed" : "updated",
        detail:
          kind === "publish"
            ? `Published "${f.name}"`
            : `Saved draft: "${f.name}"`,
      });
      await revalidateVisa(f.slug, visa.slug !== f.slug ? visa.slug : undefined);
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
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">
            {f.name}
          </h1>
          <div className="mt-1 flex items-center gap-2">
            <ContentStatusBadge status={status} />
            <span className="font-utility text-xs text-slate">
              subclass {f.code} · /visas/{f.slug}
            </span>
          </div>
        </div>
        <div className="flex flex-shrink-0 items-center gap-2">
          {message && (
            <span className="font-body text-xs text-status-open">{message}</span>
          )}
          {errorMsg && (
            <span className="font-body text-xs text-status-closed">
              {errorMsg}
            </span>
          )}
          <button
            type="button"
            disabled={saving !== null}
            onClick={() => save("draft", "draft")}
            className="rounded-md border border-ink/20 px-3 py-1.5 font-body text-sm text-ink hover:border-status-open disabled:opacity-50"
          >
            {saving === "draft" ? "Saving…" : "Save draft"}
          </button>
          <button
            type="button"
            disabled={saving !== null}
            onClick={() => save("published", "publish")}
            className="rounded-md bg-status-open px-3 py-1.5 font-body text-sm font-medium text-paper hover:opacity-90 disabled:opacity-50"
          >
            {saving === "publish" ? "Publishing…" : "Publish"}
          </button>
        </div>
      </div>

      <div className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
        <label>
          <span className={labelCls}>Name</span>
          <input value={f.name} onChange={(e) => set("name", e.target.value)} className={inputCls} />
        </label>
        <label>
          <span className={labelCls}>Subclass code</span>
          <input value={f.code} onChange={(e) => set("code", e.target.value)} className={`${inputCls} font-utility`} />
        </label>
        <label>
          <span className={labelCls}>Slug</span>
          <input value={f.slug} onChange={(e) => set("slug", e.target.value)} className={`${inputCls} font-utility`} />
        </label>
        <label>
          <span className={labelCls}>Category</span>
          <select value={f.category} onChange={(e) => set("category", e.target.value)} className={inputCls}>
            {VISA_CATEGORY_ORDER.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </label>
        <label>
          <span className={labelCls}>Stream</span>
          <input value={f.stream} onChange={(e) => set("stream", e.target.value)} className={inputCls} />
        </label>
        <label>
          <span className={labelCls}>Stay period</span>
          <input value={f.stay_period} onChange={(e) => set("stay_period", e.target.value)} className={inputCls} />
        </label>
        <label>
          <span className={labelCls}>Base application charge</span>
          <input value={f.base_application_charge} onChange={(e) => set("base_application_charge", e.target.value)} className={inputCls} />
        </label>
        <label>
          <span className={labelCls}>Processing time</span>
          <input value={f.processing_time} onChange={(e) => set("processing_time", e.target.value)} className={inputCls} />
        </label>
        <label>
          <span className={labelCls}>Age limit</span>
          <input value={f.age_limit} onChange={(e) => set("age_limit", e.target.value)} className={inputCls} />
        </label>
        <label>
          <span className={labelCls}>English requirement</span>
          <input value={f.english_requirement} onChange={(e) => set("english_requirement", e.target.value)} className={inputCls} />
        </label>
        <label>
          <span className={labelCls}>Work experience requirement</span>
          <input value={f.work_experience_requirement} onChange={(e) => set("work_experience_requirement", e.target.value)} className={inputCls} />
        </label>
        <label>
          <span className={labelCls}>Occupation list</span>
          <input value={f.occupation_list} onChange={(e) => set("occupation_list", e.target.value)} className={inputCls} />
        </label>
        <label>
          <span className={labelCls}>Min points (if points-tested)</span>
          <input value={f.min_points} onChange={(e) => set("min_points", e.target.value)} className={`${inputCls} font-utility`} inputMode="numeric" />
        </label>
        <div className="flex items-end gap-6 pb-1.5">
          <label className="flex items-center gap-2 font-body text-sm text-ink">
            <input type="checkbox" checked={f.is_points_tested} onChange={(e) => set("is_points_tested", e.target.checked)} />
            Points tested
          </label>
          <label className="flex items-center gap-2 font-body text-sm text-ink">
            <input type="checkbox" checked={f.leads_to_pr} onChange={(e) => set("leads_to_pr", e.target.checked)} />
            Leads to PR
          </label>
        </div>
      </div>

      <div className="mt-6 grid gap-4">
        <label>
          <span className={labelCls}>Short description (cards + meta)</span>
          <textarea value={f.short_description} onChange={(e) => set("short_description", e.target.value)} rows={2} className={areaCls.replace("font-utility", "font-body")} />
        </label>
        <label>
          <span className={labelCls}>Summary (answer-first opening)</span>
          <textarea value={f.summary} onChange={(e) => set("summary", e.target.value)} rows={4} className={areaCls.replace("font-utility", "font-body")} />
        </label>
        <label>
          <span className={labelCls}>PR pathway (prose)</span>
          <textarea value={f.pr_pathway} onChange={(e) => set("pr_pathway", e.target.value)} rows={3} className={areaCls.replace("font-utility", "font-body")} />
        </label>
        <label>
          <span className={labelCls}>Who it&rsquo;s for / eligibility (markdown)</span>
          <textarea value={f.eligibility} onChange={(e) => set("eligibility", e.target.value)} rows={8} className={areaCls} />
        </label>
        <label>
          <span className={labelCls}>Full explainer content (markdown)</span>
          <textarea value={f.content} onChange={(e) => set("content", e.target.value)} rows={16} className={areaCls} />
        </label>
        <label>
          <span className={labelCls}>Visa conditions (markdown)</span>
          <textarea value={f.conditions} onChange={(e) => set("conditions", e.target.value)} rows={6} className={areaCls} />
        </label>
        <label>
          <span className={labelCls}>Source URLs (one per line)</span>
          <textarea value={f.source_urls} onChange={(e) => set("source_urls", e.target.value)} rows={3} className={areaCls} />
        </label>
      </div>
    </div>
  );
}
