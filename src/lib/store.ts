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

// Force immediate save (used before page unload)
let pendingSaveData: { kites: any[]; currentKiteIndex: number; currentTheme: string } | null = null;

async function saveToAPI(data: { kites: Kite[]; currentKiteIndex: number; currentTheme: string }) {
  try {
    // Debug: Log the actual content being saved
    data.kites.forEach((kite, i) => {
      kite.contentBlocks.forEach((block, j) => {
        console.log(`📦 Saving Kite ${i} Block ${j} (${block.type}): ${block.content.length} chars`);
        if (block.type === 'text') {
          console.log(`   Content preview: "${block.content.slice(0, 100)}${block.content.length > 100 ? '...' : ''}"`);
        }
      });
    });
    
    const response = await fetch("/api/kites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (response.ok) {
      console.log("✅ Saved to database:", data.kites.length, "kites");
    } else {
      console.error("❌ Save failed with status:", response.status);
    }
  } catch (error) {
    console.error("❌ Failed to save:", error);
  }
}

function debouncedSave(data: { kites: Kite[]; currentKiteIndex: number; currentTheme: string }) {
  pendingSaveData = data; // Track pending save
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    saveToAPI(data);
    pendingSaveData = null;
  }, SAVE_DELAY);
}

// Save immediately before page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    if (pendingSaveData) {
      // Use sendBeacon for reliable save on page unload
      navigator.sendBeacon('/api/kites', JSON.stringify(pendingSaveData));
    }
  });
}

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
  _isLoaded: boolean;

  // Data Loading
  loadFromAPI: () => Promise<void>;

  // Theme
  setTheme: (themeId: string) => void;

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
        _isLoaded: false,

        // Load from API
        loadFromAPI: async () => {
          try {
            const response = await fetch("/api/kites");
            const data = await response.json();
            
            // Debug: Log the actual content being loaded
            console.log("🔵 Loading from API:", data.kites?.length || 0, "kites");
            data.kites?.forEach((kite: any, i: number) => {
              kite.contentBlocks?.forEach((block: any, j: number) => {
                console.log(`📥 Loaded Kite ${i} Block ${j} (${block.type}): ${block.content?.length || 0} chars`);
                if (block.type === 'text') {
                  console.log(`   Content: "${block.content?.slice(0, 150)}${block.content?.length > 150 ? '...' : ''}"`);
                }
              });
            });
            
            set((state) => {
              state.kites = data.kites || [];
              state.currentKiteIndex = data.currentKiteIndex || 0;
              state.currentTheme = data.currentTheme || "sky";
              state._isLoaded = true;
            });
            
            console.log("✅ Loaded from database:", data.kites?.length || 0, "kites");
          } catch (error) {
            console.error("Failed to load from API:", error);
            set({ _isLoaded: true }); // Still mark as loaded so app can function
          }
        },

        // Theme setter
        setTheme: (themeId) => {
          set({ currentTheme: themeId });
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

        // Layer actions - all z-indexes must be >= 1 to stay above slide background
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
    _isLoaded: state._isLoaded 
  }),
  (current, previous) => {
    // Don't save until initial load is complete
    if (!current._isLoaded) {
      console.log("⏳ Waiting for load before saving...");
      return;
    }
    
    // Only save if data actually changed (not just selection or load state)
    const kitesChanged = current.kites !== previous.kites;
    const indexChanged = current.currentKiteIndex !== previous.currentKiteIndex;
    const themeChanged = current.currentTheme !== previous.currentTheme;
    
    if (kitesChanged || indexChanged || themeChanged) {
      console.log("📝 State changed, scheduling save...", { kitesChanged, indexChanged, themeChanged });
      debouncedSave({
        kites: current.kites,
        currentKiteIndex: current.currentKiteIndex,
        currentTheme: current.currentTheme,
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

// Keep old name for backwards compatibility
export const useHasHydrated = () =>
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
