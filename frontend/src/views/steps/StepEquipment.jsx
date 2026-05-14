import { useState } from "react";
import { toast } from "sonner";
import { Camera, Loader2, Trash2, X } from "lucide-react";
import { Field } from "@/components/Field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EquipmentIcon } from "@/components/EquipmentIcon";
import { EQUIPMENT_TYPES } from "@/lib/equipment";
import { compressImage } from "@/lib/image";
import { cn } from "@/lib/utils";

function PhotoPicker({ value, onChange }) {
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
    <div className="flex items-center gap-3 rounded-lg border-2 border-dashed border-slate-200 bg-slate-50 p-3">
      {value ? (
        <img
          src={value}
          alt="Equipment"
          className="h-16 w-16 flex-shrink-0 rounded-md border object-cover"
        />
      ) : (
        <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-md border bg-white text-muted-foreground">
          <Camera className="size-6" />
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        <Button asChild size="sm" disabled={busy}>
          <label className="cursor-pointer">
            {busy ? <Loader2 className="size-4 animate-spin" /> : <Camera className="size-4" />}
            {busy ? "Processing…" : value ? "Retake" : "Take photo"}
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
          <Button variant="outline" size="sm" onClick={() => onChange(null)}>
            <X className="size-4" />
            Remove
          </Button>
        )}
      </div>
    </div>
  );
}

export function StepEquipment({ draft, addItem, updateItem, removeItem }) {
  const items = draft.items || [];

  // Group counts for the type picker
  const counts = items.reduce((acc, it) => {
    acc[it.equipmentType] = (acc[it.equipmentType] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-1 text-lg font-bold text-navy">What's on site?</h2>
        <p className="mb-3 text-sm text-muted-foreground">
          Tap a type to add one. You can add as many as you need.
        </p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {Object.keys(EQUIPMENT_TYPES).map((type) => {
            const n = counts[type] || 0;
            return (
              <button
                key={type}
                type="button"
                onClick={() => addItem(type)}
                className={cn(
                  "relative flex h-20 flex-col items-center justify-center rounded-xl border-2 p-2 text-center transition-colors",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  n > 0
                    ? "border-primary bg-brand-50"
                    : "border-slate-200 bg-white hover:border-primary/40"
                )}
              >
                <EquipmentIcon type={type} className="size-6" />
                <div className="mt-1.5 text-xs font-semibold leading-tight text-navy">
                  {type}
                </div>
                {n > 0 && (
                  <span className="absolute right-1.5 top-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">
                    {n}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {items.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-200 p-6 text-center text-sm text-muted-foreground">
          Tap a type above to add your first machine.
        </div>
      ) : (
        <div className="space-y-3">
          <div className="text-sm font-semibold text-navy">
            {items.length} machine{items.length === 1 ? "" : "s"} added
          </div>
          {items.map((it, idx) => (
            <div
              key={it.id}
              className="rounded-xl border border-slate-200 bg-white p-4"
            >
              <div className="mb-3 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-sm font-bold text-navy">
                  <EquipmentIcon type={it.equipmentType} className="size-4" />
                  {it.equipmentType}
                  <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-semibold text-neutral-600">
                    #{idx + 1}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeItem(it.id)}
                >
                  <Trash2 className="size-4" />
                  Remove
                </Button>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Brand" required htmlFor={`brand-${it.id}`}>
                  <Input
                    id={`brand-${it.id}`}
                    className="h-11 text-base"
                    value={it.brand}
                    onChange={(e) => updateItem(it.id, { brand: e.target.value })}
                    placeholder="Life Fitness"
                  />
                </Field>
                <Field label="Model" required htmlFor={`model-${it.id}`}>
                  <Input
                    id={`model-${it.id}`}
                    className="h-11 text-base"
                    value={it.model}
                    onChange={(e) => updateItem(it.id, { model: e.target.value })}
                    placeholder="T5 Track+"
                  />
                </Field>
                <Field label="Serial number" required htmlFor={`serial-${it.id}`}>
                  <Input
                    id={`serial-${it.id}`}
                    className="h-11 text-base"
                    value={it.serialNumber}
                    onChange={(e) =>
                      updateItem(it.id, { serialNumber: e.target.value })
                    }
                    placeholder="From the sticker on the machine"
                  />
                </Field>
                <Field label="Where on the floor?" htmlFor={`loc-${it.id}`}>
                  <Input
                    id={`loc-${it.id}`}
                    className="h-11 text-base"
                    value={it.location}
                    onChange={(e) => updateItem(it.id, { location: e.target.value })}
                    placeholder="Cardio Floor 2"
                  />
                </Field>
              </div>

              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <Field label="Photo of the whole machine" required>
                  <PhotoPicker
                    value={it.distancePhoto}
                    onChange={(v) => updateItem(it.id, { distancePhoto: v })}
                  />
                </Field>
                <Field label="Photo of the serial number" required>
                  <PhotoPicker
                    value={it.serialPhoto}
                    onChange={(v) => updateItem(it.id, { serialPhoto: v })}
                  />
                </Field>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
