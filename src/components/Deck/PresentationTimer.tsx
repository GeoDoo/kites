"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { type KiteTheme } from "@/lib/themes";

interface PresentationTimerProps {
  timerSeconds: number;
  isActive: boolean;
  theme: KiteTheme;
}

/**
 * PresentationTimer Component
 * Simple countdown timer for presentation mode
 * Shows time remaining per kite
 */
export function PresentationTimer({ timerSeconds, isActive, theme }: PresentationTimerProps) {
  const [timeLeft, setTimeLeft] = useState(timerSeconds);
  const [isExpired, setIsExpired] = useState(false);

  // Reset when kite becomes active
  useEffect(() => {
    if (isActive) {
      setTimeLeft(timerSeconds);
      setIsExpired(false);
    }
  }, [isActive, timerSeconds]);

  // Countdown timer
  useEffect(() => {
    if (!isActive || isExpired) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsExpired(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, isExpired]);

  if (!isActive) return null;

  // Determine urgency level
  const isUrgent = timeLeft <= 10;
  const isWarning = timeLeft <= 30 && timeLeft > 10;

  // Get theme-appropriate colors
  const getTimerStyle = () => {
    if (isExpired) {
      return {
        bg: "bg-red-600/90",
        text: "text-white",
        border: "border-red-400",
      };
    }
    if (isUrgent) {
      return {
        bg: "bg-red-500/80",
        text: "text-white",
        border: "border-red-400",
      };
    }
    if (isWarning) {
      return {
        bg: "bg-amber-500/80",
        text: "text-white",
        border: "border-amber-400",
      };
    }
    // Normal state - use theme colors
    return {
      bg: "bg-black/50",
      text: "text-white",
      border: "border-white/20",
    };
  };

  const style = getTimerStyle();

  // Format time
  const formatTime = (seconds: number) => {
    if (seconds >= 60) {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}:${secs.toString().padStart(2, "0")}`;
    }
    return `${seconds}s`;
  };

  return (
    <div className="fixed top-4 left-4 z-40">
      <div
        className={cn(
          "px-3 py-2 rounded-lg border backdrop-blur-sm",
          "font-mono text-sm font-medium",
          "transition-all duration-300",
          style.bg,
          style.text,
          style.border,
          isUrgent && "animate-pulse"
        )}
      >
        <div className="flex items-center gap-2">
          <span>{isExpired ? "⏰" : isUrgent ? "⚠️" : "⏱️"}</span>
          <span>
            {isExpired ? "Time's up!" : formatTime(timeLeft)}
          </span>
        </div>
      </div>
    </div>
  );
}
