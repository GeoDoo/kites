/**
 * KiteList Keyboard Navigation Tests
 * Tests arrow key navigation in the kite sidebar
 */

import { describe, it, expect, beforeEach } from "vitest";
import { useKitesStore } from "@/lib/store";
import { createKite } from "./fixtures";

// Reset store before each test
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

describe("KiteList: Keyboard Navigation (store-level)", () => {
  describe("setCurrentKite", () => {
    it("should navigate to a specific kite index", () => {
      useKitesStore.setState({
        kites: [
          createKite({ id: "kite-1" }),
          createKite({ id: "kite-2" }),
          createKite({ id: "kite-3" }),
        ],
        currentKiteIndex: 0,
      });

      useKitesStore.getState().setCurrentKite(2);
      expect(useKitesStore.getState().currentKiteIndex).toBe(2);
    });

    it("should clamp to last index when exceeding bounds", () => {
      useKitesStore.setState({
        kites: [
          createKite({ id: "kite-1" }),
          createKite({ id: "kite-2" }),
          createKite({ id: "kite-3" }),
        ],
        currentKiteIndex: 0,
      });

      useKitesStore.getState().setCurrentKite(99);
      expect(useKitesStore.getState().currentKiteIndex).toBe(2);
    });

    it("should clamp to 0 when index is negative", () => {
      useKitesStore.setState({
        kites: [
          createKite({ id: "kite-1" }),
          createKite({ id: "kite-2" }),
        ],
        currentKiteIndex: 1,
      });

      useKitesStore.getState().setCurrentKite(-5);
      expect(useKitesStore.getState().currentKiteIndex).toBe(0);
    });

    it("should clear selected block when navigating", () => {
      useKitesStore.setState({
        kites: [
          createKite({ id: "kite-1" }),
          createKite({ id: "kite-2" }),
        ],
        currentKiteIndex: 0,
        selectedBlockId: "some-block-id",
      });

      useKitesStore.getState().setCurrentKite(1);
      expect(useKitesStore.getState().selectedBlockId).toBeNull();
    });
  });

  describe("goToNextKite", () => {
    it("should advance to the next kite", () => {
      useKitesStore.setState({
        kites: [
          createKite({ id: "kite-1" }),
          createKite({ id: "kite-2" }),
          createKite({ id: "kite-3" }),
        ],
        currentKiteIndex: 0,
      });

      useKitesStore.getState().goToNextKite();
      expect(useKitesStore.getState().currentKiteIndex).toBe(1);
    });

    it("should not go past the last kite", () => {
      useKitesStore.setState({
        kites: [
          createKite({ id: "kite-1" }),
          createKite({ id: "kite-2" }),
        ],
        currentKiteIndex: 1,
      });

      useKitesStore.getState().goToNextKite();
      expect(useKitesStore.getState().currentKiteIndex).toBe(1);
    });

    it("should clear selected block", () => {
      useKitesStore.setState({
        kites: [
          createKite({ id: "kite-1" }),
          createKite({ id: "kite-2" }),
        ],
        currentKiteIndex: 0,
        selectedBlockId: "some-block",
      });

      useKitesStore.getState().goToNextKite();
      expect(useKitesStore.getState().selectedBlockId).toBeNull();
    });
  });

  describe("goToPreviousKite", () => {
    it("should go back to the previous kite", () => {
      useKitesStore.setState({
        kites: [
          createKite({ id: "kite-1" }),
          createKite({ id: "kite-2" }),
          createKite({ id: "kite-3" }),
        ],
        currentKiteIndex: 2,
      });

      useKitesStore.getState().goToPreviousKite();
      expect(useKitesStore.getState().currentKiteIndex).toBe(1);
    });

    it("should not go before the first kite", () => {
      useKitesStore.setState({
        kites: [
          createKite({ id: "kite-1" }),
          createKite({ id: "kite-2" }),
        ],
        currentKiteIndex: 0,
      });

      useKitesStore.getState().goToPreviousKite();
      expect(useKitesStore.getState().currentKiteIndex).toBe(0);
    });

    it("should clear selected block", () => {
      useKitesStore.setState({
        kites: [
          createKite({ id: "kite-1" }),
          createKite({ id: "kite-2" }),
        ],
        currentKiteIndex: 1,
        selectedBlockId: "some-block",
      });

      useKitesStore.getState().goToPreviousKite();
      expect(useKitesStore.getState().selectedBlockId).toBeNull();
    });
  });

  describe("sequential navigation", () => {
    it("should navigate through all kites sequentially", () => {
      const kiteCount = 5;
      useKitesStore.setState({
        kites: Array.from({ length: kiteCount }, (_, i) =>
          createKite({ id: `kite-${i}` })
        ),
        currentKiteIndex: 0,
      });

      // Navigate forward through all
      for (let i = 0; i < kiteCount - 1; i++) {
        useKitesStore.getState().goToNextKite();
        expect(useKitesStore.getState().currentKiteIndex).toBe(i + 1);
      }

      // Should be at last
      expect(useKitesStore.getState().currentKiteIndex).toBe(kiteCount - 1);

      // Navigate backward through all
      for (let i = kiteCount - 1; i > 0; i--) {
        useKitesStore.getState().goToPreviousKite();
        expect(useKitesStore.getState().currentKiteIndex).toBe(i - 1);
      }

      // Should be back at first
      expect(useKitesStore.getState().currentKiteIndex).toBe(0);
    });

    it("should handle Home (first) and End (last) navigation", () => {
      useKitesStore.setState({
        kites: Array.from({ length: 10 }, (_, i) =>
          createKite({ id: `kite-${i}` })
        ),
        currentKiteIndex: 5,
      });

      // Jump to first (Home key behavior)
      useKitesStore.getState().setCurrentKite(0);
      expect(useKitesStore.getState().currentKiteIndex).toBe(0);

      // Jump to last (End key behavior)
      const lastIndex = useKitesStore.getState().kites.length - 1;
      useKitesStore.getState().setCurrentKite(lastIndex);
      expect(useKitesStore.getState().currentKiteIndex).toBe(9);
    });
  });

  describe("edge cases", () => {
    it("should handle navigation with single kite", () => {
      useKitesStore.setState({
        kites: [createKite({ id: "only-kite" })],
        currentKiteIndex: 0,
      });

      useKitesStore.getState().goToNextKite();
      expect(useKitesStore.getState().currentKiteIndex).toBe(0);

      useKitesStore.getState().goToPreviousKite();
      expect(useKitesStore.getState().currentKiteIndex).toBe(0);
    });

    it("should handle navigation with empty kite list", () => {
      useKitesStore.setState({
        kites: [],
        currentKiteIndex: 0,
      });

      // Should not crash
      useKitesStore.getState().goToNextKite();
      expect(useKitesStore.getState().currentKiteIndex).toBe(0);

      useKitesStore.getState().goToPreviousKite();
      expect(useKitesStore.getState().currentKiteIndex).toBe(0);
    });

    it("should handle rapid navigation without state corruption", () => {
      useKitesStore.setState({
        kites: Array.from({ length: 48 }, (_, i) =>
          createKite({ id: `kite-${i}` })
        ),
        currentKiteIndex: 0,
      });

      // Rapid forward navigation
      for (let i = 0; i < 100; i++) {
        useKitesStore.getState().goToNextKite();
      }
      expect(useKitesStore.getState().currentKiteIndex).toBe(47);

      // Rapid backward navigation
      for (let i = 0; i < 100; i++) {
        useKitesStore.getState().goToPreviousKite();
      }
      expect(useKitesStore.getState().currentKiteIndex).toBe(0);
    });
  });
});
