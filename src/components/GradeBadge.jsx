import { GRADE_TW } from "@/lib/equipment";
import { cn } from "@/lib/utils";

export function GradePill({ grade, count, label, className }) {
  const tw = GRADE_TW[grade];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold",
        tw ? `${tw.bg} ${tw.border} ${tw.text}` : "border-slate-200 bg-slate-50 text-slate-600",
        className
      )}
    >
      <span className="font-bold">{count}</span>
      <span>{label}</span>
    </span>
  );
}

export function GradeStat({ grade, count, label }) {
  const tw = GRADE_TW[grade];
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-lg border p-3 text-center",
        tw ? `${tw.bg} ${tw.border}` : "border-slate-200 bg-slate-50"
      )}
    >
      <div className={cn("text-2xl font-extrabold", tw ? tw.text : "text-slate-600")}>
        {count}
      </div>
      <div
        className={cn(
          "text-[10px] font-bold uppercase tracking-wider",
          tw ? tw.text : "text-slate-600"
        )}
      >
        {label}
      </div>
    </div>
  );
}
