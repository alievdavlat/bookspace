"use server";

import { createClient } from "@/lib/supabase/server";

// Free, keyless text generation via Pollinations (open-source models).
const ENDPOINT = "https://text.pollinations.ai/";

// Best-effort per-user cooldown (in-memory; resets on restart).
const lastCall = new Map<string, number>();
async function allowed(): Promise<boolean> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const key = user?.id ?? "anon";
  const now = Date.now();
  if (now - (lastCall.get(key) ?? 0) < 3000) return false;
  lastCall.set(key, now);
  return true;
}

async function complete(prompt: string): Promise<string> {
  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [{ role: "user", content: prompt }],
        model: "openai-fast",
        private: true,
      }),
    });
    if (!res.ok) return "";
    return (await res.text()).trim();
  } catch {
    return "";
  }
}

export type AiState = { result?: string; error?: string };

export async function aiSummarize(text: string): Promise<AiState> {
  if (!(await allowed())) return { error: "Please wait a few seconds before trying again." };
  const clean = text.replace(/\s+/g, " ").trim().slice(0, 6000);
  if (clean.length < 40) return { error: "Not enough text to summarize." };
  const out = await complete(`Summarize the following for a reader in 3–4 concise sentences. Output only the summary:\n\n${clean}`);
  return out ? { result: out } : { error: "AI is unavailable right now — try again later." };
}

export async function aiTranslate(text: string, language: string): Promise<AiState> {
  if (!(await allowed())) return { error: "Please wait a few seconds before trying again." };
  const clean = text.replace(/\s+/g, " ").trim().slice(0, 6000);
  if (!clean) return { error: "Nothing to translate." };
  const out = await complete(`Translate the following text into ${language}. Output only the translation, preserving meaning and tone:\n\n${clean}`);
  return out ? { result: out } : { error: "AI is unavailable right now — try again later." };
}
