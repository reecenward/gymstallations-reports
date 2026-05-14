import { Field } from "@/components/Field";
import { Textarea } from "@/components/ui/textarea";
import { HealthSummary } from "@/components/HealthSummary";

export function StepFinish({ draft, upd }) {
  return (
    <div className="space-y-6">
      <HealthSummary draft={draft} />

      <div>
        <div className="mb-1 text-sm font-semibold text-neutral-900">Notes</div>
        <p className="mb-4 text-xs text-neutral-500">
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
    </div>
  );
}
