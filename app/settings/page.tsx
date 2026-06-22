import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageShell } from "@/components/page-shell";
import { SettingsForm } from "@/components/settings/settings-form";

export const metadata: Metadata = { title: "Settings · Bookspace" };

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in?redirect=/settings");

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, bio, language")
    .eq("id", user.id)
    .single();

  return (
    <PageShell title="Settings" subtitle="Your profile and reading preferences.">
      <SettingsForm
        displayName={profile?.display_name ?? ""}
        bio={profile?.bio ?? ""}
        language={profile?.language ?? "uz"}
      />
    </PageShell>
  );
}
