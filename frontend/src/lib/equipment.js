export const GRADES = [
  "Good",
  "Acceptable - Has Wear",
  "Needs Replacement",
];

// The lowest grade requires the technician to attach a photo of the issue
// before moving on; the others don't.
export const REPLACEMENT_GRADE = "Needs Replacement";

export const GRADE_SHORT = {
  Good: "Good",
  "Acceptable - Has Wear": "Worn",
  "Needs Replacement": "Replace",
};

export const GRADE_COLORS = {
  Good: { fg: "#166534", bg: "#ecfdf5", border: "#a7f3d0", hex: "#16a34a" },
  "Acceptable - Has Wear": { fg: "#a16207", bg: "#fef3c7", border: "#fde68a", hex: "#f59e0b" },
  "Needs Replacement": { fg: "#b91c1c", bg: "#fee2e2", border: "#fca5a5", hex: "#dc2626" },
};

export const GRADE_TW = {
  Good: {
    text: "text-emerald-700",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    solid: "bg-emerald-600 text-white",
  },
  "Acceptable - Has Wear": {
    text: "text-amber-700",
    bg: "bg-amber-50",
    border: "border-amber-200",
    solid: "bg-amber-500 text-white",
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

// Icon mapping lives in components/EquipmentIcon.jsx as lucide components.

export const COMMERCIAL_LIFE_YEARS = 10;

export const makeInitialChecklist = (type) => {
  if (!type || !EQUIPMENT_TYPES[type]) return {};
  return Object.fromEntries(
    EQUIPMENT_TYPES[type].map((k) => [k, { grade: null, notes: "" }])
  );
};

let _itemSeq = 0;
const makeItemId = () =>
  `it_${Date.now().toString(36)}_${(_itemSeq++).toString(36)}_${Math.random()
    .toString(36)
    .slice(2, 6)}`;

export const makeItem = (type = "") => ({
  id: makeItemId(),
  equipmentType: type,
  brand: "",
  model: "",
  serialNumber: "",
  distancePhoto: null,
  serialPhoto: null,
  location: "",
  checklist: makeInitialChecklist(type),
  issuePhotos: [],
});

export const makeDraft = () => ({
  clientName: "",
  siteAddress: "",
  date: new Date().toISOString().slice(0, 10),
  jobNumber: `GYM-${Math.floor(100000 + Math.random() * 900000)}`,
  technicianName: "",
  items: [],
  issuesFound: "",
  partsReplaced: "",
  recommendations: "",
});

export function gradeCounts(checklist) {
  const counts = {
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

// Returns { graded, total, blocked } for a single item's checklist.
// "blocked" counts cells where grade=Needs Replacement but no photo attached
// (treated as ungraded for completion purposes).
export function itemProgress(item) {
  const checklist = item?.checklist || {};
  const entries = Object.values(checklist);
  let graded = 0;
  let blocked = 0;
  for (const c of entries) {
    if (!c || !c.grade) continue;
    if (c.grade === REPLACEMENT_GRADE && !c.photo) {
      blocked++;
      continue;
    }
    graded++;
  }
  return { graded, total: entries.length, blocked };
}

export function itemComplete(item) {
  const { graded, total, blocked } = itemProgress(item);
  return total > 0 && graded === total && blocked === 0;
}

// Legacy reports stored a single piece of equipment at the top level. Wrap
// it into an items array so the multi-item code path can handle it.
export function normalizeDraft(draft) {
  if (!draft) return makeDraft();
  if (Array.isArray(draft.items) && draft.items.length) return draft;
  const legacy = {
    id: makeItemId(),
    equipmentType: draft.equipmentType || "",
    brand: draft.brand || "",
    model: draft.model || "",
    serialNumber: draft.serialNumber || "",
    distancePhoto: null,
    serialPhoto: draft.serialPhoto || null,
    location: draft.location || "",
    checklist: draft.checklist || {},
    issuePhotos: [],
  };
  const hasLegacy =
    legacy.equipmentType ||
    legacy.brand ||
    legacy.model ||
    legacy.serialNumber ||
    Object.keys(legacy.checklist).length > 0;
  return { ...draft, items: hasLegacy ? [legacy] : [] };
}

