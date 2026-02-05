"use client";

import { useKitesStore, useKites, useCurrentKiteIndex, useCurrentTheme } from "@/lib/store";
import { getTheme, getBackgroundForKite } from "@/lib/themes";
import { cn } from "@/lib/utils";
import { Plus, Trash2, Copy } from "lucide-react";

/**
 * KiteList Component
 * Sidebar showing all kites as thumbnails
 */
export function KiteList() {
  const kites = useKites();
  const currentKiteIndex = useCurrentKiteIndex();
  const { setCurrentKite, addKite, deleteKite, duplicateKite } = useKitesStore();
  const currentThemeId = useCurrentTheme();
  const theme = getTheme(currentThemeId);

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
    <div className="h-full flex flex-col bg-white/50 backdrop-blur-sm border-r border-sky-100">
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
        {kites.map((kite, index) => (
          <div
            key={kite.id}
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

            {/* Mini kite preview */}
            <div
              className="aspect-video relative overflow-hidden"
              style={{ backgroundColor: theme.colors.background }}
            >
              {/* Theme background image */}
              {(() => {
                const bgImage = getBackgroundForKite(theme, index);
                return bgImage && (
                  <div 
                    className="absolute inset-0 z-0"
                    style={{
                      backgroundImage: `url(${bgImage})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  />
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
                          color: theme.colors.text,
                        }}>
                        {block.content}
                      </div>
                    )}
                    {block.type === "text" && (
                      <div className="text-[3px] truncate w-full"
                        style={{ 
                          textAlign: block.style?.textAlign || "left",
                          color: theme.colors.textMuted,
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
                        style={{ backgroundColor: theme.colors.surface }}
                      />
                    ) : null}
                  </div>
                );
              })}

              {/* Empty state */}
              {kite.contentBlocks.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[6px]" style={{ color: theme.colors.textMuted }}>Empty</span>
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
        ))}
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

