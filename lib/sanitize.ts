import sanitizeHtml from "sanitize-html";

/** Sanitize stored editor HTML before rendering (XSS-safe). Mirrors the Tiptap toolbar's capabilities. */
export function cleanHtml(dirty: string | null | undefined): string {
  if (!dirty) return "";
  return sanitizeHtml(dirty, {
    allowedTags: [
      "p", "br", "h1", "h2", "h3", "h4", "strong", "b", "em", "i", "u", "s", "del",
      "ul", "ol", "li", "blockquote", "code", "pre", "a", "img", "hr",
      "table", "thead", "tbody", "tr", "th", "td", "colgroup", "col", "span", "div", "iframe",
    ],
    allowedAttributes: {
      a: ["href", "target", "rel"],
      img: ["src", "alt", "title"],
      iframe: ["src", "width", "height", "allow", "allowfullscreen", "frameborder"],
      td: ["colspan", "rowspan"],
      th: ["colspan", "rowspan"],
      col: ["span", "style"],
      "*": ["style"],
    },
    allowedStyles: {
      "*": {
        "text-align": [/^(left|right|center|justify)$/],
        "min-width": [/^\d+(?:px|%)$/],
        width: [/^\d+(?:px|%)$/],
      },
    },
    allowedSchemes: ["http", "https", "mailto"],
    allowedIframeHostnames: ["www.youtube.com", "youtube.com", "www.youtube-nocookie.com", "player.vimeo.com"],
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer", target: "_blank" }),
    },
  });
}
