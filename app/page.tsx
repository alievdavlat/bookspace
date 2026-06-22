import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 px-6 py-24 text-center">
      <div className="absolute right-6 top-6">
        <ThemeToggle />
      </div>

      <span className="rounded-full border border-border bg-secondary px-4 py-1.5 text-xs font-medium tracking-wide text-muted-foreground">
        F0 · Foundation ready
      </span>

      <h1 className="max-w-3xl font-serif text-5xl font-semibold leading-tight tracking-tight sm:text-6xl">
        Welcome to <span className="text-primary">Bookspace</span>
      </h1>

      <p className="max-w-xl text-lg text-muted-foreground">
        A community library — read books with realistic page-flip, share and
        write your own, and discover what others are reading.
      </p>

      <div className="flex items-center gap-3">
        <Button size="lg">Start reading</Button>
        <Button size="lg" variant="outline">
          Explore library
        </Button>
      </div>

      <div className="mt-6 flex gap-3">
        <span className="h-8 w-8 rounded-full bg-primary" title="primary" />
        <span className="h-8 w-8 rounded-full bg-gold" title="gold" />
        <span className="h-8 w-8 rounded-full bg-green" title="green" />
        <span
          className="h-8 w-8 rounded-full border border-border bg-card"
          title="card"
        />
      </div>
    </main>
  );
}
