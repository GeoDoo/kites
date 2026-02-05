"use client";

import { useEffect, useState, useRef } from "react";
import { useKitesStore, useKites, useIsLoaded, useCurrentTheme } from "@/lib/store";
import { KiteList } from "./KiteList";
import { KiteCanvas } from "./KiteCanvas";
import { ElementToolbar } from "./ElementToolbar";
import { ThemeSelector } from "./ThemeSelector";
import { cn } from "@/lib/utils";
import { Play, Moon, Sun, Wind, Download, Loader2 } from "lucide-react";
import { exportToPDF } from "@/lib/export-pdf";

interface EditorLayoutProps {
  onPresentMode?: () => void;
}

/**
 * EditorLayout Component
 * Main layout with kite list sidebar and large canvas area
 */
export function EditorLayout({ onPresentMode }: EditorLayoutProps) {
  const kites = useKites();
  const isLoaded = useIsLoaded();
  const loadFromAPI = useKitesStore((state) => state.loadFromAPI);
  const initializeIfEmpty = useKitesStore((state) => state.initializeIfEmpty);
  const themeId = useCurrentTheme();
  const [isDark, setIsDark] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState({ current: 0, total: 0 });
  const hasLoadedRef = useRef(false);

  // Load data from database on mount (only once)
  useEffect(() => {
    if (!hasLoadedRef.current) {
      hasLoadedRef.current = true;
      loadFromAPI();
    }
  }, [loadFromAPI]);

  // Initialize with one kite if empty - ONLY after loading from DB
  useEffect(() => {
    if (isLoaded && kites.length === 0) {
      initializeIfEmpty();
    }
  }, [isLoaded, kites.length, initializeIfEmpty]);

  // Toggle dark mode
  const toggleDarkMode = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle("dark");
  };

  // Export to PDF
  const handleExportPDF = async () => {
    if (isExporting || kites.length === 0) return;
    
    setIsExporting(true);
    setExportProgress({ current: 0, total: kites.length });
    try {
      await exportToPDF(kites, themeId, {
        filename: "kites-presentation.pdf",
        onProgress: (current, total) => {
          setExportProgress({ current, total });
        },
      });
    } catch (error) {
      console.error("Export failed:", error);
      const message = error instanceof Error ? error.message : "Unknown error";
      alert(`Export failed: ${message}`);
    } finally {
      setIsExporting(false);
      setExportProgress({ current: 0, total: 0 });
    }
  };

  // Show loading state until data is loaded
  if (!isLoaded) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gradient-to-br from-sky-50 to-white">
        <div className="flex items-center gap-2 text-sky-400">
          <Wind className="animate-pulse" size={24} />
          <span className="font-light">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("h-screen w-screen flex flex-col", "bg-gradient-to-br from-sky-50 to-slate-50")}>
      {/* Top bar */}
      <header className="h-14 flex-shrink-0 flex items-center justify-between px-4 border-b border-sky-100 bg-white/70 backdrop-blur-md relative z-50">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Wind className="text-sky-500" size={24} />
            <h1 className="text-xl font-bold bg-gradient-to-r from-sky-600 to-sky-400 bg-clip-text text-transparent">
              Kites
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Theme selector */}
          <ThemeSelector />

          {/* Dark mode toggle */}
          <button
            onClick={toggleDarkMode}
            className={cn(
              "p-2 rounded-lg",
              "text-slate-500 hover:text-slate-700",
              "hover:bg-sky-50",
              "transition-colors"
            )}
            title={isDark ? "Light mode" : "Dark mode"}
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* Export PDF button */}
          {kites.length > 0 && (
            <button
              onClick={handleExportPDF}
              disabled={isExporting}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-xl",
                "border border-sky-200 text-sky-600",
                "hover:bg-sky-50 hover:border-sky-300",
                "transition-all text-sm font-medium",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
              title="Export to PDF"
            >
              {isExporting ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Download size={16} />
              )}
              {isExporting 
                ? `${exportProgress.current}/${exportProgress.total}` 
                : "PDF"}
            </button>
          )}

          {/* Present button */}
          {onPresentMode && kites.length > 0 && (
            <button
              onClick={onPresentMode}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl",
                "bg-gradient-to-r from-sky-500 to-sky-400 text-white",
                "hover:from-sky-600 hover:to-sky-500",
                "transition-all text-sm font-medium shadow-sm hover:shadow-md"
              )}
            >
              <Play size={16} />
              Present
            </button>
          )}
        </div>
      </header>

      {/* Element toolbar */}
      <div className="relative z-50">
        <ElementToolbar />
      </div>

      {/* Main content area */}
      <div className="flex-1 flex overflow-hidden relative z-0">
        {/* Left sidebar - Kite list */}
        <aside className="w-48 flex-shrink-0">
          <KiteList />
        </aside>

        {/* Main canvas area */}
        <main className="flex-1 overflow-hidden">
          <KiteCanvas />
        </main>
      </div>
    </div>
  );
}
