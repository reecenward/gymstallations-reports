import { useEffect, useRef, useState } from "react";
import { Check, LogOut, Users } from "lucide-react";
import { cn } from "@/lib/utils";

function initials(user) {
  const source = user?.full_name?.trim() || user?.email || "?";
  return source.charAt(0).toUpperCase();
}

function MenuItem({ icon: Icon, children, onClick, destructive }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-sm transition-colors",
        destructive
          ? "text-red-700 hover:bg-red-50"
          : "text-neutral-800 hover:bg-neutral-100"
      )}
    >
      {Icon && <Icon className="size-4 shrink-0" strokeWidth={1.75} />}
      <span className="flex-1 truncate">{children}</span>
    </button>
  );
}

export function AccountMenu({ user, onManageUsers, onLogout }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <div className="relative" ref={wrapRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account menu"
        className={cn(
          "flex size-10 items-center justify-center rounded-full bg-neutral-900 text-sm font-bold text-white transition-shadow",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          open && "ring-2 ring-neutral-300 ring-offset-2"
        )}
      >
        {initials(user)}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-30 mt-2 w-64 origin-top-right rounded-xl border border-neutral-200 bg-white p-1.5 shadow-lg"
        >
          <div className="flex items-center gap-3 px-2.5 py-2">
            <div className="flex size-10 flex-shrink-0 items-center justify-center rounded-full bg-neutral-900 text-sm font-bold text-white">
              {initials(user)}
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-navy">
                {user?.full_name || user?.email || "Account"}
              </div>
              {user?.full_name && (
                <div className="truncate text-xs text-muted-foreground">
                  {user.email}
                </div>
              )}
              {user?.is_admin && (
                <div className="mt-0.5 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                  <Check className="size-3" /> Admin
                </div>
              )}
            </div>
          </div>

          <div className="my-1 h-px bg-neutral-100" />

          {onManageUsers && (
            <MenuItem
              icon={Users}
              onClick={() => {
                close();
                onManageUsers();
              }}
            >
              Manage users
            </MenuItem>
          )}
          <MenuItem
            icon={LogOut}
            destructive
            onClick={() => {
              close();
              onLogout?.();
            }}
          >
            Sign out
          </MenuItem>
        </div>
      )}
    </div>
  );
}
