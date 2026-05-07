import { useState } from "react";

// ─── Constants ────────────────────────────────────────────────────────────────

const GRADES = [
  "Excellent",
  "Good",
  "Acceptable - Has Wear",
  "Needs Replacement",
];

const GRADE_SHORT = {
  "Excellent": "Excellent",
  "Good": "Good",
  "Acceptable - Has Wear": "Acceptable",
  "Needs Replacement": "Replace",
};

const GRADE_COLORS = {
  "Excellent":             { fg: "#15803d", bg: "#dcfce7", border: "#86efac" },
  "Good":                  { fg: "#0369a1", bg: "#e0f2fe", border: "#7dd3fc" },
  "Acceptable - Has Wear": { fg: "#a16207", bg: "#fef3c7", border: "#fde68a" },
  "Needs Replacement":     { fg: "#b91c1c", bg: "#fee2e2", border: "#fca5a5" },
};

const EQUIPMENT_TYPES = {
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

const EQUIPMENT_ICONS = {
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

const COMMERCIAL_LIFE_YEARS = 10;

const makeInitialChecklist = (type) => {
  if (!type || !EQUIPMENT_TYPES[type]) return {};
  return Object.fromEntries(
    EQUIPMENT_TYPES[type].map((k) => [k, { grade: null, notes: "" }])
  );
};

const makeDraft = () => ({
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

// ─── Colours ──────────────────────────────────────────────────────────────────

const NAVY = "#0f172a";
const NAVY2 = "#1e293b";
const ORANGE = "#f97316";
const GREY_BG = "#f8fafc";
const BORDER = "#e2e8f0";
const MID = "#64748b";
const PASS_C = "#15803d";
const PASS_BG = "#dcfce7";
const FAIL_C = "#b91c1c";
const FAIL_BG = "#fee2e2";
const NA_BG = "#f1f5f9";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function gradeCounts(checklist) {
  const counts = { "Excellent": 0, "Good": 0, "Acceptable - Has Wear": 0, "Needs Replacement": 0, ungraded: 0 };
  for (const v of Object.values(checklist || {})) {
    if (v && v.grade && counts[v.grade] !== undefined) counts[v.grade]++;
    else counts.ungraded++;
  }
  return counts;
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [view, setView] = useState("dashboard"); // dashboard | form | report
  const [step, setStep] = useState(0);
  const [jobs, setJobs] = useState([]);
  const [draft, setDraft] = useState(makeDraft);
  const [emailState, setEmailState] = useState("idle");
  const [viewingJob, setViewingJob] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const upd = (field, val) => setDraft((d) => ({ ...d, [field]: val }));

  const updEquipmentType = (type) =>
    setDraft((d) => ({
      ...d,
      equipmentType: type,
      checklist: makeInitialChecklist(type),
    }));

  const updChecklistGrade = (item, grade) =>
    setDraft((d) => ({
      ...d,
      checklist: {
        ...d.checklist,
        [item]: {
          ...(d.checklist[item] || { grade: null, notes: "" }),
          grade: d.checklist[item]?.grade === grade ? null : grade,
        },
      },
    }));

  const updChecklistNotes = (item, notes) =>
    setDraft((d) => ({
      ...d,
      checklist: {
        ...d.checklist,
        [item]: {
          ...(d.checklist[item] || { grade: null, notes: "" }),
          notes,
        },
      },
    }));

  const startNew = () => {
    setDraft(makeDraft());
    setEmailState("idle");
    setStep(0);
    setViewingJob(null);
    setView("form");
  };

  const submitReport = () => {
    const job = {
      ...draft,
      id: Date.now(),
      submittedAt: new Date().toLocaleString(),
    };
    setJobs((prev) => [job, ...prev]);
    setViewingJob(job);
    setView("report");
  };

  const openJob = (job) => {
    setViewingJob(job);
    setDraft(job);
    setEmailState("idle");
    setView("report");
  };

  const sendReport = () => {
    setEmailState("sending");
    setTimeout(() => {
      setEmailState("sent");
      showToast("Report sent to client successfully!");
    }, 1800);
  };

  return (
    <div
      style={{
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
        minHeight: "100vh",
        background: GREY_BG,
        color: NAVY2,
      }}
    >
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        button { cursor: pointer; transition: opacity 0.15s; }
        button:hover:not(:disabled) { opacity: 0.85; }
        button:disabled { cursor: not-allowed; }
        input, textarea, select {
          font-family: inherit;
          font-size: 14px;
          color: ${NAVY2};
          background: white;
          border: 1px solid ${BORDER};
          border-radius: 8px;
          padding: 9px 12px;
          width: 100%;
          transition: outline 0.1s;
        }
        input:focus, textarea:focus, select:focus {
          outline: 2px solid ${ORANGE};
          outline-offset: 1px;
        }
        textarea { resize: vertical; }
        @media print {
          .no-print { display: none !important; }
          body { background: white; }
        }
      `}</style>

      {toast && (
        <div
          style={{
            position: "fixed",
            top: 20,
            right: 20,
            zIndex: 9999,
            background: toast.type === "error" ? FAIL_BG : PASS_BG,
            color: toast.type === "error" ? FAIL_C : PASS_C,
            border: `1px solid ${toast.type === "error" ? "#fca5a5" : "#86efac"}`,
            padding: "12px 20px",
            borderRadius: 10,
            fontWeight: 600,
            fontSize: 14,
            boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
            maxWidth: 340,
          }}
          className="no-print"
        >
          {toast.msg}
        </div>
      )}

      {view === "dashboard" && (
        <Dashboard jobs={jobs} onNew={startNew} onView={openJob} />
      )}
      {view === "form" && (
        <FormView
          step={step}
          setStep={setStep}
          draft={draft}
          upd={upd}
          updEquipmentType={updEquipmentType}
          updChecklistGrade={updChecklistGrade}
          updChecklistNotes={updChecklistNotes}
          onSubmit={submitReport}
          onBack={() => setView("dashboard")}
        />
      )}
      {view === "report" && (
        <ReportView
          job={viewingJob || draft}
          emailState={emailState}
          onSend={sendReport}
          onBack={() => setView("dashboard")}
          onPrint={() => window.print()}
        />
      )}
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

function Dashboard({ jobs, onNew, onView }) {
  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "28px 20px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 32,
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 38,
                height: 38,
                background: ORANGE,
                borderRadius: 9,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <span style={{ color: "white", fontWeight: 900, fontSize: 20 }}>
                G
              </span>
            </div>
            <span style={{ fontSize: 22, fontWeight: 800, color: NAVY, letterSpacing: -0.3 }}>
              Gymstallations
            </span>
          </div>
          <div style={{ color: MID, fontSize: 13, marginTop: 3, paddingLeft: 48 }}>
            Preventive Maintenance Reports
          </div>
        </div>
        <button
          onClick={onNew}
          style={{
            background: ORANGE,
            color: "white",
            border: "none",
            borderRadius: 9,
            padding: "11px 22px",
            fontWeight: 700,
            fontSize: 14,
          }}
        >
          + New Report
        </button>
      </div>

      {jobs.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "64px 24px",
            background: "white",
            borderRadius: 16,
            border: `1px solid ${BORDER}`,
          }}
        >
          <div style={{ fontSize: 52, marginBottom: 14 }}>📋</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: NAVY, marginBottom: 8 }}>
            No reports yet
          </div>
          <div style={{ color: MID, marginBottom: 28, fontSize: 15 }}>
            Create your first service report to get started
          </div>
          <button
            onClick={onNew}
            style={{
              background: ORANGE,
              color: "white",
              border: "none",
              borderRadius: 9,
              padding: "13px 32px",
              fontWeight: 700,
              fontSize: 15,
            }}
          >
            Create First Report
          </button>
        </div>
      ) : (
        <div>
          <div style={{ fontSize: 13, color: MID, fontWeight: 600, marginBottom: 14 }}>
            {jobs.length} Report{jobs.length !== 1 ? "s" : ""}
          </div>
          <div style={{ display: "grid", gap: 12 }}>
            {jobs.map((job) => {
              const counts = gradeCounts(job.checklist);
              const replace = counts["Needs Replacement"];
              return (
                <div
                  key={job.id}
                  style={{
                    background: "white",
                    border: `1px solid ${BORDER}`,
                    borderRadius: 12,
                    padding: "18px 22px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 16,
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 15, color: NAVY, marginBottom: 3 }}>
                      {job.clientName || "Unnamed Client"}
                    </div>
                    <div style={{ color: MID, fontSize: 13 }}>
                      {EQUIPMENT_ICONS[job.equipmentType] || ""}{" "}
                      {job.equipmentType} · {job.brand} {job.model} · {job.date} · Job #{job.jobNumber}
                    </div>
                    {replace > 0 && (
                      <span
                        style={{
                          display: "inline-block",
                          marginTop: 6,
                          fontSize: 12,
                          background: FAIL_BG,
                          color: FAIL_C,
                          padding: "2px 10px",
                          borderRadius: 20,
                          fontWeight: 600,
                        }}
                      >
                        {replace} item{replace !== 1 ? "s" : ""} need replacement
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => onView(job)}
                    style={{
                      background: NAVY,
                      color: "white",
                      border: "none",
                      borderRadius: 8,
                      padding: "9px 18px",
                      fontWeight: 600,
                      fontSize: 13,
                      flexShrink: 0,
                    }}
                  >
                    View Report
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Form View ────────────────────────────────────────────────────────────────

const STEPS = [
  "Equipment Type",
  "Job Info",
  "Equipment",
  "Inspection",
  "Tech Notes",
  "Review",
];

function FormView({
  step,
  setStep,
  draft,
  upd,
  updEquipmentType,
  updChecklistGrade,
  updChecklistNotes,
  onSubmit,
  onBack,
}) {
  const canNext = () => {
    if (step === 0) return !!draft.equipmentType;
    if (step === 1) return draft.clientName && draft.technicianName && draft.date;
    if (step === 2) return draft.brand && draft.model;
    return true;
  };

  return (
    <div style={{ maxWidth: 740, margin: "0 auto", padding: "24px 20px" }}>
      <div
        style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}
        className="no-print"
      >
        <button
          onClick={onBack}
          style={{
            background: "none",
            border: "none",
            color: MID,
            fontSize: 22,
            padding: 0,
            lineHeight: 1,
          }}
        >
          ←
        </button>
        <div>
          <div style={{ fontWeight: 800, fontSize: 18, color: NAVY }}>
            New Service Report
          </div>
          <div style={{ color: MID, fontSize: 13 }}>Job #{draft.jobNumber}</div>
        </div>
      </div>

      {/* Step progress */}
      <div style={{ display: "flex", gap: 6, marginBottom: 28 }} className="no-print">
        {STEPS.map((s, i) => (
          <div key={i} style={{ flex: 1, textAlign: "center" }}>
            <div
              style={{
                height: 4,
                borderRadius: 2,
                background: i <= step ? ORANGE : BORDER,
                marginBottom: 5,
                transition: "background 0.2s",
              }}
            />
            <div
              style={{
                fontSize: 11,
                color: i === step ? ORANGE : MID,
                fontWeight: i === step ? 700 : 400,
              }}
            >
              {s}
            </div>
          </div>
        ))}
      </div>

      {/* Step content */}
      <div
        style={{
          background: "white",
          borderRadius: 16,
          border: `1px solid ${BORDER}`,
          padding: "28px 26px",
          marginBottom: 20,
        }}
      >
        {step === 0 && <StepEquipmentType draft={draft} updEquipmentType={updEquipmentType} />}
        {step === 1 && <StepJobInfo draft={draft} upd={upd} />}
        {step === 2 && <StepEquipment draft={draft} upd={upd} />}
        {step === 3 && (
          <StepChecklist
            draft={draft}
            updChecklistGrade={updChecklistGrade}
            updChecklistNotes={updChecklistNotes}
          />
        )}
        {step === 4 && <StepTechNotes draft={draft} upd={upd} />}
        {step === 5 && <StepReview draft={draft} />}
      </div>

      {/* Navigation */}
      <div style={{ display: "flex", justifyContent: "space-between" }} className="no-print">
        <button
          onClick={() => setStep((s) => s - 1)}
          disabled={step === 0}
          style={{
            background: "white",
            border: `1px solid ${BORDER}`,
            borderRadius: 8,
            padding: "10px 24px",
            fontWeight: 600,
            color: NAVY,
            opacity: step === 0 ? 0.4 : 1,
          }}
        >
          ← Back
        </button>
        {step < STEPS.length - 1 ? (
          <button
            onClick={() => setStep((s) => s + 1)}
            disabled={!canNext()}
            style={{
              background: canNext() ? ORANGE : BORDER,
              color: canNext() ? "white" : MID,
              border: "none",
              borderRadius: 8,
              padding: "10px 28px",
              fontWeight: 700,
            }}
          >
            Next →
          </button>
        ) : (
          <button
            onClick={onSubmit}
            style={{
              background: PASS_C,
              color: "white",
              border: "none",
              borderRadius: 8,
              padding: "10px 28px",
              fontWeight: 700,
            }}
          >
            Submit Report ✓
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Form Steps ───────────────────────────────────────────────────────────────

function Field({ label, required, children }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <label
        style={{
          display: "block",
          fontWeight: 600,
          fontSize: 13,
          color: NAVY2,
          marginBottom: 6,
        }}
      >
        {label}
        {required && <span style={{ color: ORANGE }}> *</span>}
      </label>
      {children}
    </div>
  );
}

function StepEquipmentType({ draft, updEquipmentType }) {
  return (
    <div>
      <h3 style={{ marginBottom: 8, fontSize: 17, fontWeight: 700, color: NAVY }}>
        Select Equipment Type
      </h3>
      <p style={{ color: MID, fontSize: 13, marginBottom: 20, lineHeight: 1.6 }}>
        The inspection checklist is generated from the equipment type.
      </p>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
          gap: 10,
        }}
      >
        {Object.keys(EQUIPMENT_TYPES).map((type) => {
          const selected = draft.equipmentType === type;
          const itemCount = EQUIPMENT_TYPES[type].length;
          return (
            <button
              key={type}
              onClick={() => updEquipmentType(type)}
              style={{
                background: selected ? "#fff7ed" : "white",
                border: `2px solid ${selected ? ORANGE : BORDER}`,
                borderRadius: 12,
                padding: "16px 14px",
                textAlign: "left",
                cursor: "pointer",
                transition: "border-color 0.15s, background 0.15s",
              }}
            >
              <div style={{ fontSize: 26, marginBottom: 6 }}>
                {EQUIPMENT_ICONS[type] || "🏋️"}
              </div>
              <div style={{ fontWeight: 700, color: NAVY, fontSize: 14, marginBottom: 2 }}>
                {type}
              </div>
              <div style={{ fontSize: 12, color: MID }}>
                {itemCount} inspection points
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function StepJobInfo({ draft, upd }) {
  return (
    <div>
      <h3 style={{ marginBottom: 20, fontSize: 17, fontWeight: 700, color: NAVY }}>
        Job Information
      </h3>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
        <Field label="Client Name" required>
          <input
            value={draft.clientName}
            onChange={(e) => upd("clientName", e.target.value)}
            placeholder="e.g. Gold's Gym Sydney"
          />
        </Field>
        <Field label="Job Number">
          <input
            value={draft.jobNumber}
            onChange={(e) => upd("jobNumber", e.target.value)}
          />
        </Field>
      </div>
      <Field label="Site Address">
        <input
          value={draft.siteAddress}
          onChange={(e) => upd("siteAddress", e.target.value)}
          placeholder="Full address"
        />
      </Field>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
        <Field label="Date" required>
          <input
            type="date"
            value={draft.date}
            onChange={(e) => upd("date", e.target.value)}
          />
        </Field>
        <Field label="Technician Name" required>
          <input
            value={draft.technicianName}
            onChange={(e) => upd("technicianName", e.target.value)}
            placeholder="Your name"
          />
        </Field>
      </div>
    </div>
  );
}

function StepEquipment({ draft, upd }) {
  const onPhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => upd("serialPhoto", reader.result);
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <h3 style={{ marginBottom: 6, fontSize: 17, fontWeight: 700, color: NAVY }}>
        Equipment Details
      </h3>
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          background: "#fff7ed",
          border: "1px solid #fed7aa",
          color: "#9a3412",
          borderRadius: 20,
          padding: "4px 12px",
          fontSize: 12,
          fontWeight: 600,
          marginBottom: 18,
        }}
      >
        <span>{EQUIPMENT_ICONS[draft.equipmentType] || "🏋️"}</span>
        <span>{draft.equipmentType || "No equipment type selected"}</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
        <Field label="Brand" required>
          <input
            value={draft.brand}
            onChange={(e) => upd("brand", e.target.value)}
            placeholder="e.g. Life Fitness"
          />
        </Field>
        <Field label="Model" required>
          <input
            value={draft.model}
            onChange={(e) => upd("model", e.target.value)}
            placeholder="e.g. T5 Track+"
          />
        </Field>
        <Field label="Serial Number">
          <input
            value={draft.serialNumber}
            onChange={(e) => upd("serialNumber", e.target.value)}
            placeholder="e.g. LFT5-2024-..."
          />
        </Field>
        <Field label="Asset / Internal ID">
          <input
            value={draft.assetId}
            onChange={(e) => upd("assetId", e.target.value)}
            placeholder="e.g. ASSET-00421"
          />
        </Field>
        <Field label="Location / Floor">
          <input
            value={draft.location}
            onChange={(e) => upd("location", e.target.value)}
            placeholder="e.g. Cardio Floor 2"
          />
        </Field>
        <Field label="Hours on Unit">
          <input
            type="number"
            value={draft.hoursOnUnit}
            onChange={(e) => upd("hoursOnUnit", e.target.value)}
            placeholder="0"
            min="0"
          />
        </Field>
        <Field label="Manufacturing Date">
          <input
            type="date"
            value={draft.manufacturingDate}
            onChange={(e) => upd("manufacturingDate", e.target.value)}
          />
        </Field>
        <Field label="Install Date">
          <input
            type="date"
            value={draft.installDate}
            onChange={(e) => upd("installDate", e.target.value)}
          />
        </Field>
        <Field label="Age (Years)">
          <input
            type="number"
            value={draft.ageYears}
            onChange={(e) => upd("ageYears", e.target.value)}
            placeholder="0"
            min="0"
          />
        </Field>
      </div>

      <Field label="Serial Number Photo">
        <div
          style={{
            border: `2px dashed ${BORDER}`,
            borderRadius: 12,
            padding: "16px",
            background: GREY_BG,
            display: "flex",
            alignItems: "center",
            gap: 14,
          }}
        >
          {draft.serialPhoto ? (
            <img
              src={draft.serialPhoto}
              alt="Serial number"
              style={{
                width: 90,
                height: 90,
                objectFit: "cover",
                borderRadius: 8,
                border: `1px solid ${BORDER}`,
                flexShrink: 0,
              }}
            />
          ) : (
            <div
              style={{
                width: 90,
                height: 90,
                background: "white",
                borderRadius: 8,
                border: `1px solid ${BORDER}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 30,
                color: MID,
                flexShrink: 0,
              }}
            >
              📷
            </div>
          )}
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, color: MID, marginBottom: 8 }}>
              Upload a photo of the equipment serial plate.
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <label
                style={{
                  background: NAVY,
                  color: "white",
                  borderRadius: 8,
                  padding: "8px 14px",
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: "pointer",
                  display: "inline-block",
                }}
              >
                {draft.serialPhoto ? "Replace Photo" : "Upload Photo"}
                <input
                  type="file"
                  accept="image/*"
                  onChange={onPhotoChange}
                  style={{ display: "none" }}
                />
              </label>
              {draft.serialPhoto && (
                <button
                  type="button"
                  onClick={() => upd("serialPhoto", null)}
                  style={{
                    background: "white",
                    border: `1px solid ${BORDER}`,
                    borderRadius: 8,
                    padding: "8px 14px",
                    fontWeight: 600,
                    fontSize: 13,
                    color: NAVY2,
                  }}
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        </div>
      </Field>
    </div>
  );
}

