import { Field } from "@/components/Field";
import { Input } from "@/components/ui/input";

export function StepSite({ draft, upd }) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold text-navy">Where are you working?</h2>
        <p className="text-sm text-muted-foreground">
          Tell us about the job site.
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

      <Field label="Site address" required htmlFor="siteAddress">
        <Input
          id="siteAddress"
          className="h-12 text-base"
          value={draft.siteAddress}
          onChange={(e) => upd("siteAddress", e.target.value)}
          placeholder="123 Example St, Sydney NSW"
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Your name" required htmlFor="technicianName">
          <Input
            id="technicianName"
            className="h-12 text-base"
            value={draft.technicianName}
            onChange={(e) => upd("technicianName", e.target.value)}
            placeholder="First Last"
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
        <Field label="Job number" required htmlFor="jobNumber">
          <Input
            id="jobNumber"
            className="h-12 text-base"
            value={draft.jobNumber}
            onChange={(e) => upd("jobNumber", e.target.value)}
            placeholder="From your job sheet"
          />
        </Field>
      </div>
    </div>
  );
}
