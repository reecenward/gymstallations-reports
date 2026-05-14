import { Field } from "@/components/Field";
import { Input } from "@/components/ui/input";

export function StepSite({ draft, upd }) {
  return (
    <div className="space-y-5">
      <div>
        <div className="mb-1 text-sm font-semibold text-navy">Site details</div>
        <p className="text-xs text-muted-foreground">
          Where the work is happening. All fields required.
        </p>
      </div>

      <Field label="Client" required htmlFor="clientName">
        <Input
          id="clientName"
          className="h-12 text-base"
          value={draft.clientName}
          onChange={(e) => upd("clientName", e.target.value)}
          placeholder="e.g. Gold's Gym Sydney"
        />
      </Field>

      <Field label="Site Address" required htmlFor="siteAddress">
        <Input
          id="siteAddress"
          className="h-12 text-base"
          value={draft.siteAddress}
          onChange={(e) => upd("siteAddress", e.target.value)}
          placeholder="123 Example St, Sydney NSW"
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Technician" required htmlFor="technicianName">
          <Input
            id="technicianName"
            className="h-12 text-base"
            value={draft.technicianName}
            onChange={(e) => upd("technicianName", e.target.value)}
          />
        </Field>
        <Field label="Date" required htmlFor="date">
          <Input
            id="date"
            type="date"
            className="h-12 text-base"
            value={draft.date}
            onChange={(e) => upd("date", e.target.value)}
          />
        </Field>
        <Field label="Job Number" required htmlFor="jobNumber">
          <Input
            id="jobNumber"
            className="h-12 text-base"
            value={draft.jobNumber}
            onChange={(e) => upd("jobNumber", e.target.value)}
          />
        </Field>
      </div>
    </div>
  );
}
