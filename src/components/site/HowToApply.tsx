import { GuideContent } from "@/components/site/GuideContent";
import { OutboundLink } from "@/components/site/OutboundLink";

const GENERIC_STEPS = [
  "Pick your course and check it is open to international students for your intended intake.",
  "Check the entry requirements for that specific course: academic background, minimum GPA or ATAR, subject prerequisites, and the English test score it accepts.",
  "Prepare your documents: academic transcripts and completion certificates, your English test result (IELTS, PTE, or TOEFL), passport, CV, and a statement of purpose if the course asks for one.",
  "Apply online through the university's application portal, or through an authorised education agent in your country. Both routes reach the same admissions team.",
  "Pay the application fee if the course charges one. Many Australian universities do not.",
  "Wait for the outcome. You may receive a full offer, a conditional offer (for example, subject to final results or an English score), or a rejection.",
  "Accept your offer and pay the tuition deposit. The university then issues a Confirmation of Enrolment (CoE).",
  "Use the CoE to apply for a Student visa (subclass 500), arrange Overseas Student Health Cover, and book travel.",
];

/**
 * Renders a university's own how-to-apply markdown when it has one, otherwise
 * the generic Australian direct-application flow. `applyUrl` is surfaced as
 * the call to action either way.
 */
export function HowToApply({
  markdown,
  applyUrl,
  universityName,
}: {
  markdown: string | null;
  applyUrl: string | null;
  universityName: string;
}) {
  return (
    <div>
      {markdown ? (
        <GuideContent content={markdown} />
      ) : (
        <ol className="ml-4 list-decimal space-y-2 font-body text-base leading-relaxed text-ink marker:font-utility marker:text-slate">
          {GENERIC_STEPS.map((step) => (
            <li key={step} className="pl-1.5">
              {step}
            </li>
          ))}
        </ol>
      )}

      {applyUrl && (
        <OutboundLink
          event="apply_click"
          eventParams={{ university: universityName, location: "how_to_apply" }}
          href={applyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-ink px-5 py-2.5 font-body text-sm font-medium text-paper shadow-md shadow-ink/10 transition-all duration-150 hover:-translate-y-0.5 hover:shadow-lg"
        >
          Start your application at {universityName} ↗
        </OutboundLink>
      )}

      <p className="mt-4 font-body text-xs text-slate">
        Requirements and steps can vary by course. Always confirm the process for
        your specific program on the university&rsquo;s official website before
        applying.
      </p>
    </div>
  );
}
