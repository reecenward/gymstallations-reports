import { GRADES, GRADE_COLORS, GRADE_SHORT, gradeCounts } from "@/lib/equipment";

// Weighted health score: Excellent=100, Good=75, Acceptable=40, Replace=0.
const WEIGHTS = {
  Excellent: 100,
  Good: 75,
  "Acceptable - Has Wear": 40,
  "Needs Replacement": 0,
};

function computeScore(counts) {
  const graded =
    counts.Excellent +
    counts.Good +
    counts["Acceptable - Has Wear"] +
    counts["Needs Replacement"];
  if (graded === 0) return null;
  const sum = GRADES.reduce((acc, g) => acc + WEIGHTS[g] * counts[g], 0);
  return Math.round(sum / graded);
}

function scoreVerdict(score) {
  if (score === null) return "Not graded";
  if (score >= 85) return "Excellent";
  if (score >= 65) return "Good";
  if (score >= 40) return "Needs Attention";
  return "Critical";
}

function Donut({ counts, total, score }) {
  const SIZE = 168;
  const STROKE = 18;
  const R = (SIZE - STROKE) / 2;
  const C = 2 * Math.PI * R;
  let offset = 0;

  const segments = GRADES.map((g) => {
    const n = counts[g];
    if (!n) return null;
    const frac = n / total;
    const len = frac * C;
    const seg = (
      <circle
        key={g}
        cx={SIZE / 2}
        cy={SIZE / 2}
        r={R}
        fill="none"
        stroke={GRADE_COLORS[g].hex}
        strokeWidth={STROKE}
        strokeDasharray={`${len} ${C - len}`}
        strokeDashoffset={-offset}
        transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
        strokeLinecap="butt"
      />
    );
    offset += len;
    return seg;
  }).filter(Boolean);

  return (
    <div className="relative grid place-items-center" style={{ width: SIZE, height: SIZE }}>
      <svg width={SIZE} height={SIZE} className="absolute inset-0">
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={R}
          fill="none"
          stroke="#f5f5f5"
          strokeWidth={STROKE}
        />
        {segments}
      </svg>
      <div className="relative text-center">
        <div className="text-4xl font-extrabold tracking-tight text-neutral-900 tabular-nums">
          {score ?? "—"}
        </div>
        <div className="-mt-0.5 text-[10px] font-bold uppercase tracking-wider text-neutral-500">
          Health score
        </div>
      </div>
    </div>
  );
}

function Bars({ counts, total }) {
  return (
    <div className="space-y-2">
      {GRADES.map((g) => {
        const n = counts[g];
        const pct = total > 0 ? Math.round((n / total) * 100) : 0;
        const color = GRADE_COLORS[g].hex;
        return (
          <div key={g}>
            <div className="mb-1 flex items-center justify-between text-[11px] font-semibold text-neutral-700">
              <span className="flex items-center gap-2">
                <span
                  className="inline-block size-2 rounded-full"
                  style={{ background: color }}
                />
                {GRADE_SHORT[g]}
              </span>
              <span className="tabular-nums text-neutral-500">
                {n} · {pct}%
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-100">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${pct}%`, background: color }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function HealthSummary({ draft, title = "Inspection Summary" }) {
  const counts = gradeCounts(draft.checklist || {});
  const graded =
    counts.Excellent +
    counts.Good +
    counts["Acceptable - Has Wear"] +
    counts["Needs Replacement"];
  const total = graded + (counts.ungraded || 0);
  const score = computeScore(counts);
  const verdict = scoreVerdict(score);
  const replaceCount = counts["Needs Replacement"] || 0;

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-neutral-500">
            {title}
          </div>
          <div className="mt-1 text-base font-bold text-neutral-900">
            {draft.clientName || "Untitled"}
          </div>
          <div className="text-sm text-neutral-500">
            {draft.equipmentType
              ? `${draft.equipmentType}${draft.brand ? ` · ${draft.brand}` : ""}${
                  draft.model ? ` ${draft.model}` : ""
                }`
              : "—"}
          </div>
        </div>
        <div
          className="rounded-full border border-neutral-200 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-neutral-700"
        >
          {verdict}
        </div>
      </div>

      <div className="grid items-center gap-5 sm:grid-cols-[auto_1fr]">
        <div className="mx-auto">
          {graded > 0 ? (
            <Donut counts={counts} total={graded} score={score} />
          ) : (
            <div className="grid size-[168px] place-items-center rounded-full border border-dashed border-neutral-200 text-xs text-neutral-400">
              No grades yet
            </div>
          )}
        </div>
        <div>
          <Bars counts={counts} total={graded || 1} />
          <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-neutral-500">
            <span className="tabular-nums">
              {graded}/{total} graded
            </span>
            {counts.ungraded > 0 && (
              <span className="rounded-full bg-neutral-100 px-2 py-0.5 font-semibold text-neutral-700">
                {counts.ungraded} ungraded
              </span>
            )}
            {replaceCount > 0 && (
              <span className="rounded-full bg-red-50 px-2 py-0.5 font-semibold text-red-700">
                {replaceCount} need replacement
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
