import { useState } from "react";
import { toast } from "sonner";
import {
  Camera,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EquipmentIcon } from "@/components/EquipmentIcon";
import {
  EQUIPMENT_TYPES,
  GRADES,
  GRADE_SHORT,
  GRADE_TW,
  REPLACEMENT_GRADE,
  itemProgress,
} from "@/lib/equipment";
import { compressImage } from "@/lib/image";
import { cn } from "@/lib/utils";

function ProgressRing({ graded, total, blocked }) {
  const SIZE = 36;
  const STROKE = 4;
  const R = (SIZE - STROKE) / 2;
  const C = 2 * Math.PI * R;
  const pct = total > 0 ? graded / total : 0;
  const len = pct * C;
  const color = blocked > 0 ? "#dc2626" : graded === total && total > 0 ? "#16a34a" : "#0ea5e9";
  return (
    <div className="relative" style={{ width: SIZE, height: SIZE }}>
      <svg width={SIZE} height={SIZE}>
        <circle cx={SIZE / 2} cy={SIZE / 2} r={R} fill="none" stroke="#e5e7eb" strokeWidth={STROKE} />
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={R}
          fill="none"
          stroke={color}
          strokeWidth={STROKE}
          strokeDasharray={`${len} ${C - len}`}
          transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-[10px] font-bold tabular-nums text-neutral-700">
        {graded}/{total}
      </div>
    </div>
  );
}

function ReplacementPhoto({ value, onChange }) {
  const [busy, setBusy] = useState(false);
  const handle = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setBusy(true);
    try {
      const dataUrl = await compressImage(file);
      onChange(dataUrl);
    } catch (err) {
      toast.error(err.message || "Couldn't process that photo");
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="mt-2 flex items-center gap-2 rounded-md border border-red-200 bg-red-50/60 p-2">
      {value ? (
        <img src={value} alt="Issue" className="h-12 w-12 flex-shrink-0 rounded border object-cover" />
      ) : (
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded border bg-white text-red-600">
          <Camera className="size-5" />
        </div>
      )}
      <div className="flex-1 text-xs font-semibold text-red-800">
        Add a photo of the problem
      </div>
      <Button asChild size="sm" disabled={busy}>
        <label className="cursor-pointer">
          {busy ? <Loader2 className="size-4 animate-spin" /> : <Camera className="size-4" />}
          {busy ? "…" : value ? "Retake" : "Take photo"}
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handle}
            className="hidden"
            disabled={busy}
          />
        </label>
      </Button>
      {value && !busy && (
        <Button variant="ghost" size="sm" onClick={() => onChange(null)}>
          <X className="size-4" />
        </Button>
      )}
    </div>
  );
}

