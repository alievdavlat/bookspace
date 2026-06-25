import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { SettingsForm } from "@/components/settings/settings-form";
import { SectionsManager, type Section } from "@/components/settings/sections-manager";

export const metadata: Metadata = { title: "Settings · Bookspace" };

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [{ data: profile }, { data: sectionRows }] = await Promise.all([
    supabase
      .from("profiles")
      .select("display_name, status, bio, location, website, language, avatar_url, banner_url")
      .eq("id", user.id)
      .single(),
    supabase
      .from("profile_sections")
      .select("id, kind, title, body")
      .eq("profile_id", user.id)
      .order("order", { ascending: true }),
  ]);

  const sections = (sectionRows ?? []) as Section[];

  return (
    <>
      <h1 className="font-serif text-3xl font-semibold">Settings</h1>
      <p className="mt-1 text-muted-foreground">Your profile, about and custom tabs.</p>
      <SettingsForm
        displayName={profile?.display_name ?? ""}
        status={profile?.status ?? ""}
        bio={profile?.bio ?? ""}
        location={profile?.location ?? ""}
        website={profile?.website ?? ""}
        language={profile?.language ?? "en"}
        avatarUrl={profile?.avatar_url ?? null}
        bannerUrl={profile?.banner_url ?? null}
      />

      <section className="mt-14 max-w-2xl">
        <h2 className="font-serif text-2xl font-semibold">About</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Rich blocks shown on your profile&apos;s About tab.
        </p>
        <SectionsManager kind="about" sections={sections} />
      </section>

      <section className="mt-14 max-w-2xl">
        <h2 className="font-serif text-2xl font-semibold">Custom tabs</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Add your own tabs (e.g. Awards, Press) — they appear on your profile, YouTube-style.
        </p>
        <SectionsManager kind="tab" sections={sections} />
      </section>
    </>
  );
}
