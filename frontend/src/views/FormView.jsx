import { ArrowLeft, ArrowRight, Check, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StepBasics } from "@/views/steps/StepBasics";
import { StepChecklist } from "@/views/steps/StepChecklist";
import { StepFinish } from "@/views/steps/StepFinish";
import { cn } from "@/lib/utils";

const STEPS = ["Basics", "Inspection", "Notes"];

export function FormView({
  step,
  setStep,
  draft,
  upd,
  updEquipmentType,
  updChecklistGrade,
  updChecklistNotes,
  onSubmit,
  onBack,
  onDiscard,
}) {
  const canNext = () => {
    if (step === 0) return !!draft.equipmentType && !!draft.clientName && !!draft.brand && !!draft.model;
    return true;
  };

  const isLast = step === STEPS.length - 1;

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col px-4 pb-28 pt-4 sm:px-6 sm:pt-6">
      <div className="mb-4 flex items-center gap-3 no-print">
        <Button
          onClick={onBack}
          variant="ghost"
          size="icon"
          aria-label="Back to dashboard"
        >
          <ArrowLeft className="size-5" />
        </Button>
        <div className="min-w-0 flex-1">
          <div className="truncate text-base font-bold text-navy">
            New Report
          </div>
          <div className="truncate text-xs text-muted-foreground">
            #{draft.jobNumber}
          </div>
        </div>
        {onDiscard && (
          <Button
            onClick={() => {
              if (confirm("Discard this draft? This can't be undone.")) onDiscard();
            }}
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
          {step === 0 && (
            <StepBasics draft={draft} upd={upd} updEquipmentType={updEquipmentType} />
          )}
          {step === 1 && (
            <StepChecklist
              draft={draft}
              updChecklistGrade={updChecklistGrade}
              updChecklistNotes={updChecklistNotes}
            />
          )}
          {step === 2 && <StepFinish draft={draft} upd={upd} />}
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
              Submit
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
    </div>
  );
}
