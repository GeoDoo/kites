"use client";

import { useState, useRef, useEffect } from "react";
import { useKitesStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import {
  Type,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Image,
  ChevronDown,
} from "lucide-react";
import type { BlockType } from "@/lib/types";

const headingOptions: { type: BlockType; label: string; icon: React.ReactNode }[] = [
  { type: "h1", label: "Heading 1", icon: <Heading1 size={18} /> },
  { type: "h2", label: "Heading 2", icon: <Heading2 size={18} /> },
  { type: "h3", label: "Heading 3", icon: <Heading3 size={18} /> },
  { type: "h4", label: "Heading 4", icon: <Heading4 size={18} /> },
];

/**
 * ElementToolbar Component
 * Toolbar for adding new content blocks to the kite
 */
export function ElementToolbar() {
  const addBlock = useKitesStore((state) => state.addBlock);
  const [headingDropdownOpen, setHeadingDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setHeadingDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAddBlock = (type: BlockType) => {
    addBlock(type);
    setHeadingDropdownOpen(false);
  };

  return (
    <div className="flex items-center gap-1 px-4 py-2 bg-white/80 backdrop-blur-sm border-b border-sky-100 relative z-50">
      <span className="text-xs text-sky-400 mr-2 font-medium">Add:</span>

      {/* Heading dropdown */}
      <div ref={dropdownRef} className="relative">
        <button
          onClick={() => setHeadingDropdownOpen(!headingDropdownOpen)}
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-lg",
            "text-slate-600 hover:text-slate-900",
            "hover:bg-sky-50",
            "transition-colors",
            headingDropdownOpen && "bg-sky-50 text-slate-900"
          )}
        >
          <Heading1 size={20} />
          <span className="text-sm">Heading</span>
          <ChevronDown size={14} className={cn("transition-transform", headingDropdownOpen && "rotate-180")} />
        </button>

        {/* Dropdown menu */}
        {headingDropdownOpen && (
          <div className="absolute top-full left-0 mt-1 py-1 bg-white border border-sky-100 rounded-lg shadow-xl z-[100] min-w-[150px]">
            {headingOptions.map((option) => (
              <button
                key={option.type}
                onClick={() => handleAddBlock(option.type)}
                className={cn(
                  "flex items-center gap-3 w-full px-3 py-2",
                  "text-slate-600 hover:text-slate-900",
                  "hover:bg-sky-50",
                  "transition-colors text-left"
                )}
              >
                {option.icon}
                <span className="text-sm">{option.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Text button */}
      <button
        onClick={() => handleAddBlock("text")}
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-lg",
          "text-slate-600 hover:text-slate-900",
          "hover:bg-sky-50",
          "transition-colors"
        )}
        title="Add Text"
      >
        <Type size={20} />
        <span className="text-sm">Text</span>
      </button>

      {/* Image button */}
      <button
        onClick={() => handleAddBlock("image")}
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-lg",
          "text-slate-600 hover:text-slate-900",
          "hover:bg-sky-50",
          "transition-colors"
        )}
        title="Add Image"
      >
        <Image size={20} />
        <span className="text-sm">Image</span>
      </button>
    </div>
  );
}
