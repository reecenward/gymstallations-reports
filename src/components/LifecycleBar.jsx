import { COMMERCIAL_LIFE_YEARS } from "@/lib/equipment";
import { cn } from "@/lib/utils";

const fmt = (d) => d.toISOString().slice(0, 10);

function LifecycleStat({ label, value, warn }) {
  return (
    <div
      className={cn(
        "rounded-md border p-2.5 text-center",
        warn ? "border-red-200 bg-red-50" : "border-slate-200 bg-slate-50"
      )}
    >
      <div
        className={cn(
          "text-[10px] font-bold uppercase tracking-wider",
          warn ? "text-red-600" : "text-muted-foreground"
        )}
      >
        {label}
      </div>
      <div
        className={cn(
          "text-sm font-bold",
          warn ? "text-red-700" : "text-navy-soft"
        )}
      >
        {value}
      </div>
    </div>
  );
}

export function LifecycleBar({ manufacturingDate, installDate }) {
  if (!manufacturingDate) {
    return (
      <div className="rounded-md border border-dashed border-slate-200 bg-slate-50 p-3 text-center text-sm text-muted-foreground">
        Add a Manufacturing Date to see the lifecycle timeline.
      </div>
    );
  }
  const mfg = new Date(manufacturingDate);
  const end = new Date(mfg);
  end.setFullYear(end.getFullYear() + COMMERCIAL_LIFE_YEARS);
  const today = new Date();
  const install = installDate ? new Date(installDate) : null;

  const span = end - mfg;
  const pct = (d) => Math.max(0, Math.min(100, ((d - mfg) / span) * 100));
  const todayPct = pct(today);
  const installPct = install ? pct(install) : null;

  const yearsUsed = Math.max(
    0,
    (today - mfg) / (1000 * 60 * 60 * 24 * 365.25)
  );
  const yearsRemaining = Math.max(0, COMMERCIAL_LIFE_YEARS - yearsUsed);
  const overdue = today > end;

  return (
    <div>
      <div className="relative mb-3 mt-6 h-7 rounded-full border bg-gradient-to-r from-emerald-100 via-sky-100 via-50% via-amber-100 to-red-100">
        {installPct !== null && (
          <div
            title={`Installed ${fmt(install)}`}
            className="absolute -top-2 h-11 w-0.5 -translate-x-1/2 bg-navy-soft"
            style={{ left: `${installPct}%` }}
          />
        )}
        <div
          title={`Today ${fmt(today)}`}
          className="absolute -top-5 flex -translate-x-1/2 flex-col items-center"
          style={{ left: `${todayPct}%` }}
        >
          <span className="rounded-sm bg-primary px-1.5 py-0.5 text-[10px] font-bold leading-none text-white">
            TODAY
          </span>
          <div className="mt-0.5 h-8 w-0.5 bg-primary" />
        </div>
      </div>
      <div className="mb-3 flex justify-between text-[11px] font-semibold text-muted-foreground">
        <span>Mfg {fmt(mfg)}</span>
        <span>End-of-life {fmt(end)}</span>
      </div>
      <div className="grid grid-cols-3 gap-2 text-xs">
        <LifecycleStat label="Age" value={`${yearsUsed.toFixed(1)} yrs`} />
        <LifecycleStat
          label="Expected Life"
          value={`${COMMERCIAL_LIFE_YEARS} yrs`}
        />
        <LifecycleStat
          label={overdue ? "Past End-of-Life" : "Remaining"}
          value={
            overdue
              ? `${(yearsUsed - COMMERCIAL_LIFE_YEARS).toFixed(1)} yrs over`
              : `${yearsRemaining.toFixed(1)} yrs`
          }
          warn={overdue}
        />
      </div>
    </div>
  );
}
