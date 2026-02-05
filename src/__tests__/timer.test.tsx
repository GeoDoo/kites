/**
 * Presentation Timer Tests
 * Tests for the timer functionality across all themes
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { PresentationTimer } from "@/components/Deck/PresentationTimer";
import { themes } from "@/lib/themes";

// Default props for PresentationTimer
const defaultProps = {
  timerSeconds: 60,
  isActive: true,
  theme: themes.sky,
};

describe("PresentationTimer Component", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("rendering", () => {
    it("should render timer when active", () => {
      render(<PresentationTimer {...defaultProps} />);
      
      // 60s formats as 1:00
      expect(screen.getByText(/1:00/)).toBeInTheDocument();
    });

    it("should not render when inactive", () => {
      render(<PresentationTimer {...defaultProps} isActive={false} />);
      
      expect(screen.queryByText(/60/)).not.toBeInTheDocument();
    });

    it("should show time in seconds format for < 60s", () => {
      render(<PresentationTimer {...defaultProps} timerSeconds={45} />);
      
      expect(screen.getByText(/45s/)).toBeInTheDocument();
    });

    it("should show time in mm:ss format for >= 60s", () => {
      render(<PresentationTimer {...defaultProps} timerSeconds={90} />);
      
      expect(screen.getByText(/1:30/)).toBeInTheDocument();
    });

    it("should show time in mm:ss format for exactly 60s", () => {
      render(<PresentationTimer {...defaultProps} timerSeconds={60} />);
      
      expect(screen.getByText(/1:00/)).toBeInTheDocument();
    });

    it("should show clock emoji when time is normal", () => {
      render(<PresentationTimer {...defaultProps} timerSeconds={60} />);
      
      expect(screen.getByText(/⏱️/)).toBeInTheDocument();
    });
  });

  describe("countdown", () => {
    it("should display initial time", () => {
      render(<PresentationTimer {...defaultProps} timerSeconds={45} />);
      
      expect(screen.getByText(/45s/)).toBeInTheDocument();
    });

    it("should display initial time for longer durations", () => {
      render(<PresentationTimer {...defaultProps} timerSeconds={90} />);
      
      expect(screen.getByText(/1:30/)).toBeInTheDocument();
    });
  });

  describe("urgency states", () => {
    it("should show warning emoji when time is urgent (<= 10s)", () => {
      // Start directly at 10 seconds to test urgent state
      render(<PresentationTimer {...defaultProps} timerSeconds={10} />);
      
      // Should show ⚠️ when urgent
      expect(screen.getByText(/⚠️/)).toBeInTheDocument();
    });

    it("should show clock emoji when time is normal (> 10s)", () => {
      render(<PresentationTimer {...defaultProps} timerSeconds={30} />);
      
      // Should show ⏱️ when normal
      expect(screen.getByText(/⏱️/)).toBeInTheDocument();
    });
  });

  describe("reset on activation", () => {
    it("should reset timer when becoming active", () => {
      const { rerender } = render(
        <PresentationTimer {...defaultProps} timerSeconds={30} isActive={false} />
      );
      
      // Activate
      rerender(<PresentationTimer {...defaultProps} timerSeconds={30} isActive={true} />);
      
      expect(screen.getByText(/30s/)).toBeInTheDocument();
    });

    it("should reset timer when timerSeconds changes while active", async () => {
      vi.useFakeTimers();
      const { rerender } = render(
        <PresentationTimer {...defaultProps} timerSeconds={10} />
      );
      
      await vi.advanceTimersByTimeAsync(3000); // Now at 7s
      expect(screen.getByText(/7s/)).toBeInTheDocument();
      
      // Simulate moving to new slide (reactivate with same time)
      rerender(<PresentationTimer {...defaultProps} timerSeconds={10} isActive={false} />);
      rerender(<PresentationTimer {...defaultProps} timerSeconds={10} isActive={true} />);
      
      expect(screen.getByText(/10s/)).toBeInTheDocument();
      vi.useRealTimers();
    });
  });

  describe("theme compatibility", () => {
    it.each(Object.keys(themes))("should render with %s theme", (themeId) => {
      const theme = themes[themeId];
      render(
        <PresentationTimer
          timerSeconds={60}
          isActive={true}
          theme={theme}
        />
      );
      
      expect(screen.getByText(/1:00/)).toBeInTheDocument();
    });
  });
});

describe("Timer Calculation Logic", () => {
  // Helper to calculate timer seconds (mirrors KiteView logic)
  const calculateTimerSeconds = (totalTalkMinutes: number, totalKites: number): number => {
    return Math.floor((totalTalkMinutes * 60) / totalKites);
  };

  it("should calculate 30s per kite for 25 min talk with 50 kites", () => {
    expect(calculateTimerSeconds(25, 50)).toBe(30);
  });

  it("should calculate 60s per kite for 25 min talk with 25 kites", () => {
    expect(calculateTimerSeconds(25, 25)).toBe(60);
  });

  it("should calculate 150s per kite for 25 min talk with 10 kites", () => {
    expect(calculateTimerSeconds(25, 10)).toBe(150);
  });

  it("should calculate 1500s per kite for 25 min talk with 1 kite", () => {
    expect(calculateTimerSeconds(25, 1)).toBe(1500);
  });

  it("should handle 30 minute talk", () => {
    expect(calculateTimerSeconds(30, 30)).toBe(60);
  });

  it("should handle 15 minute talk", () => {
    expect(calculateTimerSeconds(15, 15)).toBe(60);
  });

  it("should floor fractional seconds", () => {
    // 25 min = 1500s, divided by 7 = 214.28... -> 214
    expect(calculateTimerSeconds(25, 7)).toBe(214);
  });
});

describe("Timer Time Formatting", () => {
  // Helper function that mirrors the formatting logic
  const formatTime = (seconds: number): string => {
    if (seconds >= 60) {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}:${secs.toString().padStart(2, "0")}`;
    }
    return `${seconds}s`;
  };

  it("should format seconds under 60 with 's' suffix", () => {
    expect(formatTime(45)).toBe("45s");
    expect(formatTime(1)).toBe("1s");
    expect(formatTime(0)).toBe("0s");
  });

  it("should format 60+ seconds as mm:ss", () => {
    expect(formatTime(60)).toBe("1:00");
    expect(formatTime(90)).toBe("1:30");
    expect(formatTime(125)).toBe("2:05");
  });

  it("should pad seconds with zero in mm:ss format", () => {
    expect(formatTime(61)).toBe("1:01");
    expect(formatTime(69)).toBe("1:09");
    expect(formatTime(120)).toBe("2:00");
  });

  it("should handle large values", () => {
    expect(formatTime(600)).toBe("10:00");
    expect(formatTime(3600)).toBe("60:00");
  });
});

describe("Timer Urgency Levels", () => {
  // Helper to determine urgency (mirrors component logic)
  const getUrgencyLevel = (
    timeLeft: number,
    isExpired: boolean
  ): "expired" | "urgent" | "warning" | "normal" => {
    if (isExpired) return "expired";
    if (timeLeft <= 10) return "urgent";
    if (timeLeft <= 30) return "warning";
    return "normal";
  };

  it("should return 'normal' for time > 30s", () => {
    expect(getUrgencyLevel(60, false)).toBe("normal");
    expect(getUrgencyLevel(31, false)).toBe("normal");
  });

  it("should return 'warning' for time between 11-30s", () => {
    expect(getUrgencyLevel(30, false)).toBe("warning");
    expect(getUrgencyLevel(20, false)).toBe("warning");
    expect(getUrgencyLevel(11, false)).toBe("warning");
  });

  it("should return 'urgent' for time <= 10s", () => {
    expect(getUrgencyLevel(10, false)).toBe("urgent");
    expect(getUrgencyLevel(5, false)).toBe("urgent");
    expect(getUrgencyLevel(1, false)).toBe("urgent");
  });

  it("should return 'expired' when isExpired is true", () => {
    expect(getUrgencyLevel(0, true)).toBe("expired");
    // Even with time left, if marked expired
    expect(getUrgencyLevel(10, true)).toBe("expired");
  });
});
