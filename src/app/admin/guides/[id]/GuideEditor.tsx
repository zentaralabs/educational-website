"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ContentStatusBadge } from "@/components/admin/ContentStatusBadge";
import type { GuideDetailRow, GuideListRow } from "@/lib/queries/guides";
import {
  syncGuideRelatedGuides,
  syncGuideRelatedUniversities,
  updateGuide,
} from "@/lib/queries/guides";
import type { UniversityListRow } from "@/lib/queries/universities";
import { logActivity } from "@/lib/queries/activity";
import { createClient } from "@/lib/supabase/client";
import type { ContentStatus } from "@/lib/supabase/types";

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// Minimal markdown-to-HTML for the admin preview pane — headers and
// paragraphs only. Not the public-facing renderer.
function renderMarkdownPreview(md: string): string {
  const lines = md.split("\n");
  const html: string[] = [];
  let paragraph: string[] = [];

  function flush() {
    if (paragraph.length) {
      html.push(`<p>${paragraph.join(" ")}</p>`);
      paragraph = [];
    }
  }

  for (const line of lines) {
    const h = line.match(/^(#{1,3})\s+(.*)/);
    if (h) {
      flush();
      const level = h[1].length;
      html.push(`<h${level}>${escapeHtml(h[2])}</h${level}>`);
    } else if (line.trim() === "") {
      flush();
    } else {
      paragraph.push(escapeHtml(line));
    }
  }
  flush();
  return html.join("\n");
}

function QaItem({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-start gap-2 font-body text-sm text-ink">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5"
      />
      {label}
    </label>
  );
}

export function GuideEditor({
  guide,
  otherGuides,
  universities,
  relatedLinks,
}: {
  guide: GuideDetailRow;
  otherGuides: GuideListRow[];
  universities: UniversityListRow[];
  relatedLinks: { relatedGuideIds: string[]; relatedUniversityIds: string[] };
}) {
  const router = useRouter();
  const [content, setContent] = useState(guide.content);
  const [showPreview, setShowPreview] = useState(false);
  const [qaFacts, setQaFacts] = useState(guide.qa_facts_verified);
  const [qaSentence, setQaSentence] = useState(guide.qa_sentence_variation_checked);
  const [qaFirsthand, setQaFirsthand] = useState(guide.qa_firsthand_detail_added);
  const [status, setStatus] = useState<ContentStatus>(guide.status);
  const [saving, setSaving] = useState<"draft" | "publish" | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [relatedGuideIds, setRelatedGuideIds] = useState(
    new Set(relatedLinks.relatedGuideIds),
  );
  const [relatedUniIds, setRelatedUniIds] = useState(
    new Set(relatedLinks.relatedUniversityIds),
  );

  const words = useMemo(() => wordCount(content), [content]);
  const previewHtml = useMemo(() => renderMarkdownPreview(content), [content]);
  const qaDone = Number(qaFacts) + Number(qaSentence) + Number(qaFirsthand);
  const readyToPublish = qaDone === 3;

  function toggleRelatedGuide(id: string) {
    setRelatedGuideIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleRelatedUni(id: string) {
    setRelatedUniIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function save(targetStatus: ContentStatus, kind: "draft" | "publish") {
    setSaving(kind);
    setErrorMsg(null);
    setMessage(null);
    try {
      const supabase = createClient();
      await updateGuide(supabase, guide.id, {
        content,
        word_count: words,
        qa_facts_verified: qaFacts,
        qa_sentence_variation_checked: qaSentence,
        qa_firsthand_detail_added: qaFirsthand,
        status: targetStatus,
        ...(targetStatus === "published"
          ? { last_verified_at: new Date().toISOString().slice(0, 10) }
          : {}),
      });
      await Promise.all([
        syncGuideRelatedGuides(supabase, guide.id, Array.from(relatedGuideIds)),
        syncGuideRelatedUniversities(supabase, guide.id, Array.from(relatedUniIds)),
      ]);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      await logActivity(supabase, {
        author_id: user?.id ?? null,
        entity_type: "guide",
        entity_id: guide.id,
        action: kind === "publish" ? "status_changed" : "updated",
        detail:
          kind === "publish"
            ? `Published "${guide.title}"`
            : `Saved draft: "${guide.title}"`,
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
            {guide.title}
          </h1>
          <div className="mt-1 flex items-center gap-2">
            <ContentStatusBadge status={status} />
            <span className="font-utility text-xs text-slate">
              /{guide.slug} · {words} words
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
            onClick={() => setShowPreview((v) => !v)}
            className="rounded-md border border-ink/20 px-3 py-1.5 font-body text-sm text-ink transition-colors duration-150 hover:border-status-open"
          >
            {showPreview ? "Edit" : "Preview"}
          </button>
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
            disabled={!readyToPublish || saving !== null}
            title={
              readyToPublish
                ? undefined
                : "Complete the QA checklist before publishing"
            }
            onClick={() => save("published", "publish")}
            className="rounded-md bg-status-open px-3 py-1.5 font-body text-sm font-medium text-paper transition-opacity duration-150 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {saving === "publish" ? "Publishing…" : "Publish"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_280px]">
        <div>
          {showPreview ? (
            <div
              className="min-h-96 rounded-md border border-ink/15 bg-paper px-5 py-4 font-body text-sm text-ink [&_h1]:font-display [&_h1]:text-2xl [&_h1]:font-semibold [&_h2]:mt-4 [&_h2]:font-display [&_h2]:text-lg [&_h2]:font-semibold [&_p]:mt-2 [&_p]:leading-relaxed"
              dangerouslySetInnerHTML={{ __html: previewHtml }}
            />
          ) : (
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={24}
              className="w-full resize-y rounded-md border border-ink/20 bg-paper px-4 py-3 font-utility text-sm text-ink focus-visible:border-status-open"
            />
          )}
        </div>

        <aside className="flex flex-col gap-6">
          <div className="rounded-md border border-ink/15 p-4">
            <h2 className="mb-3 font-body text-xs font-semibold tracking-wide text-slate uppercase">
              QA checklist
            </h2>
            <div className="flex flex-col gap-2.5">
              <QaItem
                label="Facts verified against source"
                checked={qaFacts}
                onChange={setQaFacts}
              />
              <QaItem
                label="Sentence variation checked"
                checked={qaSentence}
                onChange={setQaSentence}
              />
              <QaItem
                label="First-hand detail added"
                checked={qaFirsthand}
                onChange={setQaFirsthand}
              />
            </div>
            <p className="mt-3 font-body text-xs text-slate">
              {qaDone}/3 complete
              {!readyToPublish && " — required before publishing"}
            </p>
          </div>

          <div className="rounded-md border border-ink/15 p-4">
            <h2 className="mb-3 font-body text-xs font-semibold tracking-wide text-slate uppercase">
              Related guides
            </h2>
            <div className="flex flex-col gap-2">
              {otherGuides.map((g) => (
                <label
                  key={g.id}
                  className="flex items-start gap-2 font-body text-sm text-ink"
                >
                  <input
                    type="checkbox"
                    checked={relatedGuideIds.has(g.id)}
                    onChange={() => toggleRelatedGuide(g.id)}
                    className="mt-0.5"
                  />
                  {g.title}
                </label>
              ))}
            </div>
          </div>

          <div className="rounded-md border border-ink/15 p-4">
            <h2 className="mb-3 font-body text-xs font-semibold tracking-wide text-slate uppercase">
              Related universities
            </h2>
            <div className="flex flex-col gap-2">
              {universities.map((u) => (
                <label
                  key={u.id}
                  className="flex items-start gap-2 font-body text-sm text-ink"
                >
                  <input
                    type="checkbox"
                    checked={relatedUniIds.has(u.id)}
                    onChange={() => toggleRelatedUni(u.id)}
                    className="mt-0.5"
                  />
                  {u.name}
                </label>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
