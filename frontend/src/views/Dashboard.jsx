import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ChevronRight,
  ClipboardCheck,
  ClipboardList,
  FileEdit,
  Mail,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { EquipmentIcon } from "@/components/EquipmentIcon";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { AccountMenu } from "@/components/AccountMenu";
import { cn } from "@/lib/utils";

const STEP_LABELS = ["Site", "Equipment", "Inspection", "Notes"];

function DraftResumeCard({ draft, step, onResume, onDiscard }) {
  const label =
    draft.clientName ||
    [draft.brand, draft.model].filter(Boolean).join(" ") ||
    draft.equipmentType ||
    "Untitled draft";
  const stepLabel = STEP_LABELS[step] || STEP_LABELS[0];

  return (
    <Card className="border-dashed border-neutral-300 bg-neutral-50">
      <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div className="flex min-w-0 items-start gap-3">
          <div className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md bg-white text-neutral-700 ring-1 ring-neutral-200">
            <FileEdit className="size-4" strokeWidth={1.75} />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
              You have a saved report
            </div>
            <div className="mt-0.5 truncate text-sm font-semibold text-navy">
              {label}
            </div>
            <div className="mt-0.5 text-xs text-muted-foreground">
              On step {step + 1} of {STEP_LABELS.length}: {stepLabel}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" onClick={onDiscard}>
            <Trash2 className="size-4" />
            Throw away
          </Button>
          <Button size="lg" onClick={onResume}>
            Keep going
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function BrandMark() {
  return (
    <a href="/" className="flex items-center" aria-label="Gymstallations home">
      <img
        src="/logo.png"
        alt="Gymstallations"
        className="h-9 w-auto sm:h-10"
        width={5171}
        height={1156}
      />
    </a>
  );
}

const FILTERS = [
  { id: "all", label: "All" },
  { id: "review", label: "Needs review", icon: ClipboardCheck, adminOnly: true },
  { id: "replace", label: "Repairs needed", icon: AlertTriangle },
];

function FilterChip({ active, onClick, children, icon: Icon, count }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-xs font-semibold transition-colors",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50"
      )}
    >
      {Icon && <Icon className="size-3.5" />}
      {children}
      {count != null && (
        <span
          className={cn(
            "ml-0.5 rounded-full px-1.5 text-[10px] font-bold tabular-nums",
            active ? "bg-white/20 text-white" : "bg-neutral-100 text-neutral-600"
          )}
        >
          {count}
        </span>
      )}
    </button>
  );
}

