import type { FaqItem } from "@/lib/faq";

/**
 * Per-intake deadline hubs (/deadlines/{slug}). Each hub is an editorial
 * landing page that wraps the live per-university deadline table for one
 * intake: a "when to start" timeline, the February-versus-July decision,
 * a dated "what changed" log, and an FAQ. The master table itself is
 * queried live (listIntakeDeadlines) so it stays accurate; only the
 * surrounding copy lives here.
 *
 * Cloning for a future intake: copy an entry, change `slug`, `intakeName`,
 * `startWindow`, `deadlineTypes` stays ["Semester 1"] for a February intake
 * or ["Semester 2"] for a July one, rewrite the timeline dates, and point
 * `altIntake` at the sibling. Then add the slug to the sitemap.
 */

export type IntakeTimelineStep = {
  when: string;
  step: string;
  detail: string;
};

export type IntakeChangeLogEntry = {
  date: string;
  note: string;
};

export type IntakeHub = {
  slug: string;
  /** How the intake is written in prose, e.g. "February 2027". */
  intakeName: string;
  /** The deadline_type names whose rows belong to this intake. */
  deadlineTypes: string[];
  /** When courses in this intake actually start. */
  startWindow: string;
  /** The sibling intake for the "is this the right intake" section. */
  altIntake: { slug: string | null; name: string };
  metaTitle: string;
  metaDescription: string;
  intro: string[];
  /** The February-versus-July (or equivalent) decision framing. */
  decision: string[];
  timeline: IntakeTimelineStep[];
  /** Reverse-chronological; the newest entry is the most load-bearing. */
  whatChanged: IntakeChangeLogEntry[];
  faq: FaqItem[];
  sources: string[];
  lastVerified: string;
};

