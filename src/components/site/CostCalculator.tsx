"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { trackEvent } from "@/lib/analytics";
import { CITY_COSTS } from "@/lib/cities";
import { formatCurrency } from "@/lib/format";

export type CalcUniversity = { slug: string; name: string; minTuition: number | null };

const FINANCIAL_CAPACITY_12MO = 29_710; // Home Affairs, primary applicant
const VISA_FEE = 2_500; // subclass 500
const PARTNER_12MO = 10_394;
const CHILD_12MO = 4_449;
const SETUP_ONE_OFF = 1_500; // deposit, bond top-up, first-weeks buffer, basics

// Rough return economy airfare to Australia, AUD. Wide ranges in reality.
const FLIGHTS: Record<string, { label: string; cost: number }> = {
  se_asia: { label: "Southeast Asia / China", cost: 1_000 },
  south_asia: { label: "South Asia (India, Nepal, Pakistan, Bangladesh, Sri Lanka)", cost: 1_200 },
  middle_east: { label: "Middle East", cost: 1_400 },
  europe: { label: "Europe / UK", cost: 1_600 },
  africa: { label: "Africa", cost: 1_800 },
  americas: { label: "North or South America", cost: 2_000 },
  other: { label: "Somewhere else", cost: 1_500 },
};

// Annual single-student OSHC, and the multiplier for partner / family. Rough.
const OSHC_SINGLE = 650;
const OSHC_COUPLE = 3_200;
const OSHC_FAMILY = 4_700;

type AccomKey = "shared" | "studio" | "oncampus";
const ACCOM: { key: AccomKey; label: string }[] = [
  { key: "shared", label: "Room in a shared house" },
  { key: "studio", label: "Studio or one-bedroom" },
  { key: "oncampus", label: "On-campus / student accommodation" },
];

const REGIONAL = {
  slug: "regional",
  name: "A regional city or town",
  rentSharedLow: 180,
  rentSharedHigh: 300,
  rentStudioLow: 320,
  rentStudioHigh: 480,
  food: 110,
  transport: 30,
  utilities: 35,
  phoneInternet: 15,
  entertainment: 60,
};

const CITIES = [
  ...CITY_COSTS.map((c) => ({
    slug: c.slug,
    name: c.name,
    rentSharedLow: c.rentSharedLow,
    rentSharedHigh: c.rentSharedHigh,
    rentStudioLow: c.rentStudioLow,
    rentStudioHigh: c.rentStudioHigh,
    food: c.food,
    transport: c.transport,
    utilities: c.utilities,
    phoneInternet: c.phoneInternet,
    entertainment: c.entertainment,
  })),
  REGIONAL,
];

const YEARS = [1, 1.5, 2, 3, 4];

const selectCls =
  "w-full rounded-lg border border-line bg-paper px-3 py-2 font-body text-sm text-ink outline-none focus:border-status-open/50";
const labelCls =
  "font-body text-xs font-semibold tracking-wide text-slate uppercase";

