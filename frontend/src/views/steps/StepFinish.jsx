import { Field } from "@/components/Field";
import { Textarea } from "@/components/ui/textarea";
import { GRADES, GRADE_SHORT, GRADE_TW, gradeCounts } from "@/lib/equipment";
import { cn } from "@/lib/utils";

export function StepFinish({ draft, upd }) {
  const counts = gradeCounts(draft.checklist);

  return (
    <div className="space-y-6">
      <div>
        <div className="mb-1 text-sm font-semibold text-navy">Notes</div>
        <p className="mb-4 text-xs text-muted-foreground">
          Anything not covered by the checklist.
        </p>
        <div className="space-y-4">
          <Field label="Issues found" htmlFor="issuesFound">
            <Textarea
              id="issuesFound"
              rows={3}
              value={draft.issuesFound}
              onChange={(e) => upd("issuesFound", e.target.value)}
              placeholder="What's wrong, what to watch…"
              className="text-base"
            />
          </Field>
          <Field label="Parts replaced" htmlFor="partsReplaced">
            <Textarea
              id="partsReplaced"
              rows={2}
              value={draft.partsReplaced}
              onChange={(e) => upd("partsReplaced", e.target.value)}
              placeholder="Part numbers if you have them"
              className="text-base"
            />
          </Field>
          <Field label="Recommendations" htmlFor="recommendations">
            <Textarea
              id="recommendations"
              rows={2}
              value={draft.recommendations}
              onChange={(e) => upd("recommendations", e.target.value)}
              placeholder="Follow-up, repairs, advice"
              className="text-base"
            />
          </Field>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
        <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Summary
        </div>
        <div className="mb-3 text-sm text-navy-soft">
          <div className="font-semibold text-navy">{draft.clientName || "—"}</div>
          <div>
            {draft.equipmentType ? `${draft.equipmentType} · ${draft.brand} ${draft.model}` : "—"}
          </div>
        </div>
        <div className="grid grid-cols-4 gap-1.5">
          {GRADES.map((g) => {
            const c = counts[g] || 0;
            const tw = GRADE_TW[g];
            return (
              <div
                key={g}
                className={cn(
                  "rounded-md border px-2 py-1.5 text-center",
                  c > 0 ? `${tw.bg} ${tw.border} ${tw.text}` : "border-slate-200 bg-white text-muted-foreground"
                )}
              >
                <div className="text-base font-bold">{c}</div>
                <div className="text-[10px] font-semibold uppercase">{GRADE_SHORT[g]}</div>
              </div>
            );
          })}
        </div>
        {counts.ungraded > 0 && (
          <div className="mt-2 text-xs text-amber-700">
            {counts.ungraded} item{counts.ungraded !== 1 ? "s" : ""} ungraded
          </div>
        )}
      </div>
    </div>
  );
}
