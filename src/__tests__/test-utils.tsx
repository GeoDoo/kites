/**
 * Test Utilities
 * Helpers for rendering components and testing store
 */

import React, { ReactElement } from "react";
import { render, RenderOptions } from "@testing-library/react";
import { useKitesStore } from "@/lib/store";
import type { Kite } from "@/lib/types";

// ============================================
// STORE TEST UTILITIES
// ============================================

/**
 * Reset the store to its initial state
 */
export function resetStore() {
  useKitesStore.setState({
    kites: [],
    currentKiteIndex: 0,
    selectedBlockId: null,
    currentTheme: "sky",
    _isLoaded: true, // Mark as loaded for tests
  });
}

/**
 * Initialize store with test kites
 */
export function initializeStoreWithKites(kites: Kite[], theme: string = "sky") {
  useKitesStore.setState({
    kites,
    currentKiteIndex: 0,
    selectedBlockId: null,
    currentTheme: theme,
    _isLoaded: true,
  });
}

/**
 * Get current store state
 */
export function getStoreState() {
  return useKitesStore.getState();
}

/**
 * Get specific store action
 */
export function getStoreAction<K extends keyof ReturnType<typeof useKitesStore.getState>>(
  action: K
): ReturnType<typeof useKitesStore.getState>[K] {
  return useKitesStore.getState()[action];
}

// ============================================
// RENDER UTILITIES
// ============================================

/**
 * Custom render with providers
 */
function customRender(
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) {
  // Reset store before each render
  resetStore();
  
  return render(ui, {
    ...options,
  });
}

export * from "@testing-library/react";
export { customRender as render };

// ============================================
// ASSERTION HELPERS
// ============================================

/**
 * Assert that a kite exists in the store
 */
export function expectKiteExists(kiteId: string) {
  const state = getStoreState();
  const kite = state.kites.find(k => k.id === kiteId);
  if (!kite) {
    throw new Error(`Expected kite with id "${kiteId}" to exist`);
  }
  return kite;
}

/**
 * Assert that a block exists in the current kite
 */
export function expectBlockExists(blockId: string) {
  const state = getStoreState();
  const currentKite = state.kites[state.currentKiteIndex];
  if (!currentKite) {
    throw new Error("No current kite exists");
  }
  const block = currentKite.contentBlocks.find(b => b.id === blockId);
  if (!block) {
    throw new Error(`Expected block with id "${blockId}" to exist in current kite`);
  }
  return block;
}

/**
 * Assert kite count
 */
export function expectKiteCount(count: number) {
  const state = getStoreState();
  if (state.kites.length !== count) {
    throw new Error(`Expected ${count} kites, got ${state.kites.length}`);
  }
}

/**
 * Assert block count in current kite
 */
export function expectBlockCount(count: number) {
  const state = getStoreState();
  const currentKite = state.kites[state.currentKiteIndex];
  const actual = currentKite?.contentBlocks.length || 0;
  if (actual !== count) {
    throw new Error(`Expected ${count} blocks, got ${actual}`);
  }
}

// ============================================
// TIMING UTILITIES
// ============================================

/**
 * Wait for a condition to be true
 */
export async function waitFor(
  condition: () => boolean,
  timeout: number = 5000,
  interval: number = 50
): Promise<void> {
  const start = Date.now();
  while (!condition()) {
    if (Date.now() - start > timeout) {
      throw new Error("Timeout waiting for condition");
    }
    await new Promise(resolve => setTimeout(resolve, interval));
  }
}

/**
 * Wait for store state to match
 */
export async function waitForStoreState(
  predicate: (state: ReturnType<typeof getStoreState>) => boolean,
  timeout: number = 5000
): Promise<void> {
  await waitFor(() => predicate(getStoreState()), timeout);
}

// ============================================
// MOCK UTILITIES
// ============================================

/**
 * Create a mock for fetch that returns test data
 */
export function mockFetch(data: unknown) {
  return vi.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve(data),
  });
}

/**
 * Create a mock for fetch that fails
 */
export function mockFetchError(error: string = "Network error") {
  return vi.fn().mockRejectedValue(new Error(error));
}
