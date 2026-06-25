"use client";

import { useActionState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LanguageSelect } from "@/components/language-select";
import { FormSelect } from "@/components/form-select";
import { createWrittenBook, type WriteFormState } from "@/lib/actions/written";

const initial: WriteFormState = {};
const fieldClass =
  "w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50";

export function WriteForm({ genres }: { genres: string[] }) {
  const [state, formAction, pending] = useActionState(createWrittenBook, initial);

  return (
    <form action={formAction} className="mt-8 flex w-full flex-col gap-5">
      <div className="flex flex-col gap-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" required minLength={2} placeholder="Your book title" />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="description">Description</Label>
        <textarea id="description" name="description" rows={3} className={fieldClass} placeholder="A short summary" />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="language">Language</Label>
          <LanguageSelect id="language" defaultValue="en" />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="visibility">Visibility</Label>
          <FormSelect
            name="visibility"
            id="visibility"
            defaultValue="public"
            options={[
              { value: "public", label: "Public" },
              { value: "unlisted", label: "Unlisted (link only)" },
              { value: "private", label: "Private" },
            ]}
          />
        </div>
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1 text-sm font-medium">Genres</legend>
        <div className="flex flex-wrap gap-3">
          {genres.map((g) => (
            <label key={g} className="flex items-center gap-1.5 text-sm">
              <input type="checkbox" name="genres" value={g} className="accent-primary" />
              {g}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="flex flex-col gap-2">
        <Label htmlFor="cover">Cover image (optional)</Label>
        <input id="cover" name="cover" type="file" accept="image/*" className={fieldClass} />
      </div>

      {state.error && <p className="text-sm text-destructive">{state.error}</p>}

      <Button type="submit" disabled={pending} size="lg" className="self-start">
        {pending ? "Creating…" : "Create & write chapters"}
      </Button>
    </form>
  );
}
