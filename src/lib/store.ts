import { create } from "zustand";
import { devtools, subscribeWithSelector } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import {
  type Kite,
  type ContentBlock,
  type BlockPosition,
  type BlockType,
} from "./types";

// Debounce helper for saving
let saveTimeout: NodeJS.Timeout | null = null;
const SAVE_DELAY = 300; // ms - save quickly after changes

type SavePayload = { kites: Kite[]; currentKiteIndex: number; currentTheme: string; title: string; totalDurationMinutes: number };

// Always holds the latest unsaved data — only cleared after a successful save
let pendingSaveData: SavePayload | null = null;

async function saveToAPI(data: SavePayload) {
  try {
    const response = await fetch("/api/kites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (response.ok) {
      // Only clear pending data if this save was for the latest version
      // (a newer debouncedSave may have arrived while this fetch was in-flight)
      if (pendingSaveData === data) {
        pendingSaveData = null;
      }
      // If live sync toggle is on, write back to talk-data.ts source
      syncToSourceIfEnabled(data.kites);
    } else {
      console.error("Save failed with status:", response.status);
    }
  } catch (error) {
    console.error("Failed to save:", error);
  }
}

/** Fire-and-forget sync to talk-data.ts when the localStorage toggle is on */
function syncToSourceIfEnabled(kites: Kite[]) {
  try {
    if (typeof window === "undefined") return;
    if (localStorage.getItem("kites-sync-to-source") !== "true") return;
    fetch("/api/sync-talk-data", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kites }),
    }).catch(() => {
      // Silent — this is a dev convenience, not critical
    });
  } catch {
    // localStorage may throw in some contexts
  }
}

function debouncedSave(data: SavePayload) {
  pendingSaveData = data;
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    saveToAPI(data);
  }, SAVE_DELAY);
}

// Flush pending save before page unload / tab switch
if (typeof window !== 'undefined') {
  const flushSave = () => {
    if (pendingSaveData) {
      const blob = new Blob([JSON.stringify(pendingSaveData)], { type: 'application/json' });
      navigator.sendBeacon('/api/kites', blob);
      pendingSaveData = null;
    }
  };

  window.addEventListener('beforeunload', flushSave);

  // Also flush when the tab becomes hidden (covers navigation, tab switch, app switch)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      flushSave();
    }
  });
}

// ─── Undo / Redo history ──────────────────────────────────────────────────────
// Kept outside Zustand state to avoid triggering auto-save or re-renders.

const MAX_HISTORY = 80;
type UndoSnapshot = string; // JSON-stringified kites array

let undoStack: UndoSnapshot[] = [];
let redoStack: UndoSnapshot[] = [];

/**
 * Generate a UUID v4
 */
function generateId(): string {
  return crypto.randomUUID();
}

/**
 * Create a new empty Kite
 */
