/**
 * Kite Theme Definitions
 * Game-inspired presets that apply globally to all kites
 */

export interface TimerConfig {
  enabled: boolean;
  totalTalkMinutes: number;  // Total presentation time - divided by kite count for per-kite timer
}

export interface ZombieAttackConfig {
  enabled: boolean;
}

export interface BackgroundTreatment {
  opacity?: number;      // 0-1, how transparent the bg image is
  blur?: number;         // px, blur amount
  grayscale?: number;    // 0-1, grayscale filter
  brightness?: number;   // 0-2, brightness (1 = normal)
  overlay?: string;      // Color overlay with alpha (e.g., "rgba(0,0,0,0.5)")
}

export interface KiteTheme {
  id: string;
  name: string;
  description: string;
  colors: {
    background: string;
    surface: string;
    text: string;
    textMuted: string;
    accent: string;
    accentText: string;
    // Preset content colors for good contrast
    heading: string;      // Default heading color
    headingShadow?: string; // Optional text shadow for headings
  };
  backgroundImage?: string;
  backgroundImages?: string[]; // Multiple images for randomization
  backgroundTreatment?: BackgroundTreatment;
  font?: string;
  style: "sharp" | "rounded" | "pixel";
  timer?: TimerConfig;  // Presentation timer - separate from theme-specific effects
  effects?: {
    glow?: boolean;
    scanlines?: boolean;
    noise?: boolean;
    zombieAttack?: ZombieAttackConfig;  // Zombie-specific attack animation
  };
}

export const themes: Record<string, KiteTheme> = {
  sky: {
    id: "sky",
    name: "Sky",
    description: "Light, airy, and modern",
    colors: {
      background: "#f0f9ff",
      surface: "#ffffff",
      text: "#1e3a5f",
      textMuted: "#64748b",
      accent: "#0ea5e9",
      accentText: "#ffffff",
      heading: "#0c4a6e",
      headingShadow: "0 2px 4px rgba(255,255,255,0.8)",
    },
    backgroundImage: "/themes/sky-bg.png",
    backgroundTreatment: {
      opacity: 0.4,
      blur: 2,
      brightness: 1.1,
    },
    style: "rounded",
    timer: {
      enabled: true,
      totalTalkMinutes: 25,
    },
  },

  retro: {
    id: "retro",
    name: "Retro Gaming",
    description: "CRT terminal vibes",
    colors: {
      background: "#0d1117",
      surface: "#161b22",
      text: "#33ff33",
      textMuted: "#238636",
      accent: "#ffcc00",
      accentText: "#000000",
      heading: "#00ff00",
      headingShadow: "0 0 10px #00ff00, 0 0 20px #00ff0080",
    },
    backgroundImage: "/themes/retro-bg.png",
    backgroundTreatment: {
      opacity: 0.3,
      grayscale: 0.8,
      brightness: 0.4,
      overlay: "rgba(0, 20, 0, 0.7)",
    },
    font: "VT323",
    style: "sharp",
    timer: {
      enabled: true,
      totalTalkMinutes: 25,
    },
    effects: {
      scanlines: true,
    },
  },

  neon: {
    id: "neon",
    name: "Neon Cyberpunk",
    description: "Glowing futuristic style",
    colors: {
      background: "#0a0a0a",
      surface: "#1a1a2e",
      text: "#e0e0ff",
      textMuted: "#a0a0a0",
      accent: "#00ffff",
      accentText: "#000000",
      heading: "#ff00ff",
      headingShadow: "0 0 10px #ff00ff, 0 0 30px #ff00ff80, 0 0 50px #ff00ff40",
    },
    backgroundImage: "/themes/neon-bg.png",
    backgroundTreatment: {
      opacity: 0.5,
      blur: 3,
      brightness: 0.6,
      overlay: "rgba(10, 0, 30, 0.6)",
    },
    style: "sharp",
    timer: {
      enabled: true,
      totalTalkMinutes: 25,
    },
    effects: {
      glow: true,
    },
  },

  rpg: {
    id: "rpg",
    name: "RPG Fantasy",
    description: "Medieval parchment feel",
    colors: {
      background: "#f5e6d3",
      surface: "#fff8f0",
      text: "#3d2914",
      textMuted: "#6b4423",
      accent: "#8b4513",
      accentText: "#ffffff",
      heading: "#5c3317",
      headingShadow: "2px 2px 0 rgba(255,248,240,0.8)",
    },
    backgroundImage: "/themes/rpg-bg.png",
    backgroundTreatment: {
      opacity: 0.35,
      blur: 1,
      brightness: 1.2,
      overlay: "rgba(245, 230, 211, 0.5)",
    },
    font: "Cinzel",
    style: "rounded",
    timer: {
      enabled: true,
      totalTalkMinutes: 25,
    },
    effects: {
      noise: true,
    },
  },

  zombie: {
    id: "zombie",
    name: "Zombie Apocalypse",
    description: "Survive the undead wasteland",
    colors: {
      background: "#1a1a0f",
      surface: "#2a2a1a",
      text: "#d4e4b0",
      textMuted: "#8b9365",
      accent: "#8b0000",
      accentText: "#ffffff",
      heading: "#e8f0c0",
      headingShadow: "3px 3px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 0 4px 8px rgba(0,0,0,0.8)",
    },
    backgroundImages: [
      "/themes/zombie-bg.png",
      "/themes/zombie-bg-2.png",
      "/themes/zombie-bg-3.png",
      "/themes/zombie-bg-4.png",
      "/themes/zombie-bg-5.png",
    ],
    backgroundTreatment: {
      opacity: 0.6,
      blur: 2,
      grayscale: 0.4,
      brightness: 0.5,
      overlay: "rgba(20, 25, 10, 0.5)",
    },
    font: "Creepster",
    style: "sharp",
    timer: {
      enabled: true,
      totalTalkMinutes: 25,
    },
    effects: {
      noise: true,
      zombieAttack: {
        enabled: true,  // Enables zombie animation synced to timer
      },
    },
  },
};

