import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageShell } from "@/components/page-shell";

export const metadata: Metadata = { title: "Profile · Bookspace" };

export default async function AuthorPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("username, display_name, bio")
    .eq("username", username)
    .single();

  if (!profile) notFound();

  return (
    <PageShell
      title={profile.display_name || profile.username || username}
      subtitle={`@${profile.username}`}
    >
      {profile.bio ? (
        <p className="mt-6 max-w-2xl text-muted-foreground">{profile.bio}</p>
      ) : (
        <p className="mt-6 text-muted-foreground">No bio yet.</p>
      )}
    </PageShell>
  );
}