function createKite(): Kite {
  const now = new Date().toISOString();
  return {
    id: generateId(),
    contentBlocks: [],
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Create a new content block with default position
 * Images default to z-index 1 (background layer)
 * Text elements default to z-index 10 (foreground layer)
 */
function createBlock(
  type: BlockType,
  content: string = "",
  position?: Partial<BlockPosition>
): ContentBlock {
  const defaults: Record<BlockType, { position: BlockPosition; content: string; style?: ContentBlock["style"]; zIndex: number }> = {
    h1: {
      position: { x: 10, y: 40, width: 80, height: 20 },
      content: content || "Heading 1",
      style: { fontSize: 72, fontWeight: "bold", textAlign: "center" },
      zIndex: 10,
    },
    h2: {
      position: { x: 10, y: 40, width: 80, height: 15 },
      content: content || "Heading 2",
      style: { fontSize: 56, fontWeight: "bold", textAlign: "center" },
      zIndex: 10,
    },
    h3: {
      position: { x: 10, y: 40, width: 80, height: 12 },
      content: content || "Heading 3",
      style: { fontSize: 40, fontWeight: "semibold", textAlign: "center" },
      zIndex: 10,
    },
    h4: {
      position: { x: 10, y: 40, width: 80, height: 10 },
      content: content || "Heading 4",
      style: { fontSize: 32, fontWeight: "semibold", textAlign: "center" },
      zIndex: 10,
    },
    text: {
      position: { x: 10, y: 50, width: 80, height: 15 },
      content: content || "Click to edit text",
      style: { fontSize: 24, textAlign: "left" },
      zIndex: 10,
    },
    image: {
      position: { x: 25, y: 20, width: 50, height: 60 },
      content: content || "",
      zIndex: 1, // Images default to background layer
    },
  };

  const defaultConfig = defaults[type];

  return {
    id: generateId(),
    type,
    position: { ...defaultConfig.position, ...position },
    content: content || defaultConfig.content,
    style: defaultConfig.style,
    zIndex: defaultConfig.zIndex,
  };
}

/**
 * Kites Store State
 */
interface KitesState {
  // State
  kites: Kite[];
  currentKiteIndex: number;
  selectedBlockId: string | null;
  currentTheme: string;
  title: string;
  totalDurationMinutes: number;
  _isLoaded: boolean;

  // Data Loading
  loadFromAPI: () => Promise<void>;

  // Title
  setTitle: (title: string) => void;

  // Theme
  setTheme: (themeId: string) => void;

  // Duration
  setTotalDuration: (minutes: number) => void;
  updateKiteDuration: (kiteId: string, seconds: number | undefined) => void;

  // Computed
  currentKite: () => Kite | null;
  selectedBlock: () => ContentBlock | null;
  kiteCount: () => number;

  // Kite Actions
  addKite: () => string;
  deleteKite: (id: string) => void;
  reorderKites: (fromIndex: number, toIndex: number) => void;
  setCurrentKite: (index: number) => void;
  duplicateKite: (id: string) => string | null;
  updateKiteBackground: (kiteId: string, color: string) => void;
  updateSpeakerNotes: (kiteId: string, notes: string) => void;
  updateKiteThemeOverride: (kiteId: string, themeId: string | undefined) => void;

  // Block Actions
  addBlock: (type: BlockType, content?: string) => string | null;
  updateBlock: (blockId: string, updates: Partial<ContentBlock>) => void;
  updateBlockPosition: (blockId: string, position: Partial<BlockPosition>) => void;
  updateBlockContent: (blockId: string, content: string) => void;
  deleteBlock: (blockId: string) => void;
  selectBlock: (blockId: string | null) => void;
  duplicateBlock: (blockId: string) => string | null;
  
  // Layer Actions
  bringToFront: (blockId: string) => void;
  sendToBack: (blockId: string) => void;

  // Navigation
  goToNextKite: () => void;
  goToPreviousKite: () => void;

  // Undo / Redo
  snapshot: () => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;

  // Utility
  clearAllKites: () => void;
  initializeIfEmpty: () => void;
}

/**
 * Zustand store for Kites management
 */
export const useKitesStore = create<KitesState>()(
  devtools(
    subscribeWithSelector(
      immer((set, get) => ({
        // Initial state
        kites: [],
        currentKiteIndex: 0,
        selectedBlockId: null,
        currentTheme: "sky",
        title: "Untitled Presentation",
        totalDurationMinutes: 25,
        _isLoaded: false,

        // Load from API
        loadFromAPI: async () => {
          try {
            const response = await fetch("/api/kites");
            const data = await response.json();

            set((state) => {
              const kites = data.kites ?? [];
              state.kites = kites;
              state.currentKiteIndex = Math.max(
                0,
                Math.min(data.currentKiteIndex ?? 0, kites.length - 1)
              );
              state.currentTheme = data.currentTheme ?? "sky";
              state.title = data.title ?? "Untitled Presentation";
              state.totalDurationMinutes = data.totalDurationMinutes ?? 25;
              state._isLoaded = true;
            });
          } catch (error) {
            console.error("Failed to load from API:", error);
            set((state) => {
              state._isLoaded = true;
            });
          }
        },

        // Title setter
        setTitle: (title) => {
          set({ title });
        },

        // Theme setter
        setTheme: (themeId) => {
          set({ currentTheme: themeId });
        },

        // Duration
        setTotalDuration: (minutes) => {
          set({ totalDurationMinutes: Math.max(1, minutes) });
        },

        updateKiteDuration: (kiteId, seconds) => {
          set((state) => {
            const kite = state.kites.find((k) => k.id === kiteId);
            if (kite) {
              kite.durationOverride = seconds;
              kite.updatedAt = new Date().toISOString();
            }
          });
        },

        // Computed getters
        currentKite: () => {
          const { kites, currentKiteIndex } = get();
          return kites[currentKiteIndex] ?? null;
        },

        selectedBlock: () => {
          const { kites, currentKiteIndex, selectedBlockId } = get();
          const kite = kites[currentKiteIndex];
          if (!kite || !selectedBlockId) return null;
          return kite.contentBlocks.find((b) => b.id === selectedBlockId) ?? null;
        },

        kiteCount: () => get().kites.length,

        // Kite Actions
        addKite: () => {
          const kite = createKite();
          set((state) => {
            state.kites.push(kite);
            state.currentKiteIndex = state.kites.length - 1;
            state.selectedBlockId = null;
          });
          return kite.id;
        },

        deleteKite: (id) => {
          set((state) => {
            const index = state.kites.findIndex((k) => k.id === id);
            if (index !== -1) {
              state.kites.splice(index, 1);
              if (state.currentKiteIndex >= state.kites.length && state.kites.length > 0) {
                state.currentKiteIndex = Math.max(0, state.kites.length - 1);
              }
              state.selectedBlockId = null;
            }
          });
        },

        reorderKites: (fromIndex, toIndex) => {
          set((state) => {
            const { kites } = state;
            if (
              fromIndex < 0 ||
              fromIndex >= kites.length ||
              toIndex < 0 ||
              toIndex >= kites.length
            ) {
              return;
            }
            const [removed] = kites.splice(fromIndex, 1);
            kites.splice(toIndex, 0, removed);

            if (state.currentKiteIndex === fromIndex) {
              state.currentKiteIndex = toIndex;
            }
          });
        },

        setCurrentKite: (index) => {
          set((state) => {
            const clampedIndex = Math.max(0, Math.min(index, state.kites.length - 1));
            state.currentKiteIndex = clampedIndex;
            state.selectedBlockId = null;
          });
        },

        duplicateKite: (id) => {
          const { kites } = get();
          const index = kites.findIndex((k) => k.id === id);
          if (index === -1) return null;

          const original = kites[index];
          const duplicate: Kite = {
            ...original,
            id: generateId(),
            contentBlocks: original.contentBlocks.map((b) => ({ ...b, id: generateId() })),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          set((state) => {
            state.kites.splice(index + 1, 0, duplicate);
            state.currentKiteIndex = index + 1;
          });

          return duplicate.id;
        },

        updateKiteBackground: (kiteId, color) => {
          set((state) => {
            const kite = state.kites.find((k) => k.id === kiteId);
            if (kite) {
              kite.backgroundColor = color;
              kite.updatedAt = new Date().toISOString();
            }
          });
        },

        updateSpeakerNotes: (kiteId, notes) => {
          set((state) => {
            const kite = state.kites.find((k) => k.id === kiteId);
            if (kite) {
              kite.speakerNotes = notes;
              kite.updatedAt = new Date().toISOString();
            }
          });
        },

        updateKiteThemeOverride: (kiteId, themeId) => {
          set((state) => {
            const kite = state.kites.find((k) => k.id === kiteId);
            if (kite) {
              kite.themeOverride = themeId;
              kite.updatedAt = new Date().toISOString();
            }
          });
        },

        // Block Actions
        addBlock: (type, content) => {
          const { currentKiteIndex, kites } = get();
          if (currentKiteIndex < 0 || currentKiteIndex >= kites.length) return null;

          const block = createBlock(type, content);
          set((state) => {
            state.kites[state.currentKiteIndex].contentBlocks.push(block);
            state.kites[state.currentKiteIndex].updatedAt = new Date().toISOString();
            state.selectedBlockId = block.id;
          });
          return block.id;
        },

        updateBlock: (blockId, updates) => {
          set((state) => {
            const kite = state.kites[state.currentKiteIndex];
            if (!kite) return;
            const block = kite.contentBlocks.find((b) => b.id === blockId);
            if (block) {
              Object.assign(block, updates);
              kite.updatedAt = new Date().toISOString();
            }
          });
        },

        updateBlockPosition: (blockId, position) => {
          set((state) => {
            const kite = state.kites[state.currentKiteIndex];
            if (!kite) return;
            const block = kite.contentBlocks.find((b) => b.id === blockId);
            if (block) {
              block.position = { ...block.position, ...position };
              kite.updatedAt = new Date().toISOString();
            }
          });
        },

        updateBlockContent: (blockId, content) => {
          set((state) => {
            const kite = state.kites[state.currentKiteIndex];
            if (!kite) return;
            const block = kite.contentBlocks.find((b) => b.id === blockId);
            if (block) {
              block.content = content;
              kite.updatedAt = new Date().toISOString();
            }
          });
        },

        deleteBlock: (blockId) => {
          set((state) => {
            const kite = state.kites[state.currentKiteIndex];
            if (!kite) return;
            const index = kite.contentBlocks.findIndex((b) => b.id === blockId);
            if (index !== -1) {
              kite.contentBlocks.splice(index, 1);
              kite.updatedAt = new Date().toISOString();
              if (state.selectedBlockId === blockId) {
                state.selectedBlockId = null;
              }
            }
          });
        },

        selectBlock: (blockId) => {
          set((state) => {
            state.selectedBlockId = blockId;
          });
        },

        duplicateBlock: (blockId) => {
          const { currentKiteIndex, kites } = get();
          const kite = kites[currentKiteIndex];
          if (!kite) return null;

          const block = kite.contentBlocks.find((b) => b.id === blockId);
          if (!block) return null;

          const duplicate: ContentBlock = {
            ...block,
            id: generateId(),
            position: {
              ...block.position,
              x: block.position.x + 2,
              y: block.position.y + 2,
            },
          };

          set((state) => {
            state.kites[state.currentKiteIndex].contentBlocks.push(duplicate);
            state.selectedBlockId = duplicate.id;
          });

          return duplicate.id;
        },

        // Layer actions - all z-indexes must be >= 1 to stay above kite background
        bringToFront: (blockId) => {
          set((state) => {
            const kite = state.kites[state.currentKiteIndex];
            if (!kite) return;
            
            // Find the max zIndex (minimum 1)
            const maxZ = Math.max(1, ...kite.contentBlocks.map(b => b.zIndex ?? 1));
            
            const block = kite.contentBlocks.find(b => b.id === blockId);
            if (block) {
              block.zIndex = maxZ + 1;
            }
          });
        },

        sendToBack: (blockId) => {
          set((state) => {
            const kite = state.kites[state.currentKiteIndex];
            if (!kite) return;
            
            // Find the min zIndex (minimum 1 to stay above background)
            const minZ = Math.min(...kite.contentBlocks.map(b => b.zIndex ?? 1));
            
            const block = kite.contentBlocks.find(b => b.id === blockId);
            if (block) {
              // Set to 1 less than current min, but never below 1
              // Instead, shift all other elements up and set this one to 1
              if (minZ <= 1) {
                // Shift all other blocks up by 1
                kite.contentBlocks.forEach(b => {
                  if (b.id !== blockId) {
                    b.zIndex = (b.zIndex ?? 1) + 1;
                  }
                });
                block.zIndex = 1;
              } else {
                block.zIndex = minZ - 1;
              }
            }
          });
        },

        // Navigation
        goToNextKite: () => {
          set((state) => {
            if (state.currentKiteIndex < state.kites.length - 1) {
              state.currentKiteIndex++;
              state.selectedBlockId = null;
            }
          });
        },

        goToPreviousKite: () => {
          set((state) => {
            if (state.currentKiteIndex > 0) {
              state.currentKiteIndex--;
              state.selectedBlockId = null;
            }
          });
        },

        // Undo / Redo
        snapshot: () => {
          const kites = get().kites;
          const snap = JSON.stringify(kites);
          // Don't push if identical to the last snapshot
          if (undoStack.length > 0 && undoStack[undoStack.length - 1] === snap) return;
          undoStack.push(snap);
          if (undoStack.length > MAX_HISTORY) undoStack.shift();
          // Any new action clears the redo stack
          redoStack = [];
        },

        undo: () => {
          if (undoStack.length === 0) return;
          // Save current state to redo stack
          const currentSnap = JSON.stringify(get().kites);
          redoStack.push(currentSnap);
          // Pop the last snapshot
          const prev = undoStack.pop()!;
          const restored = JSON.parse(prev) as Kite[];
          set((state) => {
            state.kites = restored;
            // Clamp currentKiteIndex
            if (state.currentKiteIndex >= restored.length) {
              state.currentKiteIndex = Math.max(0, restored.length - 1);
            }
            state.selectedBlockId = null;
          });
        },

        redo: () => {
          if (redoStack.length === 0) return;
          // Save current state to undo stack
          const currentSnap = JSON.stringify(get().kites);
          undoStack.push(currentSnap);
          // Pop from redo
          const next = redoStack.pop()!;
          const restored = JSON.parse(next) as Kite[];
          set((state) => {
            state.kites = restored;
            if (state.currentKiteIndex >= restored.length) {
              state.currentKiteIndex = Math.max(0, restored.length - 1);
            }
            state.selectedBlockId = null;
          });
        },

        canUndo: () => undoStack.length > 0,
        canRedo: () => redoStack.length > 0,

        // Utility
        clearAllKites: () => {
          set((state) => {
            state.kites = [];
            state.currentKiteIndex = 0;
            state.selectedBlockId = null;
          });
        },

        // Initialize with default kite if empty (call only after loading)
        initializeIfEmpty: () => {
          const { kites, addKite, addBlock } = get();
          if (kites.length === 0) {
            addKite();
            setTimeout(() => {
              addBlock("h1", "Welcome to Kites");
            }, 0);
          }
        },
      }))
    ),
    { name: "KitesStore" }
  )
);

// Subscribe to state changes and auto-save (excluding selected block changes)
// Only save after initial load is complete to avoid overwriting with empty state
useKitesStore.subscribe(
  (state) => ({ 
    kites: state.kites, 
    currentKiteIndex: state.currentKiteIndex, 
    currentTheme: state.currentTheme,
    title: state.title,
    totalDurationMinutes: state.totalDurationMinutes,
    _isLoaded: state._isLoaded 
  }),
  (current, previous) => {
    if (!current._isLoaded) return;

    const kitesChanged = current.kites !== previous.kites;
    const indexChanged = current.currentKiteIndex !== previous.currentKiteIndex;
    const themeChanged = current.currentTheme !== previous.currentTheme;
    const titleChanged = current.title !== previous.title;
    const durationChanged = current.totalDurationMinutes !== previous.totalDurationMinutes;
    
    if (kitesChanged || indexChanged || themeChanged || titleChanged || durationChanged) {
      debouncedSave({
        kites: current.kites,
        currentKiteIndex: current.currentKiteIndex,
        currentTheme: current.currentTheme,
        title: current.title,
        totalDurationMinutes: current.totalDurationMinutes,
      });
    }
  }
);

// Selector hooks
export const useCurrentKite = () =>
  useKitesStore((state) => state.kites[state.currentKiteIndex] ?? null);

export const useKites = () => useKitesStore((state) => state.kites);

export const useKiteCount = () => useKitesStore((state) => state.kites.length);

export const useCurrentKiteIndex = () =>
  useKitesStore((state) => state.currentKiteIndex);

export const useIsLoaded = () =>
  useKitesStore((state) => state._isLoaded);

export const useSelectedBlock = () => {
  const kites = useKitesStore((state) => state.kites);
  const currentIndex = useKitesStore((state) => state.currentKiteIndex);
  const selectedId = useKitesStore((state) => state.selectedBlockId);
  
  const kite = kites[currentIndex];
  if (!kite || !selectedId) return null;
  return kite.contentBlocks.find((b) => b.id === selectedId) ?? null;
};

export const useCurrentTheme = () =>
  useKitesStore((state) => state.currentTheme);

export const useTitle = () =>
  useKitesStore((state) => state.title);

export const useTotalDurationMinutes = () =>
  useKitesStore((state) => state.totalDurationMinutes);
