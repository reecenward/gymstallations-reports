import {
  Activity,
  Bike,
  Cable,
  Dumbbell,
  Footprints,
  TrendingUp,
  Waves,
  Wrench,
} from "lucide-react";

const ICON_MAP = {
  Treadmill: Footprints,
  Elliptical: Activity,
  "Stair Climber": TrendingUp,
  "Spin Bike": Bike,
  "Upright / Recumbent Bike": Bike,
  "All Cable Equipment": Cable,
  Rower: Waves,
  "Plate Loaded Equipment": Dumbbell,
};

export function EquipmentIcon({ type, className = "size-5", strokeWidth = 1.75 }) {
  const Icon = ICON_MAP[type] || Wrench;
  return <Icon className={className} strokeWidth={strokeWidth} />;
}
