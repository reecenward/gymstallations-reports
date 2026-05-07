import { Field } from "@/components/Field";
import { Textarea } from "@/components/ui/textarea";

export function StepTechNotes({ draft, upd }) {
  return (
    <div className="space-y-5">
      <div className="text-lg font-bold text-navy">Technician Notes</div>
      <Field label="Issues Found" htmlFor="issuesFound">
        <Textarea
          id="issuesFound"
          rows={4}
          value={draft.issuesFound}
          onChange={(e) => upd("issuesFound", e.target.value)}
          placeholder="Describe any issues observed during inspection..."
        />
      </Field>
      <Field label="Parts Replaced" htmlFor="partsReplaced">
        <Textarea
          id="partsReplaced"
          rows={3}
          value={draft.partsReplaced}
          onChange={(e) => upd("partsReplaced", e.target.value)}
          placeholder="List any parts replaced, with part numbers if available..."
        />
      </Field>
      <Field label="Recommendations" htmlFor="recommendations">
        <Textarea
          id="recommendations"
          rows={3}
          value={draft.recommendations}
          onChange={(e) => upd("recommendations", e.target.value)}
          placeholder="Follow-up actions, scheduled repairs, client advice..."
        />
      </Field>
    </div>
  );
}
