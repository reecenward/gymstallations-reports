import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export function Field({ label, required, htmlFor, className, children }) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label htmlFor={htmlFor}>
        {label}
        {required && <span className="text-destructive"> *</span>}
      </Label>
      {children}
    </div>
  );
}
