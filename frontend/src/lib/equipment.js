export const GRADES = [
  "Excellent",
  "Good",
  "Acceptable - Has Wear",
  "Needs Replacement",
];

export const GRADE_SHORT = {
  Excellent: "Excellent",
  Good: "Good",
  "Acceptable - Has Wear": "Acceptable",
  "Needs Replacement": "Replace",
};

export const GRADE_COLORS = {
  Excellent: { fg: "#0a0a0a", bg: "#f5f5f5", border: "#0a0a0a", hex: "#0a0a0a" },
  Good: { fg: "#262626", bg: "#f5f5f5", border: "#404040", hex: "#404040" },
  "Acceptable - Has Wear": { fg: "#525252", bg: "#fafafa", border: "#a3a3a3", hex: "#a3a3a3" },
  "Needs Replacement": { fg: "#b91c1c", bg: "#fef2f2", border: "#fecaca", hex: "#dc2626" },
};

export const GRADE_TW = {
  Excellent: {
    text: "text-neutral-900",
    bg: "bg-neutral-100",
    border: "border-neutral-900",
    solid: "bg-neutral-900 text-white",
  },
  Good: {
    text: "text-neutral-800",
    bg: "bg-neutral-100",
    border: "border-neutral-500",
    solid: "bg-neutral-700 text-white",
  },
  "Acceptable - Has Wear": {
    text: "text-neutral-600",
    bg: "bg-neutral-50",
    border: "border-neutral-300",
    solid: "bg-neutral-400 text-white",
  },
  "Needs Replacement": {
    text: "text-red-700",
    bg: "bg-red-50",
    border: "border-red-300",
    solid: "bg-red-600 text-white",
  },
};

export const EQUIPMENT_TYPES = {
  Treadmill: [
    "Frame & structural integrity", "Handrails & console mounts", "Leveling & floor contact",
    "Running belt alignment", "Running belt condition", "Running belt tension",
    "Deck condition", "Drive belt condition", "Front & rear rollers",
    "Motor operation", "Motor compartment cleanliness", "Electronics / control board",
    "Console display & buttons", "Heart rate sensors", "Speed consistency",
    "Incline system operation", "Elevation screw condition", "Emergency stop function",
    "Overall noise & performance",
  ],
  Elliptical: [
    "Frame & structural integrity", "Handlebars (moving & fixed) stability", "Console mast & mounts",
    "Leveling & floor contact", "Pedal arms & linkage joints", "Pedal condition & grip surface",
    "Pedal alignment & tracking", "Crank system / axle condition",
    "Drive system (belt or generator) condition", "Flywheel operation & smoothness",
    "Resistance system operation (magnetic / generator)", "Resistance level consistency",
    "Rollers & guide rails (if applicable)", "Rail cleanliness & lubrication",
    "Bearings condition (arms, crank, rollers)", "Joint play / looseness check",
    "Motor (if motorized incline or resistance)", "Stride motion smoothness",
    "Incline system operation (if applicable)", "Console display & buttons",
    "Electronics / control board", "Heart rate sensors", "Speed consistency",
    "Emergency stop function", "Overall noise & performance",
  ],
  "Stair Climber": [
    "Frame & structure", "Steps & pedals", "Handrails", "Drive system",
    "Chain condition", "Chain tension", "Bearings", "Console display",
    "Buttons & controls", "Heart rate sensors", "Electrical connections",
    "Safety stop", "Noise & performance",
  ],
  "Spin Bike": [
    "Frame & structure", "Flywheel & resistance", "Pedals & threads",
    "Handlebars", "Seat & adjustments", "Belt/drive system", "Bearings",
    "Console / screen", "Connectivity",
  ],
  "Upright / Recumbent Bike": [
    "Frame & structural integrity", "Handlebars condition & stability",
    "Leveling & floor contact", "Seat post & adjustment mechanism",
    "Seat condition & padding", "Seat stability (no movement / play)",
    "Crank arms & pedal threads", "Pedal condition & straps (if applicable)",
    "Bottom bracket / crank smoothness", "Drive system (belt or chain) condition",
    "Drive system tension & alignment", "Bearings condition (crank, pedals, flywheel)",
    "Resistance system operation (magnetic / generator)", "Resistance level consistency",
    "Motor (if self-powered assist or incline)", "RPM / cadence accuracy",
    "Speed & resistance consistency", "Console display & buttons",
    "Electronics / control board", "Heart rate sensors", "Speed consistency",
    "Emergency stop function", "Overall noise & performance",
  ],
  "All Cable Equipment": [
    "Frame & structure", "Cables", "Pulleys", "Weight stack & guide rods",
    "Adjustment mechanisms", "Handles & attachments", "Fasteners & bolts",
    "Overall performance",
  ],
  Rower: [
    "Frame & structural integrity", "Rail condition & straightness",
    "Leveling & floor contact", "Seat condition & rollers",
    "Seat travel smoothness (rail glide)", "Footrests & straps condition",
    "Footrest adjustment mechanism", "Handle condition & grip",
    "Handle attachment (strap/cord connection)", "Chain / strap condition (wear, rust, fraying)",
    "Chain alignment & lubrication (if applicable)", "Return mechanism (recoil spring) function",
    "Drive system operation (chain/cord engagement)", "Flywheel & fan housing condition",
    "Damper adjustment & function", "Resistance feel consistency",
    "Stroke smoothness", "Bearings condition (seat, flywheel, rollers)",
    "Electronics / control board", "Monitor display (PM console)",
    "Buttons & connectivity (if applicable)",
  ],
  Skierg: [
    "Frame / wall mount / stand stability", "Mounting hardware integrity (wall or floor stand)",
    "Leveling & alignment", "Handles condition & straps",
    "Handle return system (cord retraction)", "Drive cords condition (fraying, wear)",
    "Cord tracking & alignment", "Pulley system condition",
    "Damper adjustment & function", "Resistance consistency",
    "Pull stroke smoothness (left/right balance)", "Bearings condition (flywheel, pulleys)",
    "Electronics / control board", "Monitor display (PM console)", "Buttons & connectivity",
  ],
  "Plate Loaded Equipment": [
    "Frame & structural integrity", "Welds & joints condition",
    "Leveling & floor contact", "Pivot points & rotation smoothness",
    "Bearings / bushings condition (pivot joints)", "Range of motion (full travel, no obstruction)",
    "Weight horns (plate holders) condition", "Weight horn sleeves (wear & damage)",
    "Cleanliness & lubrication", "Adjustment mechanisms (seat, backrest, start position)",
    "Adjustment pop pins / locking mechanisms", "Seat & backrest upholstery condition",
    "Foam integrity & support", "Upholstery tears / wear",
    "Handles / grips condition (rubber wear, looseness)",
    "Safety stops / limiters (if applicable)", "Safety lock / catch system (if applicable)",
    "Fasteners (bolts, nuts) tightness check",
  ],
};

