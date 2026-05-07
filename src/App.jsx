import { useState } from "react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { Dashboard } from "@/views/Dashboard";
import { FormView } from "@/views/FormView";
import { ReportView } from "@/views/ReportView";
import { makeDraft, makeInitialChecklist } from "@/lib/equipment";

export default function App() {
  const [view, setView] = useState("dashboard");
  const [step, setStep] = useState(0);
  const [jobs, setJobs] = useState([]);
  const [draft, setDraft] = useState(makeDraft);
  const [emailState, setEmailState] = useState("idle");
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
      <Toaster />
    </>
  );
}
