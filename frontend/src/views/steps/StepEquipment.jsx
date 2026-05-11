import { Camera, Upload, X } from "lucide-react";
import { Field } from "@/components/Field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EQUIPMENT_ICONS } from "@/lib/equipment";

export function StepEquipment({ draft, upd }) {
  const onPhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => upd("serialPhoto", reader.result);
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-5">
      <div>
        <div className="text-lg font-bold text-navy">Equipment Details</div>
        <Badge variant="warn" className="mt-2 gap-1.5 border-brand-200 bg-brand-50 text-brand">
          <span>{EQUIPMENT_ICONS[draft.equipmentType] || "🏋️"}</span>
          <span>{draft.equipmentType || "No equipment type selected"}</span>
        </Badge>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Brand" required htmlFor="brand">
          <Input
            id="brand"
            value={draft.brand}
            onChange={(e) => upd("brand", e.target.value)}
            placeholder="e.g. Life Fitness"
          />
        </Field>
        <Field label="Model" required htmlFor="model">
          <Input
            id="model"
            value={draft.model}
            onChange={(e) => upd("model", e.target.value)}
            placeholder="e.g. T5 Track+"
          />
        </Field>
        <Field label="Serial Number" htmlFor="serial">
          <Input
            id="serial"
            value={draft.serialNumber}
            onChange={(e) => upd("serialNumber", e.target.value)}
            placeholder="e.g. LFT5-2024-..."
          />
        </Field>
        <Field label="Asset / Internal ID" htmlFor="asset">
          <Input
            id="asset"
            value={draft.assetId}
            onChange={(e) => upd("assetId", e.target.value)}
            placeholder="e.g. ASSET-00421"
          />
        </Field>
        <Field label="Location / Floor" htmlFor="location">
          <Input
            id="location"
            value={draft.location}
            onChange={(e) => upd("location", e.target.value)}
            placeholder="e.g. Cardio Floor 2"
          />
        </Field>
        <Field label="Hours on Unit" htmlFor="hours">
          <Input
            id="hours"
            type="number"
            inputMode="numeric"
            min="0"
            value={draft.hoursOnUnit}
            onChange={(e) => upd("hoursOnUnit", e.target.value)}
            placeholder="0"
          />
        </Field>
        <Field label="Manufacturing Date" htmlFor="mfgDate">
          <Input
            id="mfgDate"
            type="date"
            value={draft.manufacturingDate}
            onChange={(e) => upd("manufacturingDate", e.target.value)}
          />
        </Field>
        <Field label="Install Date" htmlFor="installDate">
          <Input
            id="installDate"
            type="date"
            value={draft.installDate}
            onChange={(e) => upd("installDate", e.target.value)}
          />
        </Field>
        <Field label="Age (Years)" htmlFor="ageYears">
          <Input
            id="ageYears"
            type="number"
            inputMode="numeric"
            min="0"
            value={draft.ageYears}
            onChange={(e) => upd("ageYears", e.target.value)}
            placeholder="0"
          />
        </Field>
      </div>

      <Field label="Serial Number Photo">
        <div className="flex flex-col gap-3 rounded-lg border-2 border-dashed border-slate-200 bg-slate-50 p-3 sm:flex-row sm:items-center sm:gap-4 sm:p-4">
          {draft.serialPhoto ? (
            <img
              src={draft.serialPhoto}
              alt="Serial number"
              className="h-24 w-24 flex-shrink-0 rounded-md border object-cover"
            />
          ) : (
            <div className="flex h-24 w-24 flex-shrink-0 items-center justify-center rounded-md border bg-white text-muted-foreground">
              <Camera className="size-7" />
            </div>
          )}
          <div className="flex-1">
            <div className="mb-2 text-sm text-muted-foreground">
              Upload a photo of the equipment serial plate.
            </div>
            <div className="flex flex-wrap gap-2">
              <Button asChild variant="secondary" size="sm">
                <label className="cursor-pointer">
                  <Upload className="size-4" />
                  {draft.serialPhoto ? "Replace Photo" : "Upload Photo"}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={onPhotoChange}
                    className="hidden"
                  />
                </label>
              </Button>
              {draft.serialPhoto && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => upd("serialPhoto", null)}
                >
                  <X className="size-4" />
                  Remove
                </Button>
              )}
            </div>
          </div>
        </div>
      </Field>
    </div>
  );
}
