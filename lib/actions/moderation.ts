"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

async function authed() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

export async function createReport(formData: FormData): Promise<void> {
  const { supabase, user } = await authed();
  if (!user) return;
  const target_type = String(formData.get("target_type") ?? "");
  const target_id = String(formData.get("target_id") ?? "");
  const reason = String(formData.get("reason") ?? "").trim();
  if (!target_type || !target_id) return;
  await supabase.from("reports").insert({
    reporter_id: user.id,
    target_type,
    target_id,
    reason: reason || null,
  });
}

export async function setReportStatus(formData: FormData): Promise<void> {
  const { supabase, user } = await authed();
  if (!user) return;
  const { data: p } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (p?.role !== "admin") return;
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!["open", "resolved", "dismissed"].includes(status)) return;
  await supabase.from("reports").update({ status }).eq("id", id);
  revalidatePath("/admin/reports");
}
