"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { EditorLayout } from "@/components/Editor";
import { DeckContainer } from "@/components/Deck";
import { useKitesStore, useKites, useCurrentKiteIndex } from "@/lib/store";

// Check and clear corrupted storage on load
function checkAndClearStorage() {
  if (typeof window === "undefined") return;
  
  try {
    // Test if we can write to localStorage
    const testKey = "__storage_test__";
    localStorage.setItem(testKey, "test");
    localStorage.removeItem(testKey);
  } catch (e) {
    // Storage is full or corrupted - clear kites-storage
    console.warn("Storage issue detected, clearing kites-storage...");
    try {
      localStorage.removeItem("kites-storage");
      window.location.reload();
    } catch {
      // If even that fails, clear everything
      localStorage.clear();
      window.location.reload();
    }
  }
}

function PresentationView({ onExit }: { onExit: () => void }) {
  const kites = useKites();
  const currentKiteIndex = useCurrentKiteIndex();
  const { goToNextKite, goToPreviousKite } = useKitesStore();

  const canGoPrev = currentKiteIndex > 0;
  const canGoNext = currentKiteIndex < kites.length - 1;

  return (
    <div className="relative bg-white">
      {/* Exit button */}
      <button
        onClick={onExit}
        className="fixed top-4 right-4 z-50 px-4 py-2 rounded-xl bg-slate-900/50 text-white hover:bg-slate-900/70 transition-colors backdrop-blur-sm text-sm font-medium"
      >
        Exit (Esc)
      </button>

      {/* Navigation arrows */}
      {kites.length > 1 && (
        <>
          {/* Previous button */}
          <button
            onClick={goToPreviousKite}
            disabled={!canGoPrev}
            className={`fixed left-4 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full backdrop-blur-sm transition-all ${
              canGoPrev 
                ? "bg-slate-900/50 text-white hover:bg-slate-900/70 cursor-pointer" 
                : "bg-slate-900/20 text-white/30 cursor-not-allowed"
            }`}
          >
            <ChevronLeft size={32} />
          </button>

          {/* Next button */}
          <button
            onClick={goToNextKite}
            disabled={!canGoNext}
            className={`fixed right-4 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full backdrop-blur-sm transition-all ${
              canGoNext 
                ? "bg-slate-900/50 text-white hover:bg-slate-900/70 cursor-pointer" 
                : "bg-slate-900/20 text-white/30 cursor-not-allowed"
            }`}
          >
            <ChevronRight size={32} />
          </button>

          {/* Slide counter */}
          <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-slate-900/50 text-white backdrop-blur-sm text-sm font-medium">
            {currentKiteIndex + 1} / {kites.length}
          </div>
        </>
      )}

      <DeckContainer onExit={onExit} />
    </div>
  );
}

export default function Home() {
  const [mode, setMode] = useState<"editor" | "present">("editor");

  // Check storage on mount
  useEffect(() => {
    checkAndClearStorage();
  }, []);

  // Enter fullscreen presentation mode
  const enterPresentMode = useCallback(async () => {
    try {
      await document.documentElement.requestFullscreen();
      setMode("present");
    } catch (err) {
      // Fallback if fullscreen fails (e.g., user denied)
      setMode("present");
    }
  }, []);

  // Exit presentation mode
  const exitPresentMode = useCallback(async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      }
    } catch (err) {
      // Ignore errors
    }
    setMode("editor");
  }, []);

  // Listen for fullscreen changes (e.g., user presses Esc)
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && mode === "present") {
        setMode("editor");
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, [mode]);

  if (mode === "present") {
    return <PresentationView onExit={exitPresentMode} />;
  }

  return <EditorLayout onPresentMode={enterPresentMode} />;
}
