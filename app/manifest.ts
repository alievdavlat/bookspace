import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Bookspace",
    short_name: "Bookspace",
    description: "Read, write and share — a community library.",
    start_url: "/",
    display: "standalone",
    background_color: "#15110d",
    theme_color: "#15110d",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "maskable" },
    ],
  };
}
