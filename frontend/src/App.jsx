import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { Dashboard } from "@/views/Dashboard";
import { FormView } from "@/views/FormView";
import { ReportView } from "@/views/ReportView";
import { LoginView } from "@/views/LoginView";
import { AdminUsersView } from "@/views/AdminUsersView";
import { makeDraft, makeInitialChecklist } from "@/lib/equipment";
import { api, getToken, clearToken } from "@/lib/api";
import {
  DEMO_REPORT_ID,
  demoJob,
  isDemoDismissed,
  setDemoDismissed,
} from "@/lib/demo";

const DRAFT_KEY = "gym_draft_v2";

function loadSavedDraft() {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    if (!parsed.draft) return null;
    return { draft: parsed.draft, step: Number.isFinite(parsed.step) ? parsed.step : 0 };
  } catch {
    return null;
  }
}

function persistDraft(draft, step) {
  const blob = { draft, step };
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(blob));
  } catch {
    // Most likely QuotaExceededError from a big base64 photo — retry without it.
    try {
      localStorage.setItem(
        DRAFT_KEY,
        JSON.stringify({ draft: { ...draft, serialPhoto: null }, step })
      );
    } catch {
      /* give up silently */
    }
  }
}

function clearSavedDraft() {
  try {
    localStorage.removeItem(DRAFT_KEY);
  } catch {
    /* noop */
  }
}

function isMeaningfulDraft(d) {
  if (!d) return false;
  if (d.clientName || d.brand || d.model || d.equipmentType) return true;
  if (d.issuesFound || d.partsReplaced || d.recommendations) return true;
  if (d.serialPhoto) return true;
  return Object.values(d.checklist || {}).some((c) => c && c.grade);
}

function creatorLabel(emailOrName, name) {
  return name || emailOrName || null;
}

function jobFromServer(detail) {
  const p = detail.payload || {};
  return {
    ...p,
    id: detail.id,
    submittedAt: detail.submitted_at,
    emailStatus: detail.email_status,
    createdBy: creatorLabel(detail.created_by_email, detail.created_by_name),
    createdByEmail: detail.created_by_email || null,
    needsReplacementCount: detail.needs_replacement_count || 0,
  };
}

function summaryToJob(s) {
  return {
    id: s.id,
    jobNumber: s.job_number,
    clientName: s.client_name || "",
    equipmentType: s.equipment_type || "",
    brand: s.brand || "",
    model: s.model || "",
    date: (s.submitted_at || "").slice(0, 10),
    submittedAt: s.submitted_at,
    emailStatus: s.email_status,
    createdBy: creatorLabel(s.created_by_email, s.created_by_name),
    createdByEmail: s.created_by_email || null,
    needsReplacementCount: s.needs_replacement_count || 0,
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
  const [savedDraft, setSavedDraft] = useState(() => {
    const s = loadSavedDraft();
    return s && isMeaningfulDraft(s.draft) ? s : null;
  });
  const [demoVisible, setDemoVisible] = useState(() => !isDemoDismissed());

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

  // Autosave the draft (and step) while the user is editing the form so a
  // crash or accidental refresh doesn't wipe their work.
  useEffect(() => {
    if (view !== "form") return;
    persistDraft(draft, step);
    if (isMeaningfulDraft(draft)) {
      setSavedDraft({ draft, step });
    }
  }, [draft, step, view]);

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

  const enterForm = (initialDraft, initialStep = 0, resumed = false) => {
    setDraft(initialDraft);
    setStep(initialStep);
    setEmailState("idle");
    setViewingJob(null);
    setView("form");
    if (resumed) toast.message("Resumed your in-progress draft");
  };

  const startNew = () => {
    const saved = loadSavedDraft();
    if (saved && isMeaningfulDraft(saved.draft)) {
      enterForm(saved.draft, saved.step || 0, true);
    } else {
      enterForm(
        { ...makeDraft(), technicianName: user?.full_name || user?.email || "" },
        0
      );
    }
  };

  const resumeDraft = () => {
    const saved = loadSavedDraft();
    if (!saved || !isMeaningfulDraft(saved.draft)) {
      toast.error("No draft to resume");
      setSavedDraft(null);
      return;
    }
    enterForm(saved.draft, saved.step || 0, true);
  };

  const discardDraft = () => {
    clearSavedDraft();
    setSavedDraft(null);
    setDraft({
      ...makeDraft(),
      technicianName: user?.full_name || user?.email || "",
    });
    setStep(0);
    setView("dashboard");
    toast.message("Draft discarded");
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
      clearSavedDraft();
      setSavedDraft(null);
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
    if (job?.id === DEMO_REPORT_ID) {
      toast.message(
        "This is a demo placeholder — submit a real report to see the full view."
      );
      return;
    }
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

  const dismissDemo = () => {
    setDemoDismissed();
    setDemoVisible(false);
  };

  const displayedJobs = demoVisible ? [demoJob, ...jobs] : jobs;

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
          jobs={displayedJobs}
          onNew={startNew}
          onView={openJob}
          onLogout={logout}
          onManageUsers={user.is_admin ? () => setView("users") : null}
          user={user}
          savedDraft={savedDraft?.draft || null}
          savedDraftStep={savedDraft?.step || 0}
          onResumeDraft={resumeDraft}
          onDiscardDraft={discardDraft}
          onDismissDemo={dismissDemo}
        />
      )}
      {view === "users" && (
        <AdminUsersView currentUser={user} onBack={() => setView("dashboard")} />
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
          onDiscard={discardDraft}
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
