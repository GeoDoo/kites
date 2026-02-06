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
 * Strip inline styles, classes, scripts, and other non-HTML-structure attributes
 * from HTML content. Keeps only the HTML elements and their structural attributes
 * (href, src, colspan, rowspan, etc.).
 *
 * Block styling (font-size, color, alignment) is controlled by the block's style
 * property — not by CSS embedded in the HTML content.
 */
export function sanitizeBlockHtml(html: string): string {
  return html
    .replace(/<meta[^>]*>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/\s*style="[^"]*"/gi, "")
    .replace(/\s*class="[^"]*"/gi, "")
    .replace(/\s*data-[\w-]+="[^"]*"/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .trim();
}

/** CSS class string for rendering HTML content blocks (tables, lists, quotes, etc.) */
export const BLOCK_CONTENT_CLASSES = [
  "[&_blockquote]:border-l-4 [&_blockquote]:border-current [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:opacity-80",
  "[&_ul]:list-disc [&_ul]:ml-6 [&_ol]:list-decimal [&_ol]:ml-6",
  "[&_table]:w-full [&_table]:border-collapse",
  "[&_td]:py-2 [&_td]:px-3 [&_td]:align-top",
  "[&_th]:py-2 [&_th]:px-3 [&_th]:align-top [&_th]:font-bold [&_th]:text-left",
  "[&_tr]:border-b [&_tr]:border-current/15",
  "[&_tr:last-child]:border-b-0",
  "[&_a]:underline [&_a]:underline-offset-2",
].join(" ");
