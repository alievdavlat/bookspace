"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { addSection, updateSection, deleteSection } from "@/lib/actions/profile";

export type Section = { id: string; kind: "about" | "tab"; title: string; body: string | null };

const fieldClass =
  "w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50";

export function SectionsManager({ kind, sections }: { kind: "about" | "tab"; sections: Section[] }) {
  const [adding, setAdding] = useState(false);
  const mine = sections.filter((s) => s.kind === kind);
  const noun = kind === "about" ? "About section" : "Custom tab";

  return (
    <div className="mt-4 space-y-4">
      {mine.length === 0 ? (
        <p className="text-sm text-muted-foreground">No {noun.toLowerCase()}s yet.</p>
      ) : (
        mine.map((s) => <SectionRow key={s.id} section={s} />)
      )}

      {adding ? (
        <form action={addSection} className="space-y-3 rounded-xl border border-dashed border-border p-4">
          <input type="hidden" name="kind" value={kind} />
          <div className="flex flex-col gap-1.5">
            <Label>Title</Label>
            <Input name="title" required placeholder={kind === "tab" ? "Tab name (e.g. Awards)" : "Heading"} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Content</Label>
            <textarea name="body" rows={4} className={fieldClass} placeholder="Write something…" />
          </div>
          <div className="flex gap-2">
            <Button type="submit" size="sm">Add</Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => setAdding(false)}>Cancel</Button>
          </div>
        </form>
      ) : (
        <Button type="button" size="sm" variant="outline" onClick={() => setAdding(true)}>
          + Add {noun.toLowerCase()}
        </Button>
      )}
    </div>
  );
}

function SectionRow({ section }: { section: Section }) {
  const [editing, setEditing] = useState(false);
  if (editing) {
    return (
      <form action={updateSection} className="space-y-3 rounded-xl border border-border p-4" onSubmit={() => setEditing(false)}>
        <input type="hidden" name="id" value={section.id} />
        <Input name="title" defaultValue={section.title} required />
        <textarea name="body" rows={4} defaultValue={section.body ?? ""} className={fieldClass} />
        <div className="flex gap-2">
          <Button type="submit" size="sm">Save</Button>
          <Button type="button" size="sm" variant="ghost" onClick={() => setEditing(false)}>Cancel</Button>
        </div>
      </form>
    );
  }
  return (
    <div className="flex items-start justify-between gap-4 rounded-xl border border-border p-4">
      <div className="min-w-0">
        <p className="font-medium">{section.title}</p>
        {section.body ? <p className="mt-1 line-clamp-2 whitespace-pre-line text-sm text-muted-foreground">{section.body}</p> : null}
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <button onClick={() => setEditing(true)} className="text-xs text-primary hover:underline">Edit</button>
        <form action={deleteSection}>
          <input type="hidden" name="id" value={section.id} />
          <button className="text-xs text-destructive hover:underline">Delete</button>
        </form>
      </div>
    </div>
  );
}
