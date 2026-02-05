"use client";

import { useEffect, useState, useRef } from "react";
import { useKitesStore, useKites, useIsLoaded, useCurrentTheme, useTitle } from "@/lib/store";
import { KiteList } from "./KiteList";
import { KiteCanvas } from "./KiteCanvas";
import { ElementToolbar } from "./ElementToolbar";
import { ThemeSelector } from "./ThemeSelector";
import { cn } from "@/lib/utils";
import { Play, Moon, Sun, Wind, Download, Loader2, ChevronDown, FileText, FileSpreadsheet, ExternalLink } from "lucide-react";
import { exportToPDF } from "@/lib/export-pdf";
import { exportToPPTX } from "@/lib/export-pptx";

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
  const title = useTitle();
  const setTitle = useKitesStore((state) => state.setTitle);
  const [isDark, setIsDark] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState({ current: 0, total: 0 });
  const [exportType, setExportType] = useState<"pdf" | "pptx" | "gslides" | null>(null);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(title);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const exportMenuRef = useRef<HTMLDivElement>(null);
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

  // Sync edited title when title changes from store
  useEffect(() => {
    setEditedTitle(title);
  }, [title]);

  // Focus input when editing starts
  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [isEditingTitle]);

  // Handle title edit
  const handleTitleClick = () => {
    setIsEditingTitle(true);
  };

  const handleTitleBlur = () => {
    setIsEditingTitle(false);
    const newTitle = editedTitle.trim() || "Untitled Presentation";
    setTitle(newTitle);
    setEditedTitle(newTitle);
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleTitleBlur();
    } else if (e.key === "Escape") {
      setEditedTitle(title);
      setIsEditingTitle(false);
    }
  };

  // Toggle dark mode
  const toggleDarkMode = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle("dark");
  };

  // Close export menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target as Node)) {
        setShowExportMenu(false);
      }
    };
    
    if (showExportMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showExportMenu]);

  // Export to PDF
  const handleExportPDF = async () => {
    if (isExporting || kites.length === 0) return;
    
    setIsExporting(true);
    setExportType("pdf");
    setExportProgress({ current: 0, total: kites.length });
    setShowExportMenu(false);
    
    try {
      const sanitizedTitle = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "") || "presentation";
      
      await exportToPDF(kites, themeId, {
        filename: `${sanitizedTitle}.pdf`,
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
      setExportType(null);
      setExportProgress({ current: 0, total: 0 });
    }
  };

  // Export to PPTX
  const handleExportPPTX = async () => {
    if (isExporting || kites.length === 0) return;
    
    setIsExporting(true);
    setExportType("pptx");
    setExportProgress({ current: 0, total: kites.length });
    setShowExportMenu(false);
    
    try {
      await exportToPPTX(kites, themeId, title, {
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
      setExportType(null);
      setExportProgress({ current: 0, total: 0 });
    }
  };

  // Export to Google Slides (PPTX + open Google Slides)
  const handleExportGoogleSlides = async () => {
    if (isExporting || kites.length === 0) return;
    
    setIsExporting(true);
    setExportType("gslides");
    setExportProgress({ current: 0, total: kites.length });
    setShowExportMenu(false);
    
    let exportSuccess = false;
    
    try {
      // Export as PPTX first
      await exportToPPTX(kites, themeId, title, {
        onProgress: (current, total) => {
          setExportProgress({ current, total });
        },
      });
      exportSuccess = true;
    } catch (error) {
      console.error("Export failed:", error);
      const message = error instanceof Error ? error.message : "Unknown error";
      alert(`Export failed: ${message}`);
    } finally {
      setIsExporting(false);
      setExportType(null);
      setExportProgress({ current: 0, total: 0 });
    }
    
    // Show instructions and open Google Slides after export completes
    if (exportSuccess) {
      alert(
        "✅ PPTX file downloaded!\n\n" +
        "To import into Google Slides:\n" +
        "1. Google Slides will open in a new tab\n" +
        "2. Click 'Blank' to create a new presentation\n" +
        "3. Go to File → Import slides\n" +
        "4. Click 'Upload' and select the downloaded file"
      );
      
      window.open("https://docs.google.com/presentation/u/0/?usp=slides_web", "_blank");
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
      <header className="h-14 flex-shrink-0 flex items-center justify-between px-4 border-b border-sky-100 bg-white/70 backdrop-blur-md relative z-[60] overflow-visible">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Wind className="text-sky-500" size={24} />
            <span className="text-sky-400 text-lg font-medium">Kites</span>
            <span className="text-slate-300">/</span>
          </div>
          {isEditingTitle ? (
            <input
              ref={titleInputRef}
              type="text"
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              onBlur={handleTitleBlur}
              onKeyDown={handleTitleKeyDown}
              className={cn(
                "text-xl font-bold bg-transparent border-b-2 border-sky-400 outline-none",
                "text-slate-700 min-w-[200px]"
              )}
            />
          ) : (
            <h1 
              onClick={handleTitleClick}
              className={cn(
                "text-xl font-bold text-slate-700 cursor-pointer",
                "hover:text-sky-600 transition-colors",
                "border-b-2 border-transparent hover:border-sky-200"
              )}
              title="Click to edit title"
            >
              {title}
            </h1>
          )}
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

          {/* Export dropdown */}
          {kites.length > 0 && (
            <div className="relative" ref={exportMenuRef}>
              <button
                onClick={() => !isExporting && setShowExportMenu(!showExportMenu)}
                disabled={isExporting}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-xl",
                  "border border-sky-200 text-sky-600",
                  "hover:bg-sky-50 hover:border-sky-300",
                  "transition-all text-sm font-medium",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
                title="Export presentation"
              >
                {isExporting ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Download size={16} />
                )}
                {isExporting 
                  ? `${exportType === "gslides" ? "Slides" : exportType?.toUpperCase()} ${exportProgress.current}/${exportProgress.total}` 
                  : "Export"}
                {!isExporting && <ChevronDown size={14} />}
              </button>
              
              {/* Dropdown menu */}
              {showExportMenu && !isExporting && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-sky-100 z-[200] overflow-hidden">
                  <button
                    onClick={handleExportPDF}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3",
                      "hover:bg-sky-50 transition-colors",
                      "text-left text-sm text-slate-700"
                    )}
                  >
                    <FileText size={18} className="text-red-500" />
                    <div>
                      <div className="font-medium">PDF</div>
                      <div className="text-xs text-slate-400">Best for printing</div>
                    </div>
                  </button>
                  <button
                    onClick={handleExportPPTX}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3",
                      "hover:bg-sky-50 transition-colors",
                      "text-left text-sm text-slate-700",
                      "border-t border-sky-50"
                    )}
                  >
                    <FileSpreadsheet size={18} className="text-orange-500" />
                    <div>
                      <div className="font-medium">PowerPoint</div>
                      <div className="text-xs text-slate-400">Editable .pptx file</div>
                    </div>
                  </button>
                  <button
                    onClick={handleExportGoogleSlides}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3",
                      "hover:bg-sky-50 transition-colors",
                      "text-left text-sm text-slate-700",
                      "border-t border-sky-50"
                    )}
                  >
                    <ExternalLink size={18} className="text-green-500" />
                    <div>
                      <div className="font-medium">Google Slides</div>
                      <div className="text-xs text-slate-400">Download & open Slides</div>
                    </div>
                  </button>
                </div>
              )}
            </div>
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
