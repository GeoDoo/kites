"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import { createPortal } from "react-dom";
import { useKitesStore, useKites, useCurrentKiteIndex, useCurrentTheme } from "@/lib/store";
import { getTheme, getBackgroundForKite, resolveThemeForKite, themeList } from "@/lib/themes";
import { cn } from "@/lib/utils";
import { Plus, Trash2, Copy, ChevronDown } from "lucide-react";

/**
 * Per-kite theme picker — shown on each thumbnail when Hybrid mode is active.
 */
function KiteThemePicker({
  kiteId,
  currentOverride,
}: {
  kiteId: string;
  currentOverride?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const { updateKiteThemeOverride } = useKitesStore();

  const effectiveId = currentOverride || "sky";
  const effectiveTheme = getTheme(effectiveId);

  // Exclude "hybrid" from the per-kite picker — it's the meta-theme
  const pickableThemes = themeList.filter((t) => t.id !== "hybrid");

  const handleToggle = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!isOpen && buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        setMenuPos({ top: rect.bottom + 4, left: rect.left });
      }
      setIsOpen((prev) => !prev);
    },
    [isOpen]
  );

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    function handleClick(e: MouseEvent) {
      if (
        menuRef.current && !menuRef.current.contains(e.target as Node) &&
        buttonRef.current && !buttonRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isOpen]);

  // Close on scroll (the sidebar scrolls and would leave the menu floating)
  useEffect(() => {
    if (!isOpen) return;
    const handleScroll = () => setIsOpen(false);
    window.addEventListener("scroll", handleScroll, true);
    return () => window.removeEventListener("scroll", handleScroll, true);
  }, [isOpen]);

  return (
    <>
      <button
        ref={buttonRef}
        onClick={handleToggle}
        className={cn(
          "flex items-center gap-0.5 px-1 py-0.5 rounded text-[8px] leading-none",
          "bg-slate-800/60 text-white backdrop-blur-sm",
          "hover:bg-slate-800/80 transition-colors"
        )}
        title="Set theme for this kite"
      >
        <div
          className="w-2 h-2 rounded-sm border border-white/30"
          style={{ backgroundColor: effectiveTheme.colors.accent }}
        />
        <span className="max-w-[40px] truncate">{effectiveTheme.name}</span>
        <ChevronDown size={7} />
      </button>

      {isOpen &&
        createPortal(
          <div
            ref={menuRef}
            className="fixed w-32 bg-white rounded-lg shadow-xl border border-slate-200 py-1"
            style={{ top: menuPos.top, left: menuPos.left, zIndex: 9999 }}
            onClick={(e) => e.stopPropagation()}
          >
            {pickableThemes.map((t) => (
              <button
                key={t.id}
                onClick={(e) => {
                  e.stopPropagation();
                  updateKiteThemeOverride(kiteId, t.id === "sky" ? undefined : t.id);
                  setIsOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-2 px-2 py-1.5 text-left text-xs hover:bg-slate-50 transition-colors",
                  t.id === effectiveId && "bg-sky-50"
                )}
              >
                <div className="flex items-center gap-px shrink-0">
                  <div
                    className="w-2.5 h-2.5 rounded-l-sm border border-slate-200"
                    style={{ backgroundColor: t.colors.background }}
                  />
                  <div
                    className="w-2.5 h-2.5 rounded-r-sm border border-slate-200"
                    style={{ backgroundColor: t.colors.accent }}
                  />
                </div>
                <span className="text-slate-700 truncate">{t.name}</span>
              </button>
            ))}
          </div>,
          document.body
        )}
    </>
  );
}

/**
 * KiteList Component
 * Sidebar showing all kites as thumbnails
 * Supports arrow key navigation (Up/Down)
 * In Hybrid mode: per-kite theme picker + visually reflects each kite's theme
 */
