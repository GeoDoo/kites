/**
 * Kite Theme Definitions
 * Game-inspired presets that apply globally to all kites
 */

export interface ZombieAttackConfig {
  enabled: boolean;
  totalTalkMinutes: number;  // Total presentation time - divided by kite count for per-kite timer
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
  };
  backgroundImage?: string;
  backgroundImages?: string[]; // Multiple images for randomization
  font?: string;
  style: "sharp" | "rounded" | "pixel";
  effects?: {
    glow?: boolean;
    scanlines?: boolean;
    noise?: boolean;
    zombieAttack?: ZombieAttackConfig;
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
      text: "#0f172a",
      textMuted: "#64748b",
      accent: "#0ea5e9",
      accentText: "#ffffff",
    },
    backgroundImage: "/themes/sky-bg.png",
    style: "rounded",
  },

  retro: {
    id: "retro",
    name: "Retro Gaming",
    description: "CRT terminal vibes",
    colors: {
      background: "#0d1117",
      surface: "#161b22",
      text: "#00ff00",
      textMuted: "#238636",
      accent: "#ffcc00",
      accentText: "#000000",
    },
    backgroundImage: "/themes/retro-bg.png",
    font: "VT323",
    style: "sharp",
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
      text: "#ffffff",
      textMuted: "#a0a0a0",
      accent: "#00ffff",
      accentText: "#000000",
    },
    backgroundImage: "/themes/neon-bg.png",
    style: "sharp",
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
      text: "#2c1810",
      textMuted: "#6b4423",
      accent: "#8b4513",
      accentText: "#ffffff",
    },
    backgroundImage: "/themes/rpg-bg.png",
    font: "Cinzel",
    style: "rounded",
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
      text: "#c4d4a0",
      textMuted: "#6b7355",
      accent: "#8b0000",
      accentText: "#ffffff",
    },
    backgroundImages: [
      "/themes/zombie-bg.png",
      "/themes/zombie-bg-2.png",
      "/themes/zombie-bg-3.png",
      "/themes/zombie-bg-4.png",
      "/themes/zombie-bg-5.png",
    ],
    font: "Creepster",
    style: "sharp",
    effects: {
      noise: true,
      zombieAttack: {
        enabled: true,
        totalTalkMinutes: 25,  // Total presentation time (25 min) - divided by number of kites
      },
    },
  },
};

export const themeList = Object.values(themes);

export function getTheme(id: string): KiteTheme {
  return themes[id] || themes.sky;
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
