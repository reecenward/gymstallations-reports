import { Field } from "@/components/Field";
import { Textarea } from "@/components/ui/textarea";
import { HealthSummary } from "@/components/HealthSummary";

export function StepFinish({ draft, upd }) {
  const items = draft.items || [];
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-navy">Anything else to add?</h2>
        <p className="text-sm text-muted-foreground">
          Notes are optional. Tap the green button below to send the report when you're done.
        </p>
      </div>

      <div className="space-y-4">
        <Field label="Issues you noticed (optional)" htmlFor="issuesFound">
          <Textarea
            id="issuesFound"
            rows={3}
            value={draft.issuesFound}
            onChange={(e) => upd("issuesFound", e.target.value)}
            placeholder="What's wrong, what to watch…"
            className="text-base"
          />
        </Field>
        <Field label="Parts you replaced (optional)" htmlFor="partsReplaced">
          <Textarea
            id="partsReplaced"
            rows={2}
            value={draft.partsReplaced}
            onChange={(e) => upd("partsReplaced", e.target.value)}
            placeholder="Part numbers if you have them"
            className="text-base"
          />
        </Field>
        <Field label="What should they do next? (optional)" htmlFor="recommendations">
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

      {items.length > 0 && (
        <div className="space-y-3 pt-2">
          <div className="text-sm font-semibold text-navy">
            Quick look at each machine
          </div>
          {items.map((it, idx) => (
            <HealthSummary
              key={it.id}
              item={it}
              title={`#${idx + 1} · ${it.equipmentType}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
