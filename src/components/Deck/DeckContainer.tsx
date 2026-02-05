"use client";

import { useEffect, useRef, useCallback } from "react";
import { useKitesStore, useKites, useCurrentKiteIndex, useCurrentTheme } from "@/lib/store";
import { KiteView } from "./KiteView";
import { getTheme } from "@/lib/themes";
import { cn } from "@/lib/utils";

interface DeckContainerProps {
  className?: string;
  onExit?: () => void;
}

/**
 * DeckContainer Component
 * Presentation mode: renders all kites with vertical scroll-snap
 */
export function DeckContainer({ className, onExit }: DeckContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const kites = useKites();
  const currentKiteIndex = useCurrentKiteIndex();
  const setCurrentKite = useKitesStore((state) => state.setCurrentKite);
  const currentThemeId = useCurrentTheme();
  const theme = getTheme(currentThemeId);

  /**
   * Handle scroll events to update current kite index
   */
  const handleScroll = useCallback(() => {
    const container = containerRef.current;
    if (!container || kites.length === 0) return;

    const scrollTop = container.scrollTop;
    const kiteHeight = container.clientHeight;
    const newIndex = Math.round(scrollTop / kiteHeight);

    if (newIndex !== currentKiteIndex && newIndex >= 0 && newIndex < kites.length) {
      setCurrentKite(newIndex);
    }
  }, [kites.length, currentKiteIndex, setCurrentKite]);

  /**
   * Scroll to kite when currentKiteIndex changes programmatically
   */
  useEffect(() => {
    const container = containerRef.current;
    if (!container || kites.length === 0) return;

    const targetScrollTop = currentKiteIndex * container.clientHeight;
    const currentScrollTop = container.scrollTop;

    if (Math.abs(targetScrollTop - currentScrollTop) > 10) {
      container.scrollTo({
        top: targetScrollTop,
        behavior: "smooth",
      });
    }
  }, [currentKiteIndex, kites.length]);

  /**
   * Handle keyboard navigation
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const { goToNextKite, goToPreviousKite } = useKitesStore.getState();

      switch (e.key) {
        case "Escape":
          e.preventDefault();
          onExit?.();
          break;
        case "ArrowDown":
        case "ArrowRight":
        case " ":
        case "PageDown":
          e.preventDefault();
          goToNextKite();
          break;
        case "ArrowUp":
        case "ArrowLeft":
        case "PageUp":
          e.preventDefault();
          goToPreviousKite();
          break;
        case "Home":
          e.preventDefault();
          setCurrentKite(0);
          break;
        case "End":
          e.preventDefault();
          setCurrentKite(kites.length - 1);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [kites.length, setCurrentKite, onExit]);

  if (kites.length === 0) {
    return (
      <div
        className={cn(
          "h-screen w-full flex items-center justify-center",
          className
        )}
        style={{ 
          backgroundColor: theme.colors.background,
          color: theme.colors.textMuted 
        }}
      >
        <div className="text-center space-y-4">
          <p className="text-2xl font-light">No kites to present</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className={cn(
        "h-screen w-full overflow-y-scroll",
        "snap-y snap-mandatory",
        "scroll-smooth",
        className
      )}
      style={{
        scrollSnapType: "y mandatory",
        overscrollBehavior: "contain",
        backgroundColor: theme.colors.background,
      }}
    >
      {kites.map((kite, index) => (
        <KiteView
          key={kite.id}
          kite={kite}
          index={index}
          isActive={index === currentKiteIndex}
          theme={theme}
        />
      ))}
    </div>
  );
}
