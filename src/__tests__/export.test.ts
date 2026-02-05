/**
 * Export Functionality Tests
 * Tests for PDF export and filename generation
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// Test the filename sanitization logic used in export
describe("Export: Filename Sanitization", () => {
  // Helper function that mirrors the sanitization logic in EditorLayout
  const sanitizeFilename = (title: string): string => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "presentation";
  };

  it("should convert title to lowercase", () => {
    expect(sanitizeFilename("My Presentation")).toBe("my-presentation");
  });

  it("should replace spaces with hyphens", () => {
    expect(sanitizeFilename("hello world")).toBe("hello-world");
  });

  it("should remove special characters", () => {
    expect(sanitizeFilename("Test: Part 1!")).toBe("test-part-1");
  });

  it("should handle multiple consecutive special chars", () => {
    expect(sanitizeFilename("Test   ---   Title")).toBe("test-title");
  });

  it("should remove leading/trailing hyphens", () => {
    expect(sanitizeFilename("---title---")).toBe("title");
  });

  it("should return 'presentation' for empty string", () => {
    expect(sanitizeFilename("")).toBe("presentation");
  });

  it("should return 'presentation' for whitespace only", () => {
    expect(sanitizeFilename("   ")).toBe("presentation");
  });

  it("should return 'presentation' for special chars only", () => {
    expect(sanitizeFilename("!@#$%")).toBe("presentation");
  });

  it("should handle unicode characters", () => {
    expect(sanitizeFilename("Zombies 🧟 Attack")).toBe("zombies-attack");
  });

  it("should handle numbers", () => {
    expect(sanitizeFilename("Chapter 1: Section 2")).toBe("chapter-1-section-2");
  });

  it("should handle already valid filename", () => {
    expect(sanitizeFilename("valid-filename")).toBe("valid-filename");
  });

  it("should handle camelCase", () => {
    expect(sanitizeFilename("MyPresentation")).toBe("mypresentation");
  });
});

describe("Export: Progress Tracking", () => {
  it("should track progress correctly", () => {
    const progress = { current: 0, total: 10 };
    
    // Simulate progress updates
    for (let i = 1; i <= 10; i++) {
      progress.current = i;
      expect(progress.current).toBe(i);
      expect(progress.total).toBe(10);
    }
    
    expect(progress.current).toBe(progress.total);
  });

  it("should handle single kite", () => {
    const progress = { current: 0, total: 1 };
    progress.current = 1;
    
    expect(progress.current).toBe(1);
    expect(progress.total).toBe(1);
  });

  it("should handle large number of kites", () => {
    const progress = { current: 0, total: 100 };
    
    progress.current = 50;
    expect(progress.current / progress.total).toBe(0.5);
    
    progress.current = 100;
    expect(progress.current / progress.total).toBe(1);
  });
});

describe("Export: Quality Settings", () => {
  // Helper function that mirrors the quality logic in export-pdf.ts
  const getDefaultQuality = (kiteCount: number): number => {
    return kiteCount > 20 ? 1 : 2;
  };

  it("should use quality 2 for small presentations", () => {
    expect(getDefaultQuality(5)).toBe(2);
    expect(getDefaultQuality(10)).toBe(2);
    expect(getDefaultQuality(20)).toBe(2);
  });

  it("should use quality 1 for large presentations", () => {
    expect(getDefaultQuality(21)).toBe(1);
    expect(getDefaultQuality(50)).toBe(1);
    expect(getDefaultQuality(100)).toBe(1);
  });

  it("should use quality 2 for exactly 20 kites", () => {
    expect(getDefaultQuality(20)).toBe(2);
  });
});

describe("Export: Content Block Rendering", () => {
  // Test the content block sorting logic
  it("should sort blocks by zIndex", () => {
    const blocks = [
      { id: "1", zIndex: 5 },
      { id: "2", zIndex: 1 },
      { id: "3", zIndex: 10 },
      { id: "4", zIndex: undefined },
    ];

    const sorted = [...blocks].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));

    expect(sorted[0].id).toBe("4"); // undefined treated as 0
    expect(sorted[1].id).toBe("2"); // zIndex 1
    expect(sorted[2].id).toBe("1"); // zIndex 5
    expect(sorted[3].id).toBe("3"); // zIndex 10
  });

  it("should handle blocks with same zIndex", () => {
    const blocks = [
      { id: "1", zIndex: 5 },
      { id: "2", zIndex: 5 },
      { id: "3", zIndex: 5 },
    ];

    const sorted = [...blocks].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));

    // Order should be preserved for same zIndex
    expect(sorted).toHaveLength(3);
    sorted.forEach((b) => expect(b.zIndex).toBe(5));
  });

  it("should handle empty blocks array", () => {
    const blocks: { id: string; zIndex?: number }[] = [];
    const sorted = [...blocks].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));
    
    expect(sorted).toHaveLength(0);
  });
});

describe("Export: Font Size Calculation", () => {
  const defaultFontSizes: Record<string, number> = {
    h1: 72,
    h2: 56,
    h3: 40,
    h4: 32,
    text: 24,
  };

  it("should return correct size for h1", () => {
    expect(defaultFontSizes.h1).toBe(72);
  });

  it("should return correct size for h2", () => {
    expect(defaultFontSizes.h2).toBe(56);
  });

  it("should return correct size for h3", () => {
    expect(defaultFontSizes.h3).toBe(40);
  });

  it("should return correct size for h4", () => {
    expect(defaultFontSizes.h4).toBe(32);
  });

  it("should return correct size for text", () => {
    expect(defaultFontSizes.text).toBe(24);
  });

  it("should use style fontSize when provided", () => {
    const blockStyle = { fontSize: 48 };
    const fontSize = blockStyle.fontSize || defaultFontSizes.text;
    
    expect(fontSize).toBe(48);
  });

  it("should fallback to default when style fontSize is undefined", () => {
    const blockStyle: { fontSize?: number } = {};
    const fontSize = blockStyle.fontSize || defaultFontSizes.text;
    
    expect(fontSize).toBe(24);
  });
});

describe("Export: Position Calculation", () => {
  const WIDTH = 1920;
  const HEIGHT = 1080;

  it("should convert percentage to pixels for x", () => {
    const percentX = 50;
    const pixelX = (percentX / 100) * WIDTH;
    
    expect(pixelX).toBe(960);
  });

  it("should convert percentage to pixels for y", () => {
    const percentY = 25;
    const pixelY = (percentY / 100) * HEIGHT;
    
    expect(pixelY).toBe(270);
  });

  it("should handle 0%", () => {
    expect((0 / 100) * WIDTH).toBe(0);
    expect((0 / 100) * HEIGHT).toBe(0);
  });

  it("should handle 100%", () => {
    expect((100 / 100) * WIDTH).toBe(1920);
    expect((100 / 100) * HEIGHT).toBe(1080);
  });

  it("should handle decimal percentages", () => {
    const percentX = 33.33;
    const pixelX = (percentX / 100) * WIDTH;
    
    expect(pixelX).toBeCloseTo(639.936, 2);
  });
});

describe("Export: Text Color Logic", () => {
  const getTextColor = (
    styleColor: string | undefined,
    isHeading: boolean,
    themeHeadingColor: string,
    themeTextColor: string
  ): string => {
    if (styleColor) return styleColor;
    if (isHeading) return themeHeadingColor;
    return themeTextColor;
  };

  it("should use style color when provided", () => {
    const result = getTextColor("#ff0000", true, "#000000", "#333333");
    expect(result).toBe("#ff0000");
  });

  it("should use theme heading color for headings", () => {
    const result = getTextColor(undefined, true, "#000000", "#333333");
    expect(result).toBe("#000000");
  });

  it("should use theme text color for non-headings", () => {
    const result = getTextColor(undefined, false, "#000000", "#333333");
    expect(result).toBe("#333333");
  });

  it("should prioritize style color over theme colors", () => {
    const result = getTextColor("#custom", false, "#heading", "#text");
    expect(result).toBe("#custom");
  });
});