const FEBRUARY_2027: IntakeHub = {
  slug: "february-2027-intake",
  intakeName: "February 2027",
  deadlineTypes: ["Semester 1"],
  startWindow: "late February or early March 2027",
  altIntake: { slug: null, name: "July 2027" },
  metaTitle: "February 2027 Intake Deadlines for Australian Universities",
  metaDescription:
    "Application dates for every Australian university's February 2027 intake, undergraduate and postgraduate, with the date each figure was last checked against the university's own admissions page.",
  intro: [
    "Australian universities do not all publish a single application deadline the way universities in the United States or United Kingdom do. Semester 1 courses start in late February or early March 2027. A few universities, including the University of Sydney and the Australian National University, set a firm international closing date in December 2026. Most others assess applications as they arrive and simply close a course once it is full, so the useful date is the point past which a place, a scholarship, or a visa processed in time all become unlikely.",
    "The table below is built from our deadline dataset and shows, per university and study level, either the firm date or the recommended apply-by date, with the day each row was last checked against the university's own key-dates page. For a February start, aim to have applications in by the end of 2026 at the latest, and earlier for postgraduate coursework, medicine, law, and portfolio-based courses, which all close sooner.",
  ],
  decision: [
    "February (Semester 1) is the larger of the two intakes. Almost every course runs in it, scholarship rounds are fuller, and the academic year runs in step with the standard progression, so you are not joining a course mid-sequence. The trade-off is timing: to start in February 2027 you are applying, accepting, and lodging a student visa across the last quarter of 2026 and into January 2027, which is tight if you still need to sit an English test or assemble financial evidence.",
    "July (Semester 2) is the fallback and a sensible target in its own right. Fewer courses take a mid-year intake, and some structured programs only start in February, but the extra five to six months is often the difference between a rushed application and a strong one. If a February start means cutting corners on the Genuine Student statement or showing funds that only just appeared, a July start is usually the better decision.",
  ],
  timeline: [
    {
      when: "By September 2026",
      step: "Shortlist courses and sit your English test",
      detail:
        "Confirm each course is open to international students for Semester 1 2027 and is CRICOS registered. Book IELTS or PTE early; results can take up to two weeks and you may need to resit.",
    },
    {
      when: "September to December 2026",
      step: "Submit applications",
      detail:
        "Apply before any firm closing date, and as early as you can where admission is rolling. Postgraduate coursework and competitive courses close first. Applying to several universities at once is normal.",
    },
    {
      when: "October 2026 to January 2027",
      step: "Compare offers, accept, pay the deposit",
      detail:
        "Offers arrive on a rolling basis. Read the conditions, fees, and any scholarship before you accept. Accepting and paying the tuition deposit is what triggers your Confirmation of Enrolment.",
    },
    {
      when: "November 2026 to January 2027",
      step: "Lodge your student visa (subclass 500)",
      detail:
        "Lodge as soon as you hold the Confirmation of Enrolment. Which university you apply to now sets how fast processing starts, and offshore refusal rates are elevated, so an early, well-evidenced application matters more than usual.",
    },
    {
      when: "December 2026 to February 2027",
      step: "Arrange OSHC, money, flights and housing",
      detail:
        "Buy Overseas Student Health Cover for the full visa period, plan the transfer of tuition and living funds, and book temporary accommodation for your first week or two rather than committing to a lease unseen.",
    },
    {
      when: "Late February 2027",
      step: "Semester 1 starts",
      detail:
        "Attend orientation, complete enrolment, and give your university a residential address within seven days of arriving, which is a student visa condition.",
    },
  ],
  whatChanged: [
    {
      date: "3 September 2026",
      note: "Page published. Deadline rows in the table below carry their own last-checked date; this log tracks changes to the guidance around them.",
    },
    {
      date: "February 2026",
      note: "The offshore refusal rate for higher education student visa applications reached about 32.5 percent, the highest monthly level in roughly two decades. Build in more time and a stronger evidence file for a February 2027 lodgement.",
    },
    {
      date: "January 2026",
      note: "India, Nepal, Bangladesh, and Bhutan were moved to student-visa Evidence Level 3, the highest tier, meaning more documentation upfront and generally slower processing.",
    },
    {
      date: "14 November 2025",
      note: "Ministerial Direction 115 replaced MD 111 and added a third processing tier for offshore student visas. The university you apply to now decides whether processing starts in weeks or months.",
    },
  ],
  faq: [
    {
      q: "Can I still apply for the February 2027 intake?",
      a: "Usually yes, if you are reading this in 2026. Universities that assess applications on a rolling basis keep taking them until a course fills, and some hold late offer rounds into January. What you cannot recover is time: a February start needs the offer, the deposit, the Confirmation of Enrolment, and the student visa all done by late January or early February 2027. If that looks unrealistic, target July 2027 instead.",
    },
    {
      q: "Is the February or July intake better for international students?",
      a: "February is the main intake, with the widest choice of courses and fuller scholarship rounds, and it keeps you in step with the standard academic year. July is smaller but gives you more time to prepare a strong application and student visa. If a February start would force a rushed Genuine Student statement or thin financial evidence, July is the better choice.",
    },
    {
      q: "When should I lodge my student visa for a February 2027 start?",
      a: "As soon as you have your Confirmation of Enrolment, which usually means November 2026 to January 2027. Processing times vary with your country's evidence level and the university's processing tier under Ministerial Direction 115, and offshore refusal rates are high, so lodging early with complete financial and Genuine Student evidence gives you the best chance of a decision before the semester starts.",
    },
    {
      q: "Do all Australian universities have a fixed application deadline?",
      a: "No. A minority, such as the University of Sydney, ANU, and the University of Melbourne for undergraduate entry, publish a firm international closing date. Most others assess applications as they come in and close individual courses once they are full. For those, the date shown is a recommended apply-by point, typically three to four months before the intake.",
    },
    {
      q: "What is a Confirmation of Enrolment and when do I get one?",
      a: "A Confirmation of Enrolment, or CoE, is the electronic document a university issues once you have accepted your offer and paid the required tuition deposit. You cannot lodge a student visa without it. For a February intake, most students receive their CoE between November 2026 and January 2027.",
    },
    {
      q: "Are scholarship deadlines the same as the application deadline?",
      a: "Not always. Many merit scholarships are assessed automatically from your admission application, so the application deadline is the effective one. Others need a separate form with its own, usually earlier, closing date. Check the scholarship page for each award you are targeting.",
    },
    {
      q: "How early can I apply for the February 2027 intake?",
      a: "Most universities open Semester 1 2027 applications around a year ahead, so from roughly early to mid 2026. Applying early is an advantage where admission is rolling, both for your place and for scholarship consideration, as long as your application and documents are complete.",
    },
  ],
  sources: [
    "https://www.studyaustralia.gov.au/en/plan-your-studies/how-to-apply-to-study-in-australia",
    "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/student-500",
    "https://immi.homeaffairs.gov.au/what-we-do/migration-program-planning-levels/student-visa-processing",
  ],
  lastVerified: "2026-09-03",
};

export const INTAKE_HUBS: IntakeHub[] = [FEBRUARY_2027];

export const INTAKE_HUB_SLUGS = INTAKE_HUBS.map((h) => h.slug);

export function getIntakeHub(slug: string): IntakeHub | undefined {
  return INTAKE_HUBS.find((h) => h.slug === slug);
}
