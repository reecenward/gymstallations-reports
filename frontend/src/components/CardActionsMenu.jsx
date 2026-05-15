import { useEffect, useRef, useState } from "react";
import { MoreVertical } from "lucide-react";
import { cn } from "@/lib/utils";

function MenuItem({ icon: Icon, children, onClick, destructive }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 rounded-md px-3 py-3 text-left text-sm transition-colors sm:py-2",
        destructive
          ? "text-red-700 hover:bg-red-50 active:bg-red-100"
          : "text-neutral-800 hover:bg-neutral-100 active:bg-neutral-200"
      )}
    >
      {Icon && <Icon className="size-4 shrink-0" strokeWidth={1.75} />}
      <span className="flex-1 truncate">{children}</span>
    </button>
  );
}

export function CardActionsMenu({ children, label = "More actions" }) {
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
    <div className="relative" ref={wrapRef} onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={label}
        className={cn(
          "flex size-10 items-center justify-center rounded-full text-neutral-500 transition-colors",
          "hover:bg-neutral-100 hover:text-neutral-900 active:bg-neutral-200",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          open && "bg-neutral-100 text-neutral-900"
        )}
      >
        <MoreVertical className="size-5" strokeWidth={2} />
      </button>

      {open && (
        <>
          {/* Mobile: full-width bottom sheet */}
          <div
            className="fixed inset-0 z-40 bg-black/40 sm:hidden"
            onClick={(e) => {
              e.stopPropagation();
              close();
            }}
            aria-hidden="true"
          />
          <div
            role="menu"
            className={cn(
              "z-50 rounded-xl border border-neutral-200 bg-white p-1.5 shadow-lg",
              // Mobile: bottom sheet
              "fixed inset-x-3 bottom-3 max-h-[80vh] overflow-y-auto pb-[max(0.375rem,env(safe-area-inset-bottom))] sm:inset-x-auto sm:bottom-auto",
              // Desktop: anchored popover
              "sm:absolute sm:right-0 sm:mt-2 sm:w-56 sm:origin-top-right"
            )}
          >
            {typeof children === "function" ? children({ close, MenuItem }) : children}
          </div>
        </>
      )}
    </div>
  );
}

CardActionsMenu.MenuItem = MenuItem;
