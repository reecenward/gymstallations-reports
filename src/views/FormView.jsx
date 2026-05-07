import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { StepEquipmentType } from "@/views/steps/StepEquipmentType";
import { StepJobInfo } from "@/views/steps/StepJobInfo";
import { StepEquipment } from "@/views/steps/StepEquipment";
import { StepChecklist } from "@/views/steps/StepChecklist";
import { StepTechNotes } from "@/views/steps/StepTechNotes";
import { StepReview } from "@/views/steps/StepReview";
import { cn } from "@/lib/utils";

const STEPS = [
  "Equipment Type",
  "Job Info",
  "Equipment",
  "Inspection",
  "Tech Notes",
  "Review",
];

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
}) {
  const canNext = () => {
    if (step === 0) return !!draft.equipmentType;
    if (step === 1) return draft.clientName && draft.technicianName && draft.date;
    if (step === 2) return draft.brand && draft.model;
    return true;
  };

  const progress = ((step + 1) / STEPS.length) * 100;
  const isLast = step === STEPS.length - 1;

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col px-4 pb-28 pt-5 sm:px-6 sm:pt-8">
      <div className="mb-5 flex items-center gap-3 no-print">
        <Button
          onClick={onBack}
          variant="ghost"
          size="icon"
          aria-label="Back to dashboard"
        >
          <ArrowLeft className="size-5" />
        </Button>
        <div className="min-w-0 flex-1">
          <div className="truncate text-base font-bold text-navy sm:text-lg">
            New Service Report
          </div>
          <div className="truncate text-xs text-muted-foreground">
            Job #{draft.jobNumber}
          </div>
        </div>
      </div>

      <div className="mb-5 no-print">
        <div className="mb-2 flex items-center justify-between text-xs font-semibold">
          <span className="text-primary">
            Step {step + 1} of {STEPS.length}
          </span>
          <span className="text-navy-soft">{STEPS[step]}</span>
        </div>
        <Progress value={progress} />
        <div className="mt-3 hidden gap-1 md:flex">
          {STEPS.map((s, i) => (
            <div key={s} className="flex-1 text-center">
              <div
                className={cn(
                  "h-1 rounded-full",
                  i <= step ? "bg-primary" : "bg-slate-200"
                )}
              />
              <div
                className={cn(
                  "mt-1.5 truncate text-[10px]",
                  i === step
                    ? "font-bold text-primary"
                    : "text-muted-foreground"
                )}
              >
                {s}
              </div>
            </div>
          ))}
        </div>
      </div>

      <Card className="flex-1">
        <CardContent className="p-4 sm:p-6">
          {step === 0 && (
            <StepEquipmentType
              draft={draft}
              updEquipmentType={updEquipmentType}
            />
          )}
          {step === 1 && <StepJobInfo draft={draft} upd={upd} />}
          {step === 2 && <StepEquipment draft={draft} upd={upd} />}
          {step === 3 && (
            <StepChecklist
              draft={draft}
              updChecklistGrade={updChecklistGrade}
              updChecklistNotes={updChecklistNotes}
            />
          )}
          {step === 4 && <StepTechNotes draft={draft} upd={upd} />}
          {step === 5 && <StepReview draft={draft} />}
        </CardContent>
      </Card>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/75 no-print">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Button
            onClick={() => setStep((s) => s - 1)}
            disabled={step === 0}
            variant="outline"
            size="lg"
          >
            <ArrowLeft className="size-4" />
            Back
          </Button>
          {isLast ? (
            <Button onClick={onSubmit} variant="success" size="lg">
              <Check className="size-4" />
              Submit Report
            </Button>
          ) : (
            <Button
              onClick={() => setStep((s) => s + 1)}
              disabled={!canNext()}
              size="lg"
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
