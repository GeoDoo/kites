/**
 * Theme Tests
 * Tests the public API and structural contracts of the theme system.
 * Does NOT assert on specific config values (font names, booleans, etc.)
 * — those are design decisions, not behaviour.
 */

import { describe, it, expect } from "vitest";
import {
  themes,
  themeList,
  getTheme,
  getRandomBackground,
  getBackgroundForKite,
  resolveThemeForKite,
  type KiteTheme,
} from "@/lib/themes";

// ── Structural contracts ────────────────────────────────────────────────────

describe("Theme registry contracts", () => {
  it("should have at least one theme", () => {
    expect(Object.keys(themes).length).toBeGreaterThan(0);
  });

  it("every theme id should match its registry key", () => {
    Object.entries(themes).forEach(([key, theme]) => {
      expect(theme.id).toBe(key);
    });
  });

  it("every theme should have all required colour fields", () => {
    const requiredFields = [
      "background", "surface", "text", "textMuted",
      "accent", "accentText", "heading",
    ];

    Object.values(themes).forEach((theme) => {
      requiredFields.forEach((field) => {
        expect(
          theme.colors[field as keyof typeof theme.colors],
          `${theme.id}.colors.${field}`,
        ).toBeDefined();
      });
    });
  });

  it("every theme should have a valid style value", () => {
    const validStyles = new Set(["sharp", "rounded", "pixel"]);
    Object.values(themes).forEach((theme) => {
      expect(validStyles.has(theme.style), `${theme.id}.style`).toBe(true);
    });
  });

  it("every theme should have a non-empty name and description", () => {
    Object.values(themes).forEach((theme) => {
      expect(theme.name.length, `${theme.id}.name`).toBeGreaterThan(0);
      expect(theme.description.length, `${theme.id}.description`).toBeGreaterThan(0);
    });
  });
});

// ── themeList ────────────────────────────────────────────────────────────────

describe("themeList", () => {
  it("should be in sync with the themes registry", () => {
    expect(themeList.length).toBe(Object.keys(themes).length);
  });

  it("every entry should be a valid KiteTheme", () => {
    themeList.forEach((theme) => {
      expect(theme.id).toBeDefined();
      expect(theme.name).toBeDefined();
      expect(theme.colors).toBeDefined();
    });
  });
});

// ── getTheme ─────────────────────────────────────────────────────────────────

describe("getTheme", () => {
  it("should return the correct theme by id", () => {
    Object.values(themes).forEach((theme) => {
      expect(getTheme(theme.id)).toBe(theme);
    });
  });

  it("should fall back to sky for unknown ids", () => {
    expect(getTheme("nonexistent")).toBe(themes.sky);
    expect(getTheme("")).toBe(themes.sky);
  });
});

// ── getRandomBackground ─────────────────────────────────────────────────────

describe("getRandomBackground", () => {
  it("should return a value from backgroundImages when the array exists", () => {
    // Find a theme with backgroundImages
    const themeWithMultiple = Object.values(themes).find(
      (t) => t.backgroundImages && t.backgroundImages.length > 1,
    );
    if (!themeWithMultiple) return; // skip if none

    const backgrounds = themeWithMultiple.backgroundImages!;
    for (let i = 0; i < 20; i++) {
      expect(backgrounds).toContain(getRandomBackground(themeWithMultiple));
    }
  });

  it("should return the single backgroundImage when no array exists", () => {
    const themeWithSingle = Object.values(themes).find(
      (t) => t.backgroundImage && !t.backgroundImages,
    );
    if (!themeWithSingle) return;

    expect(getRandomBackground(themeWithSingle)).toBe(themeWithSingle.backgroundImage);
  });

  it("should return undefined when theme has no background", () => {
    const bare: KiteTheme = {
      id: "bare",
      name: "Bare",
      description: "No bg",
      colors: themes.sky.colors,
      style: "sharp",
    };
    expect(getRandomBackground(bare)).toBeUndefined();
  });
});

// ── getBackgroundForKite ────────────────────────────────────────────────────

describe("getBackgroundForKite", () => {
  it("should be deterministic — same index always yields same result", () => {
    Object.values(themes).forEach((theme) => {
      const a = getBackgroundForKite(theme, 3);
      const b = getBackgroundForKite(theme, 3);
      expect(a).toBe(b);
    });
  });

  it("should cycle through backgroundImages array", () => {
    const themeWithMultiple = Object.values(themes).find(
      (t) => t.backgroundImages && t.backgroundImages.length > 1,
    );
    if (!themeWithMultiple) return;

    const imgs = themeWithMultiple.backgroundImages!;
    for (let i = 0; i < imgs.length; i++) {
      expect(getBackgroundForKite(themeWithMultiple, i)).toBe(imgs[i]);
    }
    // Wrap around
    expect(getBackgroundForKite(themeWithMultiple, imgs.length)).toBe(imgs[0]);
  });

  it("should not throw for very large indices", () => {
    Object.values(themes).forEach((theme) => {
      expect(() => getBackgroundForKite(theme, 999999)).not.toThrow();
    });
  });
});

// ── Hybrid theme ────────────────────────────────────────────────────────────

describe("Hybrid meta-theme", () => {
  it("should be registered in themes", () => {
    expect(themes.hybrid).toBeDefined();
    expect(themes.hybrid.id).toBe("hybrid");
  });

  it("should appear in themeList", () => {
    expect(themeList.some((t) => t.id === "hybrid")).toBe(true);
  });

  it("should use Sky colours as its chrome defaults", () => {
    expect(themes.hybrid.colors.background).toBe(themes.sky.colors.background);
    expect(themes.hybrid.colors.text).toBe(themes.sky.colors.text);
  });
});

// ── resolveThemeForKite ─────────────────────────────────────────────────────

describe("resolveThemeForKite", () => {
  it("in non-hybrid mode, always returns the global theme regardless of override", () => {
    Object.values(themes)
      .filter((t) => t.id !== "hybrid")
      .forEach((theme) => {
        expect(resolveThemeForKite(theme.id)).toBe(theme);
        expect(resolveThemeForKite(theme.id, "retro")).toBe(theme);
      });
  });

  it("in hybrid mode with no override, defaults to sky", () => {
    expect(resolveThemeForKite("hybrid")).toBe(themes.sky);
    expect(resolveThemeForKite("hybrid", undefined)).toBe(themes.sky);
  });

  it("in hybrid mode, resolves a valid override to that theme", () => {
    Object.values(themes)
      .filter((t) => t.id !== "hybrid")
      .forEach((theme) => {
        expect(resolveThemeForKite("hybrid", theme.id)).toBe(theme);
      });
  });

  it("in hybrid mode, falls back to sky for an unknown override", () => {
    expect(resolveThemeForKite("hybrid", "does-not-exist")).toBe(themes.sky);
  });
});

// ── Visual sanity ───────────────────────────────────────────────────────────

describe("Theme visual sanity", () => {
  const hexToLuminance = (hex: string): number => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    return 0.299 * r + 0.587 * g + 0.114 * b;
  };

  it("text should be readable against the background (minimum contrast)", () => {
    Object.values(themes)
      .filter((t) => t.id !== "hybrid") // hybrid inherits sky
      .forEach((theme) => {
        const bgLum = hexToLuminance(theme.colors.background);
        const textLum = hexToLuminance(theme.colors.text);
        expect(
          Math.abs(bgLum - textLum),
          `${theme.id} text contrast`,
        ).toBeGreaterThan(0.3);
      });
  });
});
