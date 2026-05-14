// A placeholder report shown on the dashboard so the search/filter UI
// has something to render before real reports exist. The user can
// dismiss it; the dismissal is remembered in localStorage so it never
// re-appears for them. Clicking it now opens a fully-populated example
// report so the new layout (per-item photos + issues) can be previewed.

export const DEMO_DISMISSED_KEY = "gym_demo_dismissed_v1";
export const DEMO_REPORT_ID = "__demo__";

// picsum.photos returns a different image per seed — stable, no auth.
const img = (seed, w = 800, h = 600) =>
  `https://picsum.photos/seed/${seed}/${w}/${h}`;

const treadmillChecklist = {
  "Frame & structural integrity": { grade: "Good", notes: "" },
  "Handrails & console mounts": { grade: "Good", notes: "" },
  "Leveling & floor contact": { grade: "Good", notes: "" },
  "Running belt alignment": { grade: "Acceptable - Has Wear", notes: "Slight tracking drift to the left." },
  "Running belt condition": {
    grade: "Needs Replacement",
    notes: "Visible fraying along the right edge.",
    photo: img("issue-belt", 800, 500),
  },
  "Running belt tension": { grade: "Good", notes: "" },
  "Deck condition": { grade: "Acceptable - Has Wear", notes: "" },
  "Drive belt condition": { grade: "Good", notes: "" },
  "Front & rear rollers": { grade: "Good", notes: "" },
  "Motor operation": { grade: "Good", notes: "" },
  "Motor compartment cleanliness": { grade: "Good", notes: "" },
  "Electronics / control board": { grade: "Good", notes: "" },
  "Console display & buttons": {
    grade: "Needs Replacement",
    notes: "Speed-up button unresponsive at high speeds.",
    photo: img("issue-console", 800, 500),
  },
  "Heart rate sensors": { grade: "Good", notes: "" },
  "Speed consistency": { grade: "Good", notes: "" },
  "Incline system operation": { grade: "Good", notes: "" },
  "Elevation screw condition": { grade: "Good", notes: "" },
  "Emergency stop function": { grade: "Good", notes: "" },
  "Overall noise & performance": { grade: "Acceptable - Has Wear", notes: "Minor squeak at high incline." },
};

const rowerChecklist = {
  "Frame & structural integrity": { grade: "Good", notes: "" },
  "Rail condition & straightness": { grade: "Good", notes: "" },
  "Leveling & floor contact": { grade: "Good", notes: "" },
  "Seat condition & rollers": { grade: "Good", notes: "" },
  "Seat travel smoothness (rail glide)": { grade: "Good", notes: "" },
  "Footrests & straps condition": { grade: "Good", notes: "" },
  "Footrest adjustment mechanism": { grade: "Good", notes: "" },
  "Handle condition & grip": { grade: "Good", notes: "" },
  "Handle attachment (strap/cord connection)": { grade: "Good", notes: "" },
  "Chain / strap condition (wear, rust, fraying)": { grade: "Good", notes: "" },
  "Chain alignment & lubrication (if applicable)": { grade: "Good", notes: "" },
  "Return mechanism (recoil spring) function": { grade: "Good", notes: "" },
  "Drive system operation (chain/cord engagement)": { grade: "Good", notes: "" },
  "Flywheel & fan housing condition": { grade: "Good", notes: "" },
  "Damper adjustment & function": { grade: "Good", notes: "" },
  "Resistance feel consistency": { grade: "Good", notes: "" },
  "Stroke smoothness": { grade: "Good", notes: "" },
  "Bearings condition (seat, flywheel, rollers)": { grade: "Good", notes: "" },
  "Electronics / control board": { grade: "Good", notes: "" },
  "Monitor display (PM console)": { grade: "Good", notes: "" },
  "Buttons & connectivity (if applicable)": { grade: "Good", notes: "" },
};

export const demoJob = {
  id: DEMO_REPORT_ID,
  jobNumber: "GYM-DEMO",
  clientName: "Demo — North Side Athletic Club",
  siteAddress: "414 Fitness Ave, Sydney NSW 2000",
  equipmentType: "Treadmill",
  brand: "Life Fitness",
  model: "T5 Track+",
  serialNumber: "LFT5-EXAMPLE-001",
  date: new Date().toISOString().slice(0, 10),
  submittedAt: new Date().toISOString(),
  emailStatus: "sent",
  createdBy: "Reece Ward",
  createdByEmail: "reecenward@gmail.com",
  technicianName: "Reece Ward",
  needsReplacementCount: 2,
  itemCount: 2,
  reviewStatus: "pending",
  isDemo: true,
  issuesFound:
    "Treadmill belt fraying and console buttons intermittent — recommend belt replacement and console keypad service.",
  partsReplaced: "",
  recommendations:
    "Replace running belt within 2 weeks. Schedule console keypad swap with vendor.",
  items: [
    {
      id: "demo-item-1",
      equipmentType: "Treadmill",
      brand: "Life Fitness",
      model: "T5 Track+",
      serialNumber: "LFT5-EXAMPLE-001",
      location: "Cardio Floor 2",
      distancePhoto: img("treadmill-unit", 900, 700),
      serialPhoto: img("treadmill-serial", 800, 500),
      checklist: treadmillChecklist,
      issuePhotos: [],
    },
    {
      id: "demo-item-2",
      equipmentType: "Rower",
      brand: "Concept2",
      model: "Model D",
      serialNumber: "C2D-EXAMPLE-042",
      location: "Functional Area",
      distancePhoto: img("rower-unit", 900, 700),
      serialPhoto: img("rower-serial", 800, 500),
      checklist: rowerChecklist,
      issuePhotos: [],
    },
  ],
};

export function isDemoDismissed() {
  try {
    return localStorage.getItem(DEMO_DISMISSED_KEY) === "1";
  } catch {
    return false;
  }
}

export function setDemoDismissed() {
  try {
    localStorage.setItem(DEMO_DISMISSED_KEY, "1");
  } catch {
    /* noop */
  }
}