// Hybrid is a meta-theme: each kite can have its own theme override.
// It uses Sky as the default and inherits Sky's visual properties for the editor chrome.
export const hybridTheme: KiteTheme = {
  id: "hybrid",
  name: "Hybrid",
  description: "Mix themes per kite",
  colors: { ...themes.sky.colors },
  backgroundImage: themes.sky.backgroundImage,
  backgroundTreatment: themes.sky.backgroundTreatment,
  style: "rounded",
  timer: {
    enabled: true,
    totalTalkMinutes: 25,
  },
};

// All themes including hybrid (for the theme selector dropdown)
themes.hybrid = hybridTheme;

export const themeList = Object.values(themes);

export function getTheme(id: string): KiteTheme {
  return themes[id] || themes.sky;
}

/**
 * Resolve the effective theme for a specific kite.
 * - If deck theme is NOT "hybrid", every kite uses the deck theme.
 * - If deck theme IS "hybrid", use kite.themeOverride (default: "sky").
 */
export function resolveThemeForKite(
  deckThemeId: string,
  kiteThemeOverride?: string
): KiteTheme {
  if (deckThemeId !== "hybrid") {
    return getTheme(deckThemeId);
  }
  // Hybrid mode: resolve per-kite, default to sky
  return getTheme(kiteThemeOverride || "sky");
}

/**
 * Get a random background image from a theme
 * Returns the single backgroundImage if no array exists
 */
export function getRandomBackground(theme: KiteTheme): string | undefined {
  if (theme.backgroundImages && theme.backgroundImages.length > 0) {
    const randomIndex = Math.floor(Math.random() * theme.backgroundImages.length);
    return theme.backgroundImages[randomIndex];
  }
  return theme.backgroundImage;
}

/**
 * Get background for a specific kite (deterministic based on kite index)
 * This ensures the same kite always gets the same background within a session
 */
export function getBackgroundForKite(theme: KiteTheme, kiteIndex: number): string | undefined {
  if (theme.backgroundImages && theme.backgroundImages.length > 0) {
    return theme.backgroundImages[kiteIndex % theme.backgroundImages.length];
  }
  return theme.backgroundImage;
}

/**
 * Resolve per-kite durations from total budget.
 * - In Hybrid mode: kites with `durationOverride` use that value;
 *   remaining budget is split evenly among unset kites.
 * - In non-Hybrid mode: total is split evenly across all kites.
 * Returns an array of seconds per kite, same order as the input.
 */
export function resolveKiteDurations(
  totalMinutes: number,
  kites: Array<{ durationOverride?: number }>,
  isHybrid: boolean
): number[] {
  const totalSeconds = totalMinutes * 60;
  const count = kites.length;
  if (count === 0) return [];

  if (!isHybrid) {
    const base = Math.floor(totalSeconds / count);
    const extra = totalSeconds - base * count; // leftover seconds to distribute
    return kites.map((_, i) => base + (i < extra ? 1 : 0));
  }

  // Hybrid: respect overrides, distribute remainder
  let allocated = 0;
  const unsetIndices: number[] = [];
  for (let i = 0; i < kites.length; i++) {
    const kite = kites[i];
    if (kite.durationOverride != null && kite.durationOverride > 0) {
      allocated += kite.durationOverride;
    } else {
      unsetIndices.push(i);
    }
  }

  const remaining = Math.max(0, totalSeconds - allocated);
  const unsetCount = unsetIndices.length;
  const base = unsetCount > 0 ? Math.floor(remaining / unsetCount) : 0;
  const extra = unsetCount > 0 ? remaining - base * unsetCount : 0;

  return kites.map((kite, i) => {
    if (kite.durationOverride != null && kite.durationOverride > 0) {
      return kite.durationOverride;
    }
    // Distribute leftover seconds across the first N unset kites
    const unsetPos = unsetIndices.indexOf(i);
    return base + (unsetPos < extra ? 1 : 0);
  });
}
