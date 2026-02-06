import PptxGenJS from "pptxgenjs";
import html2canvas from "html2canvas";
import type { Kite, ContentBlock } from "./types";
import { themes, getBackgroundForKite, resolveThemeForKite, type KiteTheme } from "./themes";

interface ExportOptions {
  filename?: string;
  onProgress?: (current: number, total: number) => void;
}

/**
 * Map custom web fonts to similar system fonts available in PowerPoint
 */
const fontMapping: Record<string, string> = {
  "Creepster": "Chiller",           // Zombie theme - horror font
  "VT323": "Consolas",              // Retro theme - monospace
  "Cinzel": "Palatino Linotype",    // RPG theme - serif
  "Press Start 2P": "Consolas",     // Pixel art - monospace
  // Default fallbacks
  "default": "Arial",
};

/**
 * Get a PowerPoint-compatible font
 */
function getPptxFont(themeFont?: string): string {
  if (!themeFont) return "Arial";
  return fontMapping[themeFont] || themeFont;
}

/**
 * Export kites to PowerPoint (PPTX) using hybrid approach:
 * - Backgrounds are captured as screenshots (preserving all CSS effects)
 * - Text is added as editable elements on top
 */
export async function exportToPPTX(
  kites: Kite[],
  themeId: string,
  title: string,
  options: ExportOptions = {}
): Promise<void> {
  const { filename, onProgress } = options;
  // Create presentation
  const pptx = new PptxGenJS();
  
  // Set presentation properties
  pptx.author = "Kites";
  pptx.title = title;
  pptx.subject = "Presentation created with Kites";
  
  // Set kite size to 16:9
  pptx.defineLayout({ name: "LAYOUT_16x9", width: 10, height: 5.625 });
  pptx.layout = "LAYOUT_16x9";

  // Process each kite
  for (let i = 0; i < kites.length; i++) {
    const kite = kites[i];
    
    onProgress?.(i + 1, kites.length);
    
    // Resolve per-kite theme (handles Hybrid mode)
    const kiteTheme = resolveThemeForKite(themeId, kite.themeOverride);

    // Create PPTX slide for this kite
    const slide = pptx.addSlide();
    
    // Capture background as screenshot (preserves all CSS effects)
    const bgDataUrl = await captureBackgroundAsImage(kite, kiteTheme, i);
    
    if (bgDataUrl) {
      // Use captured background
      slide.background = { data: bgDataUrl };
    } else {
      // Fallback to solid color
      slide.background = { color: kiteTheme.colors.background.replace("#", "") };
    }

    // Sort blocks by zIndex and add to PPTX slide as editable text
    const sortedBlocks = [...kite.contentBlocks].sort(
      (a, b) => (a.zIndex || 0) - (b.zIndex || 0)
    );

    for (const block of sortedBlocks) {
      addBlockToSlide(slide, block, kiteTheme);
    }
    
    // Small delay to allow React state updates for progress
    await new Promise(resolve => setTimeout(resolve, 10));
  }

  // Generate filename
  const sanitizedTitle = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "presentation";
  
  const finalFilename = filename || `${sanitizedTitle}.pptx`;

  // Save the file
  await pptx.writeFile({ fileName: finalFilename });
}

/**
 * Capture a kite's background (with all effects) as a base64 image
 */
async function captureBackgroundAsImage(
  kite: Kite,
  theme: KiteTheme,
  kiteIndex: number
): Promise<string | null> {
  try {
    // Create a temporary container for rendering
    const container = document.createElement("div");
    container.style.cssText = `
      position: fixed;
      left: -9999px;
      top: 0;
      width: 1920px;
      height: 1080px;
      overflow: hidden;
    `;
    document.body.appendChild(container);

    // Build the background HTML with all theme effects
    const bgImage = getBackgroundForKite(theme, kiteIndex);
    const treatment = theme.backgroundTreatment;
    
    // Build filter string
    const filters: string[] = [];
    if (treatment?.blur) filters.push(`blur(${treatment.blur}px)`);
    if (treatment?.grayscale) filters.push(`grayscale(${treatment.grayscale})`);
    if (treatment?.brightness) filters.push(`brightness(${treatment.brightness})`);
    const filterStr = filters.length > 0 ? filters.join(" ") : "none";
    
    container.innerHTML = `
      <div style="
        position: relative;
        width: 100%;
        height: 100%;
        background-color: ${theme.colors.background};
      ">
        ${bgImage ? `
          <div style="
            position: absolute;
            inset: 0;
            background-image: url('${bgImage}');
            background-size: cover;
            background-position: center;
            opacity: ${treatment?.opacity ?? 1};
            filter: ${filterStr};
          "></div>
        ` : ""}
        ${treatment?.overlay ? `
          <div style="
            position: absolute;
            inset: 0;
            background-color: ${treatment.overlay};
          "></div>
        ` : ""}
      </div>
    `;

    // Wait for images to load
    const images = container.querySelectorAll("img");
    await Promise.all(
      Array.from(images).map(
        (img) =>
          new Promise((resolve) => {
            if (img.complete) resolve(true);
            else {
              img.onload = () => resolve(true);
              img.onerror = () => resolve(false);
            }
          })
      )
    );
    
    // Small delay for background images to render
    await new Promise(resolve => setTimeout(resolve, 100));

    // Capture to canvas
    const canvas = await html2canvas(container, {
      width: 1920,
      height: 1080,
      scale: 1,
      useCORS: true,
      allowTaint: true,
      backgroundColor: theme.colors.background,
      logging: false,
    });

    // Cleanup
    document.body.removeChild(container);

    // Convert to base64
    return canvas.toDataURL("image/jpeg", 0.9);
  } catch (error) {
    console.warn("Failed to capture background:", error);
    return null;
  }
}

