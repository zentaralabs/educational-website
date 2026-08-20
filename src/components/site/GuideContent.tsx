import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function GuideContent({ content }: { content: string }) {
  return (
    <div className="prose-guide font-body text-base leading-relaxed text-ink">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
}
