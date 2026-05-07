import { ArrowLeft, Printer, Send, Sparkles, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ConditionChart } from "@/components/ConditionChart";
import { LifecycleBar } from "@/components/LifecycleBar";
import { GradePill } from "@/components/GradeBadge";
import {
  EQUIPMENT_TYPES,
  EQUIPMENT_ICONS,
  GRADES,
  GRADE_SHORT,
  GRADE_TW,
  gradeCounts,
} from "@/lib/equipment";
import { cn } from "@/lib/utils";

function SectionLabel({ children }) {
  return (
    <div className="mb-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
      {children}
    </div>
  );
}

function ReportSection({ title, children }) {
  return (
    <div className="rounded-lg bg-slate-50 p-4 sm:p-5">
      <div className="mb-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
        {title}
      </div>
      {children}
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="mb-2 flex items-baseline justify-between gap-3 text-sm last:mb-0">
      <span className="flex-shrink-0 text-muted-foreground">{label}</span>
      <span className="text-right font-semibold text-navy-soft">
        {value || "—"}
      </span>
    </div>
  );
}

function InfoBlock({ label, value }) {
  return (
    <div className="mb-3 last:mb-0">
      <div className="mb-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="text-sm leading-relaxed text-navy-soft">{value}</div>
    </div>
  );
}

