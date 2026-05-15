import { useState } from "react";
import {
  ArrowLeft,
  ChevronDown,
  Printer,
  Send,
  Pencil,
  ClipboardCheck,
  Mail,
  Trash2,
  Undo2,
} from "lucide-react";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CardActionsMenu } from "@/components/CardActionsMenu";
import { HealthSummary } from "@/components/HealthSummary";
import { EquipmentIcon } from "@/components/EquipmentIcon";
import {
  EQUIPMENT_TYPES,
  GRADE_SHORT,
  GRADE_TW,
  REPLACEMENT_GRADE,
  normalizeDraft,
} from "@/lib/equipment";
import { cn } from "@/lib/utils";

const REVIEW_BADGE = {
  pending: { label: "Needs review", cls: "bg-warn/10 text-warn-foreground border-warn" },
  reviewed: { label: "Reviewed", cls: "bg-neutral-100 text-neutral-700 border-neutral-200" },
  sent_to_client: { label: "Sent to client", cls: "bg-neutral-100 text-neutral-700 border-neutral-200" },
};

function SectionLabel({ children }) {
  return (
    <div className="mb-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
      {children}
    </div>
  );
}

function ReportSection({ title, children }) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4 sm:p-5">
      <div className="mb-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
        {title}
      </div>
      {children}
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="mb-2.5 flex flex-col gap-0.5 text-sm last:mb-0 sm:flex-row sm:items-baseline sm:justify-between sm:gap-3">
      <span className="flex-shrink-0 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground sm:text-sm sm:font-normal sm:normal-case sm:tracking-normal">
        {label}
      </span>
      <span className="break-words font-semibold text-navy-soft sm:text-right">
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

function PhotoTile({ src, label, alt }) {
  return (
    <figure className="overflow-hidden rounded-lg border bg-neutral-50">
      <img src={src} alt={alt} className="block h-44 w-full object-cover sm:h-56" />
      <figcaption className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-neutral-500">
        {label}
      </figcaption>
    </figure>
  );
}

