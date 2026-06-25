"use client";

import { useActionState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { LanguageSelect } from "@/components/language-select";
import { updateProfile, type ProfileState } from "@/lib/actions/profile";

const initial: ProfileState = {};
const fieldClass =
  "w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50";

export function SettingsForm({
  displayName,
  status,
  bio,
  location,
  website,
  language,
  avatarUrl,
  bannerUrl,
}: {
  displayName: string;
  status: string;
  bio: string;
  location: string;
  website: string;
  language: string;
  avatarUrl: string | null;
  bannerUrl: string | null;
}) {
  const [state, formAction, pending] = useActionState(updateProfile, initial);

  return (
    <form action={formAction} className="mt-8 flex w-full flex-col gap-6">
      {/* Banner + avatar preview */}
      <div className="overflow-hidden rounded-2xl border border-border">
        <div
          className="h-28 w-full bg-[linear-gradient(120deg,#1e3a8a,#2563eb)]"
          style={bannerUrl ? { backgroundImage: `url(${bannerUrl})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
        />
        <div className="flex items-end gap-4 px-4 pb-4">
          <Avatar className="-mt-8 size-20 border-4 border-card">
            {avatarUrl ? <AvatarImage src={avatarUrl} alt="" /> : null}
            <AvatarFallback>{(displayName || "?").slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
        </div>
        <div className="grid gap-4 border-t border-border p-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="avatar">Profile photo</Label>
            <input id="avatar" name="avatar" type="file" accept="image/*" className={fieldClass} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="banner">Banner image</Label>
            <input id="banner" name="banner" type="file" accept="image/*" className={fieldClass} />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="display_name">Display name</Label>
        <Input id="display_name" name="display_name" defaultValue={displayName} placeholder="Your name" />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="status">Status / headline</Label>
        <Input id="status" name="status" defaultValue={status} placeholder="e.g. Writer · Reading 50 books this year" maxLength={140} />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="bio">Bio</Label>
        <textarea id="bio" name="bio" rows={3} defaultValue={bio} className={fieldClass} placeholder="A little about you" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="location">Location</Label>
          <Input id="location" name="location" defaultValue={location} placeholder="City, Country" />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="website">Website</Label>
          <Input id="website" name="website" defaultValue={website} placeholder="https://" />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="language">Preferred language</Label>
        <LanguageSelect id="language" defaultValue={language} />
      </div>

      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      {state.ok && <p className="text-sm text-green">Saved.</p>}
      <Button type="submit" disabled={pending} className="self-start">
        {pending ? "Saving…" : "Save changes"}
      </Button>
    </form>
  );
}
