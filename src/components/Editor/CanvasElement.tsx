"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useKitesStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import type { ContentBlock, BlockType } from "@/lib/types";
import type { KiteTheme } from "@/lib/themes";
import { Trash2, Copy, Move, ArrowUpToLine, ArrowDownToLine, Palette, Bold, Italic, Underline, Strikethrough, List, ListOrdered, Quote, Minus, Plus, AlignLeft, AlignCenter, AlignRight, ChevronDown } from "lucide-react";
import { calculateGuides } from "./AlignmentGuides";
import { ImageUploadModal } from "./ImageUploadModal";

interface DragState {
  blockId: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface CanvasElementProps {
  block: ContentBlock;
  isSelected: boolean;
  scale: number;
  onSelect: () => void;
  onDragUpdate: (state: DragState | null) => void;
  snapThreshold?: number;
  theme: KiteTheme;
}

export function CanvasElement({
  block,
  isSelected,
  scale,
  onSelect,
  onDragUpdate,
  snapThreshold = 2,
  theme,
}: CanvasElementProps) {
  const { updateBlockPosition, updateBlockContent, updateBlock, deleteBlock, duplicateBlock, bringToFront, sendToBack, snapshot } =
    useKitesStore();
  const [isEditing, setIsEditing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showInlineColorPicker, setShowInlineColorPicker] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const typeSwitcherBtnRef = useRef<HTMLButtonElement>(null);
  const dragStartRef = useRef({ x: 0, y: 0, posX: 0, posY: 0 });
  const resizeStartRef = useRef({ 
    width: 0, 
    height: 0, 
    x: 0, 
    y: 0, 
    mouseX: 0, 
    mouseY: 0,
    corner: "" as string 
  });

  const { type, position, content, style } = block;

  // Handle double-click to edit
  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (type === "text" || type === "h1" || type === "h2" || type === "h3" || type === "h4") {
      snapshot(); // Capture state before text edit
      setIsEditing(true);
    } else if (type === "image") {
      setShowImageModal(true);
    }
  };

  // Handle image selection from modal
  const handleImageSelect = (imageUrl: string) => {
    updateBlockContent(block.id, imageUrl);
  };

  // Handle color change
  const handleColorChange = (color: string) => {
    updateBlock(block.id, { 
      style: { ...block.style, color } 
    });
  };

  // Preset colors for quick selection - distinct colors only
  const presetColors = [
    "#ffffff", "#000000", "#374151", "#6b7280", "#9ca3af",
    "#ef4444", "#f97316", "#eab308", "#22c55e", "#14b8a6", 
    "#0ea5e9", "#3b82f6", "#8b5cf6", "#d946ef", "#ec4899",
  ];

  // Text formatting commands
  const formatText = (command: string, value?: string) => {
    // Ensure we have focus and selection is within our element
    if (contentRef.current) {
      contentRef.current.focus();
      document.execCommand(command, false, value);
    }
  };

  // Font size helpers (only used for text elements, not headings)
  const currentFontSize = style?.fontSize || 24;
  
  const changeFontSize = (delta: number) => {
    const newSize = Math.max(12, Math.min(200, currentFontSize + delta));
    updateBlock(block.id, { 
      style: { ...block.style, fontSize: newSize } 
    });
  };

  // Text alignment
  const changeAlignment = (align: "left" | "center" | "right") => {
    updateBlock(block.id, { 
      style: { ...block.style, textAlign: align } 
    });
  };
  
  const currentAlign = style?.textAlign || "left";

