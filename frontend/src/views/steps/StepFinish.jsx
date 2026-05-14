import { Field } from "@/components/Field";
import { Textarea } from "@/components/ui/textarea";
import { HealthSummary } from "@/components/HealthSummary";
import { REPLACEMENT_GRADE } from "@/lib/equipment";

function PhotoThumb({ src, label }) {
  return (
    <figure className="overflow-hidden rounded-md border bg-neutral-50">
      <img src={src} alt={label} className="block h-28 w-full object-cover" />
      <figcaption className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-neutral-500">
        {label}
      </figcaption>
    </figure>
  );
}

function ItemPhotos({ item }) {
  const issueCells = Object.entries(item.checklist || {}).filter(
    ([, c]) => c && c.grade === REPLACEMENT_GRADE && c.photo
  );
  const hasAny = item.distancePhoto || item.serialPhoto || issueCells.length > 0;
  if (!hasAny) return null;

  return (
    <div className="space-y-2">
      <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
        Photos
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {item.distancePhoto && <PhotoThumb src={item.distancePhoto} label="Equipment" />}
        {item.serialPhoto && <PhotoThumb src={item.serialPhoto} label="Serial #" />}
        {issueCells.map(([label, cell]) => (
          <PhotoThumb key={label} src={cell.photo} label={`Issue · ${label}`} />
        ))}
      </div>
    </div>
  );
}

export function StepFinish({ draft, upd }) {
  const items = draft.items || [];
  return (
    <div className="space-y-6">
      {items.length > 0 && (
        <div className="space-y-4">
          <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Per-item summary
          </div>
          {items.map((it, idx) => (
            <div key={it.id} className="space-y-3">
              <HealthSummary item={it} title={`#${idx + 1} · ${it.equipmentType}`} />
              <ItemPhotos item={it} />
            </div>
          ))}
        </div>
      )}

      <div>
        <div className="mb-1 text-sm font-semibold text-neutral-900">Notes</div>
        <p className="mb-4 text-xs text-neutral-500">
          Anything not covered by the checklist (applies to the whole report).
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
