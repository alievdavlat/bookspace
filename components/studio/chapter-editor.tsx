"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { GripVertical, Plus, Pencil, Trash2, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { RichEditor } from "@/components/editor/rich-editor";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  addChapter,
  updateChapter,
  renameChapter,
  deleteChapter,
  reorderChapters,
} from "@/lib/actions/written";

export type ChapterData = { id: string; title: string; order: number; html: string };

type SaveState = "idle" | "saving" | "saved";

export function ChapterEditor({
  bookId,
  bookTitle,
  bookSlug,
  initialChapters,
}: {
  bookId: string;
  bookTitle: string;
  bookSlug: string;
  initialChapters: ChapterData[];
}) {
  const [chapters, setChapters] = useState<ChapterData[]>(initialChapters);
  const [activeId, setActiveId] = useState<string>(initialChapters[0]?.id ?? "");
  const [save, setSave] = useState<SaveState>("idle");
  const [editingId, setEditingId] = useState<string | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dragId = useRef<string | null>(null);

  const active = chapters.find((c) => c.id === activeId) ?? chapters[0];

  const onEditorChange = useCallback(
    (html: string) => {
      if (!active) return;
      setChapters((prev) => prev.map((c) => (c.id === active.id ? { ...c, html } : c)));
      setSave("saving");
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(async () => {
        await updateChapter(active.id, html);
        setSave("saved");
      }, 800);
    },
    [active]
  );

  useEffect(() => {
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, []);

  const onAdd = async () => {
    const res = await addChapter(bookId);
    if (res.id) {
      const newCh: ChapterData = {
        id: res.id,
        title: `Chapter ${chapters.length + 1}`,
        order: chapters.length,
        html: "",
      };
      setChapters((prev) => [...prev, newCh]);
      setActiveId(res.id);
    }
  };

  const commitRename = async (c: ChapterData, title: string) => {
    setEditingId(null);
    const t = title.trim();
    if (!t || t === c.title) return;
    setChapters((prev) => prev.map((x) => (x.id === c.id ? { ...x, title: t } : x)));
    await renameChapter(c.id, t, bookId);
  };

  const onDelete = (c: ChapterData) => {
    if (chapters.length <= 1) {
      toast.error("A book needs at least one chapter.");
      return;
    }
    toast(`Delete “${c.title}”?`, {
      action: {
        label: "Delete",
        onClick: async () => {
          const next = chapters.filter((x) => x.id !== c.id);
          setChapters(next);
          if (activeId === c.id) setActiveId(next[0]?.id ?? "");
          await deleteChapter(c.id, bookId);
        },
      },
    });
  };

  const onDrop = async (targetId: string) => {
    const from = dragId.current;
    dragId.current = null;
    if (!from || from === targetId) return;
    const ids = chapters.map((c) => c.id);
    const fromIdx = ids.indexOf(from);
    const toIdx = ids.indexOf(targetId);
    if (fromIdx < 0 || toIdx < 0) return;
    const reordered = [...chapters];
    const [moved] = reordered.splice(fromIdx, 1);
    reordered.splice(toIdx, 0, moved);
    setChapters(reordered);
    await reorderChapters(bookId, reordered.map((c) => c.id));
  };

  return (
    <div className="grid gap-0 overflow-hidden rounded-xl border border-border bg-card md:grid-cols-[260px_1fr]">
      {/* Chapters panel */}
      <aside className="border-b border-border bg-secondary/30 p-3 md:border-b-0 md:border-r">
        <p className="px-2 pb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Chapters
        </p>
        <ul className="space-y-0.5">
          {chapters.map((c, i) => (
            <li
              key={c.id}
              draggable
              onDragStart={() => (dragId.current = c.id)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => onDrop(c.id)}
              className={cn(
                "group flex items-center gap-1.5 rounded-lg px-2 py-2 text-sm",
                c.id === activeId ? "bg-primary/10 text-foreground" : "text-muted-foreground hover:bg-secondary"
              )}
            >
              <GripVertical className="size-3.5 shrink-0 cursor-grab text-muted-foreground/50" />
              {editingId === c.id ? (
                <input
                  autoFocus
                  defaultValue={c.title}
                  onBlur={(e) => commitRename(c, e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") (e.target as HTMLInputElement).blur();
                    else if (e.key === "Escape") setEditingId(null);
                  }}
                  className="min-w-0 flex-1 rounded border border-input bg-transparent px-1 py-0.5 text-sm outline-none focus-visible:border-ring"
                />
              ) : (
                <button onClick={() => setActiveId(c.id)} className="min-w-0 flex-1 truncate text-left">
                  {i + 1}. {c.title}
                </button>
              )}
              <button
                onClick={() => setEditingId(c.id)}
                aria-label="Rename"
                className="opacity-0 transition-opacity group-hover:opacity-100"
              >
                <Pencil className="size-3.5 text-muted-foreground hover:text-foreground" />
              </button>
              <button
                onClick={() => onDelete(c)}
                aria-label="Delete"
                className="opacity-0 transition-opacity group-hover:opacity-100"
              >
                <Trash2 className="size-3.5 text-muted-foreground hover:text-destructive" />
              </button>
            </li>
          ))}
        </ul>
        <button
          onClick={onAdd}
          className="mt-2 flex w-full items-center gap-1.5 rounded-lg px-2 py-2 text-sm text-primary hover:bg-primary/10"
        >
          <Plus className="size-4" /> Add chapter
        </button>
      </aside>

      {/* Editor */}
      <div className="flex min-w-0 flex-col">
        <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-2.5">
          <p className="min-w-0 truncate text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{bookTitle}</span>
            {active ? <span> · {active.title}</span> : null}
          </p>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span
                className={cn(
                  "size-1.5 rounded-full",
                  save === "saving" ? "bg-gold" : save === "saved" ? "bg-green" : "bg-muted-foreground/40"
                )}
              />
              {save === "saving" ? "Saving…" : save === "saved" ? "Draft saved" : "All changes saved"}
            </span>
            <Button
              render={<Link href={`/book/${bookSlug}`} />}
              nativeButton={false}
              variant="outline"
              size="sm"
            >
              <ExternalLink className="size-3.5" /> View book
            </Button>
          </div>
        </div>

        {active ? (
          <RichEditor
            key={active.id}
            defaultValue={active.html}
            placeholder="Once upon a time…"
            onChange={onEditorChange}
            className="rounded-none border-0"
          />
        ) : (
          <p className="p-6 text-sm text-muted-foreground">Add a chapter to start writing.</p>
        )}
      </div>
    </div>
  );
}
