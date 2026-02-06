import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility function to merge class names with Tailwind CSS support.
 * Combines clsx for conditional classes and tailwind-merge to resolve conflicts.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Strip presentational inline styles from HTML content while keeping structural ones.
 *
 * REMOVES: font-size, font-family, font-weight, font-style, color, background-color,
 *          text-align, line-height (these are controlled by the block's style property).
 * KEEPS:   width, height, display, vertical-align, margin, padding, border, etc.
 *          (structural layout properties needed for inline images, tables, etc.)
 *
 * Also strips: <meta>, <style> blocks, <script> blocks, class attrs, data- attrs, HTML comments.
 */
export function sanitizeBlockHtml(html: string): string {
  return html
    .replace(/<meta[^>]*>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/\s*style="([^"]*)"/gi, (_match, styles: string) => {
      // Strip only font/color/text properties that the block style controls
      const cleaned = styles
        .split(";")
        .map((s: string) => s.trim())
        .filter((s: string) => {
          if (!s) return false;
          const prop = s.split(":")[0]?.trim().toLowerCase() ?? "";
          // Remove properties controlled by block.style
          const blocked = [
            "font-size", "font-family", "font-weight", "font-style",
            "color", "background-color", "background",
            "text-align", "line-height", "letter-spacing",
          ];
          return !blocked.includes(prop);
        })
        .join("; ");
      return cleaned ? ` style="${cleaned}"` : "";
    })
    .replace(/\s*class="[^"]*"/gi, "")
    .replace(/\s*data-[\w-]+="[^"]*"/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .trim();
}

/** CSS class string for rendering HTML content blocks (tables, lists, quotes, etc.) */
export const BLOCK_CONTENT_CLASSES = [
  "[&_blockquote]:border-l-4 [&_blockquote]:border-current [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:opacity-80",
  "[&_ul]:list-disc [&_ul]:list-inside [&_ul]:pl-2 [&_ol]:list-decimal [&_ol]:list-inside [&_ol]:pl-2",
  "[&_table]:w-full [&_table]:border-collapse",
  "[&_td]:py-2 [&_td]:px-3 [&_td]:align-top",
  "[&_th]:py-2 [&_th]:px-3 [&_th]:align-top [&_th]:font-bold [&_th]:text-left",
  "[&_tr]:border-b [&_tr]:border-current/15",
  "[&_tr:last-child]:border-b-0",
  "[&_a]:underline [&_a]:underline-offset-2",
].join(" ");
