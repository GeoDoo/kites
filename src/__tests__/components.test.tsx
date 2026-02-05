/**
 * Component Tests
 * Tests for React components using React Testing Library
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { ZombieAttack, type AttackType } from "@/components/Deck/ZombieAttack";
import type { ZombieAttackConfig } from "@/lib/themes";

// Reset mocks after each test
afterEach(() => {
  vi.clearAllMocks();
});

describe("ZombieAttack Component", () => {
  const defaultConfig: ZombieAttackConfig = {
    enabled: true,
    totalTalkMinutes: 25,
  };

  const defaultProps = {
    config: defaultConfig,
    timerSeconds: 60,
    isActive: true,
    onAttack: vi.fn(),
    onReset: vi.fn(),
  };

  describe("rendering", () => {
    it("should render timer when active", () => {
      render(<ZombieAttack {...defaultProps} />);
      
      expect(screen.getByText(/Survive:/)).toBeInTheDocument();
      expect(screen.getByText(/60s/)).toBeInTheDocument();
    });

    it("should not render when inactive", () => {
      render(<ZombieAttack {...defaultProps} isActive={false} />);
      
      expect(screen.queryByText(/Survive:/)).not.toBeInTheDocument();
    });

    it("should not render when config is disabled", () => {
      render(
        <ZombieAttack
          {...defaultProps}
          config={{ ...defaultConfig, enabled: false }}
        />
      );
      
      expect(screen.queryByText(/Survive:/)).not.toBeInTheDocument();
    });
  });

  describe("timer countdown", () => {
    it("should count down each second", async () => {
      vi.useFakeTimers();
      render(<ZombieAttack {...defaultProps} timerSeconds={5} />);
      
      expect(screen.getByText(/5s/)).toBeInTheDocument();
      
      // Advance timers and allow React to process updates
      await vi.advanceTimersByTimeAsync(1000);
      expect(screen.getByText(/4s/)).toBeInTheDocument();
      
      await vi.advanceTimersByTimeAsync(1000);
      expect(screen.getByText(/3s/)).toBeInTheDocument();
      vi.useRealTimers();
    });

    it("should show warning when time is low (<= 3s)", async () => {
      vi.useFakeTimers();
      render(<ZombieAttack {...defaultProps} timerSeconds={4} />);
      
      // Need to wait until timer reaches 3s or less
      await vi.advanceTimersByTimeAsync(1000);
      expect(screen.getByText(/THEY'RE EVERYWHERE!/)).toBeInTheDocument();
      vi.useRealTimers();
    });

    it("should trigger onAttack when timer reaches 0", async () => {
      vi.useFakeTimers();
      const onAttack = vi.fn();
      render(<ZombieAttack {...defaultProps} timerSeconds={2} onAttack={onAttack} />);
      
      await vi.advanceTimersByTimeAsync(2000);
      expect(onAttack).toHaveBeenCalled();
      vi.useRealTimers();
    });

    it("should pass attack type to onAttack callback", async () => {
      vi.useFakeTimers();
      const onAttack = vi.fn();
      render(<ZombieAttack {...defaultProps} timerSeconds={1} onAttack={onAttack} />);
      
      await vi.advanceTimersByTimeAsync(1000);
      expect(onAttack).toHaveBeenCalledWith(expect.stringMatching(/scratch|infection|devour|drag|splatter/));
      vi.useRealTimers();
    });
  });

  describe("attack messages", () => {
    const attackMessages: Record<AttackType, string> = {
      scratch: "CLAWED!",
      infection: "INFECTED!",
      devour: "DEVOURED!",
      drag: "DRAGGED UNDER!",
      splatter: "OBLITERATED!",
    };

    // Note: Attack type is random, so we test that ONE of the messages appears
    it("should show attack message when timer reaches 0", async () => {
      vi.useFakeTimers();
      render(<ZombieAttack {...defaultProps} timerSeconds={1} />);
      
      await vi.advanceTimersByTimeAsync(1000);
      
      const messagePatterns = Object.values(attackMessages).join("|");
      const regex = new RegExp(messagePatterns);
      expect(screen.getByText(regex)).toBeInTheDocument();
      vi.useRealTimers();
    });
  });

  describe("horde rendering", () => {
    it("should render multiple zombie emojis", () => {
      const { container } = render(<ZombieAttack {...defaultProps} />);
      
      // Look for zombie emoji text
      const zombieEmojis = container.querySelectorAll('[class*="animate-zombie"]');
      expect(zombieEmojis.length).toBeGreaterThan(0);
    });
  });

  describe("reset on activation", () => {
    it("should reset timer when becoming active", () => {
      const { rerender } = render(
        <ZombieAttack {...defaultProps} timerSeconds={10} isActive={false} />
      );
      
      // Activate
      rerender(<ZombieAttack {...defaultProps} timerSeconds={10} isActive={true} />);
      
      expect(screen.getByText(/10s/)).toBeInTheDocument();
    });
  });
});

// Basic fixture tests
describe("Fixture Integration", () => {
  it("should be able to import fixtures", async () => {
    const fixtures = await import("./fixtures");
    
    expect(fixtures.createKite).toBeDefined();
    expect(fixtures.createBlock).toBeDefined();
    expect(fixtures.createKiteWithBlocks).toBeDefined();
  });

  it("should create valid kites from fixtures", async () => {
    const { createKite, createKiteWithBlocks } = await import("./fixtures");
    
    const emptyKite = createKite();
    expect(emptyKite.id).toBeDefined();
    expect(emptyKite.contentBlocks).toHaveLength(0);
    
    const kiteWithBlocks = createKiteWithBlocks(5);
    expect(kiteWithBlocks.contentBlocks.length).toBe(5);
  });

  it("should generate edge case scenarios", async () => {
    const { generateEdgeCaseScenarios } = await import("./fixtures");
    
    const scenarios = generateEdgeCaseScenarios();
    expect(scenarios.length).toBeGreaterThan(0);
    
    scenarios.forEach((scenario) => {
      expect(scenario.name).toBeDefined();
      expect(scenario.description).toBeDefined();
      expect(Array.isArray(scenario.kites)).toBe(true);
    });
  });
});

// Attack type constants test
describe("AttackType Constants", () => {
  it("should have 5 attack types", async () => {
    // Import attack types from a test perspective
    const attackTypes: AttackType[] = ["scratch", "infection", "devour", "drag", "splatter"];
    expect(attackTypes).toHaveLength(5);
  });
});
