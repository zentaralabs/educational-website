import { GO8_SLUGS, isRegionalCity } from "@/lib/australia";
import { formatCurrency } from "@/lib/format";

export type FaqItem = { q: string; a: string };

/** schema.org FAQPage block for a set of FAQ items. */
export function faqJsonLd(items: FaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

// ---------------------------------------------------------------------------
// University FAQ — built entirely from the profile's own data so every one of
// the 56 pages gets an accurate, specific "people also ask" block with no
// hand-written content.
// ---------------------------------------------------------------------------

type UniFaqInput = {
  name: string;
  slug: string;
  city: string | null;
  application_fee: number | null;
  ielts_overall: number | string | null;
  pte_overall: number | string | null;
  acceptance_rate: number | string | null;
  apply_url: string | null;
  website_url: string | null;
  intakeTypes: string[]; // deadline_type names present, e.g. ["Semester 1", "Semester 2"]
  budgetLow: number | null;
  budgetHigh: number | null;
  minTuition: number | null;
  livingCost: number;
};

export function universityFaq(u: UniFaqInput): FaqItem[] {
  const items: FaqItem[] = [];
  const cityShort = u.city?.split(",")[0] ?? "this location";

  if (u.application_fee != null) {
    items.push({
      q: `Does ${u.name} charge an application fee for international students?`,
      a:
        u.application_fee === 0
          ? `No. ${u.name} does not charge international students an application fee when you apply directly or through an authorised agent. Third-party application platforms may add their own service fee.`
          : `${u.name} lists an application fee of about ${formatCurrency(u.application_fee, "AUD")} for direct international applications. Several universities that charge a fee waive it for applications lodged through an authorised agent, so check before you pay.`,
    });
  }

  if (u.ielts_overall != null) {
    const score = Number(u.ielts_overall);
    const pte = u.pte_overall != null ? Number(u.pte_overall) : null;
    items.push({
      q: `What English test score do I need to get into ${u.name}?`,
      a: `The institutional minimum for undergraduate entry at ${u.name} is IELTS ${score} overall${
        pte != null ? `, or PTE Academic ${pte}` : ""
      }. This is a floor, not a guarantee: nursing programs usually need IELTS 7.0, teaching 7.5, and medicine, law, and business often 7.0. Postgraduate coursework is typically 6.5. Always check the score for your specific course.`,
    });
  }

  if (u.budgetLow != null && u.budgetHigh != null) {
    items.push({
      q: `How much does it cost to study at ${u.name} for a year?`,
      a: `As an international student, budget roughly ${formatCurrency(u.budgetLow, "AUD")} to ${formatCurrency(u.budgetHigh, "AUD")} for your first year. That is tuition${u.minTuition != null ? ` from about ${formatCurrency(u.minTuition, "AUD")}` : ""}, around ${formatCurrency(u.livingCost, "AUD")} in living costs for ${cityShort}, plus roughly ${formatCurrency(4000, "AUD")} in one-off setup costs. Tuition varies widely by course.`,
    });
  }

  items.push({
    q: `Is ${u.name} a Group of Eight university?`,
    a: GO8_SLUGS.has(u.slug)
      ? `Yes. ${u.name} is one of the eight members of the Group of Eight, Australia's research-intensive university alliance. That means higher rankings and research funding, and also the most selective admissions and the highest tuition band.`
      : `No. ${u.name} is not a member of the Group of Eight (Australia's eight research-intensive universities: ANU, Melbourne, Sydney, UNSW, Queensland, Monash, Western Australia, and Adelaide). Many fields are taught just as well outside the Go8 for lower fees.`,
  });

  if (u.intakeTypes.length > 0) {
    const hasTri = u.intakeTypes.some((t) => t.startsWith("Trimester"));
    items.push({
      q: `When can I start studying at ${u.name}?`,
      a: hasTri
        ? `${u.name} runs three intakes a year rather than the usual two, so you can start sooner and, on an accelerated calendar, finish faster. Recommended international application dates fall a few months before each intake.`
        : `${u.name} has two main intakes a year: Semester 1, starting in February or March, and Semester 2, starting in July. The recommended time to apply is about three to four months before the intake, and postgraduate and competitive courses close earlier.`,
    });
  }

  if (u.city) {
    items.push({
      q: `Is ${u.name} in a regional area for skilled migration?`,
      a: isRegionalCity(u.city)
        ? `Yes. ${cityShort} is a designated regional area for skilled migration, so studying at ${u.name} earns 5 extra points on the skilled points test and opens the Skilled Work Regional (491) visa. Living costs are also usually below Sydney and Melbourne.`
        : `No. ${u.name}'s main campus is in a major metropolitan area, so it does not attract the regional study points. If regional migration points matter to you, look at universities in Perth, Adelaide, Canberra, Hobart, or the smaller cities.`,
    });
  }

  const applyLink = u.apply_url ?? u.website_url;
  items.push({
    q: `How do I apply to ${u.name} as an international student?`,
    a: `Choose your course and confirm it is open to international students for your intake, check the entry requirements and English score, then apply online${applyLink ? " through the university's admissions portal" : ""} or through an authorised agent in your country. After an offer you accept, pay the deposit, receive a Confirmation of Enrolment, and use it to apply for a Student visa (subclass 500).`,
  });

  return items;
}

// ---------------------------------------------------------------------------
// Visa FAQ
// ---------------------------------------------------------------------------

type VisaFaqInput = {
  name: string;
  code: string;
  base_application_charge: string | null;
  processing_time: string | null;
  age_limit: string | null;
  leads_to_pr: boolean;
  pr_pathway: string | null;
  is_points_tested: boolean;
  min_points: number | null;
  stay_period: string | null;
};

export function visaFaq(v: VisaFaqInput): FaqItem[] {
  const items: FaqItem[] = [];
  const label = `${v.name} (subclass ${v.code})`;

  if (v.base_application_charge) {
    items.push({
      q: `How much does the subclass ${v.code} visa cost?`,
      a: `The base application charge for the ${label} is ${v.base_application_charge}. Family members you include each pay an additional charge, and there are separate costs for health checks, police certificates, and skills assessments.`,
    });
  }
  if (v.processing_time) {
    items.push({
      q: `How long does the subclass ${v.code} visa take to process?`,
      a: `The ${label} is generally processed in ${v.processing_time}. Times vary with your occupation, how complete your application is, and demand at the time.`,
    });
  }
  items.push({
    q: `Does the subclass ${v.code} visa lead to permanent residence?`,
    a: v.leads_to_pr
      ? v.pr_pathway ?? `Yes. The ${label} is a permanent visa or a direct pathway to one.`
      : `No. The ${label} is a temporary visa. Some holders move onto a skilled or employer-sponsored visa afterward, but the ${v.code} itself gives no permanent residence entitlement.`,
  });
  if (v.age_limit) {
    items.push({
      q: `What is the age limit for the subclass ${v.code} visa?`,
      a: `${v.age_limit}. Age is assessed at a specific point in the process, usually the date of invitation or application, so check exactly when before you plan around it.`,
    });
  }
  if (v.is_points_tested) {
    items.push({
      q: `How many points do I need for the subclass ${v.code} visa?`,
      a: `You need at least 65 points to submit an Expression of Interest, but 65 rarely gets an invitation. Recent rounds have invited trades occupations near 65, most professional occupations from about 75, and ICT and accounting from 90 or higher. Work out your score with our points calculator.`,
    });
  }
  if (v.stay_period) {
    items.push({
      q: `How long can I stay on the subclass ${v.code} visa?`,
      a: `${v.stay_period}.`,
    });
  }
  return items;
}

// ---------------------------------------------------------------------------
// Scholarship FAQ
// ---------------------------------------------------------------------------

type SchFaqInput = {
  name: string;
  amount: string | null;
  separate_application: boolean | null;
  study_level: string | null;
  deadline_date: string | null;
};

// Eligibility is deliberately not repeated here: the scholarship page
// already shows it as its own section.
export function scholarshipFaq(s: SchFaqInput): FaqItem[] {
  const items: FaqItem[] = [];
  if (s.amount) {
    items.push({
      q: `How much is the ${s.name} worth?`,
      a: `${s.amount}. Amounts and eligibility bands are reviewed every year, so confirm the current value on the official scholarship page before you rely on it.`,
    });
  }
  if (s.separate_application != null) {
    items.push({
      q: `Do I need a separate application for the ${s.name}?`,
      a: s.separate_application
        ? `Yes. The ${s.name} needs its own application, usually after you have an offer of admission, and sometimes a written statement or interview.`
        : `No. The ${s.name} is applied automatically based on the academic merit of your admission application. There is no separate form.`,
    });
  }
  if (s.study_level && s.study_level !== "Any") {
    items.push({
      q: `Is the ${s.name} for undergraduate or postgraduate study?`,
      a: `The ${s.name} is for ${s.study_level.toLowerCase()} study.`,
    });
  }
  if (s.deadline_date) {
    items.push({
      q: `When is the deadline for the ${s.name}?`,
      a: `The recorded deadline is ${new Date(s.deadline_date).toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" })}. Deadlines change each intake, so confirm on the official page.`,
    });
  }
  return items;
}