export function ReportView({ job, emailState, onSend, onBack, onPrint }) {
  const items =
    EQUIPMENT_TYPES[job.equipmentType] || Object.keys(job.checklist || {});
  const counts = gradeCounts(job.checklist);

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-5 sm:px-6 sm:py-8">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between no-print">
        <Button onClick={onBack} variant="outline">
          <ArrowLeft className="size-4" />
          Dashboard
        </Button>
        <div className="flex flex-wrap gap-2">
          <Button onClick={onPrint} variant="secondary">
            <Printer className="size-4" />
            Print
          </Button>
          {emailState === "idle" && (
            <Button onClick={onSend}>
              <Send className="size-4" />
              Send Report
            </Button>
          )}
          {emailState === "sending" && (
            <Button disabled>
              <Sparkles className="size-4 animate-pulse" />
              Sending…
            </Button>
          )}
          {emailState === "sent" && (
            <Button variant="success" disabled>
              <Check className="size-4" />
              Report Sent
            </Button>
          )}
        </div>
      </div>

      <Card className="overflow-hidden print-shadow-none">
        <div className="flex flex-col gap-4 bg-navy p-5 text-white sm:flex-row sm:items-start sm:justify-between sm:p-7">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-base font-black">
                G
              </div>
              <span className="text-xl font-extrabold tracking-tight">
                Gymstallations
              </span>
            </div>
            <div className="mt-1 pl-12 text-xs text-slate-300">
              Preventive Maintenance Report
            </div>
          </div>
          <div className="text-left sm:text-right">
            <div className="text-lg font-extrabold text-primary sm:text-xl">
              #{job.jobNumber}
            </div>
            <div className="mt-0.5 text-xs text-slate-300">{job.date}</div>
            <div className="mt-0.5 text-[10px] uppercase tracking-wider text-slate-400">
              Service Report
            </div>
          </div>
        </div>

        <CardContent className="space-y-7 p-5 sm:p-7">
          <div className="grid gap-4 md:grid-cols-2">
            <ReportSection title="Job Details">
              <InfoRow label="Client" value={job.clientName} />
              <InfoRow label="Site" value={job.siteAddress} />
              <InfoRow label="Technician" value={job.technicianName} />
              <InfoRow label="Date" value={job.date} />
            </ReportSection>
            <ReportSection title="Equipment">
              <InfoRow
                label="Type"
                value={
                  job.equipmentType
                    ? `${EQUIPMENT_ICONS[job.equipmentType] || ""} ${job.equipmentType}`.trim()
                    : "—"
                }
              />
              <InfoRow
                label="Brand / Model"
                value={`${job.brand} ${job.model}`.trim() || "—"}
              />
              <InfoRow label="Serial #" value={job.serialNumber} />
              <InfoRow label="Asset ID" value={job.assetId} />
              <InfoRow label="Location" value={job.location} />
              <InfoRow label="Mfg Date" value={job.manufacturingDate} />
              <InfoRow label="Install Date" value={job.installDate} />
              <InfoRow
                label="Hours"
                value={job.hoursOnUnit ? `${job.hoursOnUnit} hrs` : "—"}
              />
              <InfoRow
                label="Age"
                value={job.ageYears ? `${job.ageYears} yr(s)` : "—"}
              />
            </ReportSection>
          </div>

          {job.serialPhoto && (
            <div>
              <SectionLabel>Serial Number Photo</SectionLabel>
              <img
                src={job.serialPhoto}
                alt="Serial number"
                className="block max-h-48 max-w-xs rounded-md border"
              />
            </div>
          )}

          <div>
            <SectionLabel>Condition Summary</SectionLabel>
            <div className="rounded-lg border bg-slate-50 p-4 sm:p-5">
              <ConditionChart checklist={job.checklist} />
            </div>
          </div>

          <div>
            <SectionLabel>Equipment Lifecycle</SectionLabel>
            <div className="rounded-lg border bg-slate-50 p-4 sm:p-5">
              <LifecycleBar
                manufacturingDate={job.manufacturingDate}
                installDate={job.installDate}
              />
            </div>
          </div>

          <div>
            <SectionLabel>Inspection Results</SectionLabel>
            <div className="mb-3 flex flex-wrap gap-1.5">
              {GRADES.map((g) => (
                <GradePill
                  key={g}
                  grade={g}
                  count={counts[g]}
                  label={GRADE_SHORT[g]}
                />
              ))}
              {counts.ungraded > 0 && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-600">
                  <span className="font-bold">{counts.ungraded}</span> Ungraded
                </span>
              )}
            </div>
            <div className="space-y-1.5">
              {items.map((item) => {
                const cell = job.checklist?.[item] || {
                  grade: null,
                  notes: "",
                };
                const tw = cell.grade ? GRADE_TW[cell.grade] : null;
                return (
                  <div
                    key={item}
                    className={cn(
                      "flex items-start gap-3 rounded-md border p-3",
                      tw ? `${tw.bg} ${tw.border}` : "border-slate-200 bg-slate-50"
                    )}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold text-navy-soft">
                        {item}
                      </div>
                      {cell.notes && (
                        <div className="mt-1 text-xs italic text-muted-foreground">
                          “{cell.notes}”
                        </div>
                      )}
                    </div>
                    <span
                      className={cn(
                        "flex-shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider",
                        tw ? tw.solid : "bg-slate-400 text-white"
                      )}
                    >
                      {cell.grade ? GRADE_SHORT[cell.grade] : "—"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {job.summary && (
            <div className="rounded-xl border border-brand-200 bg-brand-50 p-5 sm:p-6">
              <div className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary">
                <Sparkles className="size-3.5" />
                AI-Assisted Summary
              </div>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-navy-soft">
                {job.summary}
              </p>
            </div>
          )}

          {(job.issuesFound || job.partsReplaced || job.recommendations) && (
            <ReportSection title="Technician Notes">
              {job.issuesFound && (
                <InfoBlock label="Issues Found" value={job.issuesFound} />
              )}
              {job.partsReplaced && (
                <InfoBlock label="Parts Replaced" value={job.partsReplaced} />
              )}
              {job.recommendations && (
                <InfoBlock
                  label="Recommendations"
                  value={job.recommendations}
                />
              )}
            </ReportSection>
          )}

          <div className="flex flex-col items-stretch gap-4 border-t pt-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="mb-6 text-xs text-muted-foreground">
                Technician Signature
              </div>
              <div className="mb-1.5 w-56 border-b-2 border-navy-soft" />
              <div className="text-sm text-muted-foreground">
                {job.technicianName || "Technician"}
              </div>
            </div>
            <div className="text-left sm:text-right">
              <div className="text-[11px] text-muted-foreground">
                Report generated by
              </div>
              <div className="text-base font-extrabold text-navy">
                Gymstallations
              </div>
              <div className="mt-0.5 text-[11px] text-muted-foreground">
                {job.submittedAt || job.date}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
