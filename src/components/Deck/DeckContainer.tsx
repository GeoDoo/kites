"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { useKitesStore, useKites, useCurrentKiteIndex, useCurrentTheme, useTotalDurationMinutes } from "@/lib/store";
import { KiteView } from "./KiteView";
import { getTheme, resolveThemeForKite, resolveKiteDurations } from "@/lib/themes";
import { cn } from "@/lib/utils";

interface DeckContainerProps {
  className?: string;
  onExit?: () => void;
  timerStarted?: boolean;
}

/**
 * DeckContainer Component
 * Presentation mode: renders all kites with vertical scroll-snap
 */
export function DeckContainer({ className, onExit, timerStarted = true }: DeckContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInitialMount = useRef(true);
  const isScrolling = useRef(false);
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);
  const [isReady, setIsReady] = useState(false);
  const kites = useKites();
  const currentKiteIndex = useCurrentKiteIndex();
  const setCurrentKite = useKitesStore((state) => state.setCurrentKite);
  const currentThemeId = useCurrentTheme();
  const totalDurationMinutes = useTotalDurationMinutes();
  const theme = getTheme(currentThemeId);
  const isHybrid = currentThemeId === "hybrid";
  const kiteDurations = resolveKiteDurations(totalDurationMinutes, kites, isHybrid);

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
   * Initial scroll to current kite (instant, no animation)
   */
  useEffect(() => {
    const container = containerRef.current;
    if (!container || kites.length === 0) return;

    // On initial mount, scroll instantly to the current kite
    if (isInitialMount.current) {
      const targetScrollTop = currentKiteIndex * container.clientHeight;
      container.scrollTo({
        top: targetScrollTop,
        behavior: "instant",
      });
      isInitialMount.current = false;
      // Small delay to prevent flash of wrong slide
      requestAnimationFrame(() => {
        setIsReady(true);
      });
    }
  }, [currentKiteIndex, kites.length]);

  /**
   * Scroll to kite when currentKiteIndex changes programmatically (after initial mount)
   * Uses instant scroll to prevent flutter - CSS snap handles the visual smoothness
   */
  useEffect(() => {
    const container = containerRef.current;
    if (!container || kites.length === 0 || isInitialMount.current) return;

    const targetScrollTop = currentKiteIndex * container.clientHeight;
    const currentScrollTop = container.scrollTop;

    if (Math.abs(targetScrollTop - currentScrollTop) > 10) {
      // Use instant scroll - CSS scroll-snap provides visual smoothness
      container.scrollTo({
        top: targetScrollTop,
        behavior: "instant",
      });
    }
  }, [currentKiteIndex, kites.length]);

  /**
   * Handle keyboard navigation with scroll lock to prevent rapid-fire
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const { goToNextKite, goToPreviousKite } = useKitesStore.getState();

      // Handle escape immediately
      if (e.key === "Escape") {
        e.preventDefault();
        onExit?.();
        return;
      }
      
      // Block navigation if currently scrolling (prevents rapid-fire jumpiness)
      if (isScrolling.current) {
        e.preventDefault();
        return;
      }

      // Navigation keys
      switch (e.key) {
        case "ArrowDown":
        case "ArrowRight":
        case " ":
        case "PageDown":
          e.preventDefault();
          isScrolling.current = true;
          goToNextKite();
          break;
        case "ArrowUp":
        case "ArrowLeft":
        case "PageUp":
          e.preventDefault();
          isScrolling.current = true;
          goToPreviousKite();
          break;
        case "Home":
          e.preventDefault();
          isScrolling.current = true;
          setCurrentKite(0);
          break;
        case "End":
          e.preventDefault();
          isScrolling.current = true;
          setCurrentKite(kites.length - 1);
          break;
      }

      // Clear scroll lock after a short delay (prevents rapid-fire)
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }
      scrollTimeout.current = setTimeout(() => {
        isScrolling.current = false;
      }, 150); // Short delay to prevent rapid-fire without feeling sluggish
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }
    };
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
    <div className="relative h-screen w-full">
      {/* Main presentation area */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className={cn(
          "h-full w-full overflow-y-scroll",
          "snap-y snap-mandatory",
          // Hide until we've scrolled to the correct position
          !isReady && "opacity-0",
          isReady && "opacity-100 transition-opacity duration-150",
          className
        )}
        style={{
          scrollSnapType: "y mandatory",
          overscrollBehavior: "contain",
          backgroundColor: theme.colors.background,
        }}
      >
        {kites.map((kite, index) => {
          // In Hybrid mode, each kite resolves its own theme
          const kiteTheme = resolveThemeForKite(currentThemeId, kite.themeOverride);
          return (
            <KiteView
              key={kite.id}
              kite={kite}
              index={index}
              isActive={index === currentKiteIndex}
              theme={kiteTheme}
              timerSeconds={kiteDurations[index] ?? 60}
              timerStarted={timerStarted}
            />
          );
        })}
      </div>

    </div>
  );
}