export const EQUIPMENT_ICONS = {
  Treadmill: "🏃",
  Elliptical: "🤸",
  "Stair Climber": "🪜",
  "Spin Bike": "🚴",
  "Upright / Recumbent Bike": "🚲",
  "All Cable Equipment": "🪢",
  Rower: "🚣",
  Skierg: "⛷️",
  "Plate Loaded Equipment": "🏋️",
};

export const COMMERCIAL_LIFE_YEARS = 10;

export const makeInitialChecklist = (type) => {
  if (!type || !EQUIPMENT_TYPES[type]) return {};
  return Object.fromEntries(
    EQUIPMENT_TYPES[type].map((k) => [k, { grade: null, notes: "" }])
  );
};

export const makeDraft = () => ({
  clientName: "",
  siteAddress: "",
  date: new Date().toISOString().slice(0, 10),
  jobNumber: `GYM-${Math.floor(100000 + Math.random() * 900000)}`,
  technicianName: "",
  equipmentType: "",
  brand: "",
  model: "",
  serialNumber: "",
  assetId: "",
  location: "",
  manufacturingDate: "",
  installDate: "",
  hoursOnUnit: "",
  ageYears: "",
  serialPhoto: null,
  checklist: {},
  issuesFound: "",
  partsReplaced: "",
  recommendations: "",
});

export function gradeCounts(checklist) {
  const counts = {
    Excellent: 0,
    Good: 0,
    "Acceptable - Has Wear": 0,
    "Needs Replacement": 0,
    ungraded: 0,
  };
  for (const v of Object.values(checklist || {})) {
    if (v && v.grade && counts[v.grade] !== undefined) counts[v.grade]++;
    else counts.ungraded++;
  }
  return counts;
}

