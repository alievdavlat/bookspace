import type { Metadata } from "next";
import { BlogForm } from "@/components/blog/blog-form";

export const metadata: Metadata = { title: "Write a post · Bookspace" };

export default function NewBlogPage() {
  return (
    <>
      <h1 className="font-serif text-3xl font-semibold">Write a blog post</h1>
      <p className="mt-1 text-muted-foreground">
        Share an essay, review or note with the community.
      </p>
      <BlogForm />
    </>
  );
}
