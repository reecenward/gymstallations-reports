import { useState } from "react";

// ─── Constants ────────────────────────────────────────────────────────────────

const CHECKLIST_ITEMS = [
  "Belt tension", "Belt alignment", "Belt lubrication", "Running deck condition",
  "Drive belt inspection", "Motor brush inspection", "Motor temp/operation",
  "Console function test", "Emergency stop test", "Speed calibration",
  "Incline calibration", "Roller bearing check", "Frame/weld inspection",
  "Electrical connections", "Power cord inspection", "Safety key function",
  "Cooling fan operation", "Heart rate sensor test", "Incline motor test",
  "Side rail condition", "End caps intact", "Leveling feet",
  "Serial plate visible", "Overall cleanliness",
];

const makeInitialChecklist = () =>
  Object.fromEntries(CHECKLIST_ITEMS.map((k) => [k, "pending"]));

const makeDraft = () => ({
  clientName: "",
  siteAddress: "",
  date: new Date().toISOString().slice(0, 10),
  jobNumber: `GYM-${Math.floor(100000 + Math.random() * 900000)}`,
  technicianName: "",
  equipmentType: "Treadmill",
  brand: "",
  model: "",
  serialNumber: "",
  hoursOnUnit: "",
  ageYears: "",
  checklist: makeInitialChecklist(),
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

function placeholderSummary(d) {
  const fails = Object.entries(d.checklist)
    .filter(([, v]) => v === "fail")
    .map(([k]) => k);
  return `A scheduled maintenance inspection was completed on the ${d.brand || "unit"} ${d.model || ""} (${d.equipmentType}) at ${d.clientName || "the client site"} on ${d.date}. The unit has logged ${d.hoursOnUnit || "N/A"} hours of operation over ${d.ageYears || "N/A"} year(s) of service.\n\n${
    fails.length
      ? `The following checklist items were flagged as requiring attention: ${fails.join(", ")}. Immediate corrective action is recommended to prevent further wear or potential safety concerns.`
      : "All 24 checklist items passed inspection. The unit is in good operational condition with no critical findings."
  }\n\n${
    d.recommendations
      ? `Technician recommendations: ${d.recommendations}`
      : "Continued routine maintenance is advised per manufacturer schedule to preserve optimal performance and extend equipment lifespan."
  }`;
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [view, setView] = useState("dashboard"); // dashboard | form | report
  const [step, setStep] = useState(0);
  const [jobs, setJobs] = useState([]);
  const [draft, setDraft] = useState(makeDraft);
  const [summary, setSummary] = useState("");
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [emailState, setEmailState] = useState("idle"); // idle | sending | sent
  const [apiKey, setApiKey] = useState("");
  const [viewingJob, setViewingJob] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const upd = (field, val) => setDraft((d) => ({ ...d, [field]: val }));
  const updChecklist = (item, val) =>
    setDraft((d) => ({ ...d, checklist: { ...d.checklist, [item]: val } }));

  const startNew = () => {
    setDraft(makeDraft());
    setSummary("");
    setEmailState("idle");
    setStep(0);
    setViewingJob(null);
    setView("form");
  };

  const submitReport = () => {
    const job = {
      ...draft,
      summary,
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
    setSummary(job.summary || "");
    setEmailState("idle");
    setView("report");
  };

  const generateSummary = async () => {
    if (!apiKey.trim()) {
      setSummary(placeholderSummary(draft));
      return;
    }
    setSummaryLoading(true);
    setSummary("");
    try {
      const fails = Object.entries(draft.checklist)
        .filter(([, v]) => v === "fail")
        .map(([k]) => k);
      const passes = Object.entries(draft.checklist)
        .filter(([, v]) => v === "pass")
        .map(([k]) => k);

      const prompt = `Generate a professional gym equipment maintenance report summary (2–3 paragraphs, client-facing) based on:
Client: ${draft.clientName || "Unknown"} | Site: ${draft.siteAddress || "Unknown"}
Equipment: ${draft.brand} ${draft.model} ${draft.equipmentType} | Serial: ${draft.serialNumber}
Hours: ${draft.hoursOnUnit} | Age: ${draft.ageYears} years
PASS items (${passes.length}): ${passes.join(", ") || "none"}
FAIL items (${fails.length}): ${fails.join(", ") || "none"}
Issues Found: ${draft.issuesFound || "none"}
Parts Replaced: ${draft.partsReplaced || "none"}
Recommendations: ${draft.recommendations || "none"}
Write in a professional tone. Highlight any failed items and recommended follow-up actions.`;

      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 600,
          messages: [{ role: "user", content: prompt }],
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error?.message || `HTTP ${res.status}`);
      }
      const data = await res.json();
      setSummary(data.content[0].text);
    } catch (e) {
      showToast(`API Error: ${e.message}`, "error");
      setSummary(placeholderSummary(draft));
    } finally {
      setSummaryLoading(false);
    }
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
          updChecklist={updChecklist}
          apiKey={apiKey}
          setApiKey={setApiKey}
          summary={summary}
          summaryLoading={summaryLoading}
          onGenerate={generateSummary}
          onSubmit={submitReport}
          onBack={() => setView("dashboard")}
        />
      )}
      {view === "report" && (
        <ReportView
          job={viewingJob || { ...draft, summary }}
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
          <div
            style={{ display: "flex", alignItems: "center", gap: 10 }}
          >
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
            <span
              style={{ fontSize: 22, fontWeight: 800, color: NAVY, letterSpacing: -0.3 }}
            >
              Gymstallations
            </span>
          </div>
          <div style={{ color: MID, fontSize: 13, marginTop: 3, paddingLeft: 48 }}>
            Service &amp; Maintenance Reports
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
          <div
            style={{
              fontSize: 20,
              fontWeight: 700,
              color: NAVY,
              marginBottom: 8,
            }}
          >
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
          <div
            style={{
              fontSize: 13,
              color: MID,
              fontWeight: 600,
              marginBottom: 14,
            }}
          >
            {jobs.length} Report{jobs.length !== 1 ? "s" : ""}
          </div>
          <div style={{ display: "grid", gap: 12 }}>
            {jobs.map((job) => {
              const fails = Object.values(job.checklist || {}).filter(
                (v) => v === "fail"
              ).length;
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
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: 15,
                        color: NAVY,
                        marginBottom: 3,
                      }}
                    >
                      {job.clientName || "Unnamed Client"}
                    </div>
                    <div style={{ color: MID, fontSize: 13 }}>
                      {job.brand} {job.model} &middot; {job.date} &middot; Job
                      #{job.jobNumber}
                    </div>
                    {fails > 0 && (
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
                        {fails} item{fails !== 1 ? "s" : ""} failed
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
  "Job Info",
  "Equipment",
  "Checklist",
  "Tech Notes",
  "AI Summary",
  "Review",
];

function FormView({
  step,
  setStep,
  draft,
  upd,
  updChecklist,
  apiKey,
  setApiKey,
  summary,
  summaryLoading,
  onGenerate,
  onSubmit,
  onBack,
}) {
  const canNext = () => {
    if (step === 0) return draft.clientName && draft.technicianName && draft.date;
    if (step === 1) return draft.brand && draft.model;
    return true;
  };

  return (
    <div style={{ maxWidth: 740, margin: "0 auto", padding: "24px 20px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 24,
        }}
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
      <div
        style={{ display: "flex", gap: 6, marginBottom: 28 }}
        className="no-print"
      >
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
        {step === 0 && <StepJobInfo draft={draft} upd={upd} />}
        {step === 1 && <StepEquipment draft={draft} upd={upd} />}
        {step === 2 && (
          <StepChecklist draft={draft} updChecklist={updChecklist} />
        )}
        {step === 3 && <StepTechNotes draft={draft} upd={upd} />}
        {step === 4 && (
          <StepAISummary
            apiKey={apiKey}
            setApiKey={setApiKey}
            summary={summary}
            loading={summaryLoading}
            onGenerate={onGenerate}
          />
        )}
        {step === 5 && <StepReview draft={draft} summary={summary} />}
      </div>

      {/* Navigation */}
      <div
        style={{ display: "flex", justifyContent: "space-between" }}
        className="no-print"
      >
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
        {step < 5 ? (
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

function StepJobInfo({ draft, upd }) {
  return (
    <div>
      <h3
        style={{ marginBottom: 20, fontSize: 17, fontWeight: 700, color: NAVY }}
      >
        Job Information
      </h3>
      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}
      >
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
      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}
      >
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
  return (
    <div>
      <h3
        style={{ marginBottom: 20, fontSize: 17, fontWeight: 700, color: NAVY }}
      >
        Equipment Details
      </h3>
      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}
      >
        <Field label="Equipment Type">
          <select
            value={draft.equipmentType}
            onChange={(e) => upd("equipmentType", e.target.value)}
          >
            <option>Treadmill</option>
            <option>Elliptical</option>
            <option>Stationary Bike</option>
            <option>Rowing Machine</option>
            <option>Stair Climber</option>
          </select>
        </Field>
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
        <Field label="Hours on Unit">
          <input
            type="number"
            value={draft.hoursOnUnit}
            onChange={(e) => upd("hoursOnUnit", e.target.value)}
            placeholder="0"
            min="0"
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
    </div>
  );
}

function StepChecklist({ draft, updChecklist }) {
  const counts = Object.values(draft.checklist).reduce((a, v) => {
    a[v] = (a[v] || 0) + 1;
    return a;
  }, {});

  const statusColor = {
    pass: PASS_C,
    fail: FAIL_C,
    na: MID,
    pending: "#d97706",
  };
  const statusBg = {
    pass: PASS_BG,
    fail: FAIL_BG,
    na: NA_BG,
    pending: "#fef3c7",
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 18,
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        <h3 style={{ fontSize: 17, fontWeight: 700, color: NAVY }}>
          Inspection Checklist
        </h3>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {Object.entries(counts).map(([s, n]) => (
            <span
              key={s}
              style={{
                fontSize: 12,
                background: statusBg[s],
                color: statusColor[s],
                padding: "3px 10px",
                borderRadius: 20,
                fontWeight: 600,
              }}
            >
              {n} {s}
            </span>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gap: 7 }}>
        {CHECKLIST_ITEMS.map((item) => {
          const val = draft.checklist[item];
          return (
            <div
              key={item}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "9px 13px",
                borderRadius: 8,
                border: `1px solid ${val === "pending" ? BORDER : "transparent"}`,
                background: statusBg[val] || "white",
                gap: 8,
              }}
            >
              <span style={{ fontSize: 14, color: NAVY2 }}>{item}</span>
              <div style={{ display: "flex", gap: 5, flexShrink: 0 }}>
                {["pass", "fail", "na"].map((s) => (
                  <button
                    key={s}
                    onClick={() =>
                      updChecklist(item, val === s ? "pending" : s)
                    }
                    style={{
                      padding: "4px 11px",
                      borderRadius: 6,
                      fontSize: 12,
                      fontWeight: 700,
                      border: "none",
                      background:
                        val === s
                          ? s === "pass"
                            ? PASS_C
                            : s === "fail"
                            ? FAIL_C
                            : MID
                          : BORDER,
                      color: val === s ? "white" : MID,
                    }}
                  >
                    {s === "na" ? "N/A" : s.toUpperCase()}
                  </button>
                ))}
              </div>
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
      <h3
        style={{ marginBottom: 20, fontSize: 17, fontWeight: 700, color: NAVY }}
      >
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

function StepAISummary({ apiKey, setApiKey, summary, loading, onGenerate }) {
  return (
    <div>
      <h3
        style={{ marginBottom: 8, fontSize: 17, fontWeight: 700, color: NAVY }}
      >
        AI-Assisted Summary
      </h3>
      <p style={{ color: MID, fontSize: 13, marginBottom: 22, lineHeight: 1.6 }}>
        Generate a professional client-facing summary using Claude. Enter your
        Anthropic API key, or leave blank to use a demo summary.
      </p>

      <Field label="Anthropic API Key (optional)">
        <input
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="sk-ant-... (leave blank for demo summary)"
        />
      </Field>

      <button
        onClick={onGenerate}
        disabled={loading}
        style={{
          background: loading ? BORDER : ORANGE,
          color: loading ? MID : "white",
          border: "none",
          borderRadius: 8,
          padding: "11px 26px",
          fontWeight: 700,
          marginBottom: 22,
          fontSize: 14,
        }}
      >
        {loading ? "Generating…" : "✦ Generate Summary"}
      </button>

      {summary ? (
        <div
          style={{
            background: "#fff7ed",
            border: "1px solid #fed7aa",
            borderRadius: 10,
            padding: "18px 20px",
          }}
        >
          <div
            style={{
              fontWeight: 700,
              color: ORANGE,
              fontSize: 12,
              marginBottom: 10,
              textTransform: "uppercase",
              letterSpacing: 1,
            }}
          >
            ✦ AI Summary
          </div>
          <p
            style={{
              fontSize: 14,
              color: NAVY2,
              lineHeight: 1.7,
              whiteSpace: "pre-wrap",
            }}
          >
            {summary}
          </p>
        </div>
      ) : !loading ? (
        <div
          style={{
            background: NA_BG,
            border: `1px solid ${BORDER}`,
            borderRadius: 10,
            padding: "18px",
            color: MID,
            fontSize: 13,
            textAlign: "center",
          }}
        >
          Click "Generate Summary" to create an AI-powered report narrative
        </div>
      ) : null}
    </div>
  );
}

function StepReview({ draft, summary }) {
  const passes = Object.values(draft.checklist).filter(
    (v) => v === "pass"
  ).length;
  const fails = Object.values(draft.checklist).filter(
    (v) => v === "fail"
  ).length;
  const pending = Object.values(draft.checklist).filter(
    (v) => v === "pending"
  ).length;

  return (
    <div>
      <h3
        style={{ marginBottom: 20, fontSize: 17, fontWeight: 700, color: NAVY }}
      >
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
          value={`${draft.brand} ${draft.model}`.trim() || "—"}
        />
      </div>

      <div style={{ display: "flex", gap: 10, marginBottom: 18 }}>
        <StatBadge count={passes} label="PASSED" color={PASS_C} bg={PASS_BG} borderColor="#86efac" />
        <StatBadge
          count={fails}
          label="FAILED"
          color={fails > 0 ? FAIL_C : MID}
          bg={fails > 0 ? FAIL_BG : NA_BG}
          borderColor={fails > 0 ? "#fca5a5" : BORDER}
        />
        {pending > 0 && (
          <StatBadge count={pending} label="PENDING" color="#d97706" bg="#fef3c7" borderColor="#fde68a" />
        )}
      </div>

      {summary ? (
        <div
          style={{
            background: "#fff7ed",
            border: "1px solid #fed7aa",
            borderRadius: 10,
            padding: "14px 16px",
          }}
        >
          <div
            style={{
              fontWeight: 700,
              color: ORANGE,
              fontSize: 12,
              marginBottom: 6,
            }}
          >
            ✦ AI SUMMARY READY
          </div>
          <p
            style={{
              fontSize: 13,
              color: NAVY2,
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              lineHeight: 1.6,
            }}
          >
            {summary}
          </p>
        </div>
      ) : (
        <div
          style={{
            background: "#fef3c7",
            border: "1px solid #fde68a",
            borderRadius: 10,
            padding: "12px 16px",
            color: "#92400e",
            fontSize: 13,
          }}
        >
          ⚠ No AI summary generated — a placeholder will be included
        </div>
      )}
    </div>
  );
}

function ReviewCard({ label, value }) {
  return (
    <div
      style={{
        background: GREY_BG,
        borderRadius: 8,
        padding: "10px 14px",
      }}
    >
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
        flex: 1,
        background: bg,
        border: `1px solid ${borderColor}`,
        borderRadius: 10,
        padding: "12px",
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: 26, fontWeight: 800, color }}>{count}</div>
      <div style={{ fontSize: 12, color, fontWeight: 600 }}>{label}</div>
    </div>
  );
}

// ─── Report View ──────────────────────────────────────────────────────────────

function ReportView({ job, emailState, onSend, onBack, onPrint }) {
  const passes = Object.entries(job.checklist || {}).filter(
    ([, v]) => v === "pass"
  );
  const fails = Object.entries(job.checklist || {}).filter(
    ([, v]) => v === "fail"
  );
  const nas = Object.entries(job.checklist || {}).filter(
    ([, v]) => v === "na"
  );

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
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 5,
              }}
            >
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
                <span
                  style={{ color: "white", fontWeight: 900, fontSize: 18 }}
                >
                  G
                </span>
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
              Gym Equipment Service &amp; Maintenance
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ color: ORANGE, fontWeight: 800, fontSize: 20 }}>
              #{job.jobNumber}
            </div>
            <div style={{ color: "#94a3b8", fontSize: 12, marginTop: 2 }}>
              {job.date}
            </div>
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
              <InfoRow label="Type" value={job.equipmentType} />
              <InfoRow
                label="Brand / Model"
                value={`${job.brand} ${job.model}`.trim() || "—"}
              />
              <InfoRow label="Serial #" value={job.serialNumber} />
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

          {/* Checklist */}
          <div style={{ marginBottom: 28 }}>
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
              Inspection Checklist
            </div>
            <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
              <Pill count={passes.length} label="Pass" color={PASS_C} bg={PASS_BG} />
              <Pill count={fails.length} label="Fail" color={FAIL_C} bg={FAIL_BG} />
              <Pill count={nas.length} label="N/A" color={MID} bg={NA_BG} />
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: 6,
              }}
            >
              {CHECKLIST_ITEMS.map((item) => {
                const val = job.checklist?.[item] || "pending";
                const c =
                  val === "pass" ? PASS_C : val === "fail" ? FAIL_C : MID;
                const bg =
                  val === "pass"
                    ? PASS_BG
                    : val === "fail"
                    ? FAIL_BG
                    : NA_BG;
                return (
                  <div
                    key={item}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "6px 10px",
                      background: bg,
                      borderRadius: 6,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 800,
                        color: c,
                        minWidth: 20,
                      }}
                    >
                      {val === "pass"
                        ? "✓"
                        : val === "fail"
                        ? "✗"
                        : val === "na"
                        ? "—"
                        : "·"}
                    </span>
                    <span style={{ fontSize: 12, color: NAVY2 }}>{item}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* AI Summary */}
          {job.summary && (
            <div
              style={{
                marginBottom: 28,
                background: "#fff7ed",
                border: "1px solid #fed7aa",
                borderRadius: 12,
                padding: "20px 24px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 12,
                }}
              >
                <span style={{ color: ORANGE }}>✦</span>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: ORANGE,
                    textTransform: "uppercase",
                    letterSpacing: 0.6,
                  }}
                >
                  AI-Assisted Summary
                </span>
              </div>
              <p
                style={{
                  fontSize: 14,
                  color: NAVY2,
                  lineHeight: 1.75,
                  whiteSpace: "pre-wrap",
                }}
              >
                {job.summary}
              </p>
            </div>
          )}

          {/* Tech Notes */}
          {(job.issuesFound || job.partsReplaced || job.recommendations) && (
            <div style={{ marginBottom: 28 }}>
              <ReportSection title="Technician Notes">
                {job.issuesFound && (
                  <InfoBlock label="Issues Found" value={job.issuesFound} />
                )}
                {job.partsReplaced && (
                  <InfoBlock
                    label="Parts Replaced"
                    value={job.partsReplaced}
                  />
                )}
                {job.recommendations && (
                  <InfoBlock
                    label="Recommendations"
                    value={job.recommendations}
                  />
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
              <div
                style={{ fontSize: 12, color: MID, marginBottom: 24 }}
              >
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
              <div style={{ fontSize: 11, color: MID }}>
                Report generated by
              </div>
              <div
                style={{ fontWeight: 800, color: NAVY, fontSize: 15 }}
              >
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

function ReportSection({ title, children }) {
  return (
    <div
      style={{ background: GREY_BG, borderRadius: 10, padding: "16px 18px" }}
    >
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
      <span
        style={{
          fontWeight: 600,
          color: NAVY2,
          textAlign: "right",
        }}
      >
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
      <div style={{ fontSize: 13, color: NAVY2, lineHeight: 1.65 }}>
        {value}
      </div>
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
