"use client";

import { useState } from "react";
import { Sparkles, Languages, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { aiSummarize, aiTranslate } from "@/lib/actions/ai";

const LANGS = ["English", "Uzbek", "Russian", "Spanish", "French", "German", "Arabic", "Turkish"];

export function AiTools({ text, label = "AI tools" }: { text: string; label?: string }) {
  const [loading, setLoading] = useState<null | "summary" | "translate">(null);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lang, setLang] = useState("Uzbek");

  const run = async (kind: "summary" | "translate") => {
    setLoading(kind);
    setError(null);
    setResult(null);
    const res = kind === "summary" ? await aiSummarize(text) : await aiTranslate(text, lang);
    setLoading(null);
    if (res.error) setError(res.error);
    else setResult(res.result ?? "");
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex flex-wrap items-center gap-2">
        <p className="mr-1 flex items-center gap-1.5 text-sm font-medium">
          <Sparkles className="size-4 text-primary" /> {label}
        </p>
        <Button size="sm" variant="outline" disabled={!!loading} onClick={() => run("summary")}>
          {loading === "summary" ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
          Summarize
        </Button>
        <div className="flex items-center gap-1">
          <Select value={lang} onValueChange={(v) => v && setLang(v)}>
            <SelectTrigger size="sm" className="w-28">
              <SelectValue>{(v: string) => v}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {LANGS.map((l) => (
                <SelectItem key={l} value={l}>
                  {l}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button size="sm" variant="outline" disabled={!!loading} onClick={() => run("translate")}>
            {loading === "translate" ? <Loader2 className="size-4 animate-spin" /> : <Languages className="size-4" />}
            Translate
          </Button>
        </div>
      </div>

      {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}
      {result ? (
        <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">{result}</p>
      ) : null}
      <p className="mt-3 text-[11px] text-muted-foreground/70">AI-generated · may be imperfect · free open model</p>
    </div>
  );
}
