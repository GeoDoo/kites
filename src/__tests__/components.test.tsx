/**
 * Component Tests
 * Tests for React components — asserts on BEHAVIOUR, not implementation strings.
 */

import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { ZombieAttack } from "@/components/Deck/ZombieAttack";
import type { ZombieAttackConfig } from "@/lib/themes";

afterEach(() => {
  vi.clearAllMocks();
});

describe("ZombieAttack Component", () => {
  const defaultConfig: ZombieAttackConfig = {
    enabled: true,
  };

  const defaultProps = {
    config: defaultConfig,
    timerSeconds: 60,
    isActive: true,
    onAttack: vi.fn(),
    onReset: vi.fn(),
  };

  describe("visibility", () => {
    it("should render content when active and enabled", () => {
      const { container } = render(<ZombieAttack {...defaultProps} />);
      // Something should be visible
      expect(container.textContent?.length).toBeGreaterThan(0);
    });

    it("should render nothing when inactive", () => {
      const { container } = render(
        <ZombieAttack {...defaultProps} isActive={false} />
      );
      expect(container.textContent?.trim()).toBe("");
    });

    it("should render nothing when config is disabled", () => {
      const { container } = render(
        <ZombieAttack
          {...defaultProps}
          config={{ enabled: false }}
        />
      );
      expect(container.textContent?.trim()).toBe("");
    });
  });

  describe("countdown behaviour", () => {
    it("should display the initial time", () => {
      const { container } = render(
        <ZombieAttack {...defaultProps} timerSeconds={5} />
      );
      // The number 5 should appear somewhere in the rendered output
      expect(container.textContent).toMatch(/5/);
    });

    it("should count down over time", async () => {
      vi.useFakeTimers();
      const { container } = render(
        <ZombieAttack {...defaultProps} timerSeconds={5} />
      );

      await vi.advanceTimersByTimeAsync(1000);
      expect(container.textContent).toMatch(/4/);

      await vi.advanceTimersByTimeAsync(1000);
      expect(container.textContent).toMatch(/3/);
      vi.useRealTimers();
    });

    it("should visually change when time is critically low", async () => {
      vi.useFakeTimers();
      const { container } = render(
        <ZombieAttack {...defaultProps} timerSeconds={4} />
      );
      const initialHTML = container.innerHTML;

      await vi.advanceTimersByTimeAsync(2000); // now at 2s
      const lowTimeHTML = container.innerHTML;

      // The rendered output should differ (styling/class/content change)
      expect(lowTimeHTML).not.toBe(initialHTML);
      vi.useRealTimers();
    });
  });

  describe("attack callback", () => {
    it("should call onAttack when timer reaches 0", async () => {
      vi.useFakeTimers();
      const onAttack = vi.fn();
      render(
        <ZombieAttack {...defaultProps} timerSeconds={2} onAttack={onAttack} />
      );

      await vi.advanceTimersByTimeAsync(2000);
      expect(onAttack).toHaveBeenCalledTimes(1);
      vi.useRealTimers();
    });

    it("should pass a string attack type to onAttack", async () => {
      vi.useFakeTimers();
      const onAttack = vi.fn();
      render(
        <ZombieAttack {...defaultProps} timerSeconds={1} onAttack={onAttack} />
      );

      await vi.advanceTimersByTimeAsync(1000);
      expect(onAttack).toHaveBeenCalledWith(expect.any(String));
      vi.useRealTimers();
    });

    it("should not call onAttack before timer expires", async () => {
      vi.useFakeTimers();
      const onAttack = vi.fn();
      render(
        <ZombieAttack {...defaultProps} timerSeconds={5} onAttack={onAttack} />
      );

      await vi.advanceTimersByTimeAsync(3000);
      expect(onAttack).not.toHaveBeenCalled();
      vi.useRealTimers();
    });
  });

  describe("attack visual feedback", () => {
    it("should change visual output after timer expires", async () => {
      vi.useFakeTimers();
      const { container } = render(
        <ZombieAttack {...defaultProps} timerSeconds={1} />
      );
      const beforeAttack = container.innerHTML;

      await vi.advanceTimersByTimeAsync(1000);
      const afterAttack = container.innerHTML;

      expect(afterAttack).not.toBe(beforeAttack);
      vi.useRealTimers();
    });
  });

  describe("zombie horde", () => {
    it("should render zombie visuals after initialisation", async () => {
      vi.useFakeTimers();
      const { container } = render(
        <ZombieAttack {...defaultProps} isActive={true} />
      );

      // Wait for the ready delay
      await vi.advanceTimersByTimeAsync(100);

      // Should contain zombie emoji characters somewhere in the output
      expect(container.textContent).toMatch(/🧟/);
      vi.useRealTimers();
    });
  });

  describe("reset on activation", () => {
    it("should reset timer when becoming active again", () => {
      const { rerender, container } = render(
        <ZombieAttack {...defaultProps} timerSeconds={10} isActive={false} />
      );

      rerender(
        <ZombieAttack {...defaultProps} timerSeconds={10} isActive={true} />
      );

      // Should display the full initial time
      expect(container.textContent).toMatch(/10/);
    });
  });
});

