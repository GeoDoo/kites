"use client";

import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import type { Kite, ContentBlock } from "./types";
import { themes, getBackgroundForKite } from "./themes";

interface ExportOptions {
  filename?: string;
  quality?: number;
  onProgress?: (current: number, total: number) => void;
}

/**
 * Export kites to PDF
 * Creates a hidden render container, renders each kite, captures to canvas, and compiles to PDF
 */
export async function exportToPDF(
  kites: Kite[],
  themeId: string,
  options: ExportOptions = {}
): Promise<void> {
  // Use lower quality for large exports to avoid memory issues
  const defaultQuality = kites.length > 20 ? 1 : 2;
  const { filename = "presentation.pdf", quality = defaultQuality, onProgress } = options;
  const theme = themes[themeId] || themes.sky;

  // Create PDF in landscape orientation (16:9 aspect ratio)
  const pdf = new jsPDF({
    orientation: "landscape",
    unit: "px",
    format: [1920, 1080],
  });

  // Create a hidden container for rendering
  const container = document.createElement("div");
  container.style.cssText = `
    position: fixed;
    top: -10000px;
    left: -10000px;
    width: 1920px;
    height: 1080px;
    overflow: hidden;
    background: white;
  `;
  document.body.appendChild(container);

  try {
    for (let i = 0; i < kites.length; i++) {
      const kite = kites[i];
      
      onProgress?.(i + 1, kites.length);
      
      // Small delay to allow React to re-render progress
      await new Promise(resolve => setTimeout(resolve, 10));
      
      // Add new page for subsequent kites
      if (i > 0) {
        pdf.addPage([1920, 1080], "landscape");
      }

      // Render kite to the container
      container.innerHTML = renderKiteToHTML(kite, theme, i);

      // Wait for images to load
      await waitForImages(container);

      // Capture to canvas with error handling
      let canvas: HTMLCanvasElement;
      try {
        canvas = await html2canvas(container, {
          scale: quality,
          useCORS: true,
          allowTaint: true,
          backgroundColor: theme.colors.background,
          width: 1920,
          height: 1080,
          logging: false,
          // Ignore images that fail to load
          onclone: (clonedDoc) => {
            // Remove any broken images
            const imgs = clonedDoc.querySelectorAll("img");
            imgs.forEach((img) => {
              if (!img.complete || img.naturalWidth === 0) {
                img.remove();
              }
            });
          },
        });
      } catch (canvasError) {
        console.error(`Failed to capture kite ${i + 1}:`, canvasError);
        throw new Error(`Failed to capture kite ${i + 1}`);
      }

      // Add to PDF
      const imgData = canvas.toDataURL("image/jpeg", 0.95);
      pdf.addImage(imgData, "JPEG", 0, 0, 1920, 1080);
    }

    // Save the PDF
    pdf.save(filename);
  } finally {
    // Clean up
    document.body.removeChild(container);
  }
}

/**
 * Render a single kite to HTML string for capture
 */
function renderKiteToHTML(kite: Kite, theme: typeof themes.sky, index: number): string {
  const backgroundImage = getBackgroundForKite(theme, index);
  const treatment = theme.backgroundTreatment;

  // Build background styles
  let backgroundHTML = "";
  if (backgroundImage) {
    const filterParts = [];
    if (treatment?.blur) filterParts.push(`blur(${treatment.blur}px)`);
    if (treatment?.grayscale) filterParts.push(`grayscale(${treatment.grayscale})`);
    if (treatment?.brightness) filterParts.push(`brightness(${treatment.brightness})`);
    
    backgroundHTML = `
      <div style="
        position: absolute;
        inset: 0;
        background-image: url(${backgroundImage});
        background-size: cover;
        background-position: center;
        opacity: ${treatment?.opacity ?? 1};
        filter: ${filterParts.join(" ") || "none"};
      "></div>
    `;
    
    if (treatment?.overlay) {
      backgroundHTML += `
        <div style="
          position: absolute;
          inset: 0;
          background-color: ${treatment.overlay};
        "></div>
      `;
    }
  }

  // Render content blocks (create copy to avoid mutating frozen array)
  const blocksHTML = [...kite.contentBlocks]
    .sort((a: ContentBlock, b: ContentBlock) => (a.zIndex || 0) - (b.zIndex || 0))
    .map((block: ContentBlock) => {
      const { type, position, content, style } = block;
      
      const isHeading = type === "h1" || type === "h2" || type === "h3" || type === "h4";
      
      // Calculate position and size in pixels from percentages
      const left = (position.x / 100) * 1920;
      const top = (position.y / 100) * 1080;
      const width = (position.width / 100) * 1920;
      const height = (position.height / 100) * 1080;

      // Get text color - user override, then theme defaults
      const color = style?.color || (isHeading ? theme.colors.heading : theme.colors.text);
      
      // Get text shadow for headings
      const textShadow = isHeading && theme.colors.headingShadow 
        ? theme.colors.headingShadow 
        : undefined;

      if (type === "image") {
        return `
          <div style="
            position: absolute;
            left: ${left}px;
            top: ${top}px;
            width: ${width}px;
            height: ${height}px;
            z-index: ${block.zIndex || 1};
          ">
            <img 
              src="${content}" 
              style="width: 100%; height: 100%; object-fit: cover;"
              crossorigin="anonymous"
            />
          </div>
        `;
      }

      // Text or heading - get appropriate font size
      const defaultFontSizes: Record<string, number> = {
        h1: 72,
        h2: 56,
        h3: 40,
        h4: 32,
        text: 24,
      };
      
      const fontSize = style?.fontSize || defaultFontSizes[type] || 24;
      const fontWeight = style?.fontWeight || (isHeading ? "bold" : "normal");
      const textAlign = style?.textAlign || "left";

      return `
        <div style="
          position: absolute;
          left: ${left}px;
          top: ${top}px;
          width: ${width}px;
          height: ${height}px;
          z-index: ${block.zIndex || 1};
          font-size: ${fontSize}px;
          font-weight: ${fontWeight};
          text-align: ${textAlign};
          color: ${color};
          ${textShadow ? `text-shadow: ${textShadow};` : ""}
          font-family: ${theme.font || "system-ui, -apple-system, sans-serif"};
          line-height: 1.4;
          overflow: hidden;
        ">${content}</div>
      `;
    })
    .join("");

  return `
    <div style="
      position: relative;
      width: 1920px;
      height: 1080px;
      background-color: ${theme.colors.background};
      overflow: hidden;
    ">
      ${backgroundHTML}
      <div style="position: relative; z-index: 1; width: 100%; height: 100%;">
        ${blocksHTML}
      </div>
    </div>
  `;
}

/**
 * Wait for all images in a container to load
 */
function waitForImages(container: HTMLElement): Promise<void> {
  const images = container.querySelectorAll("img");
  const promises = Array.from(images).map((img) => {
    if (img.complete) return Promise.resolve();
    return new Promise<void>((resolve) => {
      img.onload = () => resolve();
      img.onerror = () => resolve(); // Continue even if image fails
    });
  });
  return Promise.all(promises).then(() => undefined);
}
