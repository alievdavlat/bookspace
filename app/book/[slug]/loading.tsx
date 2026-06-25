import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-12">
      <Skeleton className="h-4 w-40" />
      <div className="mt-8 grid gap-10 md:grid-cols-[260px_1fr]">
        <Skeleton className="mx-auto aspect-[2/3] w-[220px] rounded-xl md:w-full" />
        <div className="space-y-4">
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-5 w-40" />
          <div className="flex gap-2">
            <Skeleton className="h-7 w-16 rounded-full" />
            <Skeleton className="h-7 w-16 rounded-full" />
          </div>
          <Skeleton className="h-10 w-48 rounded-md" />
          <Skeleton className="h-20 w-full" />
        </div>
      </div>
    </div>
  );
}
