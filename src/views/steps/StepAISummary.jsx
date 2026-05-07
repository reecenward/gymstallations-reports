import { Sparkles, Loader2 } from "lucide-react";
import { Field } from "@/components/Field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function StepAISummary({
  apiKey,
  setApiKey,
  summary,
  loading,
  onGenerate,
}) {
  return (
    <div className="space-y-5">
      <div>
        <div className="text-lg font-bold text-navy">AI-Assisted Summary</div>
        <p className="mt-1 text-sm text-muted-foreground">
          Generate a professional client-facing summary using Claude. Enter
          your Anthropic API key, or leave blank to use a demo summary.
        </p>
      </div>

      <Field label="Anthropic API Key (optional)" htmlFor="apiKey">
        <Input
          id="apiKey"
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="sk-ant-... (leave blank for demo summary)"
        />
      </Field>

      <Button onClick={onGenerate} disabled={loading} size="lg">
        {loading ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Sparkles className="size-4" />
        )}
        {loading ? "Generating…" : "Generate Summary"}
      </Button>

      {summary ? (
        <div className="rounded-xl border border-brand-200 bg-brand-50 p-4 sm:p-5">
          <div className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary">
            <Sparkles className="size-3.5" />
            AI Summary
          </div>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-navy-soft">
            {summary}
          </p>
        </div>
      ) : !loading ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-5 text-center text-sm text-muted-foreground">
          Click "Generate Summary" to create an AI-powered report narrative.
        </div>
      ) : null}
    </div>
  );
}
