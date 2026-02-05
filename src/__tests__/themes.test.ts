/**
 * Theme Unit Tests
 * Tests for theme definitions and utility functions
 */

import { describe, it, expect } from "vitest";
import {
  themes,
  themeList,
  getTheme,
  getRandomBackground,
  getBackgroundForKite,
  type KiteTheme,
} from "@/lib/themes";

describe("Theme Definitions", () => {
  it("should have at least one theme defined", () => {
    expect(Object.keys(themes).length).toBeGreaterThan(0);
  });

  it("should have consistent id field matching key", () => {
    Object.entries(themes).forEach(([key, theme]) => {
      expect(theme.id).toBe(key);
    });
  });

  it("should have all required color fields", () => {
    Object.values(themes).forEach((theme) => {
      expect(theme.colors).toBeDefined();
      expect(theme.colors.background).toBeDefined();
      expect(theme.colors.surface).toBeDefined();
      expect(theme.colors.text).toBeDefined();
      expect(theme.colors.textMuted).toBeDefined();
      expect(theme.colors.accent).toBeDefined();
      expect(theme.colors.accentText).toBeDefined();
    });
  });

  it("should have valid hex color codes", () => {
    const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    // headingShadow is a CSS shadow value, not a hex color
    const nonHexColors = ["headingShadow"];
    
    Object.values(themes).forEach((theme) => {
      Object.entries(theme.colors).forEach(([colorName, colorValue]) => {
        if (!nonHexColors.includes(colorName)) {
          expect(colorValue, `${theme.id}.colors.${colorName}`).toMatch(hexRegex);
        }
      });
    });
  });

  it("should have valid style value", () => {
    const validStyles = ["sharp", "rounded", "pixel"];
    
    Object.values(themes).forEach((theme) => {
      expect(validStyles).toContain(theme.style);
    });
  });

  it("should have name and description", () => {
    Object.values(themes).forEach((theme) => {
      expect(theme.name).toBeDefined();
      expect(theme.name.length).toBeGreaterThan(0);
      expect(theme.description).toBeDefined();
      expect(theme.description.length).toBeGreaterThan(0);
    });
  });
});

describe("Specific Themes", () => {
  describe("sky theme", () => {
    it("should be the default theme", () => {
      expect(themes.sky).toBeDefined();
      expect(themes.sky.style).toBe("rounded");
    });
  });

  describe("zombie theme", () => {
    it("should have multiple background images", () => {
      expect(themes.zombie.backgroundImages).toBeDefined();
      expect(themes.zombie.backgroundImages!.length).toBeGreaterThan(1);
    });

    it("should have zombie attack config enabled", () => {
      expect(themes.zombie.effects?.zombieAttack).toBeDefined();
      expect(themes.zombie.effects?.zombieAttack?.enabled).toBe(true);
      expect(themes.zombie.effects?.zombieAttack?.totalTalkMinutes).toBeGreaterThan(0);
    });

    it("should have Creepster font", () => {
      expect(themes.zombie.font).toBe("Creepster");
    });
  });

  describe("retro theme", () => {
    it("should have scanlines effect", () => {
      expect(themes.retro.effects?.scanlines).toBe(true);
    });

    it("should have VT323 font", () => {
      expect(themes.retro.font).toBe("VT323");
    });
  });

  describe("neon theme", () => {
    it("should have glow effect", () => {
      expect(themes.neon.effects?.glow).toBe(true);
    });
  });

  describe("rpg theme", () => {
    it("should have noise effect", () => {
      expect(themes.rpg.effects?.noise).toBe(true);
    });

    it("should have Cinzel font", () => {
      expect(themes.rpg.font).toBe("Cinzel");
    });
  });
});

describe("themeList", () => {
  it("should contain all themes", () => {
    expect(themeList.length).toBe(Object.keys(themes).length);
  });

  it("should be an array of KiteTheme objects", () => {
    themeList.forEach((theme) => {
      expect(theme.id).toBeDefined();
      expect(theme.name).toBeDefined();
      expect(theme.colors).toBeDefined();
    });
  });
});

