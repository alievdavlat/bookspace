"use client";

import { useActionState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LanguageSelect } from "@/components/language-select";
import { createUploadedBook, type BookFormState } from "@/lib/actions/books";

const initial: BookFormState = {};

const fieldClass =
  "w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50";

export function UploadForm({ genres }: { genres: string[] }) {
  const [state, formAction, pending] = useActionState(createUploadedBook, initial);

  return (
    <form action={formAction} className="mt-8 flex w-full flex-col gap-5">
      <div className="flex flex-col gap-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" required minLength={2} placeholder="Book title" />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="description">Description</Label>
        <textarea
          id="description"
          name="description"
          rows={4}
          className={fieldClass}
          placeholder="What is this book about?"
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="language">Language</Label>
          <LanguageSelect id="language" defaultValue="en" />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="visibility">Visibility</Label>
          <select id="visibility" name="visibility" defaultValue="public" className={fieldClass}>
            <option value="public">Public</option>
            <option value="unlisted">Unlisted (link only)</option>
            <option value="private">Private</option>
          </select>
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
        <input
          name="cover_url"
          type="url"
          placeholder="…or paste a cover image URL"
          className={fieldClass}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="file">Book file (PDF or EPUB)</Label>
        <input id="file" name="file" type="file" accept=".pdf,.epub" className={fieldClass} />
        <input
          name="file_url"
          type="url"
          placeholder="…or paste a direct PDF/EPUB URL"
          className={fieldClass}
        />
        <p className="text-xs text-muted-foreground">Upload a file or provide a public URL.</p>
      </div>

      {state.error && <p className="text-sm text-destructive">{state.error}</p>}

      <Button type="submit" disabled={pending} size="lg" className="self-start">
        {pending ? "Publishing…" : "Publish book"}
      </Button>
    </form>
  );
}
