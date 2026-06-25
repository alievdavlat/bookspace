import { createClient } from "@/lib/supabase/server";
import { GENRES } from "@/lib/types";

export type Genre = { id: number; name: string; slug: string };

/** Genres from the DB; falls back to the built-in list if the table is empty. */
export async function listGenres(): Promise<Genre[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("genres").select("id, name, slug").order("name");
  if (data && data.length) return data as Genre[];
  return GENRES.map((name, i) => ({ id: -(i + 1), name, slug: name.toLowerCase() }));
}

export async function listGenreNames(): Promise<string[]> {
  return (await listGenres()).map((g) => g.name);
}
