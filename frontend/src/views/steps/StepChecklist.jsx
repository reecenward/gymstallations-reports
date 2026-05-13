import { Input } from "@/components/ui/input";
import {
  EQUIPMENT_TYPES,
  GRADES,
  GRADE_SHORT,
  GRADE_TW,
} from "@/lib/equipment";
import { cn } from "@/lib/utils";

export function StepChecklist({
  draft,
  updChecklistGrade,
  updChecklistNotes,
}) {
  const items = EQUIPMENT_TYPES[draft.equipmentType] || [];

  return (
    <div>
      <div className="mb-1 text-sm font-semibold text-navy">
        Inspect each item
      </div>
      <p className="mb-4 text-xs text-muted-foreground">
        Tap a grade. Notes are optional.
      </p>

      <div className="space-y-3">
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
              <div className="mb-2 text-sm font-semibold text-navy-soft">
                {item}
              </div>
              <div className="mb-2 grid grid-cols-4 gap-1.5">
                {GRADES.map((g) => {
                  const sel = grade === g;
                  const gtw = GRADE_TW[g];
                  return (
                    <button
                      key={g}
                      type="button"
                      onClick={() => updChecklistGrade(item, g)}
                      className={cn(
                        "h-12 rounded-md border text-sm font-bold transition-colors",
                        "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        sel
                          ? `${gtw.solid} border-transparent`
                          : `bg-white ${gtw.text} ${gtw.border} active:bg-slate-50`
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
                className="h-10 bg-white text-sm"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
