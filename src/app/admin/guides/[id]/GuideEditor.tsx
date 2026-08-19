"use client";

import { useMemo, useState } from "react";
import { ContentStatusBadge } from "@/components/admin/ContentStatusBadge";
import type { MockGuide } from "@/lib/mock-guides-data";
import type { MockUniversity } from "@/lib/mock-admin-data";

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
}: {
  guide: MockGuide;
  otherGuides: MockGuide[];
  universities: MockUniversity[];
}) {
  const [content, setContent] = useState(guide.content);
  const [showPreview, setShowPreview] = useState(false);
  const [qaFacts, setQaFacts] = useState(guide.qaFactsVerified);
  const [qaSentence, setQaSentence] = useState(guide.qaSentenceVariationChecked);
  const [qaFirsthand, setQaFirsthand] = useState(guide.qaFirsthandDetailAdded);
  const [relatedGuideIds, setRelatedGuideIds] = useState(
    new Set(guide.relatedGuideIds),
  );
  const [relatedUniSlugs, setRelatedUniSlugs] = useState(
    new Set(guide.relatedUniversitySlugs),
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

  function toggleRelatedUni(slug: string) {
    setRelatedUniSlugs((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">
            {guide.title}
          </h1>
          <div className="mt-1 flex items-center gap-2">
            <ContentStatusBadge status={guide.status} />
            <span className="font-utility text-xs text-slate">
              /{guide.slug} · {words} words
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setShowPreview((v) => !v)}
            className="rounded-md border border-ink/20 px-3 py-1.5 font-body text-sm text-ink transition-colors duration-150 hover:border-status-open"
          >
            {showPreview ? "Edit" : "Preview"}
          </button>
          <button
            type="button"
            className="rounded-md border border-ink/20 px-3 py-1.5 font-body text-sm text-ink transition-colors duration-150 hover:border-status-open"
          >
            Save draft
          </button>
          <button
            type="button"
            disabled={!readyToPublish}
            title={
              readyToPublish
                ? undefined
                : "Complete the QA checklist before publishing"
            }
            className="rounded-md bg-status-open px-3 py-1.5 font-body text-sm font-medium text-paper transition-opacity duration-150 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Publish
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
                    checked={relatedUniSlugs.has(u.slug)}
                    onChange={() => toggleRelatedUni(u.slug)}
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