describe("getTheme", () => {
  it("should return correct theme by id", () => {
    expect(getTheme("sky")).toBe(themes.sky);
    expect(getTheme("zombie")).toBe(themes.zombie);
    expect(getTheme("retro")).toBe(themes.retro);
  });

  it("should return sky theme for unknown id", () => {
    expect(getTheme("unknown-theme")).toBe(themes.sky);
    expect(getTheme("")).toBe(themes.sky);
  });
});

describe("getRandomBackground", () => {
  it("should return a background from the array for zombie theme", () => {
    const theme = themes.zombie;
    const backgrounds = theme.backgroundImages!;
    
    // Run multiple times to test randomness
    const results = new Set<string>();
    for (let i = 0; i < 50; i++) {
      const result = getRandomBackground(theme);
      expect(backgrounds).toContain(result);
      results.add(result!);
    }
    
    // Should get at least 2 different backgrounds over 50 runs
    expect(results.size).toBeGreaterThan(1);
  });

  it("should return single backgroundImage for themes without array", () => {
    const theme = themes.sky;
    const result = getRandomBackground(theme);
    expect(result).toBe(theme.backgroundImage);
  });

  it("should return undefined for theme with neither", () => {
    const themeWithoutBg: KiteTheme = {
      id: "test",
      name: "Test",
      description: "Test theme",
      colors: themes.sky.colors,
      style: "sharp",
    };
    
    expect(getRandomBackground(themeWithoutBg)).toBeUndefined();
  });
});

describe("getBackgroundForKite", () => {
  it("should return deterministic background based on kite index", () => {
    const theme = themes.zombie;
    const backgrounds = theme.backgroundImages!;
    
    // Same index should always return same background
    for (let i = 0; i < 10; i++) {
      const result1 = getBackgroundForKite(theme, 0);
      const result2 = getBackgroundForKite(theme, 0);
      expect(result1).toBe(result2);
    }
  });

  it("should cycle through backgrounds", () => {
    const theme = themes.zombie;
    const backgrounds = theme.backgroundImages!;
    
    // Test that it cycles through all backgrounds
    for (let i = 0; i < backgrounds.length; i++) {
      expect(getBackgroundForKite(theme, i)).toBe(backgrounds[i]);
    }
    
    // After length, should cycle back
    expect(getBackgroundForKite(theme, backgrounds.length)).toBe(backgrounds[0]);
    expect(getBackgroundForKite(theme, backgrounds.length + 1)).toBe(backgrounds[1]);
  });

  it("should return single backgroundImage for themes without array", () => {
    const theme = themes.sky;
    
    expect(getBackgroundForKite(theme, 0)).toBe(theme.backgroundImage);
    expect(getBackgroundForKite(theme, 5)).toBe(theme.backgroundImage);
    expect(getBackgroundForKite(theme, 100)).toBe(theme.backgroundImage);
  });

  it("should handle large kite indices", () => {
    const theme = themes.zombie;
    
    // Should not throw for large indices
    expect(() => getBackgroundForKite(theme, 1000)).not.toThrow();
    expect(() => getBackgroundForKite(theme, 999999)).not.toThrow();
  });
});

describe("Theme Visual Properties", () => {
  it("should have readable text contrast (basic check)", () => {
    // Simple luminance-based contrast check
    const hexToLuminance = (hex: string): number => {
      const r = parseInt(hex.slice(1, 3), 16) / 255;
      const g = parseInt(hex.slice(3, 5), 16) / 255;
      const b = parseInt(hex.slice(5, 7), 16) / 255;
      return 0.299 * r + 0.587 * g + 0.114 * b;
    };

    Object.values(themes).forEach((theme) => {
      const bgLum = hexToLuminance(theme.colors.background);
      const textLum = hexToLuminance(theme.colors.text);
      const contrast = Math.abs(bgLum - textLum);
      
      // Expect at least 0.3 contrast difference
      expect(contrast, `${theme.id} text contrast`).toBeGreaterThan(0.3);
    });
  });
});
