import { ImageResponse } from "next/og";
import { createClient } from "@/lib/supabase/server";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Book on Bookspace";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("books")
    .select("title, author_name, cover_url, author:profiles!books_author_id_fkey(display_name, username)")
    .eq("slug", slug)
    .single();

  const book = data as unknown as
    | { title: string; author_name: string | null; cover_url: string | null; author: { display_name: string | null; username: string | null } | null }
    | null;
  const title = book?.title ?? "Bookspace";
  const author = book?.author_name || book?.author?.display_name || book?.author?.username || "";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "linear-gradient(135deg, #020617, #0b1d3a)",
          color: "#e8eef9",
          padding: 64,
          alignItems: "center",
          gap: 56,
          fontFamily: "Georgia, serif",
        }}
      >
        {book?.cover_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={book.cover_url}
            alt=""
            width={300}
            height={450}
            style={{ borderRadius: 16, objectFit: "cover", boxShadow: "0 20px 60px rgba(0,0,0,.5)" }}
          />
        ) : null}
        <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
          <div style={{ color: "#3b82f6", fontSize: 28, fontWeight: 700 }}>Bookspace</div>
          <div style={{ fontSize: 64, fontWeight: 700, lineHeight: 1.1, marginTop: 24 }}>{title}</div>
          {author ? <div style={{ fontSize: 34, color: "#94a3b8", marginTop: 20 }}>by {author}</div> : null}
          <div style={{ fontSize: 24, color: "#64748b", marginTop: "auto" }}>Read it free · bookspace</div>
        </div>
      </div>
    ),
    { ...size }
  );
}
