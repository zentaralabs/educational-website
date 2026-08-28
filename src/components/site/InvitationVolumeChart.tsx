type Bar = {
  date: string;
  invitations: number;
  isEstimated: boolean;
};

/**
 * Static SVG bar chart of subclass 189 invitations issued per round, oldest
 * to newest. No client JS, no chart library — the dataset is a couple of
 * dozen points at most and never animates. Projected rounds are hatched and
 * labelled so they read as estimates, per the site's projected-round
 * convention.
 */
export function InvitationVolumeChart({ bars }: { bars: Bar[] }) {
  if (bars.length < 2) return null;

  const W = 720;
  const H = 260;
  const PAD_L = 48;
  const PAD_R = 12;
  const PAD_T = 16;
  const PAD_B = 44;
  const plotW = W - PAD_L - PAD_R;
  const plotH = H - PAD_T - PAD_B;

  const max = Math.max(...bars.map((b) => b.invitations));
  // Round the axis top up to a clean 5,000.
  const axisMax = Math.ceil(max / 5000) * 5000;
  const barW = plotW / bars.length;
  const gap = Math.min(10, barW * 0.25);

  const ticks = Array.from({ length: axisMax / 5000 + 1 }, (_, i) => i * 5000);

  const fmtK = (n: number) => (n === 0 ? "0" : `${n / 1000}k`);
  const fmtYear = (d: string) => d.slice(0, 4);

  return (
    <figure className="mt-4">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        role="img"
        aria-label="Bar chart of subclass 189 invitations issued per SkillSelect round, from 2022 to the latest round."
      >
        <defs>
          <pattern
            id="proj-hatch"
            width="6"
            height="6"
            patternTransform="rotate(45)"
            patternUnits="userSpaceOnUse"
          >
            <rect width="6" height="6" className="fill-status-pending/15" />
            <line x1="0" y1="0" x2="0" y2="6" className="stroke-status-pending/60" strokeWidth="2" />
          </pattern>
        </defs>

        {/* gridlines + y labels */}
        {ticks.map((t) => {
          const y = PAD_T + plotH - (t / axisMax) * plotH;
          return (
            <g key={t}>
              <line
                x1={PAD_L}
                y1={y}
                x2={W - PAD_R}
                y2={y}
                className="stroke-line"
                strokeWidth="1"
              />
              <text
                x={PAD_L - 8}
                y={y + 4}
                textAnchor="end"
                className="fill-slate font-utility text-[11px]"
              >
                {fmtK(t)}
              </text>
            </g>
          );
        })}

        {/* bars */}
        {bars.map((b, i) => {
          const h = (b.invitations / axisMax) * plotH;
          const x = PAD_L + i * barW + gap / 2;
          const y = PAD_T + plotH - h;
          const w = barW - gap;
          return (
            <g key={`${b.date}-${i}`}>
              <rect
                x={x}
                y={y}
                width={w}
                height={h}
                className={b.isEstimated ? "fill-status-pending/25" : "fill-status-open"}
              />
              {b.isEstimated && (
                <rect x={x} y={y} width={w} height={h} fill="url(#proj-hatch)" />
              )}
              <text
                x={x + w / 2}
                y={y - 5}
                textAnchor="middle"
                className="fill-ink font-utility text-[10px]"
              >
                {(b.invitations / 1000).toFixed(b.invitations % 1000 === 0 ? 0 : 1)}k
              </text>
              <text
                x={x + w / 2}
                y={H - PAD_B + 16}
                textAnchor="middle"
                className="fill-slate font-utility text-[10px]"
              >
                {new Date(b.date).toLocaleDateString("en-AU", { month: "short" })}
              </text>
              <text
                x={x + w / 2}
                y={H - PAD_B + 30}
                textAnchor="middle"
                className="fill-slate/70 font-utility text-[10px]"
              >
                {fmtYear(b.date)}
              </text>
            </g>
          );
        })}

        {/* x axis */}
        <line
          x1={PAD_L}
          y1={PAD_T + plotH}
          x2={W - PAD_R}
          y2={PAD_T + plotH}
          className="stroke-ink/30"
          strokeWidth="1"
        />
      </svg>
      <figcaption className="mt-2 font-body text-xs text-slate">
        Subclass 189 invitations issued per round. Hatched bars are our projections, not
        official figures.
      </figcaption>
    </figure>
  );
}
