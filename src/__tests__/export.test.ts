/**
 * Export Tests
 * Tests REAL store behaviour relevant to export payloads.
 * No re-implemented copies of internal logic.
 */

import { describe, it, expect, beforeEach } from "vitest";
import { useKitesStore } from "@/lib/store";
import { createKite } from "./fixtures";

beforeEach(() => {
  useKitesStore.setState({
    kites: [],
    currentKiteIndex: 0,
    selectedBlockId: null,
    currentTheme: "sky",
    title: "Untitled Presentation",
    _isLoaded: true,
  });
});

// ── Title persistence (used for export filename) ────────────────────────────

describe("Export: title round-trips through store", () => {
  it("should persist a title", () => {
    useKitesStore.getState().setTitle("My Zombie Deck");
    expect(useKitesStore.getState().title).toBe("My Zombie Deck");
  });

  it("should allow an empty title", () => {
    useKitesStore.getState().setTitle("");
    expect(useKitesStore.getState().title).toBe("");
  });

  it("should handle special characters", () => {
    const title = "Q&A Session: Part 1! — The Beginning";
    useKitesStore.getState().setTitle(title);
    expect(useKitesStore.getState().title).toBe(title);
  });
});

// ── Theme override survives store round-trip (matters for hybrid PDF export) ─

describe("Export: hybrid theme overrides in store", () => {
  it("should persist a themeOverride on a kite", () => {
    const kite = createKite();
    useKitesStore.setState({ kites: [kite], currentTheme: "hybrid" });
    useKitesStore.getState().updateKiteThemeOverride(kite.id, "neon");

    expect(useKitesStore.getState().kites[0].themeOverride).toBe("neon");
  });

  it("should leave themeOverride undefined when not set", () => {
    const kite = createKite();
    useKitesStore.setState({ kites: [kite] });

    expect(useKitesStore.getState().kites[0].themeOverride).toBeUndefined();
  });

  it("should allow clearing a themeOverride", () => {
    const kite = createKite();
    useKitesStore.setState({ kites: [kite] });
    useKitesStore.getState().updateKiteThemeOverride(kite.id, "retro");
    useKitesStore.getState().updateKiteThemeOverride(kite.id, undefined);

    expect(useKitesStore.getState().kites[0].themeOverride).toBeUndefined();
  });
});
