import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { addGenre, deleteGenre } from "@/lib/actions/admin";

export const metadata: Metadata = { title: "Genres · Admin" };

export default async function AdminGenresPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("genres").select("id, name, slug").order("name");
  const genres = (data ?? []) as { id: number; name: string; slug: string }[];

  return (
    <div className="max-w-2xl">
      <h1 className="font-serif text-3xl font-semibold">Genres</h1>
      <p className="mt-1 text-muted-foreground">
        These power the genre pickers on upload/write and the Explore filter.
      </p>

      <form action={addGenre} className="mt-8 flex gap-2">
        <Input name="name" placeholder="New genre name (e.g. Poetry)" required minLength={2} />
        <Button type="submit">Add</Button>
      </form>

      {genres.length === 0 ? (
        <p className="mt-8 text-muted-foreground">No genres yet.</p>
      ) : (
        <ul className="mt-8 divide-y divide-border rounded-xl border border-border">
          {genres.map((g) => (
            <li key={g.id} className="flex items-center justify-between gap-4 px-4 py-3">
              <div>
                <span className="font-medium">{g.name}</span>
                <span className="ml-2 text-xs text-muted-foreground">{g.slug}</span>
              </div>
              <form action={deleteGenre}>
                <input type="hidden" name="id" value={g.id} />
                <button className="text-xs text-destructive hover:underline">Delete</button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