function StepChecklist({ draft, updChecklistGrade, updChecklistNotes }) {
  const items = EQUIPMENT_TYPES[draft.equipmentType] || [];
  const counts = gradeCounts(draft.checklist);

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 6,
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        <h3 style={{ fontSize: 17, fontWeight: 700, color: NAVY }}>
          Inspection Checklist
        </h3>
        <div style={{ fontSize: 12, color: MID }}>
          {EQUIPMENT_ICONS[draft.equipmentType]} {draft.equipmentType} · {items.length} items
        </div>
      </div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
        {GRADES.map((g) => (
          <span
            key={g}
            style={{
              fontSize: 12,
              background: GRADE_COLORS[g].bg,
              color: GRADE_COLORS[g].fg,
              padding: "3px 10px",
              borderRadius: 20,
              fontWeight: 600,
            }}
          >
            {counts[g]} {GRADE_SHORT[g]}
          </span>
        ))}
        {counts.ungraded > 0 && (
          <span
            style={{
              fontSize: 12,
              background: NA_BG,
              color: MID,
              padding: "3px 10px",
              borderRadius: 20,
              fontWeight: 600,
            }}
          >
            {counts.ungraded} ungraded
          </span>
        )}
      </div>

      <div style={{ display: "grid", gap: 10 }}>
        {items.map((item) => {
          const cell = draft.checklist[item] || { grade: null, notes: "" };
          const grade = cell.grade;
          const colors = grade ? GRADE_COLORS[grade] : null;
          return (
            <div
              key={item}
              style={{
                padding: "12px 14px",
                borderRadius: 10,
                border: `1px solid ${colors ? colors.border : BORDER}`,
                background: colors ? colors.bg : "white",
              }}
            >
              <div style={{ fontSize: 14, color: NAVY2, fontWeight: 600, marginBottom: 8 }}>
                {item}
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
                {GRADES.map((g) => {
                  const sel = grade === g;
                  const c = GRADE_COLORS[g];
                  return (
                    <button
                      key={g}
                      onClick={() => updChecklistGrade(item, g)}
                      style={{
                        padding: "6px 12px",
                        borderRadius: 6,
                        fontSize: 12,
                        fontWeight: 700,
                        border: `1px solid ${sel ? c.fg : BORDER}`,
                        background: sel ? c.fg : "white",
                        color: sel ? "white" : c.fg,
                      }}
                    >
                      {GRADE_SHORT[g]}
                    </button>
                  );
                })}
              </div>
              <input
                type="text"
                value={cell.notes}
                onChange={(e) => updChecklistNotes(item, e.target.value)}
                placeholder="Notes (optional)"
                style={{ fontSize: 13 }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StepTechNotes({ draft, upd }) {
  return (
    <div>
      <h3 style={{ marginBottom: 20, fontSize: 17, fontWeight: 700, color: NAVY }}>
        Technician Notes
      </h3>
      <Field label="Issues Found">
        <textarea
          value={draft.issuesFound}
          onChange={(e) => upd("issuesFound", e.target.value)}
          placeholder="Describe any issues observed during inspection..."
          style={{ minHeight: 88 }}
        />
      </Field>
      <Field label="Parts Replaced">
        <textarea
          value={draft.partsReplaced}
          onChange={(e) => upd("partsReplaced", e.target.value)}
          placeholder="List any parts replaced, with part numbers if available..."
          style={{ minHeight: 64 }}
        />
      </Field>
      <Field label="Recommendations">
        <textarea
          value={draft.recommendations}
          onChange={(e) => upd("recommendations", e.target.value)}
          placeholder="Follow-up actions, scheduled repairs, client advice..."
          style={{ minHeight: 64 }}
        />
      </Field>
    </div>
  );
}

function StepReview({ draft }) {
  const counts = gradeCounts(draft.checklist);

  return (
    <div>
      <h3 style={{ marginBottom: 20, fontSize: 17, fontWeight: 700, color: NAVY }}>
        Review &amp; Submit
      </h3>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 10,
          marginBottom: 18,
        }}
      >
        <ReviewCard label="Client" value={draft.clientName} />
        <ReviewCard label="Job #" value={draft.jobNumber} />
        <ReviewCard label="Site" value={draft.siteAddress} />
        <ReviewCard label="Date" value={draft.date} />
        <ReviewCard label="Technician" value={draft.technicianName} />
        <ReviewCard
          label="Equipment"
          value={
            draft.equipmentType
              ? `${draft.equipmentType} — ${draft.brand} ${draft.model}`.trim()
              : "—"
          }
        />
        <ReviewCard label="Asset ID" value={draft.assetId} />
        <ReviewCard label="Location" value={draft.location} />
      </div>

      <div style={{ display: "flex", gap: 10, marginBottom: 18, flexWrap: "wrap" }}>
        {GRADES.map((g) => (
          <StatBadge
            key={g}
            count={counts[g]}
            label={GRADE_SHORT[g].toUpperCase()}
            color={GRADE_COLORS[g].fg}
            bg={GRADE_COLORS[g].bg}
            borderColor={GRADE_COLORS[g].border}
          />
        ))}
        {counts.ungraded > 0 && (
          <StatBadge
            count={counts.ungraded}
            label="UNGRADED"
            color={MID}
            bg={NA_BG}
            borderColor={BORDER}
          />
        )}
      </div>

      {draft.serialPhoto && (
        <div
          style={{
            background: GREY_BG,
            borderRadius: 10,
            padding: 12,
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <img
            src={draft.serialPhoto}
            alt="Serial"
            style={{ width: 60, height: 60, objectFit: "cover", borderRadius: 6 }}
          />
          <div style={{ fontSize: 13, color: MID }}>Serial number photo attached</div>
        </div>
      )}
    </div>
  );
}

function ReviewCard({ label, value }) {
  return (
    <div style={{ background: GREY_BG, borderRadius: 8, padding: "10px 14px" }}>
      <div
        style={{
          fontSize: 11,
          color: MID,
          fontWeight: 600,
          marginBottom: 3,
          textTransform: "uppercase",
          letterSpacing: 0.4,
        }}
      >
        {label}
      </div>
      <div style={{ fontSize: 14, fontWeight: 600, color: NAVY2 }}>
        {value || "—"}
      </div>
    </div>
  );
}

function StatBadge({ count, label, color, bg, borderColor }) {
  return (
    <div
      style={{
        flex: "1 1 120px",
        background: bg,
        border: `1px solid ${borderColor}`,
        borderRadius: 10,
        padding: "12px",
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: 26, fontWeight: 800, color }}>{count}</div>
      <div style={{ fontSize: 11, color, fontWeight: 700, letterSpacing: 0.4 }}>{label}</div>
    </div>
  );
}

// ─── Charts ───────────────────────────────────────────────────────────────────

function ConditionChart({ checklist }) {
  const counts = gradeCounts(checklist);
  const total =
    counts["Excellent"] +
    counts["Good"] +
    counts["Acceptable - Has Wear"] +
    counts["Needs Replacement"] +
    counts.ungraded;
  if (total === 0) {
    return (
      <div style={{ color: MID, fontSize: 13, textAlign: "center", padding: 20 }}>
        No inspection data
      </div>
    );
  }
  const max = Math.max(
    counts["Excellent"],
    counts["Good"],
    counts["Acceptable - Has Wear"],
    counts["Needs Replacement"],
    1
  );
  return (
    <div style={{ display: "grid", gap: 10 }}>
      {GRADES.map((g) => {
        const n = counts[g];
        const pct = (n / max) * 100;
        const c = GRADE_COLORS[g];
        return (
          <div key={g}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 12,
                color: NAVY2,
                fontWeight: 600,
                marginBottom: 4,
              }}
            >
              <span>{g}</span>
              <span style={{ color: c.fg }}>
                {n} ({total > 0 ? Math.round((n / total) * 100) : 0}%)
              </span>
            </div>
            <div
              style={{
                background: NA_BG,
                borderRadius: 6,
                height: 14,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${pct}%`,
                  height: "100%",
                  background: c.fg,
                  borderRadius: 6,
                  transition: "width 0.4s",
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function LifecycleBar({ manufacturingDate, installDate }) {
  if (!manufacturingDate) {
    return (
      <div
        style={{
          background: NA_BG,
          border: `1px dashed ${BORDER}`,
          borderRadius: 10,
          padding: "14px 16px",
          color: MID,
          fontSize: 13,
          textAlign: "center",
        }}
      >
        Add a Manufacturing Date to see the lifecycle timeline.
      </div>
    );
  }
  const mfg = new Date(manufacturingDate);
  const end = new Date(mfg);
  end.setFullYear(end.getFullYear() + COMMERCIAL_LIFE_YEARS);
  const today = new Date();
  const install = installDate ? new Date(installDate) : null;

  const span = end - mfg;
  const pct = (d) =>
    Math.max(0, Math.min(100, ((d - mfg) / span) * 100));
  const todayPct = pct(today);
  const installPct = install ? pct(install) : null;

  const yearsUsed = Math.max(0, (today - mfg) / (1000 * 60 * 60 * 24 * 365.25));
  const yearsRemaining = Math.max(
    0,
    COMMERCIAL_LIFE_YEARS - yearsUsed
  );
  const overdue = today > end;

  const fmt = (d) => d.toISOString().slice(0, 10);

  return (
    <div>
      <div
        style={{
          position: "relative",
          background: `linear-gradient(to right, ${GRADE_COLORS["Excellent"].bg} 0%, ${GRADE_COLORS["Good"].bg} 33%, ${GRADE_COLORS["Acceptable - Has Wear"].bg} 66%, ${GRADE_COLORS["Needs Replacement"].bg} 100%)`,
          height: 28,
          borderRadius: 14,
          border: `1px solid ${BORDER}`,
          marginBottom: 8,
        }}
      >
        {installPct !== null && (
          <div
            title={`Installed ${fmt(install)}`}
            style={{
              position: "absolute",
              left: `${installPct}%`,
              top: -6,
              transform: "translateX(-50%)",
              width: 2,
              height: 40,
              background: NAVY2,
            }}
          />
        )}
        <div
          title={`Today ${fmt(today)}`}
          style={{
            position: "absolute",
            left: `${todayPct}%`,
            top: -10,
            transform: "translateX(-50%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <div
            style={{
              background: ORANGE,
              color: "white",
              fontSize: 10,
              fontWeight: 700,
              padding: "2px 6px",
              borderRadius: 4,
              marginBottom: 2,
              whiteSpace: "nowrap",
            }}
          >
            TODAY
          </div>
          <div style={{ width: 2, height: 30, background: ORANGE }} />
        </div>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 11,
          color: MID,
          fontWeight: 600,
          marginBottom: 10,
        }}
      >
        <span>Mfg {fmt(mfg)}</span>
        <span>End-of-life {fmt(end)}</span>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 8,
          fontSize: 12,
        }}
      >
        <LifecycleStat label="Age" value={`${yearsUsed.toFixed(1)} yrs`} />
        <LifecycleStat
          label="Expected Life"
          value={`${COMMERCIAL_LIFE_YEARS} yrs`}
        />
        <LifecycleStat
          label={overdue ? "Past End-of-Life" : "Remaining"}
          value={overdue ? `${(-yearsRemaining + COMMERCIAL_LIFE_YEARS - yearsUsed).toFixed(1)} yrs over` : `${yearsRemaining.toFixed(1)} yrs`}
          warn={overdue}
        />
      </div>
    </div>
  );
}

function LifecycleStat({ label, value, warn }) {
  return (
    <div
      style={{
        background: warn ? FAIL_BG : GREY_BG,
        border: `1px solid ${warn ? "#fca5a5" : BORDER}`,
        borderRadius: 8,
        padding: "8px 10px",
        textAlign: "center",
      }}
    >
      <div
        style={{
          fontSize: 10,
          color: warn ? FAIL_C : MID,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: 0.5,
          marginBottom: 2,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 13,
          fontWeight: 700,
          color: warn ? FAIL_C : NAVY2,
        }}
      >
        {value}
      </div>
    </div>
  );
}

// ─── Report View ──────────────────────────────────────────────────────────────

function ReportView({ job, emailState, onSend, onBack, onPrint }) {
  const items = EQUIPMENT_TYPES[job.equipmentType] || Object.keys(job.checklist || {});
  const counts = gradeCounts(job.checklist);

  return (
    <div style={{ maxWidth: 840, margin: "0 auto", padding: "20px" }}>
      {/* Toolbar */}
      <div
        style={{
          display: "flex",
          gap: 10,
          marginBottom: 20,
          justifyContent: "space-between",
          alignItems: "center",
        }}
        className="no-print"
      >
        <button
          onClick={onBack}
          style={{
            background: "white",
            border: `1px solid ${BORDER}`,
            borderRadius: 8,
            padding: "9px 18px",
            fontWeight: 600,
            color: NAVY,
          }}
        >
          ← Dashboard
        </button>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={onPrint}
            style={{
              background: NAVY,
              color: "white",
              border: "none",
              borderRadius: 8,
              padding: "9px 18px",
              fontWeight: 600,
            }}
          >
            🖨 Print
          </button>
          {emailState === "idle" && (
            <button
              onClick={onSend}
              style={{
                background: ORANGE,
                color: "white",
                border: "none",
                borderRadius: 8,
                padding: "9px 22px",
                fontWeight: 700,
              }}
            >
              ✉ Send Report
            </button>
          )}
          {emailState === "sending" && (
            <button
              disabled
              style={{
                background: BORDER,
                color: MID,
                border: "none",
                borderRadius: 8,
                padding: "9px 22px",
                fontWeight: 700,
              }}
            >
              Sending…
            </button>
          )}
          {emailState === "sent" && (
            <button
              disabled
              style={{
                background: PASS_BG,
                color: PASS_C,
                border: "1px solid #86efac",
                borderRadius: 8,
                padding: "9px 22px",
                fontWeight: 700,
              }}
            >
              ✓ Report Sent
            </button>
          )}
        </div>
      </div>

      {/* Document */}
      <div
        style={{
          background: "white",
          borderRadius: 16,
          border: `1px solid ${BORDER}`,
          overflow: "hidden",
          boxShadow: "0 4px 28px rgba(0,0,0,0.07)",
        }}
      >
        {/* Header */}
        <div
          style={{
            background: NAVY,
            padding: "28px 32px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 5 }}>
              <div
                style={{
                  width: 34,
                  height: 34,
                  background: ORANGE,
                  borderRadius: 7,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <span style={{ color: "white", fontWeight: 900, fontSize: 18 }}>G</span>
              </div>
              <span
                style={{
                  color: "white",
                  fontSize: 20,
                  fontWeight: 800,
                  letterSpacing: -0.3,
                }}
              >
                Gymstallations
              </span>
            </div>
            <div style={{ color: "#94a3b8", fontSize: 12, paddingLeft: 44 }}>
              Preventive Maintenance Report
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ color: ORANGE, fontWeight: 800, fontSize: 20 }}>
              #{job.jobNumber}
            </div>
            <div style={{ color: "#94a3b8", fontSize: 12, marginTop: 2 }}>{job.date}</div>
            <div
              style={{
                color: "#94a3b8",
                fontSize: 11,
                marginTop: 2,
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              Service Report
            </div>
          </div>
        </div>

        <div style={{ padding: "28px 32px" }}>
          {/* Job + Equipment details */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 18,
              marginBottom: 28,
            }}
          >
            <ReportSection title="Job Details">
              <InfoRow label="Client" value={job.clientName} />
              <InfoRow label="Site" value={job.siteAddress} />
              <InfoRow label="Technician" value={job.technicianName} />
              <InfoRow label="Date" value={job.date} />
            </ReportSection>
            <ReportSection title="Equipment">
              <InfoRow
                label="Type"
                value={
                  job.equipmentType
                    ? `${EQUIPMENT_ICONS[job.equipmentType] || ""} ${job.equipmentType}`.trim()
                    : "—"
                }
              />
              <InfoRow
                label="Brand / Model"
                value={`${job.brand} ${job.model}`.trim() || "—"}
              />
              <InfoRow label="Serial #" value={job.serialNumber} />
              <InfoRow label="Asset ID" value={job.assetId} />
              <InfoRow label="Location" value={job.location} />
              <InfoRow label="Mfg Date" value={job.manufacturingDate} />
              <InfoRow label="Install Date" value={job.installDate} />
              <InfoRow
                label="Hours"
                value={job.hoursOnUnit ? `${job.hoursOnUnit} hrs` : "—"}
              />
              <InfoRow
                label="Age"
                value={job.ageYears ? `${job.ageYears} yr(s)` : "—"}
              />
            </ReportSection>
          </div>

          {/* Serial photo */}
          {job.serialPhoto && (
            <div style={{ marginBottom: 28 }}>
              <SectionLabel>Serial Number Photo</SectionLabel>
              <img
                src={job.serialPhoto}
                alt="Serial number"
                style={{
                  maxWidth: 240,
                  maxHeight: 180,
                  borderRadius: 10,
                  border: `1px solid ${BORDER}`,
                  display: "block",
                }}
              />
            </div>
          )}

          {/* Condition Summary Chart */}
          <div style={{ marginBottom: 28 }}>
            <SectionLabel>Condition Summary</SectionLabel>
            <div
              style={{
                background: GREY_BG,
                border: `1px solid ${BORDER}`,
                borderRadius: 12,
                padding: "18px 20px",
              }}
            >
              <ConditionChart checklist={job.checklist} />
            </div>
          </div>

          {/* Lifecycle */}
          <div style={{ marginBottom: 28 }}>
            <SectionLabel>Equipment Lifecycle</SectionLabel>
            <div
              style={{
                background: GREY_BG,
                border: `1px solid ${BORDER}`,
                borderRadius: 12,
                padding: "20px 22px 18px",
              }}
            >
              <LifecycleBar
                manufacturingDate={job.manufacturingDate}
                installDate={job.installDate}
              />
            </div>
          </div>

          {/* Inspection Items */}
          <div style={{ marginBottom: 28 }}>
            <SectionLabel>Inspection Results</SectionLabel>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
              {GRADES.map((g) => (
                <Pill
                  key={g}
                  count={counts[g]}
                  label={GRADE_SHORT[g]}
                  color={GRADE_COLORS[g].fg}
                  bg={GRADE_COLORS[g].bg}
                />
              ))}
              {counts.ungraded > 0 && (
                <Pill
                  count={counts.ungraded}
                  label="Ungraded"
                  color={MID}
                  bg={NA_BG}
                />
              )}
            </div>
            <div style={{ display: "grid", gap: 6 }}>
              {items.map((item) => {
                const cell = job.checklist?.[item] || { grade: null, notes: "" };
                const c = cell.grade ? GRADE_COLORS[cell.grade] : null;
                return (
                  <div
                    key={item}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr auto",
                      gap: 10,
                      padding: "9px 12px",
                      background: c ? c.bg : NA_BG,
                      border: `1px solid ${c ? c.border : BORDER}`,
                      borderRadius: 8,
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 13, color: NAVY2, fontWeight: 600 }}>
                        {item}
                      </div>
                      {cell.notes && (
                        <div
                          style={{
                            fontSize: 12,
                            color: MID,
                            marginTop: 3,
                            fontStyle: "italic",
                          }}
                        >
                          “{cell.notes}”
                        </div>
                      )}
                    </div>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 800,
                        background: c ? c.fg : MID,
                        color: "white",
                        padding: "3px 9px",
                        borderRadius: 12,
                        whiteSpace: "nowrap",
                        height: "fit-content",
                        alignSelf: "center",
                      }}
                    >
                      {cell.grade ? GRADE_SHORT[cell.grade].toUpperCase() : "—"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tech Notes */}
          {(job.issuesFound || job.partsReplaced || job.recommendations) && (
            <div style={{ marginBottom: 28 }}>
              <ReportSection title="Technician Notes">
                {job.issuesFound && (
                  <InfoBlock label="Issues Found" value={job.issuesFound} />
                )}
                {job.partsReplaced && (
                  <InfoBlock label="Parts Replaced" value={job.partsReplaced} />
                )}
                {job.recommendations && (
                  <InfoBlock label="Recommendations" value={job.recommendations} />
                )}
              </ReportSection>
            </div>
          )}

          {/* Footer */}
          <div
            style={{
              borderTop: `1px solid ${BORDER}`,
              paddingTop: 22,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
            }}
          >
            <div>
              <div style={{ fontSize: 12, color: MID, marginBottom: 24 }}>
                Technician Signature
              </div>
              <div
                style={{
                  borderBottom: `1.5px solid ${NAVY2}`,
                  width: 220,
                  marginBottom: 6,
                }}
              />
              <div style={{ fontSize: 13, color: MID }}>
                {job.technicianName || "Technician"}
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 11, color: MID }}>Report generated by</div>
              <div style={{ fontWeight: 800, color: NAVY, fontSize: 15 }}>
                Gymstallations
              </div>
              <div style={{ fontSize: 11, color: MID, marginTop: 2 }}>
                {job.submittedAt || job.date}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Shared UI ────────────────────────────────────────────────────────────────

function SectionLabel({ children }) {
  return (
    <div
      style={{
        fontSize: 12,
        fontWeight: 700,
        color: MID,
        textTransform: "uppercase",
        letterSpacing: 0.6,
        marginBottom: 12,
      }}
    >
      {children}
    </div>
  );
}

function ReportSection({ title, children }) {
  return (
    <div style={{ background: GREY_BG, borderRadius: 10, padding: "16px 18px" }}>
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: MID,
          textTransform: "uppercase",
          letterSpacing: 0.6,
          marginBottom: 12,
        }}
      >
        {title}
      </div>
      {children}
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        marginBottom: 7,
        fontSize: 13,
        gap: 8,
      }}
    >
      <span style={{ color: MID, flexShrink: 0 }}>{label}</span>
      <span style={{ fontWeight: 600, color: NAVY2, textAlign: "right" }}>
        {value || "—"}
      </span>
    </div>
  );
}

function InfoBlock({ label, value }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: MID,
          textTransform: "uppercase",
          letterSpacing: 0.5,
          marginBottom: 4,
        }}
      >
        {label}
      </div>
      <div style={{ fontSize: 13, color: NAVY2, lineHeight: 1.65 }}>{value}</div>
    </div>
  );
}

function Pill({ count, label, color, bg }) {
  return (
    <span
      style={{
        background: bg,
        color,
        padding: "4px 13px",
        borderRadius: 20,
        fontSize: 12,
        fontWeight: 700,
      }}
    >
      {count} {label}
    </span>
  );
}
