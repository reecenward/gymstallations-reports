import { Field } from "@/components/Field";
import { Input } from "@/components/ui/input";

export function StepJobInfo({ draft, upd }) {
  return (
    <div className="space-y-5">
      <div className="text-lg font-bold text-navy">Job Information</div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Client Name" required htmlFor="clientName">
          <Input
            id="clientName"
            value={draft.clientName}
            onChange={(e) => upd("clientName", e.target.value)}
            placeholder="e.g. Gold's Gym Sydney"
          />
        </Field>
        <Field label="Job Number" htmlFor="jobNumber">
          <Input
            id="jobNumber"
            value={draft.jobNumber}
            onChange={(e) => upd("jobNumber", e.target.value)}
          />
        </Field>
      </div>
      <Field label="Site Address" htmlFor="siteAddress">
        <Input
          id="siteAddress"
          value={draft.siteAddress}
          onChange={(e) => upd("siteAddress", e.target.value)}
          placeholder="Full address"
        />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Date" required htmlFor="date">
          <Input
            id="date"
            type="date"
            value={draft.date}
            onChange={(e) => upd("date", e.target.value)}
          />
        </Field>
        <Field label="Technician Name" required htmlFor="techName">
          <Input
            id="techName"
            value={draft.technicianName}
            onChange={(e) => upd("technicianName", e.target.value)}
            placeholder="Your name"
          />
        </Field>
      </div>
    </div>
  );
}
