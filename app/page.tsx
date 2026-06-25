import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Reveal } from "@/components/reveal";
import { AuroraBackground } from "@/components/aceternity/aurora-background";
import { Marquee } from "@/components/aceternity/marquee";
import { GradientButton } from "@/components/aceternity/gradient-button";

const STEPS = [
  { n: 1, icon: "🔎", title: "Discover", body: "Browse a community library and find your next read by genre, language or mood." },
  { n: 2, icon: "📖", title: "Read", body: "Open any book in a real two-page reader with 3D page-turning and your own highlights." },
  { n: 3, icon: "✍️", title: "Create", body: "Upload a PDF/EPUB or write a book online, chapter by chapter — then publish for free." },
];

const FEATURES = [
  { title: "Real page-turning", body: "Two-page book view with 3D page-curl on desktop, swipe on mobile. A genuinely book-like experience.", span: "sm:col-span-2" },
  { title: "Write online", body: "Chapter editor, draft auto-save, publish in one click." },
  { title: "Shelves", body: "Reading, Read, Later — plus custom collections." },
  { title: "Reviews & ratings", body: "Rate, review and discuss with the community." },
  { title: "Follow readers & authors", body: "Build your circle, see what your community is reading, and never miss a new release.", span: "sm:col-span-2" },
];

const STATS = [
  { value: "100%", label: "Free, forever" },
  { value: "PDF · EPUB", label: "Formats supported" },
  { value: "Read · Write", label: "All in one space" },
];

export default async function Home() {
  const supabase = await createClient();
  const { data: covers } = await supabase
    .from("books")
    .select("title, slug, cover_url")
    .eq("status", "published")
    .eq("visibility", "public")
    .not("cover_url", "is", null)
    .limit(14);
  const coverList = (covers ?? []) as { title: string; slug: string; cover_url: string }[];

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      {/* Hero */}
      <AuroraBackground>
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-20 lg:grid-cols-2 lg:py-28">
          <div className="flex flex-col items-start gap-6">
            <span className="rounded-full border border-border bg-secondary/70 px-4 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur">
              Free forever · A community library
            </span>
            <h1 className="font-serif text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
              Read, write and share — all in one space
            </h1>
            <p className="max-w-md text-lg text-muted-foreground">
              Read books with real page-turning, write or upload your own work
              online, and build a community of fellow readers.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <GradientButton href="/explore">Explore books</GradientButton>
              <Button render={<Link href="/sign-up" />} nativeButton={false} size="lg" variant="outline">
                Get started
              </Button>
            </div>
          </div>

          {/* Reader preview card */}
          <Reveal delay={0.1}>
            <div className="bs-float mx-auto w-full max-w-sm rounded-2xl border border-border bg-card/80 p-7 shadow-2xl backdrop-blur">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Chapter One</p>
              <h3 className="mt-2 font-serif text-2xl font-semibold">Between the lines</h3>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                The library held its breath as evening light slipped through the
                tall windows. Nora ran a finger along the spines, each one a door
                to a life she had not lived…
              </p>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                She pulled one free, and the room exhaled.
              </p>
              <div className="mt-6 h-1 w-full overflow-hidden rounded-full bg-secondary">
                <div className="h-full w-1/3 rounded-full bg-primary" />
              </div>
            </div>
          </Reveal>
        </div>
      </AuroraBackground>

      {/* Cover marquee */}
      {coverList.length > 0 ? (
        <section className="border-y border-border/60 bg-secondary/20 py-8">
          <p className="mb-6 text-center text-sm font-medium text-muted-foreground">From the library</p>
          <Marquee durationSec={45}>
            {coverList.map((b) => (
              <Link key={b.slug} href={`/book/${b.slug}`} className="shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={b.cover_url}
                  alt={b.title}
                  className="h-44 w-28 rounded-lg border border-border object-cover shadow-sm transition-transform hover:-translate-y-1"
                />
              </Link>
            ))}
          </Marquee>
        </section>
      ) : null}

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <Reveal>
          <p className="text-sm font-medium text-primary">How it works</p>
          <h2 className="mt-1 font-serif text-3xl font-semibold sm:text-4xl">Three simple steps</h2>
        </Reveal>
        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {STEPS.map((s, i) => (
            <Reveal key={s.n} delay={i * 0.08}>
              <div className="group h-full rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_18px_40px_-24px_var(--primary)]">
                <div className="text-3xl">{s.icon}</div>
                <p className="mt-4 font-serif text-2xl text-muted-foreground">0{s.n}</p>
                <h3 className="mt-1 text-lg font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Features — bento */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <Reveal>
          <h2 className="font-serif text-3xl font-semibold sm:text-4xl">One platform, everything books</h2>
          <p className="mt-2 max-w-xl text-muted-foreground">From reading to writing, from discovery to community.</p>
        </Reveal>
        <div className="mt-10 grid gap-5 sm:grid-cols-3">
          {FEATURES.map((f, i) => (
            <Reveal key={f.title} delay={i * 0.06} className={f.span ?? ""}>
              <div className="group relative h-full overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_18px_40px_-24px_var(--primary)]">
                <div
                  aria-hidden
                  className="pointer-events-none absolute -right-16 -top-16 size-40 rounded-full bg-primary/10 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100"
                />
                <h3 className="text-lg font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-6 rounded-2xl border border-border bg-secondary/40 p-10 sm:grid-cols-3">
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <p className="font-serif text-3xl font-semibold text-primary">{s.value}</p>
              <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-24">
        <AuroraBackground subtle className="mx-auto max-w-5xl rounded-3xl border border-border py-20 text-center">
          <Reveal>
            <h2 className="font-serif text-4xl font-semibold sm:text-5xl">Your next chapter starts here</h2>
            <div className="mt-8 flex justify-center">
              <GradientButton href="/sign-up">Get started — it&apos;s free</GradientButton>
            </div>
          </Reveal>
        </AuroraBackground>
      </section>

      <SiteFooter />
    </div>
  );
}