  // Handle click to select
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect();
  };

  // Debounced content save ref
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Handle content blur (finish editing)
  const handleBlur = () => {
    setIsEditing(false);
    // Clear any pending save and save immediately
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }
    if (contentRef.current) {
      // Save innerHTML to preserve formatting (bold, italic, etc.)
      updateBlockContent(block.id, contentRef.current.innerHTML);
    }
  };

  // Handle content input (debounced save as you type)
  const handleInput = () => {
    // Only save when actually editing (user interaction)
    if (!isEditing) return;
    
    // Debounce the save to avoid cursor jumping
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(() => {
      if (contentRef.current && isEditing) {
        updateBlockContent(block.id, contentRef.current.innerHTML);
      }
    }, 500); // Save after 500ms of no typing
  };

  // Handle keyboard in editing mode
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsEditing(false);
      contentRef.current?.blur();
    }
    if (e.key === "Delete" && !isEditing && isSelected) {
      snapshot();
      deleteBlock(block.id);
    }
  };

  // Set content via innerHTML
  const prevIsEditingRef = useRef(false);
  
  // Set initial content and update when not editing
  useEffect(() => {
    if (contentRef.current && !isEditing) {
      contentRef.current.innerHTML = content;
    }
  }, [content, isEditing]);

  // Focus and select when editing starts
  useEffect(() => {
    if (isEditing && !prevIsEditingRef.current && contentRef.current) {
      // Content should already be set, just focus and select
      contentRef.current.focus();
      const range = document.createRange();
      range.selectNodeContents(contentRef.current);
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);
    }
    prevIsEditingRef.current = isEditing;
  }, [isEditing]);

  // Close color pickers when element is deselected or editing ends
  useEffect(() => {
    if (!isSelected) {
      setShowColorPicker(false);
      setShowInlineColorPicker(false);
    }
  }, [isSelected]);

  useEffect(() => {
    if (!isEditing) {
      setShowInlineColorPicker(false);
    }
  }, [isEditing]);

  // Drag handling with snapping
  const handleDragStart = (e: React.MouseEvent) => {
    if (isEditing) return;
    e.preventDefault();
    e.stopPropagation();
    
    snapshot(); // Capture state before drag
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      posX: position.x,
      posY: position.y,
    };

    const handleMouseMove = (e: MouseEvent) => {
      const parentRect = elementRef.current?.parentElement?.getBoundingClientRect();
      if (!parentRect) return;

      const deltaX = ((e.clientX - dragStartRef.current.x) / parentRect.width) * 100;
      const deltaY = ((e.clientY - dragStartRef.current.y) / parentRect.height) * 100;

      let newX = Math.max(0, Math.min(100 - position.width, dragStartRef.current.posX + deltaX));
      let newY = Math.max(0, Math.min(100 - position.height, dragStartRef.current.posY + deltaY));

      const { snappedX, snappedY } = calculateGuides(
        newX,
        newY,
        position.width,
        position.height,
        snapThreshold
      );

      newX = snappedX;
      newY = snappedY;

      newX = Math.max(0, Math.min(100 - position.width, newX));
      newY = Math.max(0, Math.min(100 - position.height, newY));

      updateBlockPosition(block.id, { x: newX, y: newY });

      onDragUpdate({
        blockId: block.id,
        x: newX,
        y: newY,
        width: position.width,
        height: position.height,
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      onDragUpdate(null);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  // Resize handling with snapping - supports all corners
  const handleResizeStart = (e: React.MouseEvent, corner: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    snapshot(); // Capture state before resize
    setIsResizing(true);
    resizeStartRef.current = {
      width: position.width,
      height: position.height,
      x: position.x,
      y: position.y,
      mouseX: e.clientX,
      mouseY: e.clientY,
      corner,
    };

    const handleMouseMove = (e: MouseEvent) => {
      const parentRect = elementRef.current?.parentElement?.getBoundingClientRect();
      if (!parentRect) return;

      const deltaX = ((e.clientX - resizeStartRef.current.mouseX) / parentRect.width) * 100;
      const deltaY = ((e.clientY - resizeStartRef.current.mouseY) / parentRect.height) * 100;
      const { corner } = resizeStartRef.current;

      let newX = resizeStartRef.current.x;
      let newY = resizeStartRef.current.y;
      let newWidth = resizeStartRef.current.width;
      let newHeight = resizeStartRef.current.height;

      // Handle horizontal resize based on corner
      if (corner.includes("e")) {
        // East (right) - increase width
        newWidth = Math.max(5, resizeStartRef.current.width + deltaX);
      } else if (corner.includes("w")) {
        // West (left) - move x and adjust width
        newX = resizeStartRef.current.x + deltaX;
        newWidth = resizeStartRef.current.width - deltaX;
        if (newWidth < 5) {
          newWidth = 5;
          newX = resizeStartRef.current.x + resizeStartRef.current.width - 5;
        }
        if (newX < 0) {
          newWidth = newWidth + newX;
          newX = 0;
        }
      }

      // Handle vertical resize based on corner
      if (corner.includes("s")) {
        // South (bottom) - increase height
        newHeight = Math.max(5, resizeStartRef.current.height + deltaY);
      } else if (corner.includes("n")) {
        // North (top) - move y and adjust height
        newY = resizeStartRef.current.y + deltaY;
        newHeight = resizeStartRef.current.height - deltaY;
        if (newHeight < 5) {
          newHeight = 5;
          newY = resizeStartRef.current.y + resizeStartRef.current.height - 5;
        }
        if (newY < 0) {
          newHeight = newHeight + newY;
          newY = 0;
        }
      }

      // Clamp to canvas bounds
      if (newX + newWidth > 100) newWidth = 100 - newX;
      if (newY + newHeight > 100) newHeight = 100 - newY;

      // Snap to common sizes
      const commonSizes = [10, 20, 25, 33.33, 50, 66.67, 75, 80, 90, 100];
      for (const size of commonSizes) {
        if (Math.abs(newWidth - size) < snapThreshold) newWidth = size;
        if (Math.abs(newHeight - size) < snapThreshold) newHeight = size;
      }

      // Snap edges to center and bounds
      const rightEdge = newX + newWidth;
      if (Math.abs(rightEdge - 50) < snapThreshold) newWidth = 50 - newX;
      if (Math.abs(rightEdge - 100) < snapThreshold) newWidth = 100 - newX;
      if (Math.abs(newX - 50) < snapThreshold) {
        const diff = newX - 50;
        newX = 50;
        newWidth = newWidth + diff;
      }
      if (Math.abs(newX) < snapThreshold) {
        newWidth = newWidth + newX;
        newX = 0;
      }

      const bottomEdge = newY + newHeight;
      if (Math.abs(bottomEdge - 50) < snapThreshold) newHeight = 50 - newY;
      if (Math.abs(bottomEdge - 100) < snapThreshold) newHeight = 100 - newY;
      if (Math.abs(newY - 50) < snapThreshold) {
        const diff = newY - 50;
        newY = 50;
        newHeight = newHeight + diff;
      }
      if (Math.abs(newY) < snapThreshold) {
        newHeight = newHeight + newY;
        newY = 0;
      }

      updateBlockPosition(block.id, { x: newX, y: newY, width: newWidth, height: newHeight });

      onDragUpdate({
        blockId: block.id,
        x: newX,
        y: newY,
        width: newWidth,
        height: newHeight,
      });
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      onDragUpdate(null);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  // Block type switcher
  const [showTypeSwitcher, setShowTypeSwitcher] = useState(false);

  const blockTypeOptions: { type: BlockType; label: string; fontSize: number }[] = [
    { type: "h1", label: "H1", fontSize: 72 },
    { type: "h2", label: "H2", fontSize: 56 },
    { type: "h3", label: "H3", fontSize: 40 },
    { type: "h4", label: "H4", fontSize: 32 },
    { type: "text", label: "Text", fontSize: 24 },
  ];

  const changeBlockType = (newType: BlockType) => {
    const option = blockTypeOptions.find((o) => o.type === newType);
    if (!option || newType === type) {
      setShowTypeSwitcher(false);
      return;
    }
    snapshot(); // Capture state before type change
    const isNewHeading = newType.startsWith("h");
    updateBlock(block.id, {
      type: newType,
      style: {
        ...block.style,
        fontSize: option.fontSize,
        fontWeight: isNewHeading ? "bold" : (block.style?.fontWeight === "bold" ? "normal" : block.style?.fontWeight),
      },
    });
    setShowTypeSwitcher(false);
  };

  // Close type switcher when editing ends
  useEffect(() => {
    if (!isEditing) setShowTypeSwitcher(false);
  }, [isEditing]);

  // Check if block is a heading type
  const isHeading = type === "h1" || type === "h2" || type === "h3" || type === "h4";

  // Render block content based on type
  const renderContent = () => {
    // Default font sizes for each type (in case style is missing)
    const defaultFontSizes: Record<string, number> = {
      h1: 72,
      h2: 56,
      h3: 40,
      h4: 32,
      text: 24,
    };
    
    const fontSize = style?.fontSize || defaultFontSizes[type] || 24;
    
    const baseStyle: React.CSSProperties = {
      fontSize: fontSize * scale,
      fontWeight: style?.fontWeight || (isHeading ? "bold" : undefined),
      textAlign: style?.textAlign,
      color: style?.color || theme.colors.text,
      fontFamily: theme.font ? `"${theme.font}", sans-serif` : undefined,
      // Apply glow effect to text
      textShadow: theme.effects?.glow 
        ? `0 0 10px ${theme.colors.accent}, 0 0 20px ${theme.colors.accent}, 0 0 30px ${theme.colors.accent}40`
        : undefined,
    };

    switch (type) {
      case "h1":
      case "h2":
      case "h3":
      case "h4":
      case "text":
        return (
          <div
            ref={contentRef}
            contentEditable={isEditing}
            suppressContentEditableWarning
            onBlur={handleBlur}
            onInput={handleInput}
            onKeyDown={handleKeyDown}
            className={cn(
              "w-full h-full outline-none overflow-auto",
              "whitespace-pre-wrap break-words",
              style?.textAlign === "center" && "text-center",
              style?.textAlign === "right" && "text-right",
              isEditing && "cursor-text ring-2 ring-sky-400/50 rounded",
              isHeading && "font-bold",
              "[&_blockquote]:border-l-4 [&_blockquote]:border-current [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:opacity-80",
              "[&_ul]:list-disc [&_ul]:ml-6 [&_ol]:list-decimal [&_ol]:ml-6"
            )}
            style={baseStyle}
          />
        );

      case "image":
        return content ? (
          <img
            src={content}
            alt=""
            className={cn(
              "w-full h-full object-cover",
              theme.style === "rounded" && "rounded-lg",
              theme.style === "sharp" && "rounded-sm",
              theme.style === "pixel" && "rounded-none"
            )}
            draggable={false}
          />
        ) : (
          <div 
            className={cn(
              "w-full h-full flex items-center justify-center text-sm border-2 border-dashed",
              theme.style === "rounded" && "rounded-lg",
              theme.style === "sharp" && "rounded-sm",
              theme.style === "pixel" && "rounded-none"
            )}
            style={{ 
              backgroundColor: theme.colors.surface, 
              borderColor: theme.colors.textMuted,
              color: theme.colors.textMuted 
            }}
          >
            Double-click to add image
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div
      ref={elementRef}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      className={cn(
        "absolute",
        !isEditing && "cursor-move",
        isSelected && !isDragging && "ring-2 ring-sky-500",
        isDragging && "ring-2 ring-sky-500 opacity-90 cursor-grabbing",
        isResizing && "ring-2 ring-sky-500"
      )}
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        width: `${position.width}%`,
        height: `${position.height}%`,
        zIndex: block.zIndex ?? 1,
      }}
    >
      {/* Block type label + Drag handle */}
      {isSelected && !isEditing && (
        <div
          onMouseDown={handleDragStart}
          className="absolute top-0 left-0 flex items-center gap-2 px-1.5 py-0.5 bg-sky-500/70 text-white text-[10px] cursor-grab z-20 rounded-br-md"
        >
          <span className="font-bold uppercase tracking-wide">{type === "text" ? "Text" : type === "image" ? "Image" : type.toUpperCase()}</span>
          <div className="flex items-center gap-0.5 opacity-70">
            <Move size={10} />
            <span>Drag</span>
          </div>
        </div>
      )}

      {/* Text formatting toolbar - only when editing */}
      {isEditing && (type === "text" || isHeading) && (
        <div 
          className="fixed top-[108px] left-1/2 -translate-x-1/2 flex items-center gap-0.5 bg-white border border-slate-200 rounded-lg shadow-xl z-[100] p-1"
          onMouseDown={(e) => {
            e.preventDefault(); // Prevent losing focus
            e.stopPropagation();
          }}
        >
          {/* Heading level switcher — only for heading blocks */}
          {isHeading && (
            <>
              <div className="relative">
                <button
                  ref={typeSwitcherBtnRef}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setShowTypeSwitcher((prev) => !prev);
                  }}
                  className="flex items-center gap-1 px-2 py-1.5 rounded font-bold text-xs bg-sky-50 text-sky-700 hover:bg-sky-100 transition-colors min-w-[52px] justify-between"
                  title="Change heading level"
                >
                  <span>{type.toUpperCase()}</span>
                  <ChevronDown size={10} />
                </button>
                {showTypeSwitcher && createPortal(
                  <div
                    className="fixed py-1 bg-white border border-slate-200 rounded-lg shadow-xl min-w-[120px]"
                    style={{
                      top: (typeSwitcherBtnRef.current?.getBoundingClientRect().bottom ?? 0) + 4,
                      left: typeSwitcherBtnRef.current?.getBoundingClientRect().left ?? 0,
                      zIndex: 99999,
                    }}
                    onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
                  >
                    {blockTypeOptions.filter((o) => o.type !== "text").map((opt) => (
                      <button
                        key={opt.type}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          changeBlockType(opt.type);
                        }}
                        className={cn(
                          "w-full flex items-center justify-between px-3 py-1.5 text-xs transition-colors",
                          opt.type === type
                            ? "bg-sky-50 text-sky-700 font-bold"
                            : "text-slate-600 hover:bg-slate-50"
                        )}
                      >
                        <span className="font-semibold">{opt.label}</span>
                        <span className="text-[10px] text-slate-400">{opt.fontSize}px</span>
                      </button>
                    ))}
                  </div>,
                  document.body
                )}
              </div>
              <div className="w-px h-5 bg-slate-200 mx-1" />
            </>
          )}
          <button
            onMouseDown={(e) => {
              e.preventDefault();
              formatText("bold");
            }}
            className="p-1.5 hover:bg-slate-100 rounded text-slate-600 hover:text-slate-900"
            title="Bold (Ctrl+B)"
          >
            <Bold size={14} />
          </button>
          <button
            onMouseDown={(e) => {
              e.preventDefault();
              formatText("italic");
            }}
            className="p-1.5 hover:bg-slate-100 rounded text-slate-600 hover:text-slate-900"
            title="Italic (Ctrl+I)"
          >
            <Italic size={14} />
          </button>
          <button
            onMouseDown={(e) => {
              e.preventDefault();
              formatText("underline");
            }}
            className="p-1.5 hover:bg-slate-100 rounded text-slate-600 hover:text-slate-900"
            title="Underline (Ctrl+U)"
          >
            <Underline size={14} />
          </button>
          <button
            onMouseDown={(e) => {
              e.preventDefault();
              formatText("strikeThrough");
            }}
            className="p-1.5 hover:bg-slate-100 rounded text-slate-600 hover:text-slate-900"
            title="Strikethrough"
          >
            <Strikethrough size={14} />
          </button>
          <div className="w-px h-5 bg-slate-200 mx-1" />
          <button
            onMouseDown={(e) => {
              e.preventDefault();
              changeAlignment("left");
            }}
            className={cn(
              "p-1.5 rounded",
              currentAlign === "left" ? "bg-slate-200 text-slate-900" : "hover:bg-slate-100 text-slate-600 hover:text-slate-900"
            )}
            title="Align Left"
          >
            <AlignLeft size={14} />
          </button>
          <button
            onMouseDown={(e) => {
              e.preventDefault();
              changeAlignment("center");
            }}
            className={cn(
              "p-1.5 rounded",
              currentAlign === "center" ? "bg-slate-200 text-slate-900" : "hover:bg-slate-100 text-slate-600 hover:text-slate-900"
            )}
            title="Align Center"
          >
            <AlignCenter size={14} />
          </button>
          <button
            onMouseDown={(e) => {
              e.preventDefault();
              changeAlignment("right");
            }}
            className={cn(
              "p-1.5 rounded",
              currentAlign === "right" ? "bg-slate-200 text-slate-900" : "hover:bg-slate-100 text-slate-600 hover:text-slate-900"
            )}
            title="Align Right"
          >
            <AlignRight size={14} />
          </button>
          <div className="w-px h-5 bg-slate-200 mx-1" />
          <button
            onMouseDown={(e) => {
              e.preventDefault();
              formatText("insertUnorderedList");
            }}
            className="p-1.5 hover:bg-slate-100 rounded text-slate-600 hover:text-slate-900"
            title="Bullet List"
          >
            <List size={14} />
          </button>
          <button
            onMouseDown={(e) => {
              e.preventDefault();
              formatText("insertOrderedList");
            }}
            className="p-1.5 hover:bg-slate-100 rounded text-slate-600 hover:text-slate-900"
            title="Numbered List"
          >
            <ListOrdered size={14} />
          </button>
          <button
            onMouseDown={(e) => {
              e.preventDefault();
              formatText("formatBlock", "blockquote");
            }}
            className="p-1.5 hover:bg-slate-100 rounded text-slate-600 hover:text-slate-900"
            title="Blockquote"
          >
            <Quote size={14} />
          </button>
          {/* Font size controls - only for text, not headings */}
          {type === "text" && (
            <>
              <div className="w-px h-5 bg-slate-200 mx-1" />
              <button
                onMouseDown={(e) => {
                  e.preventDefault();
                  changeFontSize(-4);
                }}
                className="p-1.5 hover:bg-slate-100 rounded text-slate-600 hover:text-slate-900"
                title="Decrease font size"
              >
                <Minus size={14} />
              </button>
              <span className="text-xs text-slate-500 min-w-[28px] text-center font-mono">
                {currentFontSize}
              </span>
              <button
                onMouseDown={(e) => {
                  e.preventDefault();
                  changeFontSize(4);
                }}
                className="p-1.5 hover:bg-slate-100 rounded text-slate-600 hover:text-slate-900"
                title="Increase font size"
              >
                <Plus size={14} />
              </button>
            </>
          )}
          {/* Color picker */}
          <div className="w-px h-5 bg-slate-200 mx-1" />
          <div className="relative">
            <button
              onMouseDown={(e) => {
                e.preventDefault();
                setShowInlineColorPicker(!showInlineColorPicker);
              }}
              className="p-1.5 hover:bg-slate-100 rounded flex items-center gap-1"
              title="Text Color"
            >
              <div 
                className="w-4 h-4 rounded border border-slate-300"
                style={{ backgroundColor: style?.color || theme.colors.text }}
              />
            </button>
            {showInlineColorPicker && (
              <div 
                className="absolute top-full left-0 mt-2 p-2 bg-white border border-slate-200 rounded-lg shadow-lg z-50"
                onMouseDown={(e) => e.stopPropagation()}
              >
                <div className="grid grid-cols-5 gap-1 mb-2">
                  {presetColors.map((color) => (
                    <button
                      key={color}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleColorChange(color);
                        setShowInlineColorPicker(false);
                      }}
                      className={cn(
                        "w-6 h-6 rounded border-2 transition-transform hover:scale-110",
                        style?.color === color ? "border-sky-500" : "border-slate-200"
                      )}
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={style?.color || theme.colors.text}
                    onChange={(e) => handleColorChange(e.target.value)}
                    className="w-8 h-8 rounded cursor-pointer border-0"
                    title="Custom color"
                  />
                  <input
                    type="text"
                    value={style?.color || ""}
                    onChange={(e) => handleColorChange(e.target.value)}
                    placeholder={theme.colors.text}
                    className="flex-1 px-2 py-1 text-xs border border-slate-200 rounded w-20"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Block content */}
      <div 
        className="w-full h-full"
        onMouseDown={!isEditing ? handleDragStart : undefined}
      >
        {renderContent()}
      </div>

      {/* Resize handles - all four corners */}
      {isSelected && !isEditing && (
        <>
          {/* Top-left */}
          <div
            onMouseDown={(e) => handleResizeStart(e, "nw")}
            className="absolute top-0 left-0 w-3 h-3 bg-sky-500 rounded-br-full cursor-nw-resize shadow-md z-20"
          />
          {/* Top-right */}
          <div
            onMouseDown={(e) => handleResizeStart(e, "ne")}
            className="absolute top-0 right-0 w-3 h-3 bg-sky-500 rounded-bl-full cursor-ne-resize shadow-md z-20"
          />
          {/* Bottom-left */}
          <div
            onMouseDown={(e) => handleResizeStart(e, "sw")}
            className="absolute bottom-0 left-0 w-3 h-3 bg-sky-500 rounded-tr-full cursor-sw-resize shadow-md z-20"
          />
          {/* Bottom-right */}
          <div
            onMouseDown={(e) => handleResizeStart(e, "se")}
            className="absolute bottom-0 right-0 w-3 h-3 bg-sky-500 rounded-tl-full cursor-se-resize shadow-md z-20"
          />
          {/* Size indicator while resizing */}
          {isResizing && (
            <div className="absolute bottom-0 right-0 px-2 py-0.5 bg-slate-800/80 text-white text-[10px] rounded-tl shadow-md z-20 font-mono backdrop-blur-sm">
              {position.width.toFixed(0)}% × {position.height.toFixed(0)}%
            </div>
          )}
        </>
      )}

      {/* Position indicator while dragging */}
      {isDragging && (
        <div className="absolute top-0 right-0 px-2 py-0.5 bg-slate-800/80 text-white text-[10px] rounded-bl shadow-md z-20 font-mono backdrop-blur-sm">
          {position.x.toFixed(0)}%, {position.y.toFixed(0)}%
        </div>
      )}

      {/* Block actions */}
      {isSelected && !isEditing && !isDragging && !isResizing && (
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex items-center bg-white/90 backdrop-blur-sm border border-sky-200 rounded-t-md shadow-md z-20">
          {/* Color picker - only for text elements */}
          {(isHeading || type === "text") && (
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowColorPicker(!showColorPicker);
                }}
                className="p-1.5 hover:bg-sky-50 text-slate-500 hover:text-slate-700 rounded-l-md border-r border-slate-100"
                title="Text Color"
              >
                <Palette size={14} style={{ color: style?.color || theme.colors.text }} />
              </button>
              
              {/* Color picker popover */}
              {showColorPicker && (
                <div 
                  className="absolute top-full left-0 mt-2 p-2 bg-white border border-slate-200 rounded-lg shadow-lg z-50"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="grid grid-cols-5 gap-1 mb-2">
                    {presetColors.map((color) => (
                      <button
                        key={color}
                        onClick={() => {
                          handleColorChange(color);
                          setShowColorPicker(false);
                        }}
                        className={cn(
                          "w-6 h-6 rounded border-2 transition-transform hover:scale-110",
                          style?.color === color ? "border-sky-500" : "border-slate-200"
                        )}
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={style?.color || theme.colors.text}
                      onChange={(e) => handleColorChange(e.target.value)}
                      className="w-8 h-8 rounded cursor-pointer border-0"
                      title="Custom color"
                    />
                    <input
                      type="text"
                      value={style?.color || ""}
                      onChange={(e) => handleColorChange(e.target.value)}
                      placeholder={theme.colors.text}
                      className="flex-1 px-2 py-1 text-xs border border-slate-200 rounded w-20"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              snapshot();
              bringToFront(block.id);
            }}
            className={cn(
              "p-1.5 hover:bg-sky-50 text-slate-500 hover:text-slate-700 border-r border-slate-100",
              !(isHeading || type === "text") && "rounded-l-md"
            )}
            title="Bring to Front"
          >
            <ArrowUpToLine size={14} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              snapshot();
              sendToBack(block.id);
            }}
            className="p-1.5 hover:bg-sky-50 text-slate-500 hover:text-slate-700 border-r border-slate-100"
            title="Send to Back"
          >
            <ArrowDownToLine size={14} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              snapshot();
              duplicateBlock(block.id);
            }}
            className="p-1.5 hover:bg-sky-50 text-slate-500 hover:text-slate-700 border-r border-slate-100"
            title="Duplicate"
          >
            <Copy size={14} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              snapshot();
              deleteBlock(block.id);
            }}
            className="p-1.5 hover:bg-red-50 text-slate-500 hover:text-red-500 rounded-r-md"
            title="Delete"
          >
            <Trash2 size={14} />
          </button>
        </div>
      )}

      {/* Image upload modal */}
      <ImageUploadModal
        isOpen={showImageModal}
        onClose={() => setShowImageModal(false)}
        onImageSelect={handleImageSelect}
        currentImage={type === "image" ? content : undefined}
      />
    </div>
  );
}
