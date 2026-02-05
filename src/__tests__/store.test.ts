/**
 * Store Unit Tests
 * Tests for Zustand store CRUD operations and state management
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { useKitesStore } from "@/lib/store";
import {
  createKite,
  createKiteWithBlocks,
  createBlock,
  createHeadingBlock,
  createTextBlock,
  randomId,
} from "./fixtures";

// Reset store before each test
beforeEach(() => {
  useKitesStore.setState({
    kites: [],
    currentKiteIndex: 0,
    selectedBlockId: null,
    currentTheme: "sky",
    _isLoaded: true,
  });
});

describe("Store: Kite Operations", () => {
  describe("addKite", () => {
    it("should add a new empty kite", () => {
      const { addKite, kites } = useKitesStore.getState();
      expect(kites).toHaveLength(0);
      
      const id = addKite();
      
      const newState = useKitesStore.getState();
      expect(newState.kites).toHaveLength(1);
      expect(newState.kites[0].id).toBe(id);
      expect(newState.kites[0].contentBlocks).toHaveLength(0);
      expect(newState.currentKiteIndex).toBe(0);
    });

    it("should set current kite index to the new kite", () => {
      const { addKite } = useKitesStore.getState();
      
      addKite(); // index 0
      addKite(); // index 1
      addKite(); // index 2
      
      const state = useKitesStore.getState();
      expect(state.kites).toHaveLength(3);
      expect(state.currentKiteIndex).toBe(2);
    });

    it("should clear selected block when adding kite", () => {
      useKitesStore.setState({
        kites: [createKiteWithBlocks(2)],
        selectedBlockId: "some-id",
      });
      
      useKitesStore.getState().addKite();
      
      expect(useKitesStore.getState().selectedBlockId).toBeNull();
    });
  });

  describe("deleteKite", () => {
    it("should delete a kite by id", () => {
      const kite1 = createKite();
      const kite2 = createKite();
      useKitesStore.setState({ kites: [kite1, kite2] });
      
      useKitesStore.getState().deleteKite(kite1.id);
      
      const state = useKitesStore.getState();
      expect(state.kites).toHaveLength(1);
      expect(state.kites[0].id).toBe(kite2.id);
    });

    it("should adjust currentKiteIndex when deleting current kite at end", () => {
      const kites = [createKite(), createKite(), createKite()];
      useKitesStore.setState({ kites, currentKiteIndex: 2 });
      
      useKitesStore.getState().deleteKite(kites[2].id);
      
      expect(useKitesStore.getState().currentKiteIndex).toBe(1);
    });

    it("should handle deleting non-existent kite", () => {
      const kite = createKite();
      useKitesStore.setState({ kites: [kite] });
      
      useKitesStore.getState().deleteKite("non-existent-id");
      
      expect(useKitesStore.getState().kites).toHaveLength(1);
    });

    it("should clear selected block when deleting kite", () => {
      const kite = createKiteWithBlocks(1);
      useKitesStore.setState({
        kites: [kite],
        selectedBlockId: kite.contentBlocks[0].id,
      });
      
      useKitesStore.getState().deleteKite(kite.id);
      
      expect(useKitesStore.getState().selectedBlockId).toBeNull();
    });

    it("should allow deleting all kites", () => {
      const kites = [createKite(), createKite()];
      useKitesStore.setState({ kites });
      
      useKitesStore.getState().deleteKite(kites[0].id);
      useKitesStore.getState().deleteKite(kites[1].id);
      
      expect(useKitesStore.getState().kites).toHaveLength(0);
    });
  });

  describe("duplicateKite", () => {
    it("should duplicate a kite with new id", () => {
      const original = createKiteWithBlocks(2);
      useKitesStore.setState({ kites: [original] });
      
      const newId = useKitesStore.getState().duplicateKite(original.id);
      
      const state = useKitesStore.getState();
      expect(state.kites).toHaveLength(2);
      expect(newId).not.toBe(original.id);
      expect(state.kites[1].id).toBe(newId);
    });

    it("should duplicate content blocks with new ids", () => {
      const original = createKiteWithBlocks(2);
      useKitesStore.setState({ kites: [original] });
      
      useKitesStore.getState().duplicateKite(original.id);
      
      const state = useKitesStore.getState();
      const duplicate = state.kites[1];
      
      expect(duplicate.contentBlocks).toHaveLength(original.contentBlocks.length);
      original.contentBlocks.forEach((origBlock, i) => {
        expect(duplicate.contentBlocks[i].id).not.toBe(origBlock.id);
        expect(duplicate.contentBlocks[i].content).toBe(origBlock.content);
      });
    });

    it("should insert duplicate after original", () => {
      const kites = [createKite(), createKite(), createKite()];
      useKitesStore.setState({ kites, currentKiteIndex: 0 });
      
      useKitesStore.getState().duplicateKite(kites[1].id);
      
      const state = useKitesStore.getState();
      expect(state.kites[1].id).toBe(kites[1].id); // Original at index 1
      expect(state.kites[2].id).not.toBe(kites[1].id); // Duplicate at index 2
    });

    it("should return null for non-existent kite", () => {
      useKitesStore.setState({ kites: [createKite()] });
      
      const result = useKitesStore.getState().duplicateKite("non-existent");
      
      expect(result).toBeNull();
    });
  });

  describe("reorderKites", () => {
    it("should reorder kites", () => {
      const kites = [
        createKite({ id: "kite-1" } as any),
        createKite({ id: "kite-2" } as any),
        createKite({ id: "kite-3" } as any),
      ];
      // Override IDs for easier testing
      kites[0].id = "kite-1";
      kites[1].id = "kite-2";
      kites[2].id = "kite-3";
      useKitesStore.setState({ kites });
      
      useKitesStore.getState().reorderKites(0, 2);
      
      const state = useKitesStore.getState();
      expect(state.kites[0].id).toBe("kite-2");
      expect(state.kites[1].id).toBe("kite-3");
      expect(state.kites[2].id).toBe("kite-1");
    });

    it("should update currentKiteIndex when reordering current kite", () => {
      const kites = [createKite(), createKite(), createKite()];
      useKitesStore.setState({ kites, currentKiteIndex: 0 });
      
      useKitesStore.getState().reorderKites(0, 2);
      
      expect(useKitesStore.getState().currentKiteIndex).toBe(2);
    });

    it("should handle invalid indices", () => {
      const kites = [createKite(), createKite()];
      useKitesStore.setState({ kites });
      
      useKitesStore.getState().reorderKites(-1, 5);
      
      expect(useKitesStore.getState().kites).toHaveLength(2);
    });
  });

  describe("setCurrentKite", () => {
    it("should set current kite index", () => {
      const kites = [createKite(), createKite(), createKite()];
      useKitesStore.setState({ kites, currentKiteIndex: 0 });
      
      useKitesStore.getState().setCurrentKite(2);
      
      expect(useKitesStore.getState().currentKiteIndex).toBe(2);
    });

    it("should clamp index to valid range", () => {
      const kites = [createKite(), createKite()];
      useKitesStore.setState({ kites, currentKiteIndex: 0 });
      
      useKitesStore.getState().setCurrentKite(100);
      expect(useKitesStore.getState().currentKiteIndex).toBe(1);
      
      useKitesStore.getState().setCurrentKite(-5);
      expect(useKitesStore.getState().currentKiteIndex).toBe(0);
    });

    it("should clear selected block when changing kite", () => {
      const kites = [createKiteWithBlocks(1), createKiteWithBlocks(1)];
      useKitesStore.setState({
        kites,
        currentKiteIndex: 0,
        selectedBlockId: kites[0].contentBlocks[0].id,
      });
      
      useKitesStore.getState().setCurrentKite(1);
      
      expect(useKitesStore.getState().selectedBlockId).toBeNull();
    });
  });
});

describe("Store: Block Operations", () => {
  beforeEach(() => {
    const kite = createKite();
    useKitesStore.setState({
      kites: [kite],
      currentKiteIndex: 0,
      selectedBlockId: null,
      _isLoaded: true,
    });
  });

  describe("addBlock", () => {
    it("should add a block to current kite", () => {
      const id = useKitesStore.getState().addBlock("h1", "Test Heading");
      
      const state = useKitesStore.getState();
      expect(state.kites[0].contentBlocks).toHaveLength(1);
      expect(state.kites[0].contentBlocks[0].id).toBe(id);
      expect(state.kites[0].contentBlocks[0].type).toBe("h1");
      expect(state.kites[0].contentBlocks[0].content).toBe("Test Heading");
    });

    it("should select the newly added block", () => {
      const id = useKitesStore.getState().addBlock("text");
      
      expect(useKitesStore.getState().selectedBlockId).toBe(id);
    });

    it("should update kite timestamp", () => {
      const originalTime = useKitesStore.getState().kites[0].updatedAt;
      
      // Small delay to ensure timestamp differs
      vi.useFakeTimers();
      vi.advanceTimersByTime(100);
      
      useKitesStore.getState().addBlock("text");
      
      vi.useRealTimers();
    });

    it("should return null when no current kite", () => {
      useKitesStore.setState({ kites: [], currentKiteIndex: 0 });
      
      const result = useKitesStore.getState().addBlock("h1");
      
      expect(result).toBeNull();
    });

    it.each(["h1", "h2", "h3", "h4", "text", "image"] as const)(
      "should add block of type %s with correct defaults",
      (type) => {
        useKitesStore.getState().addBlock(type);
        
        const block = useKitesStore.getState().kites[0].contentBlocks[0];
        expect(block.type).toBe(type);
        expect(block.position).toBeDefined();
        expect(block.zIndex).toBeGreaterThanOrEqual(1);
      }
    );
  });

  describe("updateBlock", () => {
    it("should update block properties", () => {
      const id = useKitesStore.getState().addBlock("text", "Original");
      
      useKitesStore.getState().updateBlock(id!, {
        content: "Updated",
        style: { fontSize: 32 },
      });
      
      const block = useKitesStore.getState().kites[0].contentBlocks[0];
      expect(block.content).toBe("Updated");
      expect(block.style?.fontSize).toBe(32);
    });

    it("should handle non-existent block", () => {
      useKitesStore.getState().addBlock("text");
      
      // Should not throw
      useKitesStore.getState().updateBlock("non-existent", { content: "Test" });
    });
  });

  describe("updateBlockPosition", () => {
    it("should update block position", () => {
      const id = useKitesStore.getState().addBlock("text");
      
      useKitesStore.getState().updateBlockPosition(id!, { x: 50, y: 50 });
      
      const block = useKitesStore.getState().kites[0].contentBlocks[0];
      expect(block.position.x).toBe(50);
      expect(block.position.y).toBe(50);
    });

    it("should preserve unupdated position properties", () => {
      const id = useKitesStore.getState().addBlock("text");
      const originalWidth = useKitesStore.getState().kites[0].contentBlocks[0].position.width;
      
      useKitesStore.getState().updateBlockPosition(id!, { x: 10 });
      
      const block = useKitesStore.getState().kites[0].contentBlocks[0];
      expect(block.position.width).toBe(originalWidth);
    });
  });

  describe("updateBlockContent", () => {
    it("should update block content", () => {
      const id = useKitesStore.getState().addBlock("text", "Original");
      
      useKitesStore.getState().updateBlockContent(id!, "New Content");
      
      expect(useKitesStore.getState().kites[0].contentBlocks[0].content).toBe("New Content");
    });

    it("should handle HTML content", () => {
      const id = useKitesStore.getState().addBlock("text");
      const htmlContent = "<b>Bold</b> and <i>italic</i> text with<br>line breaks";
      
      useKitesStore.getState().updateBlockContent(id!, htmlContent);
      
      expect(useKitesStore.getState().kites[0].contentBlocks[0].content).toBe(htmlContent);
    });

    it("should handle multiline content", () => {
      const id = useKitesStore.getState().addBlock("text");
      const multilineContent = "Line 1\nLine 2\nLine 3";
      
      useKitesStore.getState().updateBlockContent(id!, multilineContent);
      
      expect(useKitesStore.getState().kites[0].contentBlocks[0].content).toBe(multilineContent);
    });
  });

  describe("deleteBlock", () => {
    it("should delete a block", () => {
      const id = useKitesStore.getState().addBlock("text");
      expect(useKitesStore.getState().kites[0].contentBlocks).toHaveLength(1);
      
      useKitesStore.getState().deleteBlock(id!);
      
      expect(useKitesStore.getState().kites[0].contentBlocks).toHaveLength(0);
    });

    it("should clear selection when deleting selected block", () => {
      const id = useKitesStore.getState().addBlock("text");
      expect(useKitesStore.getState().selectedBlockId).toBe(id);
      
      useKitesStore.getState().deleteBlock(id!);
      
      expect(useKitesStore.getState().selectedBlockId).toBeNull();
    });

    it("should not affect selection when deleting unselected block", () => {
      const id1 = useKitesStore.getState().addBlock("text");
      const id2 = useKitesStore.getState().addBlock("text");
      useKitesStore.setState({ selectedBlockId: id2 });
      
      useKitesStore.getState().deleteBlock(id1!);
      
      expect(useKitesStore.getState().selectedBlockId).toBe(id2);
    });
  });

  describe("duplicateBlock", () => {
    it("should duplicate a block with offset position", () => {
      const id = useKitesStore.getState().addBlock("text", "Test");
      const originalBlock = useKitesStore.getState().kites[0].contentBlocks[0];
      
      const newId = useKitesStore.getState().duplicateBlock(id!);
      
      const state = useKitesStore.getState();
      expect(state.kites[0].contentBlocks).toHaveLength(2);
      
      const duplicate = state.kites[0].contentBlocks.find((b) => b.id === newId);
      expect(duplicate?.content).toBe(originalBlock.content);
      expect(duplicate?.position.x).toBe(originalBlock.position.x + 2);
      expect(duplicate?.position.y).toBe(originalBlock.position.y + 2);
    });

    it("should select duplicated block", () => {
      const id = useKitesStore.getState().addBlock("text");
      
      const newId = useKitesStore.getState().duplicateBlock(id!);
      
      expect(useKitesStore.getState().selectedBlockId).toBe(newId);
    });

    it("should return null for non-existent block", () => {
      const result = useKitesStore.getState().duplicateBlock("non-existent");
      
      expect(result).toBeNull();
    });
  });
});

describe("Store: Layer Operations", () => {
  beforeEach(() => {
    const kite = createKite();
    useKitesStore.setState({
      kites: [kite],
      currentKiteIndex: 0,
      _isLoaded: true,
    });
  });

  describe("bringToFront", () => {
    it("should increase zIndex to be highest", () => {
      const id1 = useKitesStore.getState().addBlock("text");
      const id2 = useKitesStore.getState().addBlock("text");
      const id3 = useKitesStore.getState().addBlock("text");
      
      useKitesStore.getState().bringToFront(id1!);
      
      const blocks = useKitesStore.getState().kites[0].contentBlocks;
      const block1 = blocks.find((b) => b.id === id1);
      const maxZ = Math.max(...blocks.filter((b) => b.id !== id1).map((b) => b.zIndex ?? 1));
      
      expect(block1?.zIndex).toBeGreaterThan(maxZ);
    });
  });

  describe("sendToBack", () => {
    it("should set zIndex to lowest (but >= 1)", () => {
      const id1 = useKitesStore.getState().addBlock("text");
      const id2 = useKitesStore.getState().addBlock("text");
      const id3 = useKitesStore.getState().addBlock("text");
      
      useKitesStore.getState().sendToBack(id3!);
      
      const blocks = useKitesStore.getState().kites[0].contentBlocks;
      const block3 = blocks.find((b) => b.id === id3);
      
      expect(block3?.zIndex).toBeGreaterThanOrEqual(1);
      blocks.filter((b) => b.id !== id3).forEach((b) => {
        expect(b.zIndex).toBeGreaterThan(block3!.zIndex!);
      });
    });
  });
});

describe("Store: Navigation", () => {
  beforeEach(() => {
    const kites = [createKite(), createKite(), createKite()];
    useKitesStore.setState({
      kites,
      currentKiteIndex: 1,
      selectedBlockId: null,
      _isLoaded: true,
    });
  });

  describe("goToNextKite", () => {
    it("should increment currentKiteIndex", () => {
      useKitesStore.getState().goToNextKite();
      
      expect(useKitesStore.getState().currentKiteIndex).toBe(2);
    });

    it("should not go past last kite", () => {
      useKitesStore.setState({ currentKiteIndex: 2 });
      
      useKitesStore.getState().goToNextKite();
      
      expect(useKitesStore.getState().currentKiteIndex).toBe(2);
    });

    it("should clear selected block", () => {
      useKitesStore.setState({ selectedBlockId: "some-id" });
      
      useKitesStore.getState().goToNextKite();
      
      expect(useKitesStore.getState().selectedBlockId).toBeNull();
    });
  });

  describe("goToPreviousKite", () => {
    it("should decrement currentKiteIndex", () => {
      useKitesStore.getState().goToPreviousKite();
      
      expect(useKitesStore.getState().currentKiteIndex).toBe(0);
    });

    it("should not go before first kite", () => {
      useKitesStore.setState({ currentKiteIndex: 0 });
      
      useKitesStore.getState().goToPreviousKite();
      
      expect(useKitesStore.getState().currentKiteIndex).toBe(0);
    });
  });
});

describe("Store: Theme", () => {
  it("should set theme", () => {
    useKitesStore.getState().setTheme("zombie");
    
    expect(useKitesStore.getState().currentTheme).toBe("zombie");
  });

  it("should default to sky theme", () => {
    useKitesStore.setState({ currentTheme: undefined as any });
    
    // After reset
    useKitesStore.setState({ currentTheme: "sky" });
    expect(useKitesStore.getState().currentTheme).toBe("sky");
  });
});

describe("Store: Computed Getters", () => {
  it("currentKite should return current kite", () => {
    const kites = [createKite(), createKite()];
    useKitesStore.setState({ kites, currentKiteIndex: 1, _isLoaded: true });
    
    const currentKite = useKitesStore.getState().currentKite();
    
    expect(currentKite?.id).toBe(kites[1].id);
  });

  it("currentKite should return null when no kites", () => {
    useKitesStore.setState({ kites: [], currentKiteIndex: 0, _isLoaded: true });
    
    const currentKite = useKitesStore.getState().currentKite();
    
    expect(currentKite).toBeNull();
  });

  it("selectedBlock should return selected block", () => {
    const kite = createKiteWithBlocks(2);
    useKitesStore.setState({
      kites: [kite],
      currentKiteIndex: 0,
      selectedBlockId: kite.contentBlocks[1].id,
      _isLoaded: true,
    });
    
    const selectedBlock = useKitesStore.getState().selectedBlock();
    
    expect(selectedBlock?.id).toBe(kite.contentBlocks[1].id);
  });

  it("selectedBlock should return null when nothing selected", () => {
    const kite = createKiteWithBlocks(1);
    useKitesStore.setState({
      kites: [kite],
      currentKiteIndex: 0,
      selectedBlockId: null,
      _isLoaded: true,
    });
    
    const selectedBlock = useKitesStore.getState().selectedBlock();
    
    expect(selectedBlock).toBeNull();
  });

  it("kiteCount should return correct count", () => {
    useKitesStore.setState({ kites: [createKite(), createKite(), createKite()], _isLoaded: true });
    
    expect(useKitesStore.getState().kiteCount()).toBe(3);
  });
});

describe("Store: Edge Cases", () => {
  it("should handle rapid successive operations", () => {
    useKitesStore.setState({ kites: [], _isLoaded: true });
    
    // Rapid adds
    for (let i = 0; i < 10; i++) {
      useKitesStore.getState().addKite();
    }
    
    expect(useKitesStore.getState().kites).toHaveLength(10);
    expect(useKitesStore.getState().currentKiteIndex).toBe(9);
  });

  it("should maintain state integrity after many operations", () => {
    useKitesStore.setState({ kites: [], _isLoaded: true });
    
    // Complex operation sequence
    const id1 = useKitesStore.getState().addKite();
    useKitesStore.getState().addBlock("h1", "Title");
    useKitesStore.getState().addBlock("text", "Body");
    
    const id2 = useKitesStore.getState().addKite();
    useKitesStore.getState().addBlock("h2", "Another Title");
    
    useKitesStore.getState().setCurrentKite(0);
    useKitesStore.getState().duplicateKite(id1);
    
    useKitesStore.getState().deleteKite(id2);
    
    const state = useKitesStore.getState();
    expect(state.kites.length).toBeGreaterThanOrEqual(2);
    expect(state.currentKiteIndex).toBeLessThan(state.kites.length);
  });
});
