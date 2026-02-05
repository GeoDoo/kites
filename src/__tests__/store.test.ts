/**
 * Store Unit Tests
 * Tests for Zustand store CRUD operations and state management
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { useKitesStore } from "@/lib/store";
import { createKite, createKiteWithBlocks } from "./fixtures";

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
      const kite1 = createKite();
      const kite2 = createKite();
      const kite3 = createKite();
      const kites = [kite1, kite2, kite3];
      useKitesStore.setState({ kites });
      
      useKitesStore.getState().reorderKites(0, 2);
      
      const state = useKitesStore.getState();
      expect(state.kites[0].id).toBe(kite2.id);
      expect(state.kites[1].id).toBe(kite3.id);
      expect(state.kites[2].id).toBe(kite1.id);
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

    it("should update kite timestamp when adding a block", () => {
      const originalTime = useKitesStore.getState().kites[0].updatedAt;

      vi.useFakeTimers();
      vi.advanceTimersByTime(1000);

      useKitesStore.getState().addBlock("text");

      const newTime = useKitesStore.getState().kites[0].updatedAt;
      expect(newTime).not.toBe(originalTime);

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
      useKitesStore.getState().addBlock("text");
      useKitesStore.getState().addBlock("text");
      
      useKitesStore.getState().bringToFront(id1!);
      
      const blocks = useKitesStore.getState().kites[0].contentBlocks;
      const block1 = blocks.find((b) => b.id === id1);
      const maxZ = Math.max(...blocks.filter((b) => b.id !== id1).map((b) => b.zIndex ?? 1));
      
      expect(block1?.zIndex).toBeGreaterThan(maxZ);
    });
  });

  describe("sendToBack", () => {
    it("should set zIndex to lowest (but >= 1)", () => {
      useKitesStore.getState().addBlock("text");
      useKitesStore.getState().addBlock("text");
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

  it("should start with sky as the default theme", () => {
    // The beforeEach resets to sky — verify that baseline
    expect(useKitesStore.getState().currentTheme).toBe("sky");
  });
});

describe("Store: Title", () => {
  it("should set title", () => {
    useKitesStore.getState().setTitle("My Awesome Presentation");
    
    expect(useKitesStore.getState().title).toBe("My Awesome Presentation");
  });

  it("should default to 'Untitled Presentation'", () => {
    expect(useKitesStore.getState().title).toBe("Untitled Presentation");
  });

  it("should handle empty title", () => {
    useKitesStore.getState().setTitle("");
    
    expect(useKitesStore.getState().title).toBe("");
  });

  it("should handle title with special characters", () => {
    const specialTitle = "My Presentation: Part 1 — The Beginning!";
    useKitesStore.getState().setTitle(specialTitle);
    
    expect(useKitesStore.getState().title).toBe(specialTitle);
  });

  it("should handle unicode in title", () => {
    const unicodeTitle = "🧟 Zombie Apocalypse 🧟‍♂️";
    useKitesStore.getState().setTitle(unicodeTitle);
    
    expect(useKitesStore.getState().title).toBe(unicodeTitle);
  });

  it("should handle long titles", () => {
    const longTitle = "A".repeat(500);
    useKitesStore.getState().setTitle(longTitle);
    
    expect(useKitesStore.getState().title).toBe(longTitle);
  });
});

describe("Store: Speaker Notes", () => {
  it("should update speaker notes for a kite", () => {
    const kite = createKite();
    useKitesStore.setState({ kites: [kite], _isLoaded: true });
    
    useKitesStore.getState().updateSpeakerNotes(kite.id, "These are my notes");
    
    const updatedKite = useKitesStore.getState().kites[0];
    expect(updatedKite.speakerNotes).toBe("These are my notes");
  });

  it("should handle empty speaker notes", () => {
    const kite = createKite();
    kite.speakerNotes = "Existing notes";
    useKitesStore.setState({ kites: [kite], _isLoaded: true });
    
    useKitesStore.getState().updateSpeakerNotes(kite.id, "");
    
    expect(useKitesStore.getState().kites[0].speakerNotes).toBe("");
  });

  it("should update notes for the correct kite", () => {
    const kite1 = createKite();
    const kite2 = createKite();
    useKitesStore.setState({ kites: [kite1, kite2], _isLoaded: true });
    
    useKitesStore.getState().updateSpeakerNotes(kite2.id, "Notes for kite 2");
    
    expect(useKitesStore.getState().kites[0].speakerNotes).toBeUndefined();
    expect(useKitesStore.getState().kites[1].speakerNotes).toBe("Notes for kite 2");
  });

  it("should handle multiline notes", () => {
    const kite = createKite();
    useKitesStore.setState({ kites: [kite], _isLoaded: true });
    
    const multilineNotes = "Line 1\nLine 2\nLine 3\n\nWith empty line";
    useKitesStore.getState().updateSpeakerNotes(kite.id, multilineNotes);
    
    expect(useKitesStore.getState().kites[0].speakerNotes).toBe(multilineNotes);
  });

  it("should handle special characters in notes", () => {
    const kite = createKite();
    useKitesStore.setState({ kites: [kite], _isLoaded: true });
    
    const specialNotes = "Notes with <html> & special \"characters\" 'quotes' 🎉";
    useKitesStore.getState().updateSpeakerNotes(kite.id, specialNotes);
    
    expect(useKitesStore.getState().kites[0].speakerNotes).toBe(specialNotes);
  });

  it("should update kite timestamp when notes change", () => {
    const kite = createKite();
    const originalTime = kite.updatedAt;
    useKitesStore.setState({ kites: [kite], _isLoaded: true });

    vi.useFakeTimers();
    vi.advanceTimersByTime(1000);

    useKitesStore.getState().updateSpeakerNotes(kite.id, "New notes");

    const updatedKite = useKitesStore.getState().kites[0];
    expect(updatedKite.updatedAt).not.toBe(originalTime);
    expect(updatedKite.speakerNotes).toBe("New notes");

    vi.useRealTimers();
  });

  it("should not affect other kite properties when updating notes", () => {
    const kite = createKiteWithBlocks(2);
    kite.backgroundColor = "#ff0000";
    useKitesStore.setState({ kites: [kite], _isLoaded: true });
    
    useKitesStore.getState().updateSpeakerNotes(kite.id, "Notes");
    
    const updatedKite = useKitesStore.getState().kites[0];
    expect(updatedKite.contentBlocks).toHaveLength(2);
    expect(updatedKite.backgroundColor).toBe("#ff0000");
    expect(updatedKite.speakerNotes).toBe("Notes");
  });

  it("should handle non-existent kite ID gracefully", () => {
    const kite = createKite();
    useKitesStore.setState({ kites: [kite], _isLoaded: true });
    
    // This should not throw
    useKitesStore.getState().updateSpeakerNotes("non-existent-id", "Notes");
    
    // Original kite should be unchanged
    expect(useKitesStore.getState().kites[0].speakerNotes).toBeUndefined();
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