function ItemCard({ item, index }) {
  const checklistKeys =
    EQUIPMENT_TYPES[item.equipmentType] || Object.keys(item.checklist || {});

  const issues = checklistKeys
    .map((key) => ({ key, cell: item.checklist?.[key] }))
    .filter(({ cell }) => cell && cell.grade === REPLACEMENT_GRADE);
  const [showChecklist, setShowChecklist] = useState(issues.length > 0);

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center gap-3 border-b bg-neutral-50 p-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-white text-neutral-900 ring-1 ring-neutral-200">
          <EquipmentIcon type={item.equipmentType} className="size-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
            Item #{index + 1}
          </div>
          <div className="truncate text-base font-bold text-navy">
            {item.equipmentType}
          </div>
        </div>
        {issues.length > 0 && (
          <span className="flex-shrink-0 rounded-full bg-red-100 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-red-700">
            {issues.length} issue{issues.length === 1 ? "" : "s"}
          </span>
        )}
      </div>

      <CardContent className="space-y-5 p-4 sm:p-5">
        <ReportSection title="Equipment">
          <InfoRow
            label="Brand / Model"
            value={`${item.brand || ""} ${item.model || ""}`.trim() || "—"}
          />
          <InfoRow label="Serial #" value={item.serialNumber} />
          <InfoRow label="Location" value={item.location} />
        </ReportSection>

        {(item.distancePhoto || item.serialPhoto) && (
          <div>
            <SectionLabel>Photos</SectionLabel>
            <div className="grid gap-3 sm:grid-cols-2">
              {item.distancePhoto && (
                <PhotoTile
                  src={item.distancePhoto}
                  label="Equipment"
                  alt={`${item.equipmentType} unit`}
                />
              )}
              {item.serialPhoto && (
                <PhotoTile
                  src={item.serialPhoto}
                  label="Serial number"
                  alt="Serial number close-up"
                />
              )}
            </div>
          </div>
        )}

        <HealthSummary item={item} title="Condition" showPhotos={false} />

        {issues.length > 0 && (
          <div>
            <SectionLabel>Issues Found</SectionLabel>
            <div className="space-y-3">
              {issues.map(({ key, cell }) => (
                <div
                  key={key}
                  className="overflow-hidden rounded-lg border border-red-200 bg-red-50/40"
                >
                  <div className="flex flex-col gap-3 p-3 sm:flex-row">
                    {cell.photo && (
                      <img
                        src={cell.photo}
                        alt={`Issue: ${key}`}
                        className="h-32 w-full flex-shrink-0 rounded border object-cover sm:h-28 sm:w-40"
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="text-sm font-bold text-navy">{key}</div>
                        <span className={cn("flex-shrink-0 rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider", GRADE_TW[REPLACEMENT_GRADE].solid)}>
                          {GRADE_SHORT[REPLACEMENT_GRADE]}
                        </span>
                      </div>
                      {cell.notes && (
                        <div className="mt-1 text-sm text-neutral-700">
                          {cell.notes}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <div className="mb-3 flex items-center justify-between">
            <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Inspection Results
            </div>
            {issues.length === 0 && checklistKeys.length > 0 && (
              <button
                type="button"
                onClick={() => setShowChecklist((v) => !v)}
                className="no-print inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-semibold text-neutral-600 hover:bg-neutral-100"
              >
                {showChecklist ? "Hide" : "Show details"}
                <ChevronDown className={cn("size-3.5 transition-transform", showChecklist && "rotate-180")} />
              </button>
            )}
          </div>
          {!showChecklist && issues.length === 0 && (
            <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-800">
              All {checklistKeys.length} checks passed.
            </div>
          )}
          <div className={cn("space-y-1.5", !showChecklist && "hidden print:!block")}>
            {checklistKeys.map((key) => {
              const cell = item.checklist?.[key] || { grade: null, notes: "" };
              const tw = cell.grade ? GRADE_TW[cell.grade] : null;
              return (
                <div
                  key={key}
                  className={cn(
                    "flex items-start gap-3 rounded-md border p-3",
                    tw ? `${tw.bg} ${tw.border}` : "border-slate-200 bg-slate-50"
                  )}
                >
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-navy-soft">{key}</div>
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
      </CardContent>
    </Card>
  );
}

export function ReportView({
  job,
  emailState,
  onSend,
  onBack,
  onPrint,
  isAdmin,
  onEdit,
  onMarkReviewed,
  onMarkSent,
  onResetReview,
  onDelete,
}) {
  const [confirmDel, setConfirmDel] = useState(false);
  const normalized = normalizeDraft(job);
  const items = normalized.items || [];
  const reviewStatus = job.reviewStatus || "pending";
  const badge = REVIEW_BADGE[reviewStatus] || REVIEW_BADGE.pending;

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-5 sm:px-6 sm:py-8">
      <div className="mb-5 flex items-center justify-between gap-3 no-print">
        <Button onClick={onBack} variant="outline">
          <ArrowLeft className="size-4" />
          Back
        </Button>
        <CardActionsMenu label="Report actions">
          {({ close, MenuItem }) => (
            <>
              <MenuItem
                icon={Printer}
                onClick={() => {
                  close();
                  onPrint?.();
                }}
              >
                Print
              </MenuItem>
              {isAdmin && onEdit && (
                <MenuItem
                  icon={Pencil}
                  onClick={() => {
                    close();
                    onEdit();
                  }}
                >
                  Edit report
                </MenuItem>
              )}
              {isAdmin && (onMarkReviewed || onMarkSent || onResetReview) && (
                <div className="my-1 h-px bg-neutral-100" />
              )}
              {isAdmin && reviewStatus === "pending" && onMarkReviewed && (
                <MenuItem
                  icon={ClipboardCheck}
                  onClick={() => {
                    close();
                    onMarkReviewed();
                  }}
                >
                  Mark as reviewed
                </MenuItem>
              )}
              {isAdmin && reviewStatus !== "sent_to_client" && onMarkSent && (
                <MenuItem
                  icon={Mail}
                  onClick={() => {
                    close();
                    onMarkSent();
                  }}
                >
                  Mark as sent to client
                </MenuItem>
              )}
              {isAdmin && reviewStatus !== "pending" && onResetReview && (
                <MenuItem
                  icon={Undo2}
                  onClick={() => {
                    close();
                    onResetReview();
                  }}
                >
                  Back to needs review
                </MenuItem>
              )}
              {isAdmin && onDelete && (
                <>
                  <div className="my-1 h-px bg-neutral-100" />
                  <MenuItem
                    icon={Trash2}
                    destructive
                    onClick={() => {
                      close();
                      setConfirmDel(true);
                    }}
                  >
                    Delete report
                  </MenuItem>
                </>
              )}
            </>
          )}
        </CardActionsMenu>
      </div>

      <ConfirmDialog
        open={confirmDel}
        title={`Delete report for ${job.clientName || "this job"}?`}
        description="The report and its photos will be permanently deleted. You can't undo this."
        confirmLabel="Delete report"
        destructive
        onConfirm={() => {
          setConfirmDel(false);
          onDelete?.();
        }}
        onCancel={() => setConfirmDel(false)}
      />

      {emailState === "failed" && (
        <div className="mb-4 flex items-center justify-between gap-3 rounded-md border border-warn bg-warn/10 px-3 py-2 no-print">
          <div className="flex items-center gap-2 text-sm font-semibold text-warn-foreground">
            <Mail className="size-4" />
            Email didn't send. The report is saved.
          </div>
          <Button size="sm" onClick={onSend}>
            <Send className="size-4" />
            Try again
          </Button>
        </div>
      )}

      <Card className="overflow-hidden print-shadow-none">
        <div className="flex flex-col gap-4 bg-neutral-900 p-5 text-white sm:flex-row sm:items-start sm:justify-between sm:p-7">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-white text-base font-black text-neutral-900">
                G
              </div>
              <span className="text-xl font-extrabold tracking-tight">Gymstallations</span>
            </div>
            <div className="mt-1 pl-12 text-xs text-neutral-400">
              Preventive Maintenance Report
            </div>
          </div>
          <div className="text-left sm:text-right">
            <div className="text-lg font-extrabold sm:text-xl">#{job.jobNumber}</div>
            <div className="mt-0.5 text-xs text-neutral-400">{job.date}</div>
            <div className="mt-0.5 text-[10px] uppercase tracking-wider text-neutral-500">
              {items.length} item{items.length === 1 ? "" : "s"}
            </div>
            {isAdmin && (
              <div className="mt-2 no-print">
                <span className={cn("inline-block rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider", badge.cls)}>
                  {badge.label}
                </span>
              </div>
            )}
          </div>
        </div>

        <CardContent className="space-y-5 p-4 sm:space-y-7 sm:p-7">
          <ReportSection title="Job Details">
            <InfoRow label="Client" value={job.clientName} />
            <InfoRow label="Site" value={job.siteAddress} />
            <InfoRow label="Technician" value={job.technicianName} />
            <InfoRow label="Date" value={job.date} />
          </ReportSection>

          {(job.issuesFound || job.partsReplaced || job.recommendations) && (
            <ReportSection title="Notes from the technician">
              {job.issuesFound && <InfoBlock label="Issues" value={job.issuesFound} />}
              {job.partsReplaced && <InfoBlock label="Parts replaced" value={job.partsReplaced} />}
              {job.recommendations && (
                <InfoBlock label="What to do next" value={job.recommendations} />
              )}
            </ReportSection>
          )}
        </CardContent>
      </Card>

      <div className="mt-5 space-y-5">
        {items.map((it, i) => (
          <ItemCard key={it.id || i} item={it} index={i} />
        ))}
      </div>

      <Card className="mt-5 print-shadow-none">
        <CardContent className="flex flex-col items-stretch gap-4 p-5 sm:flex-row sm:items-end sm:justify-between sm:p-7">
          <div>
            <div className="mb-6 text-xs text-muted-foreground">Technician Signature</div>
            <div className="mb-1.5 w-56 border-b-2 border-navy-soft" />
            <div className="text-sm text-muted-foreground">
              {job.technicianName || "Technician"}
            </div>
          </div>
          <div className="text-left sm:text-right">
            <div className="text-[11px] text-muted-foreground">Report generated by</div>
            <div className="text-base font-extrabold text-navy">Gymstallations</div>
            <div className="mt-0.5 text-[11px] text-muted-foreground">
              {job.submittedAt || job.date}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