export function Dashboard({
  jobs,
  onNew,
  onView,
  onLogout,
  onManageUsers,
  user,
  savedDraft,
  savedDraftStep = 0,
  onResumeDraft,
  onDiscardDraft,
  onDismissDemo,
}) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [tech, setTech] = useState("all");
  const [confirmDiscard, setConfirmDiscard] = useState(false);

  const techOptions = useMemo(() => {
    const seen = new Map();
    for (const j of jobs) {
      if (j.createdByEmail && !seen.has(j.createdByEmail)) {
        seen.set(j.createdByEmail, j.createdBy || j.createdByEmail);
      }
    }
    return Array.from(seen.entries()).map(([email, label]) => ({ email, label }));
  }, [jobs]);

  const counts = useMemo(() => {
    let replace = 0;
    let failed = 0;
    let review = 0;
    for (const j of jobs) {
      if ((j.needsReplacementCount || 0) > 0) replace++;
      if (j.emailStatus === "failed") failed++;
      if ((j.reviewStatus || "pending") === "pending" && !j.isDemo) review++;
    }
    return { replace, failed, review };
  }, [jobs]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return jobs.filter((j) => {
      if (filter === "replace" && !(j.needsReplacementCount > 0)) return false;
      if (filter === "failed" && j.emailStatus !== "failed") return false;
      if (filter === "review" && (j.reviewStatus || "pending") !== "pending") return false;
      if (tech !== "all" && j.createdByEmail !== tech) return false;
      if (!q) return true;
      const haystack = [
        j.clientName,
        j.jobNumber,
        j.equipmentType,
        j.brand,
        j.model,
        j.createdBy,
        j.createdByEmail,
        j.siteAddress,
        j.serialNumber,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [jobs, query, filter, tech]);

  const isAdmin = !!user?.is_admin;
  const hasFilters = query || filter !== "all" || tech !== "all";

  return (
    <div className="mx-auto w-full max-w-4xl px-4 pb-12 sm:px-6">
      <div className="sticky top-0 z-20 -mx-4 border-b border-transparent bg-background/95 px-4 pb-4 pt-4 backdrop-blur sm:-mx-6 sm:px-6 sm:pt-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <BrandMark />
          <div className="flex items-center gap-2">
            <Button onClick={onNew} size="lg">
              <Plus className="size-4" />
              <span className="hidden sm:inline">Start New Report</span>
              <span className="sm:hidden">New Report</span>
            </Button>
            <AccountMenu
              user={user}
              onManageUsers={onManageUsers}
              onLogout={onLogout}
            />
          </div>
        </div>

        <div className="space-y-2">
          {jobs.length >= 10 && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search client, job #, brand, serial…"
                className="h-11 pl-9 text-base"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-neutral-400 hover:text-neutral-700"
                  aria-label="Clear search"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>
          )}
          <div className="flex flex-wrap gap-1.5">
            {FILTERS.filter((f) => !f.adminOnly || isAdmin).map((f) => (
              <FilterChip
                key={f.id}
                icon={f.icon}
                active={filter === f.id}
                onClick={() => setFilter(f.id)}
                count={
                  f.id === "replace"
                    ? counts.replace
                    : f.id === "review"
                    ? counts.review
                    : jobs.length
                }
              >
                {f.label}
              </FilterChip>
            ))}
            {isAdmin && techOptions.length > 1 && (
              <select
                value={tech}
                onChange={(e) => setTech(e.target.value)}
                className="h-8 rounded-full border border-neutral-200 bg-white px-3 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="all">All technicians</option>
                {techOptions.map((t) => (
                  <option key={t.email} value={t.email}>
                    {t.label}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {savedDraft && (
          <DraftResumeCard
            draft={savedDraft}
            step={savedDraftStep}
            onResume={onResumeDraft}
            onDiscard={() => setConfirmDiscard(true)}
          />
        )}

        {jobs.length === 0 ? (
          <div className="mx-auto max-w-md">
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center px-6 py-12 text-center sm:py-14">
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-neutral-100 text-neutral-900">
                  <ClipboardList className="size-7" strokeWidth={1.75} />
                </div>
                <div className="mb-1.5 text-lg font-bold text-navy">
                  No reports yet
                </div>
                <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
                  Tap the green button to start your first one. Takes about 3 minutes.
                </p>
                <Button onClick={onNew} size="xl" className="w-full">
                  <Plus className="size-5" />
                  Start New Report
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : filtered.length === 0 ? (
          <div className="mx-auto max-w-md">
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center px-6 py-10 text-center">
                <Search className="mb-3 size-7 text-neutral-300" strokeWidth={1.75} />
                <div className="mb-1 text-base font-bold text-navy">
                  Nothing matches
                </div>
                <p className="mb-4 text-sm text-muted-foreground">
                  Try a different search or clear the filters.
                </p>
                {hasFilters && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setQuery("");
                      setFilter("all");
                      setTech("all");
                    }}
                  >
                    Clear filters
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          <div>
            <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {filtered.length} of {jobs.length} report{jobs.length !== 1 ? "s" : ""}
            </div>
            <div className="space-y-3">
              {filtered.map((job) => {
                const replace = job.needsReplacementCount || 0;
                const failed = job.emailStatus === "failed";
                const isDemo = !!job.isDemo;
                return (
                  <Card
                    key={job.id}
                    className={cn(
                      "cursor-pointer transition-shadow hover:shadow-md",
                      isDemo && "border-dashed bg-neutral-50/60"
                    )}
                    onClick={() => onView(job)}
                  >
                    <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:p-5">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <div className="truncate text-base font-bold text-navy">
                            {job.clientName || "Unnamed Client"}
                          </div>
                          {isDemo && (
                            <span className="flex-shrink-0 rounded-full border border-neutral-300 bg-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-neutral-600">
                              Demo
                            </span>
                          )}
                        </div>
                        <div className="mt-1 flex items-center gap-1.5 truncate text-sm text-muted-foreground">
                          <EquipmentIcon
                            type={job.equipmentType}
                            className="size-4 shrink-0"
                          />
                          <span className="truncate">
                            {[
                              job.equipmentType,
                              [job.brand, job.model].filter(Boolean).join(" "),
                              job.date,
                              `#${job.jobNumber}`,
                            ]
                              .filter(Boolean)
                              .join(" · ")}
                          </span>
                        </div>
                        {job.createdBy && (
                          <div className="mt-0.5 truncate text-xs text-muted-foreground">
                            by {job.createdBy}
                          </div>
                        )}
                        {(replace > 0 || failed || (job.reviewStatus && job.reviewStatus !== "pending") || (isAdmin && !job.isDemo && (job.reviewStatus || "pending") === "pending")) && (
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {replace > 0 && (
                              <Badge variant="destructive">
                                <AlertTriangle className="size-3" />
                                {replace} need
                                {replace !== 1 ? "" : "s"} repair
                              </Badge>
                            )}
                            {failed && (
                              <Badge variant="outline" className="border-warn bg-warn/10 text-warn-foreground">
                                <Mail className="size-3" />
                                Email didn't send
                              </Badge>
                            )}
                            {job.reviewStatus === "sent_to_client" && (
                              <Badge variant="outline" className="border-neutral-300 bg-neutral-50 text-neutral-700">
                                <ClipboardCheck className="size-3" />
                                Sent to client
                              </Badge>
                            )}
                            {job.reviewStatus === "reviewed" && (
                              <Badge variant="outline" className="border-neutral-300 bg-neutral-50 text-neutral-700">
                                <ClipboardCheck className="size-3" />
                                Reviewed
                              </Badge>
                            )}
                            {isAdmin && !job.isDemo && (job.reviewStatus || "pending") === "pending" && (
                              <Badge variant="outline" className="border-warn bg-warn/10 text-warn-foreground">
                                <ClipboardCheck className="size-3" />
                                Needs review
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 self-start sm:self-center">
                        {isDemo && onDismissDemo && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDismissDemo();
                            }}
                          >
                            <X className="size-4" />
                            Dismiss
                          </Button>
                        )}
                        <ChevronRight className="size-5 text-neutral-400" aria-hidden="true" />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={confirmDiscard}
        title="Throw this away?"
        description="Everything you've entered so far will be deleted. You can't undo this."
        confirmLabel="Throw away"
        destructive
        onConfirm={() => {
          setConfirmDiscard(false);
          onDiscardDraft?.();
        }}
        onCancel={() => setConfirmDiscard(false)}
      />
    </div>
  );
}
