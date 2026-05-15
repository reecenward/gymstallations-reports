import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { StepSite } from "@/views/steps/StepSite";
import { StepEquipment } from "@/views/steps/StepEquipment";
import { StepChecklist } from "@/views/steps/StepChecklist";
import { StepFinish } from "@/views/steps/StepFinish";
import { itemComplete } from "@/lib/equipment";
import { cn } from "@/lib/utils";

const STEPS = [
  { short: "Site", long: "Job site" },
  { short: "Equipment", long: "Add equipment" },
  { short: "Check", long: "Check each item" },
  { short: "Send", long: "Review & send" },
];

function missingForStep(step, draft) {
  const items = draft.items || [];
  if (step === 0) {
    const missing = [];
    if (!draft.clientName) missing.push("Client");
    if (!draft.siteAddress) missing.push("Site address");
    if (!draft.technicianName) missing.push("Your name");
    if (!draft.date) missing.push("Date");
    if (!draft.jobNumber) missing.push("Job number");
    return missing;
  }
  if (step === 1) {
    if (items.length === 0) return ["Add at least one piece of equipment"];
    const bad = items
      .map((it, idx) => {
        const m = [];
        if (!it.brand) m.push("brand");
        if (!it.model) m.push("model");
        if (!it.serialNumber) m.push("serial #");
        if (!it.distancePhoto) m.push("equipment photo");
        if (!it.serialPhoto) m.push("serial photo");
        return m.length ? `Item #${idx + 1}: ${m.join(", ")}` : null;
      })
      .filter(Boolean);
    return bad;
  }
  if (step === 2) {
    const bad = items
      .map((it, idx) => (itemComplete(it) ? null : `Item #${idx + 1} not finished`))
      .filter(Boolean);
    return bad;
  }
  return [];
}

export function FormView({
  step,
  setStep,
  draft,
  upd,
  addItem,
  updateItem,
  removeItem,
  onSubmit,
  onBack,
  onDiscard,
  editing = false,
}) {
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const [triedAdvance, setTriedAdvance] = useState(false);

  // Reset the "tried" flag whenever we move between steps — fresh start.
  useEffect(() => {
    setTriedAdvance(false);
  }, [step]);

  const missing = missingForStep(step, draft);
  const canNext = missing.length === 0;
  const isLast = step === STEPS.length - 1;
  const title = editing ? "Editing report" : `Step ${step + 1} of ${STEPS.length}: ${STEPS[step].long}`;

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col px-4 pb-32 pt-4 sm:px-6 sm:pt-6">
      <div className="mb-4 flex items-center gap-3 no-print">
        <Button onClick={onBack} variant="outline" size="sm">
          <ArrowLeft className="size-4" />
          {editing ? "Back to report" : "Save & exit"}
        </Button>
        <div className="min-w-0 flex-1">
          <div className="truncate text-base font-bold text-navy">{title}</div>
          {draft.jobNumber && (
            <div className="truncate text-xs text-muted-foreground">#{draft.jobNumber}</div>
          )}
        </div>
        {onDiscard && !editing && (
          <Button
            onClick={() => setConfirmDiscard(true)}
            variant="destructive"
            size="sm"
          >
            <Trash2 className="size-4" />
            Throw away
          </Button>
        )}
      </div>

      <div className="mb-5 flex gap-1.5 no-print">
        {STEPS.map((s, i) => (
          <div
            key={s.short}
            className={cn(
              "h-2 flex-1 rounded-full transition-colors",
              i <= step ? "bg-primary" : "bg-slate-200"
            )}
          />
        ))}
      </div>

      <Card className="flex-1">
        <CardContent className="p-4 sm:p-6">
          {step === 0 && <StepSite draft={draft} upd={upd} />}
          {step === 1 && (
            <StepEquipment
              draft={draft}
              addItem={addItem}
              updateItem={updateItem}
              removeItem={removeItem}
            />
          )}
          {step === 2 && <StepChecklist draft={draft} updateItem={updateItem} />}
          {step === 3 && <StepFinish draft={draft} upd={upd} />}
        </CardContent>
      </Card>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t bg-background/95 backdrop-blur no-print pb-[env(safe-area-inset-bottom)]">
        <div className="mx-auto max-w-2xl px-4 py-3 sm:px-6">
          {triedAdvance && !canNext && !isLast && missing.length > 0 && (
            <div className="mb-2 rounded-md border border-warn bg-warn/10 px-3 py-2 text-xs font-semibold text-warn-foreground">
              <div className="mb-0.5 font-bold">Please fill in:</div>
              <ul className="list-disc pl-4 leading-tight">
                {missing.slice(0, 4).map((m) => (
                  <li key={m}>{m}</li>
                ))}
                {missing.length > 4 && <li>and {missing.length - 4} more</li>}
              </ul>
            </div>
          )}
          <div className="flex items-center gap-3">
            <Button
              onClick={() => setStep((s) => s - 1)}
              disabled={step === 0}
              variant="outline"
              size="lg"
              className="flex-1"
            >
              <ArrowLeft className="size-4" />
              Previous step
            </Button>
            {isLast ? (
              <Button onClick={onSubmit} size="xl" className="flex-[2] text-base">
                <Check className="size-5" />
                {editing ? "Save changes" : "Send Report"}
              </Button>
            ) : (
              <Button
                onClick={() => {
                  if (!canNext) {
                    setTriedAdvance(true);
                    return;
                  }
                  setStep((s) => s + 1);
                }}
                aria-disabled={!canNext}
                size="xl"
                className={cn("flex-[2] text-base", !canNext && "opacity-60")}
              >
                Next
                <ArrowRight className="size-5" />
              </Button>
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmDiscard}
        title="Throw this away?"
        description="Everything you've entered so far will be deleted. You can't undo this."
        confirmLabel="Throw away"
        destructive
        onConfirm={() => {
          setConfirmDiscard(false);
          onDiscard?.();
        }}
        onCancel={() => setConfirmDiscard(false)}
      />
    </div>
  );
}
