import { GRADES, GRADE_TW, gradeCounts } from "@/lib/equipment";
import { cn } from "@/lib/utils";

export function ConditionChart({ checklist }) {
  const counts = gradeCounts(checklist);
  const total =
    counts.Good +
    counts["Acceptable - Has Wear"] +
    counts["Needs Replacement"] +
    counts.ungraded;

  if (total === 0) {
    return (
      <div className="py-6 text-center text-sm text-muted-foreground">
        No inspection data
      </div>
    );
  }

  const max = Math.max(
    counts.Good,
    counts["Acceptable - Has Wear"],
    counts["Needs Replacement"],
    1
  );

  return (
    <div className="space-y-3">
      {GRADES.map((g) => {
        const n = counts[g];
        const pct = (n / max) * 100;
        const tw = GRADE_TW[g];
        return (
          <div key={g}>
            <div className="mb-1 flex items-center justify-between text-xs font-semibold text-navy-soft">
              <span>{g}</span>
              <span className={tw.text}>
                {n} ({total > 0 ? Math.round((n / total) * 100) : 0}%)
              </span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className={cn("h-full rounded-full transition-all duration-500", tw.solid)}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
