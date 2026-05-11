import { GradeStat } from "@/components/GradeBadge";
import {
  GRADES,
  GRADE_SHORT,
  gradeCounts,
} from "@/lib/equipment";

function ReviewCard({ label, value }) {
  return (
    <div className="rounded-md bg-slate-50 px-3 py-2.5">
      <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="mt-0.5 text-sm font-semibold text-navy-soft">
        {value || "—"}
      </div>
    </div>
  );
}

export function StepReview({ draft }) {
  const counts = gradeCounts(draft.checklist);

  return (
    <div className="space-y-5">
      <div className="text-lg font-bold text-navy">Review &amp; Submit</div>

      <div className="grid gap-2 sm:grid-cols-2">
        <ReviewCard label="Client" value={draft.clientName} />
        <ReviewCard label="Job #" value={draft.jobNumber} />
        <ReviewCard label="Site" value={draft.siteAddress} />
        <ReviewCard label="Date" value={draft.date} />
        <ReviewCard label="Technician" value={draft.technicianName} />
        <ReviewCard
          label="Equipment"
          value={
            draft.equipmentType
              ? `${draft.equipmentType} — ${draft.brand} ${draft.model}`.trim()
              : "—"
          }
        />
        <ReviewCard label="Asset ID" value={draft.assetId} />
        <ReviewCard label="Location" value={draft.location} />
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {GRADES.map((g) => (
          <GradeStat
            key={g}
            grade={g}
            count={counts[g]}
            label={GRADE_SHORT[g].toUpperCase()}
          />
        ))}
      </div>
      {counts.ungraded > 0 && (
        <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          {counts.ungraded} item{counts.ungraded !== 1 ? "s" : ""} still ungraded
        </div>
      )}

      {draft.serialPhoto && (
        <div className="flex items-center gap-3 rounded-lg bg-slate-50 p-3">
          <img
            src={draft.serialPhoto}
            alt="Serial"
            className="h-14 w-14 rounded-md object-cover"
          />
          <div className="text-sm text-muted-foreground">
            Serial number photo attached
          </div>
        </div>
      )}

    </div>
  );
}