function ChecklistRows({ item, updateItem }) {
  const items = EQUIPMENT_TYPES[item.equipmentType] || [];
  const setCell = (label, patch) => {
    const next = {
      ...(item.checklist || {}),
      [label]: {
        ...(item.checklist?.[label] || { grade: null, notes: "" }),
        ...patch,
      },
    };
    updateItem(item.id, { checklist: next });
  };
  return (
    <div className="space-y-2.5">
      {items.map((label) => {
        const cell = item.checklist?.[label] || { grade: null, notes: "" };
        const grade = cell.grade;
        const tw = grade ? GRADE_TW[grade] : null;
        const needsPhoto = grade === REPLACEMENT_GRADE;
        return (
          <div
            key={label}
            className={cn(
              "rounded-lg border p-3 transition-colors",
              tw ? `${tw.bg} ${tw.border}` : "border-slate-200 bg-white"
            )}
          >
            <div className="mb-2 text-sm font-semibold text-navy-soft">{label}</div>
            <div className="mb-2 grid grid-cols-3 gap-1.5">
              {GRADES.map((g) => {
                const sel = grade === g;
                const gtw = GRADE_TW[g];
                return (
                  <button
                    key={g}
                    type="button"
                    onClick={() => {
                      const sameAsCurrent = grade === g;
                      setCell(label, {
                        grade: sameAsCurrent ? null : g,
                        // Clear photo if user moves away from replacement
                        photo: sameAsCurrent || g !== REPLACEMENT_GRADE ? null : cell.photo || null,
                      });
                    }}
                    className={cn(
                      "h-12 rounded-md border-2 text-sm font-bold transition-colors",
                      "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      sel
                        ? `${gtw.solid} border-transparent shadow-sm`
                        : "bg-white text-neutral-600 border-neutral-200 active:bg-neutral-50"
                    )}
                  >
                    {GRADE_SHORT[g]}
                  </button>
                );
              })}
            </div>
            <Input
              value={cell.notes || ""}
              onChange={(e) => setCell(label, { notes: e.target.value })}
              placeholder="Notes (optional)"
              className="h-10 bg-white text-sm"
            />
            {needsPhoto && (
              <ReplacementPhoto
                value={cell.photo || null}
                onChange={(v) => setCell(label, { photo: v })}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export function StepChecklist({ draft, updateItem }) {
  const items = draft.items || [];
  // Default: first incomplete item open. Map id -> bool.
  const firstIncomplete =
    items.find((it) => {
      const p = itemProgress(it);
      return p.graded < p.total || p.blocked > 0;
    }) || items[0];
  const [open, setOpen] = useState(() =>
    firstIncomplete ? { [firstIncomplete.id]: true } : {}
  );
  const toggle = (id) => setOpen((o) => ({ ...o, [id]: !o[id] }));

  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-200 p-6 text-center text-sm text-muted-foreground">
        Go back to the previous step and add a machine first.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-lg font-bold text-navy">Rate every machine</h2>
        <p className="text-sm text-muted-foreground">
          Tap a button for each row: Good, Worn, or Replace. If you pick Replace, snap a photo of the problem.
        </p>
      </div>

      {items.map((it, idx) => {
        const progress = itemProgress(it);
        const isOpen = !!open[it.id];
        const done = progress.total > 0 && progress.graded === progress.total && progress.blocked === 0;
        return (
          <div
            key={it.id}
            className={cn(
              "overflow-hidden rounded-xl border bg-white",
              done ? "border-emerald-300" : progress.blocked > 0 ? "border-red-300" : "border-slate-200"
            )}
          >
            <button
              type="button"
              onClick={() => toggle(it.id)}
              className="flex w-full items-center gap-3 p-3 text-left"
            >
              {it.distancePhoto ? (
                <img
                  src={it.distancePhoto}
                  alt=""
                  className="h-12 w-12 flex-shrink-0 rounded border object-cover"
                />
              ) : (
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded border bg-slate-50 text-slate-400">
                  <EquipmentIcon type={it.equipmentType} className="size-5" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <div className="truncate text-sm font-bold text-navy">
                    {it.equipmentType}
                    <span className="ml-1.5 text-[10px] font-semibold text-neutral-500">
                      #{idx + 1}
                    </span>
                  </div>
                  {done && <CheckCircle2 className="size-4 text-emerald-600" />}
                  {progress.blocked > 0 && <AlertCircle className="size-4 text-red-600" />}
                </div>
                <div className="truncate text-xs text-muted-foreground">
                  {[it.brand, it.model].filter(Boolean).join(" ") || "—"}
                  {it.serialNumber ? ` · SN ${it.serialNumber}` : ""}
                </div>
              </div>
              <ProgressRing
                graded={progress.graded}
                total={progress.total}
                blocked={progress.blocked}
              />
              {isOpen ? (
                <ChevronUp className="size-4 text-neutral-400" />
              ) : (
                <ChevronDown className="size-4 text-neutral-400" />
              )}
            </button>
            {isOpen && (
              <div className="border-t border-slate-100 bg-slate-50 p-3">
                <ChecklistRows item={it} updateItem={updateItem} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
