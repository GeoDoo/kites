"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { useKitesStore, useCurrentKite, useCurrentTheme } from "@/lib/store";
import { CanvasElement } from "./CanvasElement";
import { AlignmentGuides, calculateGuides } from "./AlignmentGuides";
import { ContextMenu } from "./ContextMenu";
import { getTheme, getBackgroundForKite } from "@/lib/themes";
import { cn } from "@/lib/utils";

interface DragState {
  blockId: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface KiteCanvasProps {
  className?: string;
}

/**
 * KiteCanvas Component
 * Interactive canvas for editing kites with draggable content blocks
 */
export function KiteCanvas({ className }: KiteCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const currentKite = useCurrentKite();
  const selectedBlockId = useKitesStore((state) => state.selectedBlockId);
  const selectBlock = useKitesStore((state) => state.selectBlock);
  const currentKiteIndex = useKitesStore((state) => state.currentKiteIndex);
  const currentThemeId = useCurrentTheme();
  const theme = getTheme(currentThemeId);
  const backgroundImage = getBackgroundForKite(theme, currentKiteIndex);

  // Handle right-click context menu
  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
  }, []);

  // Calculate scale based on container size (accounting for padding)
  useEffect(() => {
    const updateScale = () => {
      if (!containerRef.current) return;

      const container = containerRef.current;
      // Subtract padding (p-12 = 48px * 2 = 96px on each axis)
      const padding = 96;
      const containerWidth = container.clientWidth - padding;
      const containerHeight = container.clientHeight - padding;

      const kiteWidth = 1920;
      const kiteHeight = 1080;

      const scaleX = containerWidth / kiteWidth;
      const scaleY = containerHeight / kiteHeight;
      setScale(Math.min(scaleX, scaleY, 1)); // Cap at 1 to never exceed native size
    };

    updateScale();
    const observer = new ResizeObserver(updateScale);
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    return () => observer.disconnect();
  }, []);

  // Handle drag updates from child elements
  const handleDragUpdate = useCallback((state: DragState | null) => {
    setDragState(state);
  }, []);

  // Click on canvas background to deselect
  const handleCanvasClick = () => {
    selectBlock(null);
  };

  // Handle keyboard navigation to cycle through elements
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!currentKite || currentKite.contentBlocks.length === 0) return;
      
      // Tab to cycle through elements
      if (e.key === "Tab") {
        e.preventDefault();
        const blocks = currentKite.contentBlocks;
        const currentIndex = blocks.findIndex(b => b.id === selectedBlockId);
        
        if (e.shiftKey) {
          // Shift+Tab: go to previous
          const prevIndex = currentIndex <= 0 ? blocks.length - 1 : currentIndex - 1;
          selectBlock(blocks[prevIndex].id);
        } else {
          // Tab: go to next
          const nextIndex = currentIndex >= blocks.length - 1 ? 0 : currentIndex + 1;
          selectBlock(blocks[nextIndex].id);
        }
      }
      
      // Delete selected element
      if ((e.key === "Delete" || e.key === "Backspace") && selectedBlockId) {
        const activeElement = document.activeElement;
        // Don't delete if user is typing in an input
        if (activeElement?.tagName !== "INPUT" && !activeElement?.getAttribute("contenteditable")) {
          e.preventDefault();
          useKitesStore.getState().deleteBlock(selectedBlockId);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentKite, selectedBlockId, selectBlock]);

  if (!currentKite) {
    return (
      <div className={cn("h-full flex items-center justify-center bg-sky-50", className)}>
        <p className="text-sky-400">No kite selected</p>
      </div>
    );
  }

  // Calculate guides based on current drag position
  const guides = dragState
    ? calculateGuides(dragState.x, dragState.y, dragState.width, dragState.height)
    : null;

  return (
    <div
      ref={containerRef}
      className={cn(
        "h-full w-full flex items-center justify-center",
        "bg-gradient-to-br from-slate-100 to-slate-200 p-12",
        className
      )}
    >
      {/* Canvas container with aspect ratio */}
      <div
        onClick={handleCanvasClick}
        onContextMenu={handleContextMenu}
        className={cn(
          "relative overflow-hidden",
          "ring-1 ring-slate-300/50",
          theme.style === "pixel" && "rounded-none",
          theme.style === "sharp" && "rounded-sm",
          theme.style === "rounded" && "rounded-xl"
        )}
        style={{
          width: 1920 * scale,
          height: 1080 * scale,
          backgroundColor: theme.colors.background,
          borderRadius: theme.style === "pixel" ? 0 : theme.style === "sharp" ? 4 : 12,
          fontFamily: theme.font ? `"${theme.font}", sans-serif` : undefined,
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)",
        }}
      >
        {/* Theme background image with treatment */}
        {backgroundImage && (
          <>
            <div 
              className="absolute inset-0 z-0 pointer-events-none overflow-hidden"
              style={{
                borderRadius: "inherit",
              }}
            >
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `url(${backgroundImage})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  opacity: theme.backgroundTreatment?.opacity ?? 1,
                  filter: [
                    theme.backgroundTreatment?.blur ? `blur(${theme.backgroundTreatment.blur}px)` : "",
                    theme.backgroundTreatment?.grayscale ? `grayscale(${theme.backgroundTreatment.grayscale})` : "",
                    theme.backgroundTreatment?.brightness ? `brightness(${theme.backgroundTreatment.brightness})` : "",
                  ].filter(Boolean).join(" ") || undefined,
                  // Extend to prevent blur edge artifacts
                  margin: theme.backgroundTreatment?.blur ? `-${theme.backgroundTreatment.blur * 2}px` : undefined,
                  padding: theme.backgroundTreatment?.blur ? `${theme.backgroundTreatment.blur * 2}px` : undefined,
                }}
              />
            </div>
            {/* Color overlay layer */}
            {theme.backgroundTreatment?.overlay && (
              <div 
                className="absolute inset-0 z-0 pointer-events-none"
                style={{ 
                  backgroundColor: theme.backgroundTreatment.overlay,
                  borderRadius: "inherit",
                }}
              />
            )}
          </>
        )}

        {/* Theme effects overlay - SCANLINES */}
        {theme.effects?.scanlines && (
          <div 
            className="absolute inset-0 pointer-events-none z-10"
            style={{
              backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,0,0.03) 2px, rgba(0,255,0,0.03) 4px)",
              animation: "scanline 8s linear infinite",
            }}
          />
        )}
        
        {/* Theme effects overlay - NOISE/PAPER TEXTURE */}
        {theme.effects?.noise && (
          <div 
            className="absolute inset-0 pointer-events-none z-10 opacity-20"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            }}
          />
        )}
        
        {/* Theme effects overlay - GLOW */}
        {theme.effects?.glow && (
          <div 
            className="absolute inset-0 pointer-events-none z-10"
            style={{
              background: `radial-gradient(ellipse at center, transparent 0%, transparent 50%, ${theme.colors.accent}15 100%)`,
              boxShadow: `inset 0 0 100px ${theme.colors.accent}20`,
            }}
          />
        )}

        {/* Alignment guides - only visible when dragging/resizing */}
        {dragState && (
          <>
            {guides && <AlignmentGuides {...guides.guides} />}

            {/* Grid overlay */}
            <div 
              className="absolute inset-0 pointer-events-none opacity-[0.05]"
              style={{
                backgroundImage: `
                  linear-gradient(to right, ${theme.colors.textMuted} 1px, transparent 1px),
                  linear-gradient(to bottom, ${theme.colors.textMuted} 1px, transparent 1px)
                `,
                backgroundSize: `${10 * scale}% ${10 * scale}%`,
              }}
            />

            {/* Center crosshair */}
            <div className="absolute inset-0 pointer-events-none">
              <div 
                className="absolute top-0 bottom-0 w-px opacity-30"
                style={{ left: "50%", backgroundColor: theme.colors.textMuted }}
              />
              <div 
                className="absolute left-0 right-0 h-px opacity-30"
                style={{ top: "50%", backgroundColor: theme.colors.textMuted }}
              />
            </div>
          </>
        )}

        {/* Render all content blocks */}
        {currentKite.contentBlocks.map((block) => (
          <CanvasElement
            key={block.id}
            block={block}
            isSelected={selectedBlockId === block.id}
            scale={scale}
            onSelect={() => selectBlock(block.id)}
            onDragUpdate={handleDragUpdate}
            snapThreshold={2}
            theme={theme}
          />
        ))}

        {/* Empty state */}
        {currentKite.contentBlocks.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center" style={{ color: theme.colors.textMuted }}>
              <p className="text-lg font-light">Empty kite</p>
              <p className="text-sm mt-1">Use the toolbar to add content</p>
            </div>
          </div>
        )}
      </div>

      {/* Context menu */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
        />
      )}
    </div>
  );
}

