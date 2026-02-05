"use client";

import { useState, useEffect, useRef } from "react";
import { useKitesStore, useCurrentKite } from "@/lib/store";
import { 
  ArrowUpToLine, 
  ArrowDownToLine, 
  Copy, 
  Trash2, 
  Layers,
  MousePointer2
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
}

export function ContextMenu({ x, y, onClose }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const currentKite = useCurrentKite();
  const selectedBlockId = useKitesStore((state) => state.selectedBlockId);
  const { selectBlock, bringToFront, sendToBack, duplicateBlock, deleteBlock } = useKitesStore();

  // Get all blocks sorted by z-index (highest first for display)
  const blocks = currentKite?.contentBlocks
    ? [...currentKite.contentBlocks].sort((a, b) => (b.zIndex ?? 1) - (a.zIndex ?? 1))
    : [];

  const selectedBlock = blocks.find(b => b.id === selectedBlockId);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  // Adjust position to keep menu in viewport
  const adjustedX = Math.min(x, window.innerWidth - 220);
  const adjustedY = Math.min(y, window.innerHeight - 400);

  const getBlockLabel = (block: typeof blocks[0]) => {
    switch (block.type) {
      case "h1": return `H1: ${block.content.slice(0, 20)}${block.content.length > 20 ? "..." : ""}`;
      case "h2": return `H2: ${block.content.slice(0, 20)}${block.content.length > 20 ? "..." : ""}`;
      case "h3": return `H3: ${block.content.slice(0, 20)}${block.content.length > 20 ? "..." : ""}`;
      case "h4": return `H4: ${block.content.slice(0, 20)}${block.content.length > 20 ? "..." : ""}`;
      case "text": return `Text: ${block.content.slice(0, 20)}${block.content.length > 20 ? "..." : ""}`;
      case "image": return block.content ? "Image" : "Empty Image";
      default: return block.type;
    }
  };

  return (
    <div
      ref={menuRef}
      className="fixed z-[500] bg-white rounded-xl shadow-2xl border border-slate-200 py-2 min-w-[200px] overflow-hidden"
      style={{ left: adjustedX, top: adjustedY }}
    >
      {/* Layers section */}
      <div className="px-3 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wide flex items-center gap-2">
        <Layers size={12} />
        Layers (top to bottom)
      </div>
      
      <div className="max-h-48 overflow-y-auto">
        {blocks.map((block) => (
          <button
            key={block.id}
            onClick={() => {
              selectBlock(block.id);
              onClose();
            }}
            className={cn(
              "w-full px-3 py-2 text-left text-sm flex items-center gap-2 hover:bg-sky-50 transition-colors",
              block.id === selectedBlockId && "bg-sky-100 text-sky-700"
            )}
          >
            <MousePointer2 size={14} className={block.id === selectedBlockId ? "text-sky-500" : "text-slate-400"} />
            <span className="truncate flex-1">{getBlockLabel(block)}</span>
            <span className="text-xs text-slate-400">z:{block.zIndex ?? 1}</span>
          </button>
        ))}
        
        {blocks.length === 0 && (
          <div className="px-3 py-2 text-sm text-slate-400 italic">No elements</div>
        )}
      </div>

      {/* Actions for selected element */}
      {selectedBlock && (
        <>
          <div className="border-t border-slate-100 my-1" />
          <div className="px-3 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wide">
            Actions
          </div>
          
          <button
            onClick={() => {
              bringToFront(selectedBlock.id);
              onClose();
            }}
            className="w-full px-3 py-2 text-left text-sm flex items-center gap-2 hover:bg-sky-50 transition-colors"
          >
            <ArrowUpToLine size={14} className="text-slate-500" />
            Bring to Front
          </button>
          
          <button
            onClick={() => {
              sendToBack(selectedBlock.id);
              onClose();
            }}
            className="w-full px-3 py-2 text-left text-sm flex items-center gap-2 hover:bg-sky-50 transition-colors"
          >
            <ArrowDownToLine size={14} className="text-slate-500" />
            Send to Back
          </button>
          
          <button
            onClick={() => {
              duplicateBlock(selectedBlock.id);
              onClose();
            }}
            className="w-full px-3 py-2 text-left text-sm flex items-center gap-2 hover:bg-sky-50 transition-colors"
          >
            <Copy size={14} className="text-slate-500" />
            Duplicate
          </button>
          
          <button
            onClick={() => {
              deleteBlock(selectedBlock.id);
              onClose();
            }}
            className="w-full px-3 py-2 text-left text-sm flex items-center gap-2 hover:bg-red-50 text-red-600 transition-colors"
          >
            <Trash2 size={14} />
            Delete
          </button>
        </>
      )}
    </div>
  );
}
