// A placeholder report shown on the dashboard so the search/filter UI
// has something to render before real reports exist. The user can
// dismiss it; the dismissal is remembered in localStorage so it never
// re-appears for them.

export const DEMO_DISMISSED_KEY = "gym_demo_dismissed_v1";
export const DEMO_REPORT_ID = "__demo__";

export const demoJob = {
  id: DEMO_REPORT_ID,
  jobNumber: "GYM-DEMO",
  clientName: "Demo — North Side Athletic Club",
  equipmentType: "Treadmill",
  brand: "Life Fitness",
  model: "T5 Track+",
  serialNumber: "LFT5-EXAMPLE-001",
  date: new Date().toISOString().slice(0, 10),
  submittedAt: new Date().toISOString(),
  emailStatus: "sent",
  createdBy: "Reece Ward",
  createdByEmail: "reecenward@gmail.com",
  needsReplacementCount: 2,
  isDemo: true,
  checklist: {},
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
