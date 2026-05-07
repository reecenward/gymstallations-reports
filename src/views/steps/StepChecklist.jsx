import { Input } from "@/components/ui/input";
import { GradePill } from "@/components/GradeBadge";
import {
  EQUIPMENT_TYPES,
  EQUIPMENT_ICONS,
  GRADES,
  GRADE_SHORT,
  GRADE_TW,
  gradeCounts,
} from "@/lib/equipment";
import { cn } from "@/lib/utils";

export function StepChecklist({
  draft,
  updChecklistGrade,
  updChecklistNotes,
}) {
  const items = EQUIPMENT_TYPES[draft.equipmentType] || [];
  const counts = gradeCounts(draft.checklist);

  return (
    <div>
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <div className="text-lg font-bold text-navy">Inspection Checklist</div>
        <div className="text-xs text-muted-foreground">
          {EQUIPMENT_ICONS[draft.equipmentType]} {draft.equipmentType} ·{" "}
          {items.length} items
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-1.5">
        {GRADES.map((g) => (
          <GradePill
            key={g}
            grade={g}
            count={counts[g]}
            label={GRADE_SHORT[g]}
          />
        ))}
        {counts.ungraded > 0 && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-600">
            <span className="font-bold">{counts.ungraded}</span> ungraded
          </span>
        )}
      </div>

      <div className="space-y-2.5">
        {items.map((item) => {
          const cell = draft.checklist[item] || { grade: null, notes: "" };
          const grade = cell.grade;
          const tw = grade ? GRADE_TW[grade] : null;
          return (
            <div
              key={item}
              className={cn(
                "rounded-lg border p-3 transition-colors",
                tw ? `${tw.bg} ${tw.border}` : "border-slate-200 bg-white"
              )}
            >
              <div className="mb-2.5 text-sm font-semibold text-navy-soft">
                {item}
              </div>
              <div className="mb-2.5 grid grid-cols-2 gap-1.5 sm:flex sm:flex-wrap">
                {GRADES.map((g) => {
                  const sel = grade === g;
                  const gtw = GRADE_TW[g];
                  return (
                    <button
                      key={g}
                      type="button"
                      onClick={() => updChecklistGrade(item, g)}
                      className={cn(
                        "h-9 rounded-md border px-3 text-xs font-bold transition-colors",
                        "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        sel
                          ? `${gtw.solid} border-transparent`
                          : `bg-white ${gtw.text} ${gtw.border} hover:bg-slate-50`
                      )}
                    >
                      {GRADE_SHORT[g]}
                    </button>
                  );
                })}
              </div>
              <Input
                value={cell.notes}
                onChange={(e) => updChecklistNotes(item, e.target.value)}
                placeholder="Notes (optional)"
                className="bg-white text-sm"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
