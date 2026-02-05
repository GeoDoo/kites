"use client";

import { useState, useRef, useEffect } from "react";
import { Palette, Check, ChevronDown } from "lucide-react";
import { useKitesStore, useCurrentTheme } from "@/lib/store";
import { themeList, type KiteTheme } from "@/lib/themes";
import { cn } from "@/lib/utils";

interface ThemeSwatchProps {
  theme: KiteTheme;
  isSelected: boolean;
  onClick: () => void;
}

function ThemeSwatch({ theme, isSelected, onClick }: ThemeSwatchProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all",
        "hover:bg-slate-100",
        isSelected && "bg-sky-50"
      )}
    >
      {/* Color swatches */}
      <div className="flex items-center gap-0.5 shrink-0">
        <div
          className="w-4 h-4 rounded-l-md border border-slate-200"
          style={{ backgroundColor: theme.colors.background }}
        />
        <div
          className="w-4 h-4 border-y border-slate-200"
          style={{ backgroundColor: theme.colors.surface }}
        />
        <div
          className="w-4 h-4 border-y border-slate-200"
          style={{ backgroundColor: theme.colors.text }}
        />
        <div
          className="w-4 h-4 rounded-r-md border border-slate-200"
          style={{ backgroundColor: theme.colors.accent }}
        />
      </div>

      {/* Theme info */}
      <div className="flex-1 text-left">
        <div className="text-sm font-medium text-slate-700">
          {theme.name}
        </div>
        <div className="text-xs text-slate-500">
          {theme.description}
        </div>
      </div>

      {/* Selection indicator */}
      {isSelected && (
        <Check className="w-4 h-4 text-sky-500 shrink-0" />
      )}
    </button>
  );
}

export function ThemeSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const currentThemeId = useCurrentTheme();
  const setTheme = useKitesStore((state) => state.setTheme);

  const currentTheme = themeList.find((t) => t.id === currentThemeId) || themeList[0];

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close on escape
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [isOpen]);

  function handleSelectTheme(themeId: string) {
    setTheme(themeId);
    setIsOpen(false);
  }

  return (
    <div ref={dropdownRef} className="relative z-[200]">
      {/* Trigger button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-lg transition-all",
          "bg-white/80 backdrop-blur-sm border border-sky-100",
          "hover:bg-sky-50 hover:border-sky-200",
          "text-slate-600 text-sm font-medium",
          isOpen && "bg-sky-50 border-sky-200"
        )}
      >
        <Palette className="w-4 h-4" />
        <span className="hidden sm:inline">{currentTheme.name}</span>
        <ChevronDown
          className={cn(
            "w-4 h-4 transition-transform",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div
          className={cn(
            "absolute top-full right-0 mt-2 w-72 z-[100]",
            "bg-white rounded-xl shadow-xl",
            "border border-slate-200",
            "py-2 animate-in fade-in-0 zoom-in-95"
          )}
        >
          <div className="px-3 py-2 border-b border-slate-100">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
              Theme Presets
            </h3>
          </div>
          <div className="p-1 max-h-80 overflow-y-auto">
            {themeList.map((theme) => (
              <ThemeSwatch
                key={theme.id}
                theme={theme}
                isSelected={theme.id === currentThemeId}
                onClick={() => handleSelectTheme(theme.id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
