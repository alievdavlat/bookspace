import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/page-shell";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "About · Bookspace" };

const VALUES = [
  {
    title: "Reading that feels real",
    body: "Books open in a true two-page reader with page-turning — not just a scrolling PDF. Your highlights, bookmarks and progress travel with you.",
  },
  {
    title: "Anyone can create",
    body: "Upload a PDF or EPUB, or write a book online chapter by chapter. Publish in one click and share it with the community.",
  },
  {
    title: "Free and open",
    body: "Bookspace is free — no paywalls. Read, write and share without limits.",
  },
];

export default function AboutPage() {
  return (
    <PageShell
      title="About Bookspace"
      subtitle="A community library where people read, write and share books — all in one space."
    >
      <div className="mt-10 grid gap-6 sm:grid-cols-3">
        {VALUES.map((v) => (
          <div key={v.title} className="rounded-2xl border border-border bg-card p-6">
            <h2 className="text-lg font-semibold">{v.title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{v.body}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 rounded-2xl border border-border bg-secondary/40 p-10 text-center">
        <h2 className="font-serif text-3xl font-semibold">Start your library today</h2>
        <p className="mt-2 text-muted-foreground">It&apos;s free, forever.</p>
        <div className="mt-6">
          <Button render={<Link href="/sign-up" />} nativeButton={false} size="lg">
            Get started
          </Button>
        </div>
      </div>
    </PageShell>
  );
}
