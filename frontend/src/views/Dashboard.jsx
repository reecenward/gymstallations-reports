import { ClipboardList, Plus, ChevronRight, LogOut, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EQUIPMENT_ICONS, gradeCounts } from "@/lib/equipment";

function BrandMark() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-lg font-black text-white shadow-sm">
        G
      </div>
      <div className="leading-tight">
        <div className="text-xl font-extrabold tracking-tight text-navy">
          Gymstallations
        </div>
        <div className="text-xs text-muted-foreground">
          Preventive Maintenance Reports
        </div>
      </div>
    </div>
  );
}

export function Dashboard({ jobs, onNew, onView, onLogout, onManageUsers, user }) {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-10">
      <div className="mb-6 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-center sm:justify-between">
        <BrandMark />
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
          {user && (
            <span className="text-sm text-muted-foreground sm:mr-2">
              {user.full_name || user.email}
            </span>
          )}
          <Button onClick={onNew} size="lg" className="w-full sm:w-auto">
            <Plus className="size-4" />
            New Report
          </Button>
          {onManageUsers && (
            <Button
              onClick={onManageUsers}
              size="lg"
              variant="outline"
              className="w-full sm:w-auto"
            >
              <Users className="size-4" />
              Users
            </Button>
          )}
          {onLogout && (
            <Button
              onClick={onLogout}
              size="lg"
              variant="outline"
              className="w-full sm:w-auto"
            >
              <LogOut className="size-4" />
              Sign out
            </Button>
          )}
        </div>
      </div>

      {jobs.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center px-6 py-16 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
              <ClipboardList className="size-7" />
            </div>
            <div className="mb-2 text-xl font-bold text-navy">
              No reports yet
            </div>
            <p className="mb-6 max-w-sm text-sm text-muted-foreground">
              Create your first preventive maintenance service report to get
              started.
            </p>
            <Button onClick={onNew} size="lg">
              <Plus className="size-4" />
              Create First Report
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div>
          <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {jobs.length} Report{jobs.length !== 1 ? "s" : ""}
          </div>
          <div className="space-y-3">
            {jobs.map((job) => {
              const counts = gradeCounts(job.checklist);
              const replace = counts["Needs Replacement"];
              return (
                <Card
                  key={job.id}
                  className="cursor-pointer transition-shadow hover:shadow-md"
                  onClick={() => onView(job)}
                >
                  <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:p-5">
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-base font-bold text-navy">
                        {job.clientName || "Unnamed Client"}
                      </div>
                      <div className="mt-1 truncate text-sm text-muted-foreground">
                        <span className="mr-1">
                          {EQUIPMENT_ICONS[job.equipmentType] || ""}
                        </span>
                        {job.equipmentType} · {job.brand} {job.model} ·{" "}
                        {job.date} · #{job.jobNumber}
                      </div>
                      {replace > 0 && (
                        <Badge variant="destructive" className="mt-2">
                          {replace} item{replace !== 1 ? "s" : ""} need
                          replacement
                        </Badge>
                      )}
                    </div>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="self-start sm:self-center"
                      onClick={(e) => {
                        e.stopPropagation();
                        onView(job);
                      }}
                    >
                      View Report
                      <ChevronRight className="size-4" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
