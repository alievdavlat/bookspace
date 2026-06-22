"use client";

import { useActionState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { updateProfile, type ProfileState } from "@/lib/actions/profile";

const initial: ProfileState = {};
const fieldClass =
  "w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50";

export function SettingsForm({
  displayName,
  bio,
  language,
}: {
  displayName: string;
  bio: string;
  language: string;
}) {
  const [state, formAction, pending] = useActionState(updateProfile, initial);
  return (
    <form action={formAction} className="mt-8 flex max-w-xl flex-col gap-5">
      <div className="flex flex-col gap-2">
        <Label htmlFor="display_name">Display name</Label>
        <Input id="display_name" name="display_name" defaultValue={displayName} placeholder="Your name" />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="bio">Bio</Label>
        <textarea id="bio" name="bio" rows={3} defaultValue={bio} className={fieldClass} placeholder="A little about you" />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="language">Preferred language</Label>
        <select id="language" name="language" defaultValue={language} className={fieldClass}>
          <option value="uz">Uzbek</option>
          <option value="en">English</option>
          <option value="ru">Russian</option>
        </select>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="avatar">Avatar</Label>
        <input id="avatar" name="avatar" type="file" accept="image/*" className={fieldClass} />
      </div>
      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      {state.ok && <p className="text-sm text-green">Saved.</p>}
      <Button type="submit" disabled={pending} className="self-start">
        {pending ? "Saving…" : "Save changes"}
      </Button>
    </form>
  );
}
