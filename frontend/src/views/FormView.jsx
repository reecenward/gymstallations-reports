import { useState } from "react";
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

const STEPS = ["Site", "Equipment", "Inspection", "Notes"];

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

  const items = draft.items || [];

  const canNext = () => {
    if (step === 0) {
      return !!(
        draft.clientName &&
        draft.siteAddress &&
        draft.technicianName &&
        draft.date &&
        draft.jobNumber
      );
    }
    if (step === 1) {
      if (items.length === 0) return false;
      return items.every(
        (it) => it.brand && it.model && it.serialNumber && it.distancePhoto
      );
    }
    if (step === 2) {
      return items.every(itemComplete);
    }
    return true;
  };

  const isLast = step === STEPS.length - 1;
  const title = editing ? "Edit Report" : "New Report";

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col px-4 pb-28 pt-4 sm:px-6 sm:pt-6">
      <div className="mb-4 flex items-center gap-3 no-print">
        <Button onClick={onBack} variant="ghost" size="icon" aria-label="Back">
          <ArrowLeft className="size-5" />
        </Button>
        <div className="min-w-0 flex-1">
          <div className="truncate text-base font-bold text-navy">{title}</div>
          <div className="truncate text-xs text-muted-foreground">#{draft.jobNumber}</div>
        </div>
        {onDiscard && !editing && (
          <Button
            onClick={() => setConfirmDiscard(true)}
            variant="ghost"
            size="icon"
            aria-label="Discard draft"
          >
            <Trash2 className="size-5" />
          </Button>
        )}
      </div>

      <div className="mb-5 flex gap-1.5 no-print">
        {STEPS.map((label, i) => (
          <div key={label} className="flex-1">
            <div
              className={cn(
                "h-1.5 rounded-full transition-colors",
                i <= step ? "bg-primary" : "bg-slate-200"
              )}
            />
            <div
              className={cn(
                "mt-1 text-center text-[11px] font-semibold",
                i === step ? "text-primary" : "text-muted-foreground"
              )}
            >
              {label}
            </div>
          </div>
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
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-3 sm:px-6">
          <Button
            onClick={() => setStep((s) => s - 1)}
            disabled={step === 0}
            variant="outline"
            size="lg"
            className="flex-1"
          >
            <ArrowLeft className="size-4" />
            Back
          </Button>
          {isLast ? (
            <Button onClick={onSubmit} variant="success" size="lg" className="flex-1">
              <Check className="size-4" />
              {editing ? "Save" : "Submit"}
            </Button>
          ) : (
            <Button
              onClick={() => setStep((s) => s + 1)}
              disabled={!canNext()}
              size="lg"
              className="flex-1"
            >
              Next
              <ArrowRight className="size-4" />
            </Button>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={confirmDiscard}
        title="Discard this draft?"
        description="Anything you've entered so far will be permanently removed."
        confirmLabel="Discard"
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
