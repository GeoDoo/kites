/**
 * Presentation Timer Tests
 * Tests observable BEHAVIOUR of the PresentationTimer component.
 * Does NOT test re-implemented copies of internal formatting/urgency logic.
 */

import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { PresentationTimer } from "@/components/Deck/PresentationTimer";
import { themes } from "@/lib/themes";

const defaultProps = {
  timerSeconds: 60,
  isActive: true,
  theme: themes.sky,
};

afterEach(() => {
  vi.clearAllMocks();
});

describe("PresentationTimer: visibility", () => {
  it("should render content when active", () => {
    const { container } = render(<PresentationTimer {...defaultProps} />);
    expect(container.textContent?.trim().length).toBeGreaterThan(0);
  });

  it("should render nothing when inactive", () => {
    const { container } = render(
      <PresentationTimer {...defaultProps} isActive={false} />
    );
    expect(container.textContent?.trim()).toBe("");
  });
});

describe("PresentationTimer: displays time", () => {
  it("should display the initial time value", () => {
    const { container } = render(
      <PresentationTimer {...defaultProps} timerSeconds={45} />
    );
    // The number 45 should appear somewhere in the output
    expect(container.textContent).toMatch(/45/);
  });

  it("should display a different value for a different timerSeconds prop", () => {
    const { container: c1 } = render(
      <PresentationTimer {...defaultProps} timerSeconds={30} />
    );
    const { container: c2 } = render(
      <PresentationTimer {...defaultProps} timerSeconds={90} />
    );
    // They should not have identical text
    expect(c1.textContent).not.toBe(c2.textContent);
  });
});

describe("PresentationTimer: countdown", () => {
  it("should count down after one second", async () => {
    vi.useFakeTimers();
    render(<PresentationTimer {...defaultProps} timerSeconds={45} />);

    expect(screen.getByText(/45/)).toBeInTheDocument();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000);
    });

    expect(screen.getByText(/44/)).toBeInTheDocument();
    vi.useRealTimers();
  });

  it("should count down progressively over several seconds", async () => {
    vi.useFakeTimers();
    render(<PresentationTimer {...defaultProps} timerSeconds={45} />);

    expect(screen.getByText(/45/)).toBeInTheDocument();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(3000);
    });

    expect(screen.getByText(/42/)).toBeInTheDocument();
    vi.useRealTimers();
  });
});

describe("PresentationTimer: urgency feedback", () => {
  it("should visually change when time gets low", () => {
    // Render with plenty of time
    const { container: normalContainer } = render(
      <PresentationTimer {...defaultProps} timerSeconds={60} />
    );
    // Render with very low time
    const { container: urgentContainer } = render(
      <PresentationTimer {...defaultProps} timerSeconds={5} />
    );

    // The class/style/content should differ for normal vs urgent
    expect(urgentContainer.innerHTML).not.toBe(normalContainer.innerHTML);
  });
});

describe("PresentationTimer: reset behaviour", () => {
  it("should reset timer when deactivated and reactivated", async () => {
    vi.useFakeTimers();
    const { rerender } = render(
      <PresentationTimer {...defaultProps} timerSeconds={45} />
    );

    // Count down 3 seconds
    await act(async () => {
      await vi.advanceTimersByTimeAsync(3000);
    });
    expect(screen.getByText(/42/)).toBeInTheDocument();

    // Deactivate then reactivate
    rerender(<PresentationTimer {...defaultProps} timerSeconds={45} isActive={false} />);
    rerender(<PresentationTimer {...defaultProps} timerSeconds={45} isActive={true} />);

    // Should show the full initial time again
    expect(screen.getByText(/45/)).toBeInTheDocument();
    vi.useRealTimers();
  });
});

describe("PresentationTimer: theme compatibility", () => {
  it("should render without errors for every registered theme", () => {
    Object.values(themes).forEach((theme) => {
      const { container } = render(
        <PresentationTimer timerSeconds={60} isActive={true} theme={theme} />
      );
      expect(container.textContent?.trim().length).toBeGreaterThan(0);
    });
  });
});