export function CostCalculator({
  universities,
}: {
  universities: CalcUniversity[];
}) {
  const withTuition = universities.filter((u) => u.minTuition != null);

  const [uniSlug, setUniSlug] = useState("");
  const [tuition, setTuition] = useState(38_000);
  const [citySlug, setCitySlug] = useState("melbourne");
  const [accom, setAccom] = useState<AccomKey>("shared");
  const [years, setYears] = useState(2);
  const [partner, setPartner] = useState(false);
  const [children, setChildren] = useState(0);
  const [region, setRegion] = useState("south_asia");

  const city = CITIES.find((c) => c.slug === citySlug) ?? CITIES[0];

  // Report the first field change only, so the event counts real engagement
  // rather than every keystroke.
  const usedRef = useRef(false);
  const markUsed = () => {
    if (usedRef.current) return;
    usedRef.current = true;
    trackEvent("calculator_used", { calculator: "cost" });
  };

  function onUniChange(slug: string) {
    setUniSlug(slug);
    const u = withTuition.find((x) => x.slug === slug);
    if (u?.minTuition != null) setTuition(u.minTuition);
  }

  const result = useMemo(() => {
    // Weekly rent midpoint for the chosen accommodation.
    let weeklyRent: number;
    if (accom === "studio") {
      weeklyRent = (city.rentStudioLow + city.rentStudioHigh) / 2;
    } else if (accom === "oncampus") {
      weeklyRent =
        (city.rentSharedHigh + (city.rentStudioLow + city.rentStudioHigh) / 2) / 2;
    } else {
      weeklyRent = (city.rentSharedLow + city.rentSharedHigh) / 2;
    }

    const weeklyLiving =
      weeklyRent +
      city.food +
      city.transport +
      city.utilities +
      city.phoneInternet +
      city.entertainment;
    const annualLiving = Math.round(weeklyLiving * 52);

    const oshcAnnual = children > 0 ? OSHC_FAMILY : partner ? OSHC_COUPLE : OSHC_SINGLE;
    const flights = FLIGHTS[region]?.cost ?? FLIGHTS.other.cost;

    const oneOff = VISA_FEE + flights + SETUP_ONE_OFF;

    const yearOne =
      Math.round(tuition) + annualLiving + oshcAnnual + oneOff;
    const fullDegree =
      Math.round(Math.round(tuition) * years) +
      Math.round(annualLiving * years) +
      Math.round(oshcAnnual * years) +
      oneOff;

    // What Home Affairs wants you to evidence: 12 months living + first-year
    // tuition + travel, plus partner and child amounts.
    const evidence =
      FINANCIAL_CAPACITY_12MO +
      Math.round(tuition) +
      2_000 +
      (partner ? PARTNER_12MO : 0) +
      children * CHILD_12MO;

    return {
      weeklyRent: Math.round(weeklyRent),
      annualLiving,
      monthlyLiving: Math.round(annualLiving / 12),
      oshcAnnual,
      flights,
      oneOff,
      yearOne,
      fullDegree,
      evidence,
      tuition: Math.round(tuition),
    };
  }, [tuition, city, accom, years, partner, children, region]);

  return (
    <div className="flex flex-col gap-8">
      <div
        className="grid gap-4 rounded-2xl border border-line bg-mist p-5 sm:grid-cols-2"
        onChangeCapture={markUsed}
      >
        <label className="flex flex-col gap-1">
          <span className={labelCls}>University (optional)</span>
          <select
            value={uniSlug}
            onChange={(e) => onUniChange(e.target.value)}
            className={selectCls}
          >
            <option value="">Enter tuition myself</option>
            {withTuition.map((u) => (
              <option key={u.slug} value={u.slug}>
                {u.name}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className={labelCls}>Tuition per year (A$)</span>
          <input
            type="number"
            min={0}
            step={1000}
            value={Math.round(tuition)}
            onChange={(e) => {
              setUniSlug("");
              setTuition(Number(e.target.value) || 0);
            }}
            className={selectCls}
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className={labelCls}>City</span>
          <select
            value={citySlug}
            onChange={(e) => setCitySlug(e.target.value)}
            className={selectCls}
          >
            {CITIES.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className={labelCls}>Accommodation</span>
          <select
            value={accom}
            onChange={(e) => setAccom(e.target.value as AccomKey)}
            className={selectCls}
          >
            {ACCOM.map((a) => (
              <option key={a.key} value={a.key}>
                {a.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className={labelCls}>Course length</span>
          <select
            value={years}
            onChange={(e) => setYears(Number(e.target.value))}
            className={selectCls}
          >
            {YEARS.map((y) => (
              <option key={y} value={y}>
                {y} {y === 1 ? "year" : "years"}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className={labelCls}>Flying from</span>
          <select
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className={selectCls}
          >
            {Object.entries(FLIGHTS).map(([k, v]) => (
              <option key={k} value={k}>
                {v.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex items-center gap-2 sm:col-span-2">
          <input
            type="checkbox"
            checked={partner}
            onChange={(e) => setPartner(e.target.checked)}
            className="h-4 w-4 accent-status-open"
          />
          <span className="font-body text-sm text-ink">
            Bringing a partner
          </span>
        </label>

        <label className="flex items-center gap-2 sm:col-span-2">
          <span className="font-body text-sm text-ink">Children coming with you</span>
          <select
            value={children}
            onChange={(e) => setChildren(Number(e.target.value))}
            className="rounded-lg border border-line bg-paper px-3 py-1.5 font-body text-sm text-ink outline-none focus:border-status-open/50"
          >
            {[0, 1, 2, 3].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-status-open/30 bg-status-open/5 p-5">
          <p className={labelCls}>First-year total</p>
          <p className="mt-1 font-display text-3xl font-semibold text-status-open">
            {formatCurrency(result.yearOne, "AUD")}
          </p>
          <p className="mt-1 font-body text-xs text-slate">
            Tuition, living, health cover, visa, flights, and setup for year one.
          </p>
        </div>
        <div className="rounded-2xl border border-line bg-mist p-5">
          <p className={labelCls}>Whole degree ({years} {years === 1 ? "year" : "years"})</p>
          <p className="mt-1 font-display text-3xl font-semibold text-ink">
            {formatCurrency(result.fullDegree, "AUD")}
          </p>
          <p className="mt-1 font-body text-xs text-slate">
            Assumes tuition and living costs hold steady, which they usually
            rise a little each year.
          </p>
        </div>
      </div>

      <div>
        <h2 className="mb-3 font-display text-lg font-semibold text-ink">
          Year-one breakdown
        </h2>
        <dl className="overflow-hidden rounded-xl border border-line">
          {[
            ["Tuition", result.tuition],
            [
              `Living costs (${city.name}, ${ACCOM.find((a) => a.key === accom)?.label.toLowerCase()})`,
              result.annualLiving,
            ],
            [
              children > 0
                ? "Health cover (OSHC, family)"
                : partner
                  ? "Health cover (OSHC, couple)"
                  : "Health cover (OSHC, single)",
              result.oshcAnnual,
            ],
            ["Student visa (subclass 500)", VISA_FEE],
            ["Flights", result.flights],
            ["Initial setup", SETUP_ONE_OFF],
          ].map(([label, value], i, arr) => (
            <div
              key={label as string}
              className="flex items-center justify-between gap-4 px-4 py-3 font-body text-sm"
              style={{
                borderBottomWidth: i < arr.length - 1 ? 1 : 0,
                borderBottomColor: "color-mix(in srgb, var(--color-ink) 10%, transparent)",
              }}
            >
              <dt className="text-slate">{label}</dt>
              <dd className="font-utility text-ink">
                {formatCurrency(value as number, "AUD")}
              </dd>
            </div>
          ))}
        </dl>
        <p className="mt-2 font-body text-xs text-slate">
          That works out to about {formatCurrency(result.monthlyLiving, "AUD")} a
          month for living costs, and roughly {formatCurrency(result.weeklyRent, "AUD")}{" "}
          a week for rent.
        </p>
      </div>

      <div className="rounded-2xl border border-status-pending/30 bg-status-pending/5 p-5">
        <h2 className="font-body text-xs font-semibold tracking-wide text-slate uppercase">
          What you must show for the student visa
        </h2>
        <p className="mt-2 font-display text-2xl font-semibold text-ink">
          {formatCurrency(result.evidence, "AUD")}
        </p>
        <p className="mt-1 font-body text-sm leading-relaxed text-ink">
          Home Affairs asks you to evidence 12 months of living costs
          ({formatCurrency(FINANCIAL_CAPACITY_12MO, "AUD")} for you
          {partner ? `, ${formatCurrency(PARTNER_12MO, "AUD")} for a partner` : ""}
          {children > 0 ? `, ${formatCurrency(CHILD_12MO, "AUD")} per child` : ""}),
          plus first-year tuition and about {formatCurrency(2_000, "AUD")} travel.
          The funds also need a genuine history, so show more than the minimum.
          See the{" "}
          <Link
            href="/visas/student-500"
            className="font-medium text-status-open underline underline-offset-2"
          >
            subclass 500 page
          </Link>
          .
        </p>
      </div>

      <p className="font-body text-xs text-slate">
        Estimates only, in Australian dollars. Rent is the big variable and the
        figure here is a midpoint of published ranges. Tuition varies by course,
        OSHC and airfares by provider and season, and the visa fee and living-cost
        minimum are set by the Australian Government and change. Price your actual
        course and get quotes before you commit.
      </p>
    </div>
  );
}