/**
 * Add a content block to a PowerPoint PPTX slide
 */
function addBlockToSlide(
  slide: PptxGenJS.Slide,
  block: ContentBlock,
  theme: KiteTheme
): void {
  const { type, position, content, style } = block;
  
  // Convert percentage positions to inches (PPTX slide is 10" x 5.625")
  const x = (position.x / 100) * 10;
  const y = (position.y / 100) * 5.625;
  const w = (position.width / 100) * 10;
  const h = (position.height / 100) * 5.625;

  const isHeading = ["h1", "h2", "h3", "h4"].includes(type);

  if (type === "image") {
    // Handle image
    if (content) {
      try {
        if (content.startsWith("data:")) {
          // Base64 image - embed directly
          slide.addImage({
            data: content,
            x,
            y,
            w,
            h,
          });
        } else if (content.startsWith("http://") || content.startsWith("https://")) {
          // Absolute URL - use path
          slide.addImage({
            path: content,
            x,
            y,
            w,
            h,
          });
        }
        // Skip relative paths - they won't work in PPTX
      } catch (error) {
        console.warn("Failed to add image:", error);
      }
    }
  } else {
    // Handle text/heading
    // These match the actual CSS sizes used in the app (rem -> pt conversion)
    // In the app: h1=4rem, h2=3rem, h3=2.25rem, h4=1.875rem, text varies
    const defaultFontSizes: Record<string, number> = {
      h1: 54,   // ~4rem = 64px -> 48pt, bumped up
      h2: 44,   // ~3rem = 48px -> 36pt, bumped up
      h3: 34,   // ~2.25rem = 36px -> 27pt, bumped up
      h4: 28,   // ~1.875rem = 30px -> 22pt, bumped up
      text: 16,
    };

    // Parse HTML and extract text with formatting info
    const { text: plainText, isBold, isItalic, isUnderline } = parseHtmlFormatting(content);
    
    if (!plainText.trim()) return; // Skip empty text blocks

    // Get text color
    const textColor = style?.color || 
      (isHeading ? theme.colors.heading : theme.colors.text);

    // Font size in points - use stored fontSize or default
    // The style.fontSize is in pixels, convert to points (1pt ≈ 1.333px)
    let fontSize: number;
    if (style?.fontSize) {
      fontSize = Math.round(style.fontSize * 0.75); // px to pt
    } else {
      fontSize = defaultFontSizes[type] || 16;
    }

    // Text alignment
    const align = style?.textAlign || (isHeading ? "left" : "left");

    // Get PowerPoint-compatible font
    const fontFace = getPptxFont(theme.font);

    // Build text options
    const textOptions: PptxGenJS.TextPropsOptions = {
      x,
      y,
      w,
      h,
      fontSize,
      fontFace,
      color: textColor.replace("#", ""),
      bold: isHeading || isBold || style?.fontWeight === "bold",
      italic: isItalic,
      align: align as "left" | "center" | "right",
      valign: "top",
      wrap: true,
    };

    // Add underline if needed (simple boolean works better)
    if (isUnderline) {
      textOptions.underline = { style: "sng" };
    }

    slide.addText(plainText, textOptions);
  }
}

/**
 * Parse HTML and extract text with basic formatting info
 */
function parseHtmlFormatting(html: string): {
  text: string;
  isBold: boolean;
  isItalic: boolean;
  isUnderline: boolean;
} {
  // Check for formatting tags in the content
  const isBold = /<(b|strong)>/i.test(html);
  const isItalic = /<(i|em)>/i.test(html);
  const isUnderline = /<u>/i.test(html);
  
  // Strip HTML for plain text
  let text = html;
  // Replace <br> tags with newlines
  text = text.replace(/<br\s*\/?>/gi, "\n");
  // Replace block elements with newlines
  text = text.replace(/<\/(p|div|h[1-6]|li|blockquote)>/gi, "\n");
  // Handle list items
  text = text.replace(/<li[^>]*>/gi, "• ");
  // Remove all other HTML tags
  text = text.replace(/<[^>]+>/g, "");
  // Decode HTML entities
  text = text.replace(/&nbsp;/g, " ");
  text = text.replace(/&ldquo;/g, "\u201C");
  text = text.replace(/&rdquo;/g, "\u201D");
  text = text.replace(/&lsquo;/g, "\u2018");
  text = text.replace(/&rsquo;/g, "\u2019");
  text = text.replace(/&mdash;/g, "\u2014");
  text = text.replace(/&ndash;/g, "\u2013");
  text = text.replace(/&rarr;/g, "\u2192");
  text = text.replace(/&larr;/g, "\u2190");
  text = text.replace(/&hellip;/g, "\u2026");
  text = text.replace(/&there4;/g, "\u2234");
  text = text.replace(/&ne;/g, "\u2260");
  text = text.replace(/&le;/g, "\u2264");
  text = text.replace(/&ge;/g, "\u2265");
  text = text.replace(/&amp;/g, "&");
  text = text.replace(/&lt;/g, "<");
  text = text.replace(/&gt;/g, ">");
  text = text.replace(/&quot;/g, '"');
  text = text.replace(/&#39;/g, "'");
  // Catch any remaining numeric entities
  text = text.replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)));
  text = text.replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
  // Clean up multiple newlines
  text = text.replace(/\n{3,}/g, "\n\n");
  
  return {
    text: text.trim(),
    isBold,
    isItalic,
    isUnderline,
  };
}
