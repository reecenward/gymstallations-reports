import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { Dashboard } from "@/views/Dashboard";
import { FormView } from "@/views/FormView";
import { ReportView } from "@/views/ReportView";
import { LoginView } from "@/views/LoginView";
import { AdminUsersView } from "@/views/AdminUsersView";
import { makeDraft, makeItem, normalizeDraft } from "@/lib/equipment";
import { api, getToken, clearToken } from "@/lib/api";
import {
  DEMO_REPORT_ID,
  demoJob,
  isDemoDismissed,
  setDemoDismissed,
} from "@/lib/demo";

const DRAFT_KEY = "gym_draft_v3";

function loadSavedDraft() {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    if (!parsed.draft) return null;
    return {
      draft: normalizeDraft(parsed.draft),
      step: Number.isFinite(parsed.step) ? parsed.step : 0,
    };
  } catch {
    return null;
  }
}

function stripPhotosFromItems(items) {
  return (items || []).map((it) => ({
    ...it,
    distancePhoto: null,
    serialPhoto: null,
    issuePhotos: [],
    checklist: Object.fromEntries(
      Object.entries(it.checklist || {}).map(([k, v]) => [
        k,
        v && v.photo ? { ...v, photo: null } : v,
      ])
    ),
  }));
}

function persistDraft(draft, step) {
  const blob = { draft, step };
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(blob));
  } catch {
    // QuotaExceededError on big base64 photos — retry without them.
    try {
      localStorage.setItem(
        DRAFT_KEY,
        JSON.stringify({
          draft: { ...draft, items: stripPhotosFromItems(draft.items) },
          step,
        })
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
  if (d.clientName || d.siteAddress) return true;
  if (d.issuesFound || d.partsReplaced || d.recommendations) return true;
  if ((d.items || []).length > 0) return true;
  return false;
}

function creatorLabel(emailOrName, name) {
  return name || emailOrName || null;
}

function jobFromServer(detail) {
  const p = normalizeDraft(detail.payload || {});
  return {
    ...p,
    id: detail.id,
    submittedAt: detail.submitted_at,
    emailStatus: detail.email_status,
    createdBy: creatorLabel(detail.created_by_email, detail.created_by_name),
    createdByEmail: detail.created_by_email || null,
    needsReplacementCount: detail.needs_replacement_count || 0,
    itemCount: detail.item_count || (p.items || []).length || 0,
    reviewStatus: detail.review_status || "pending",
    reviewedByEmail: detail.reviewed_by_email || null,
    reviewedAt: detail.reviewed_at || null,
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
    itemCount: s.item_count || 0,
    reviewStatus: s.review_status || "pending",
    reviewedByEmail: s.reviewed_by_email || null,
    reviewedAt: s.reviewed_at || null,
    items: [],
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
  const [editingId, setEditingId] = useState(null);
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

  // Only persist draft for fresh reports, not admin edits of existing ones.
  useEffect(() => {
    if (view !== "form" || editingId) return;
    persistDraft(draft, step);
    if (isMeaningfulDraft(draft)) {
      setSavedDraft({ draft, step });
    }
  }, [draft, step, view, editingId]);

  const upd = (field, val) => setDraft((d) => ({ ...d, [field]: val }));

  const addItem = (type) =>
    setDraft((d) => ({ ...d, items: [...(d.items || []), makeItem(type)] }));

  const updateItem = (id, patch) =>
    setDraft((d) => ({
      ...d,
      items: (d.items || []).map((it) => (it.id === id ? { ...it, ...patch } : it)),
    }));

  const removeItem = (id) =>
    setDraft((d) => ({
      ...d,
      items: (d.items || []).filter((it) => it.id !== id),
    }));

  const enterForm = (initialDraft, initialStep = 0, resumed = false) => {
    setDraft(normalizeDraft(initialDraft));
    setStep(initialStep);
    setEmailState("idle");
    setViewingJob(null);
    setEditingId(null);
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

  const enterEdit = (job) => {
    setDraft(normalizeDraft(job));
    setEditingId(job.id);
    setStep(0);
    setView("form");
  };

  const submitReport = async () => {
    setEmailState("sending");
    try {
      const res = await api.submitReport(draft);
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

  const saveEdit = async () => {
    if (!editingId) return;
    try {
      const detail = await api.updateReport(editingId, { payload: draft });
      const full = jobFromServer(detail);
      setJobs((prev) => prev.map((j) => (j.id === full.id ? { ...j, ...full } : j)));
      setViewingJob(full);
      setEditingId(null);
      setView("report");
      toast.success("Report updated");
    } catch (err) {
      toast.error(err.message || "Failed to update report");
    }
  };

  const openJob = async (job) => {
    if (job?.id === DEMO_REPORT_ID) {
      // The demo is rendered locally — no API call. It carries the full
      // shape ReportView expects (items[], photos, review status, etc.).
      setViewingJob(demoJob);
      setEmailState("sent");
      setView("report");
      return;
    }
    try {
      const detail = await api.getReport(job.id);
      const full = jobFromServer(detail);
      setViewingJob(full);
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

  const updateReview = async (status) => {
    if (!viewingJob?.id) return;
    try {
      const detail = await api.updateReport(viewingJob.id, { review_status: status });
      const full = jobFromServer(detail);
      setViewingJob(full);
      setJobs((prev) => prev.map((j) => (j.id === full.id ? { ...j, ...full } : j)));
      const labels = {
        reviewed: "Marked as reviewed",
        sent_to_client: "Marked as sent to client",
        pending: "Reset to pending",
      };
      toast.success(labels[status] || "Status updated");
    } catch (err) {
      toast.error(err.message || "Failed to update status");
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
          addItem={addItem}
          updateItem={updateItem}
          removeItem={removeItem}
          onSubmit={editingId ? saveEdit : submitReport}
          onBack={() => {
            if (editingId) {
              setEditingId(null);
              setView("report");
            } else {
              setView("dashboard");
            }
          }}
          onDiscard={editingId ? null : discardDraft}
          editing={!!editingId}
        />
      )}
      {view === "report" && (
        <ReportView
          job={viewingJob || draft}
          emailState={emailState}
          onSend={sendReport}
          onBack={() => setView("dashboard")}
          onPrint={() => window.print()}
          isAdmin={!!user.is_admin}
          onEdit={user.is_admin && viewingJob ? () => enterEdit(viewingJob) : null}
          onMarkReviewed={user.is_admin ? () => updateReview("reviewed") : null}
          onMarkSent={user.is_admin ? () => updateReview("sent_to_client") : null}
          onResetReview={user.is_admin ? () => updateReview("pending") : null}
        />
      )}
      <Toaster />
    </>
  );
}
