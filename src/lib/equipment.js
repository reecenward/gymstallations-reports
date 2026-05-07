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
  Excellent: { fg: "#15803d", bg: "#dcfce7", border: "#86efac" },
  Good: { fg: "#0369a1", bg: "#e0f2fe", border: "#7dd3fc" },
  "Acceptable - Has Wear": { fg: "#a16207", bg: "#fef3c7", border: "#fde68a" },
  "Needs Replacement": { fg: "#b91c1c", bg: "#fee2e2", border: "#fca5a5" },
};

export const GRADE_TW = {
  Excellent: {
    text: "text-emerald-700",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    solid: "bg-emerald-600 text-white",
  },
  Good: {
    text: "text-sky-700",
    bg: "bg-sky-50",
    border: "border-sky-200",
    solid: "bg-sky-600 text-white",
  },
  "Acceptable - Has Wear": {
    text: "text-amber-700",
    bg: "bg-amber-50",
    border: "border-amber-200",
    solid: "bg-amber-600 text-white",
  },
  "Needs Replacement": {
    text: "text-red-700",
    bg: "bg-red-50",
    border: "border-red-200",
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

export function placeholderSummary(d) {
  const counts = gradeCounts(d.checklist);
  const replacements = Object.entries(d.checklist || {})
    .filter(([, v]) => v?.grade === "Needs Replacement")
    .map(([k]) => k);
  const wear = Object.entries(d.checklist || {})
    .filter(([, v]) => v?.grade === "Acceptable - Has Wear")
    .map(([k]) => k);
  const total =
    replacements.length + wear.length + counts.Excellent + counts.Good;
  return `A scheduled preventive maintenance inspection was completed on the ${
    d.brand || "unit"
  } ${d.model || ""} (${d.equipmentType || "equipment"}) at ${
    d.clientName || "the client site"
  } on ${d.date}. The unit has logged ${d.hoursOnUnit || "N/A"} hours of operation over ${
    d.ageYears || "N/A"
  } year(s) of service.\n\nOf ${total} inspection points, ${counts.Excellent} were rated Excellent, ${
    counts.Good
  } Good, ${wear.length} Acceptable with wear, and ${replacements.length} flagged as needing replacement.${
    replacements.length
      ? ` Items requiring replacement: ${replacements.join(", ")}.`
      : ""
  }${
    wear.length
      ? ` Items showing wear that should be monitored: ${wear.join(", ")}.`
      : ""
  }\n\n${
    d.recommendations
      ? `Technician recommendations: ${d.recommendations}`
      : "Continued routine maintenance is advised per manufacturer schedule to preserve optimal performance and extend equipment lifespan."
  }`;
}
