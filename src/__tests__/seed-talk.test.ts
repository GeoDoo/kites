/**
 * Seed Talk Tests
 * Tests the REAL buildKites and TALK_KITES from the extracted data module.
 * No re-implemented copies.
 */

import { describe, it, expect } from "vitest";
import { TALK_KITES, buildKites, type KiteDef } from "@/app/seed-talk/talk-data";

const VALID_BLOCK_TYPES = ["h1", "h2", "h3", "h4", "text", "image"] as const;

describe("TALK_KITES data", () => {
  it("every kite should have at least one block", () => {
    TALK_KITES.forEach((kite, i) => {
      expect(kite.blocks.length, `kite ${i + 1}`).toBeGreaterThan(0);
    });
  });

  it("every block should have non-empty content", () => {
    TALK_KITES.forEach((kite, i) => {
      kite.blocks.forEach((block, j) => {
        expect(block.content.length, `kite ${i + 1} block ${j + 1}`).toBeGreaterThan(0);
      });
    });
  });

  it("every block should use a valid type", () => {
    const validTypes = new Set(VALID_BLOCK_TYPES);
    TALK_KITES.forEach((kite, i) => {
      kite.blocks.forEach((block, j) => {
        expect(validTypes.has(block.type), `kite ${i + 1} block ${j + 1}: ${block.type}`).toBe(true);
      });
    });
  });

  it("every block position should be within 0-100 percentage range", () => {
    TALK_KITES.forEach((kite, i) => {
      kite.blocks.forEach((block, j) => {
        const p = block.position;
        expect(p.x, `kite ${i + 1} block ${j + 1} x`).toBeGreaterThanOrEqual(0);
        expect(p.x, `kite ${i + 1} block ${j + 1} x`).toBeLessThanOrEqual(100);
        expect(p.y, `kite ${i + 1} block ${j + 1} y`).toBeGreaterThanOrEqual(0);
        expect(p.y, `kite ${i + 1} block ${j + 1} y`).toBeLessThanOrEqual(100);
        expect(p.width, `kite ${i + 1} block ${j + 1} width`).toBeGreaterThan(0);
        expect(p.height, `kite ${i + 1} block ${j + 1} height`).toBeGreaterThan(0);
      });
    });
  });
});

describe("buildKites", () => {
  it("should produce one kite per definition", () => {
    const kites = buildKites();
    expect(kites).toHaveLength(TALK_KITES.length);
  });

  it("should assign unique ids to every kite", () => {
    const kites = buildKites();
    const ids = kites.map((k) => k.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("should assign unique ids to every block across all kites", () => {
    const kites = buildKites();
    const blockIds = kites.flatMap((k) => k.contentBlocks.map((b) => b.id));
    expect(new Set(blockIds).size).toBe(blockIds.length);
  });

  it("should preserve block content from kite definitions", () => {
    const kites = buildKites();
    // First kite title
    expect(kites[0].contentBlocks[0].content).toBe("Imagination vs. Reality");
    // Last kite
    const last = kites[kites.length - 1];
    expect(last.contentBlocks[0].content).toBe("Thank You");
  });

  it("should set timestamps on every kite", () => {
    const kites = buildKites();
    kites.forEach((kite) => {
      expect(kite.createdAt).toBeTruthy();
      expect(kite.updatedAt).toBeTruthy();
      expect(() => new Date(kite.createdAt)).not.toThrow();
    });
  });

  it("should accept custom kite definitions", () => {
    const custom: KiteDef[] = [
      { blocks: [{ type: "h1", content: "Custom", position: { x: 0, y: 0, width: 100, height: 100 } }] },
    ];
    const kites = buildKites(custom);
    expect(kites).toHaveLength(1);
    expect(kites[0].contentBlocks[0].content).toBe("Custom");
  });

  it("should default style to empty object when kite block has no style", () => {
    const custom: KiteDef[] = [
      { blocks: [{ type: "h1", content: "No style", position: { x: 0, y: 0, width: 100, height: 100 } }] },
    ];
    const kites = buildKites(custom);
    expect(kites[0].contentBlocks[0].style).toEqual({});
  });

  it("should default zIndex to 10 when kite block has no zIndex", () => {
    const custom: KiteDef[] = [
      { blocks: [{ type: "h1", content: "Test", position: { x: 0, y: 0, width: 100, height: 100 } }] },
    ];
    const kites = buildKites(custom);
    expect(kites[0].contentBlocks[0].zIndex).toBe(10);
  });
});
