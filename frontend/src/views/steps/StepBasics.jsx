import { useState } from "react";
import { Camera, ChevronDown, ChevronUp, Upload, X } from "lucide-react";
import { Field } from "@/components/Field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EQUIPMENT_TYPES, EQUIPMENT_ICONS } from "@/lib/equipment";
import { cn } from "@/lib/utils";

export function StepBasics({ draft, upd, updEquipmentType }) {
  const [showMore, setShowMore] = useState(false);

  const onPhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => upd("serialPhoto", reader.result);
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="mb-3 text-sm font-semibold text-navy">Equipment Type</div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {Object.keys(EQUIPMENT_TYPES).map((type) => {
            const selected = draft.equipmentType === type;
            return (
              <button
                key={type}
                type="button"
                onClick={() => updEquipmentType(type)}
                className={cn(
                  "flex h-20 flex-col items-center justify-center rounded-xl border-2 p-2 text-center transition-colors",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  selected
                    ? "border-primary bg-brand-50"
                    : "border-slate-200 bg-white hover:border-primary/40"
                )}
              >
                <div className="text-2xl leading-none">{EQUIPMENT_ICONS[type] || "🏋️"}</div>
                <div className="mt-1 text-xs font-semibold leading-tight text-navy">
                  {type}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-4">
        <Field label="Client" required htmlFor="clientName">
          <Input
            id="clientName"
            className="h-12 text-base"
            value={draft.clientName}
            onChange={(e) => upd("clientName", e.target.value)}
            placeholder="e.g. Gold's Gym Sydney"
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Brand" required htmlFor="brand">
            <Input
              id="brand"
              className="h-12 text-base"
              value={draft.brand}
              onChange={(e) => upd("brand", e.target.value)}
              placeholder="Life Fitness"
            />
          </Field>
          <Field label="Model" required htmlFor="model">
            <Input
              id="model"
              className="h-12 text-base"
              value={draft.model}
              onChange={(e) => upd("model", e.target.value)}
              placeholder="T5 Track+"
            />
          </Field>
        </div>
      </div>

      <div>
        <button
          type="button"
          onClick={() => setShowMore((v) => !v)}
          className="flex w-full items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-semibold text-navy-soft"
        >
          More details (optional)
          {showMore ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
        </button>

        {showMore && (
          <div className="mt-4 space-y-4">
            <Field label="Site Address" htmlFor="siteAddress">
              <Input
                id="siteAddress"
                className="h-12 text-base"
                value={draft.siteAddress}
                onChange={(e) => upd("siteAddress", e.target.value)}
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Serial Number" htmlFor="serial">
                <Input
                  id="serial"
                  className="h-12 text-base"
                  value={draft.serialNumber}
                  onChange={(e) => upd("serialNumber", e.target.value)}
                />
              </Field>
              <Field label="Asset / Internal ID" htmlFor="asset">
                <Input
                  id="asset"
                  className="h-12 text-base"
                  value={draft.assetId}
                  onChange={(e) => upd("assetId", e.target.value)}
                />
              </Field>
              <Field label="Location" htmlFor="location">
                <Input
                  id="location"
                  className="h-12 text-base"
                  value={draft.location}
                  onChange={(e) => upd("location", e.target.value)}
                  placeholder="Cardio Floor 2"
                />
              </Field>
              <Field label="Hours on Unit" htmlFor="hours">
                <Input
                  id="hours"
                  type="number"
                  inputMode="numeric"
                  min="0"
                  className="h-12 text-base"
                  value={draft.hoursOnUnit}
                  onChange={(e) => upd("hoursOnUnit", e.target.value)}
                />
              </Field>
              <Field label="Install Date" htmlFor="installDate">
                <Input
                  id="installDate"
                  type="date"
                  className="h-12 text-base"
                  value={draft.installDate}
                  onChange={(e) => upd("installDate", e.target.value)}
                />
              </Field>
              <Field label="Age (years)" htmlFor="ageYears">
                <Input
                  id="ageYears"
                  type="number"
                  inputMode="numeric"
                  min="0"
                  className="h-12 text-base"
                  value={draft.ageYears}
                  onChange={(e) => upd("ageYears", e.target.value)}
                />
              </Field>
              <Field label="Job Number" htmlFor="jobNumber">
                <Input
                  id="jobNumber"
                  className="h-12 text-base"
                  value={draft.jobNumber}
                  onChange={(e) => upd("jobNumber", e.target.value)}
                />
              </Field>
              <Field label="Date" htmlFor="date">
                <Input
                  id="date"
                  type="date"
                  className="h-12 text-base"
                  value={draft.date}
                  onChange={(e) => upd("date", e.target.value)}
                />
              </Field>
            </div>

            <Field label="Serial Number Photo">
              <div className="flex items-center gap-3 rounded-lg border-2 border-dashed border-slate-200 bg-slate-50 p-3">
                {draft.serialPhoto ? (
                  <img
                    src={draft.serialPhoto}
                    alt="Serial"
                    className="h-16 w-16 flex-shrink-0 rounded-md border object-cover"
                  />
                ) : (
                  <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-md border bg-white text-muted-foreground">
                    <Camera className="size-6" />
                  </div>
                )}
                <div className="flex flex-wrap gap-2">
                  <Button asChild variant="secondary" size="sm">
                    <label className="cursor-pointer">
                      <Upload className="size-4" />
                      {draft.serialPhoto ? "Replace" : "Upload"}
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
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
            </Field>
          </div>
        )}
      </div>
    </div>
  );
}
