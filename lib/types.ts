export type BookAuthor = {
  username: string | null;
  display_name: string | null;
};

export type Book = {
  id: string;
  author_id: string;
  title: string;
  slug: string;
  description: string | null;
  cover_url: string | null;
  language: string | null;
  genres: string[] | null;
  type: "uploaded" | "written";
  format: "pdf" | "epub" | "written" | null;
  status: "draft" | "published" | "archived";
  visibility: "public" | "unlisted" | "private";
  page_count: number | null;
  views: number | null;
  created_at: string;
};

export type BookWithAuthor = Book & { author: BookAuthor | null };

export const GENRES = [
  "Classic",
  "Romance",
  "Horror",
  "SciFi",
  "Mystery",
  "Fantasy",
  "Adventure",
  "Childrens",
] as const;
