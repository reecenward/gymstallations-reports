import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { Dashboard } from "@/views/Dashboard";
import { FormView } from "@/views/FormView";
import { ReportView } from "@/views/ReportView";
import { LoginView } from "@/views/LoginView";
import { makeDraft, makeInitialChecklist } from "@/lib/equipment";
import { api, getToken, clearToken } from "@/lib/api";

function jobFromServer(detail) {
  const p = detail.payload || {};
  return {
    ...p,
    id: detail.id,
    submittedAt: detail.submitted_at,
    emailStatus: detail.email_status,
  };
}

function summaryToJob(s) {
  return {
    id: s.id,
    jobNumber: s.job_number,
    clientName: s.client_name || "",
    equipmentType: s.equipment_type || "",
    brand: "",
    model: "",
    date: (s.submitted_at || "").slice(0, 10),
    submittedAt: s.submitted_at,
    emailStatus: s.email_status,
    checklist: {},
  };
}

export default function App() {
  const [authReady, setAuthReady] = useState(false);
  const [user, setUser] = useState(null);
  const [view, setView] = useState("dashboard");
  const [step, setStep] = useState(0);
  const [jobs, setJobs] = useState([]);
  const [draft, setDraft] = useState(makeDraft);
  const [emailState, setEmailState] = useState("idle");
  const [viewingJob, setViewingJob] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!getToken()) {
        setAuthReady(true);
        return;
      }
      try {
        const me = await api.me();
        if (!cancelled) setUser(me);
      } catch {
        clearToken();
      } finally {
        if (!cancelled) setAuthReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      try {
        const list = await api.listReports();
        if (!cancelled) setJobs(list.map(summaryToJob));
      } catch (err) {
        toast.error(err.message || "Failed to load reports");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

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
    setDraft({
      ...makeDraft(),
      technicianName: user?.full_name || user?.email || "",
    });
    setEmailState("idle");
    setStep(0);
    setViewingJob(null);
    setView("form");
  };

  const submitReport = async () => {
    setEmailState("sending");
    const payload = { ...draft };
    if (payload.serialPhoto && typeof payload.serialPhoto !== "string") {
      payload.serialPhoto = null;
    }
    try {
      const res = await api.submitReport(payload);
      const job = {
        ...draft,
        id: res.id,
        submittedAt: res.submitted_at,
        emailStatus: res.email_status,
      };
      setJobs((prev) => [job, ...prev]);
      setViewingJob(job);
      setEmailState(res.email_status === "sent" ? "sent" : "failed");
      if (res.email_status === "sent") {
        toast.success("Report saved and emailed to client");
      } else {
        toast.error(
          `Report saved, but email failed: ${res.email_error || "unknown error"}`
        );
      }
      setView("report");
    } catch (err) {
      setEmailState("idle");
      toast.error(err.message || "Failed to submit report");
    }
  };

  const openJob = async (job) => {
    try {
      const detail = await api.getReport(job.id);
      const full = jobFromServer(detail);
      setViewingJob(full);
      setDraft(full);
      setEmailState(
        detail.email_status === "sent"
          ? "sent"
          : detail.email_status === "failed"
          ? "failed"
          : "idle"
      );
      setView("report");
    } catch (err) {
      toast.error(err.message || "Failed to load report");
    }
  };

  const sendReport = () => {
    if (emailState === "sent") {
      toast.message("Report already emailed to client");
    } else {
      toast.message("Email is sent automatically on submission");
    }
  };

  const logout = () => {
    clearToken();
    setUser(null);
    setJobs([]);
    setView("dashboard");
  };

  if (!authReady) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        Loading…
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <LoginView onAuthed={(u) => setUser(u)} />
        <Toaster />
      </>
    );
  }

  return (
    <>
      {view === "dashboard" && (
        <Dashboard
          jobs={jobs}
          onNew={startNew}
          onView={openJob}
          onLogout={logout}
          user={user}
        />
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
