import { Check } from "lucide-react";
import { EQUIPMENT_TYPES, EQUIPMENT_ICONS } from "@/lib/equipment";
import { cn } from "@/lib/utils";

export function StepEquipmentType({ draft, updEquipmentType }) {
  return (
    <div>
      <div className="mb-1 text-lg font-bold text-navy">
        Select Equipment Type
      </div>
      <p className="mb-5 text-sm text-muted-foreground">
        The inspection checklist is generated from the equipment type.
      </p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {Object.keys(EQUIPMENT_TYPES).map((type) => {
          const selected = draft.equipmentType === type;
          const itemCount = EQUIPMENT_TYPES[type].length;
          return (
            <button
              key={type}
              type="button"
              onClick={() => updEquipmentType(type)}
              className={cn(
                "relative flex flex-col rounded-xl border-2 p-3 sm:p-4 text-left transition-all",
                "hover:border-primary/60 hover:bg-brand-50/50",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
                selected
                  ? "border-primary bg-brand-50 shadow-sm"
                  : "border-slate-200 bg-white"
              )}
            >
              {selected && (
                <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white">
                  <Check className="size-3" />
                </span>
              )}
              <div className="mb-2 text-2xl sm:text-3xl">
                {EQUIPMENT_ICONS[type] || "🏋️"}
              </div>
              <div className="text-sm font-bold leading-tight text-navy">
                {type}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                {itemCount} inspection points
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
