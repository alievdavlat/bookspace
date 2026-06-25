"use client";

import { useActionState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RichEditor } from "@/components/editor/rich-editor";
import { createBlogPost, type BlogFormState } from "@/lib/actions/blog";

const initial: BlogFormState = {};

export function BlogForm() {
  const [state, formAction, pending] = useActionState(createBlogPost, initial);
  return (
    <form action={formAction} className="mt-8 flex w-full flex-col gap-5">
      <div className="flex flex-col gap-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" required minLength={2} placeholder="Post title" />
      </div>
      <div className="flex flex-col gap-2">
        <Label>Content</Label>
        <RichEditor name="content" placeholder="Write your post…" />
      </div>
      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      <Button type="submit" disabled={pending} size="lg" className="self-start">
        {pending ? "Publishing…" : "Publish post"}
      </Button>
    </form>
  );
}