export function KiteList() {
  const kites = useKites();
  const currentKiteIndex = useCurrentKiteIndex();
  const { setCurrentKite, addKite, deleteKite, duplicateKite } = useKitesStore();
  const currentThemeId = useCurrentTheme();
  const isHybrid = currentThemeId === "hybrid";
  const listRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  // Scroll selected kite into view
  useEffect(() => {
    const el = itemRefs.current.get(currentKiteIndex);
    if (el) {
      el.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [currentKiteIndex]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown" || e.key === "j") {
        e.preventDefault();
        if (currentKiteIndex < kites.length - 1) {
          setCurrentKite(currentKiteIndex + 1);
        }
      } else if (e.key === "ArrowUp" || e.key === "k") {
        e.preventDefault();
        if (currentKiteIndex > 0) {
          setCurrentKite(currentKiteIndex - 1);
        }
      } else if (e.key === "Home") {
        e.preventDefault();
        setCurrentKite(0);
      } else if (e.key === "End") {
        e.preventDefault();
        setCurrentKite(kites.length - 1);
      }
    },
    [currentKiteIndex, kites.length, setCurrentKite]
  );

  const handleAddKite = () => {
    addKite();
  };

  const handleDeleteKite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteKite(id);
  };

  const handleDuplicateKite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    duplicateKite(id);
  };

  return (
    <div
      ref={listRef}
      className="h-full flex flex-col bg-white/50 backdrop-blur-sm border-r border-sky-100 outline-none"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      {/* Header */}
      <div className="p-3 border-b border-sky-100 flex items-center justify-between">
        <h2 className="font-semibold text-slate-700 text-sm">Kites</h2>
        <button
          onClick={handleAddKite}
          className={cn(
            "p-1.5 rounded-lg",
            "bg-sky-500 text-white",
            "hover:bg-sky-600",
            "transition-colors shadow-sm"
          )}
          title="Add kite"
        >
          <Plus size={16} />
        </button>
      </div>

      {/* Kite thumbnails */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {kites.map((kite, index) => {
          // Resolve the effective theme for this specific kite
          const kiteTheme = resolveThemeForKite(currentThemeId, kite.themeOverride);

          return (
            <div
              key={kite.id}
              ref={(el) => {
                if (el) itemRefs.current.set(index, el);
                else itemRefs.current.delete(index);
              }}
              onClick={() => setCurrentKite(index)}
              className={cn(
                "group relative cursor-pointer rounded-xl overflow-hidden",
                "border-2 transition-all shadow-sm",
                index === currentKiteIndex
                  ? "border-sky-500 shadow-md"
                  : "border-sky-100 hover:border-sky-200"
              )}
            >
              {/* Kite number */}
              <div className="absolute top-1 left-1 z-10 px-1.5 py-0.5 bg-slate-800/50 text-white text-xs rounded-md backdrop-blur-sm">
                {index + 1}
              </div>

              {/* Per-kite theme picker (Hybrid mode only) */}
              {isHybrid && (
                <div className="absolute bottom-1 left-1 z-10">
                  <KiteThemePicker
                    kiteId={kite.id}
                    currentOverride={kite.themeOverride}
                  />
                </div>
              )}

              {/* Mini kite preview — uses the resolved theme for this kite */}
              <div
                className="aspect-video relative overflow-hidden"
                style={{ backgroundColor: kiteTheme.colors.background }}
              >
                {/* Theme background image with treatment */}
                {(() => {
                  const bgImage = getBackgroundForKite(kiteTheme, index);
                  return bgImage && (
                    <>
                      <div className="absolute inset-0 z-0 overflow-hidden">
                        <div
                          className="absolute inset-0"
                          style={{
                            backgroundImage: `url(${bgImage})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                            opacity: kiteTheme.backgroundTreatment?.opacity ?? 1,
                            filter: [
                              kiteTheme.backgroundTreatment?.blur ? `blur(${kiteTheme.backgroundTreatment.blur * 0.5}px)` : "",
                              kiteTheme.backgroundTreatment?.grayscale ? `grayscale(${kiteTheme.backgroundTreatment.grayscale})` : "",
                              kiteTheme.backgroundTreatment?.brightness ? `brightness(${kiteTheme.backgroundTreatment.brightness})` : "",
                            ].filter(Boolean).join(" ") || undefined,
                          }}
                        />
                      </div>
                      {kiteTheme.backgroundTreatment?.overlay && (
                        <div
                          className="absolute inset-0 z-0"
                          style={{ backgroundColor: kiteTheme.backgroundTreatment.overlay }}
                        />
                      )}
                    </>
                  );
                })()}

                {/* Render mini blocks - sort by zIndex */}
                {[...kite.contentBlocks]
                  .sort((a, b) => (a.zIndex ?? 1) - (b.zIndex ?? 1))
                  .map((block) => {
                  const isHeading = block.type === "h1" || block.type === "h2" || block.type === "h3" || block.type === "h4";
                  return (
                    <div
                      key={block.id}
                      className="absolute overflow-hidden flex items-center"
                      style={{
                        left: `${block.position.x}%`,
                        top: `${block.position.y}%`,
                        width: `${block.position.width}%`,
                        height: `${block.position.height}%`,
                        zIndex: block.zIndex ?? 1,
                        justifyContent: block.style?.textAlign === "center" ? "center" :
                                       block.style?.textAlign === "right" ? "flex-end" : "flex-start",
                        textAlign: block.style?.textAlign || "left",
                      }}
                    >
                      {isHeading && (
                        <div className="text-[4px] font-bold truncate w-full"
                          style={{
                            textAlign: block.style?.textAlign || "left",
                            color: kiteTheme.colors.text,
                          }}>
                          {block.content}
                        </div>
                      )}
                      {block.type === "text" && (
                        <div className="text-[3px] truncate w-full"
                          style={{
                            textAlign: block.style?.textAlign || "left",
                            color: kiteTheme.colors.textMuted,
                          }}>
                          {block.content}
                        </div>
                      )}
                      {block.type === "image" && block.content ? (
                        <img
                          src={block.content}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : block.type === "image" ? (
                        <div
                          className="w-full h-full rounded-sm"
                          style={{ backgroundColor: kiteTheme.colors.surface }}
                        />
                      ) : null}
                    </div>
                  );
                })}

                {/* Empty state */}
                {kite.contentBlocks.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[6px]" style={{ color: kiteTheme.colors.textMuted }}>Empty</span>
                  </div>
                )}
              </div>

              {/* Actions overlay */}
              <div className="absolute top-1 right-1 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => handleDuplicateKite(kite.id, e)}
                  className="p-1 rounded bg-slate-800/50 text-white hover:bg-slate-800/70 backdrop-blur-sm"
                  title="Duplicate"
                >
                  <Copy size={10} />
                </button>
                <button
                  onClick={(e) => handleDeleteKite(kite.id, e)}
                  className="p-1 rounded bg-slate-800/50 text-white hover:bg-red-500 backdrop-blur-sm"
                  title="Delete"
                >
                  <Trash2 size={10} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="p-2 border-t border-sky-100 text-center">
        <span className="text-xs text-sky-400">
          {kites.length} kite{kites.length !== 1 ? "s" : ""}
        </span>
      </div>
    </div>
  );
}
