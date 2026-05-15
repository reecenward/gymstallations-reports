import { useEffect, useRef, useState } from "react";
import { MoreVertical } from "lucide-react";
import { cn } from "@/lib/utils";

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
          "flex size-9 items-center justify-center rounded-full text-neutral-500 transition-colors",
          "hover:bg-neutral-100 hover:text-neutral-900",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          open && "bg-neutral-100 text-neutral-900"
        )}
      >
        <MoreVertical className="size-5" strokeWidth={2} />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-30 mt-2 w-56 origin-top-right rounded-xl border border-neutral-200 bg-white p-1.5 shadow-lg"
        >
          {typeof children === "function" ? children({ close, MenuItem }) : children}
        </div>
      )}
    </div>
  );
}

CardActionsMenu.MenuItem = MenuItem;
