import { useState } from "react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { Dashboard } from "@/views/Dashboard";
import { FormView } from "@/views/FormView";
import { ReportView } from "@/views/ReportView";
import {
  makeDraft,
  makeInitialChecklist,
  placeholderSummary,
} from "@/lib/equipment";

export default function App() {
  const [view, setView] = useState("dashboard");
  const [step, setStep] = useState(0);
  const [jobs, setJobs] = useState([]);
  const [draft, setDraft] = useState(makeDraft);
  const [summary, setSummary] = useState("");
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [emailState, setEmailState] = useState("idle");
  const [apiKey, setApiKey] = useState("");
  const [viewingJob, setViewingJob] = useState(null);

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
      const items = Object.entries(draft.checklist)
        .map(
          ([k, v]) =>
            `- ${k}: ${v?.grade || "ungraded"}${
              v?.notes ? ` (notes: ${v.notes})` : ""
            }`
        )
        .join("\n");
      const prompt = `Generate a professional gym equipment maintenance report summary (2–3 paragraphs, client-facing) based on:
Client: ${draft.clientName || "Unknown"} | Site: ${draft.siteAddress || "Unknown"}
Equipment: ${draft.brand} ${draft.model} ${draft.equipmentType} | Serial: ${draft.serialNumber} | Asset ID: ${draft.assetId}
Mfg Date: ${draft.manufacturingDate || "N/A"} | Install Date: ${draft.installDate || "N/A"}
Hours: ${draft.hoursOnUnit} | Age: ${draft.ageYears} years
Inspection results:
${items}
Issues Found: ${draft.issuesFound || "none"}
Parts Replaced: ${draft.partsReplaced || "none"}
Recommendations: ${draft.recommendations || "none"}
Write in a professional tone. Highlight any items needing replacement and recommended follow-up actions.`;

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
      toast.error(`API Error: ${e.message}`);
      setSummary(placeholderSummary(draft));
    } finally {
      setSummaryLoading(false);
    }
  };

  const sendReport = () => {
    setEmailState("sending");
    setTimeout(() => {
      setEmailState("sent");
      toast.success("Report sent to client successfully!");
    }, 1800);
  };

  return (
    <>
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
      <Toaster />
    </>
  );
}
