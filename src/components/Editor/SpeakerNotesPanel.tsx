"use client";

import { useState, useEffect, useRef } from "react";
import { useKitesStore, useKites } from "@/lib/store";
import { cn } from "@/lib/utils";
import { ChevronUp, ChevronDown, StickyNote } from "lucide-react";

/**
 * SpeakerNotesPanel Component
 * Collapsible panel for editing speaker notes on the current kite
 */
export function SpeakerNotesPanel() {
  const kites = useKites();
  const currentKiteIndex = useKitesStore((state) => state.currentKiteIndex);
  const updateSpeakerNotes = useKitesStore((state) => state.updateSpeakerNotes);
  
  const [isExpanded, setIsExpanded] = useState(false);
  const [localNotes, setLocalNotes] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const currentKite = kites[currentKiteIndex];
  const kiteId = currentKite?.id;

  // Sync local notes with store when kite changes
  useEffect(() => {
    if (currentKite) {
      setLocalNotes(currentKite.speakerNotes || "");
    }
  }, [currentKite?.id, currentKite?.speakerNotes]);

  // Debounced save to store
  const handleNotesChange = (value: string) => {
    setLocalNotes(value);
    
    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    // Debounce save
    saveTimeoutRef.current = setTimeout(() => {
      if (kiteId) {
        updateSpeakerNotes(kiteId, value);
      }
    }, 300);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current && isExpanded) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [localNotes, isExpanded]);

  if (!currentKite) return null;

  const hasNotes = localNotes.trim().length > 0;

  return (
    <div className="border-t border-sky-100 bg-white">
      {/* Header - always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          "w-full flex items-center justify-between px-4 py-2",
          "hover:bg-sky-50 transition-colors",
          "text-sm font-medium text-slate-600"
        )}
      >
        <div className="flex items-center gap-2">
          <StickyNote size={16} className={hasNotes ? "text-amber-500" : "text-slate-400"} />
          <span>Speaker Notes</span>
          {hasNotes && !isExpanded && (
            <span className="text-xs text-slate-400 ml-1">
              ({localNotes.length} chars)
            </span>
          )}
        </div>
        {isExpanded ? (
          <ChevronDown size={16} className="text-slate-400" />
        ) : (
          <ChevronUp size={16} className="text-slate-400" />
        )}
      </button>

      {/* Expandable content */}
      {isExpanded && (
        <div className="px-4 pb-4">
          <textarea
            ref={textareaRef}
            value={localNotes}
            onChange={(e) => handleNotesChange(e.target.value)}
            placeholder="Add notes for this slide... (only you can see these during presentation)"
            className={cn(
              "w-full min-h-[80px] max-h-[200px] p-3 rounded-lg",
              "border border-sky-200 focus:border-sky-400 focus:ring-1 focus:ring-sky-400",
              "text-sm text-slate-700 placeholder:text-slate-400",
              "resize-none outline-none transition-colors"
            )}
          />
          <p className="text-xs text-slate-400 mt-2">
            Notes are saved automatically and visible only to you during presentation.
          </p>
        </div>
      )}
    </div>
  );
}
