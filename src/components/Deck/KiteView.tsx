"use client";

import { useState, useCallback, useEffect } from "react";
import { type Kite, type ContentBlock } from "@/lib/types";
import { type KiteTheme, getBackgroundForKite } from "@/lib/themes";
import { cn } from "@/lib/utils";
import { ZombieAttack } from "./ZombieAttack";

interface KiteViewProps {
  kite: Kite;
  index: number;
  isActive?: boolean;
  theme: KiteTheme;
}

/**
 * KiteView Component
 * Renders a single kite in presentation mode (full-screen with scroll-snap)
 */
export function KiteView({ kite, index, isActive = false, theme }: KiteViewProps) {
  const backgroundImage = getBackgroundForKite(theme, index);
  const [isAttacked, setIsAttacked] = useState(false);
  
  // Reset attack state when slide becomes active (e.g., navigating back to it)
  useEffect(() => {
    if (isActive) {
      setIsAttacked(false);
    }
  }, [isActive]);

  // Handle zombie attack
  const handleZombieAttack = useCallback(() => {
    setIsAttacked(true);
  }, []);

  // Reset attack state when moving to next slide
  const handleZombieReset = useCallback(() => {
    setIsAttacked(false);
  }, []);
  
  return (
    <section
      id={`kite-${kite.id}`}
      data-kite-index={index}
      className={cn(
        "h-screen w-full flex-shrink-0 snap-start snap-always",
        "relative overflow-hidden"
      )}
      style={{
        backgroundColor: theme.colors.background,
        fontFamily: theme.font ? `"${theme.font}", sans-serif` : undefined,
      }}
    >
      {/* Theme background image */}
      {backgroundImage && (
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url(${backgroundImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
      )}

      {/* Theme effects - SCANLINES */}
      {theme.effects?.scanlines && (
        <div 
          className="absolute inset-0 pointer-events-none z-10"
          style={{
            backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,0,0.03) 2px, rgba(0,255,0,0.03) 4px)",
          }}
        />
      )}
      
      {/* Theme effects - NOISE/PAPER */}
      {theme.effects?.noise && (
        <div 
          className="absolute inset-0 pointer-events-none z-10 opacity-20"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />
      )}
      
      {/* Theme effects - GLOW */}
      {theme.effects?.glow && (
        <div 
          className="absolute inset-0 pointer-events-none z-10"
          style={{
            background: `radial-gradient(ellipse at center, transparent 0%, transparent 50%, ${theme.colors.accent}15 100%)`,
            boxShadow: `inset 0 0 150px ${theme.colors.accent}30`,
          }}
        />
      )}

      {/* Zombie Attack Effect - only for zombie theme */}
      {theme.effects?.zombieAttack?.enabled && (
        <ZombieAttack
          config={theme.effects.zombieAttack}
          isActive={isActive}
          onAttack={handleZombieAttack}
          onReset={handleZombieReset}
        />
      )}

      {/* Kite number indicator */}
      <span 
        className="absolute bottom-4 right-4 text-sm font-mono opacity-50"
        style={{ color: theme.colors.textMuted }}
      >
        {index + 1}
      </span>

      {/* Render all content blocks */}
      {kite.contentBlocks.map((block) => (
        <PresentationBlock 
          key={block.id} 
          block={block} 
          theme={theme} 
          isAttacked={isAttacked && theme.effects?.zombieAttack?.enabled}
        />
      ))}
    </section>
  );
}

/**
 * Presentation Block
 * Renders a content block in presentation mode (read-only)
 */
function PresentationBlock({ 
  block, 
  theme, 
  isAttacked = false 
}: { 
  block: ContentBlock; 
  theme: KiteTheme;
  isAttacked?: boolean;
}) {
  const { type, position, content, style } = block;

  const isHeading = type === "h1" || type === "h2" || type === "h3" || type === "h4";
  const isTextBlock = isHeading || type === "text";

  // Default font sizes for each type (in case style is missing)
  const defaultFontSizes: Record<string, number> = {
    h1: 72,
    h2: 56,
    h3: 40,
    h4: 32,
    text: 24,
  };

  const baseStyle: React.CSSProperties = {
    fontSize: style?.fontSize || defaultFontSizes[type] || 24,
    fontWeight: style?.fontWeight || (isHeading ? "bold" : undefined),
    textAlign: style?.textAlign,
    color: style?.color || theme.colors.text,
    fontFamily: theme.font ? `"${theme.font}", sans-serif` : undefined,
    textShadow: theme.effects?.glow 
      ? `0 0 10px ${theme.colors.accent}, 0 0 20px ${theme.colors.accent}, 0 0 40px ${theme.colors.accent}60`
      : undefined,
  };

  const renderContent = () => {
    switch (type) {
      case "h1":
      case "h2":
      case "h3":
      case "h4":
      case "text":
        return (
          <div
            className={cn(
              "w-full h-full overflow-hidden",
              style?.textAlign === "center" && "text-center",
              style?.textAlign === "right" && "text-right",
              isHeading && "font-bold",
              "[&_blockquote]:border-l-4 [&_blockquote]:border-current [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:opacity-80",
              "[&_ul]:list-disc [&_ul]:ml-6 [&_ol]:list-decimal [&_ol]:ml-6",
              isAttacked && "zombie-text-attacked"
            )}
            style={baseStyle}
            dangerouslySetInnerHTML={{ __html: content }}
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
          />
        ) : (
          <div 
            className={cn(
              "w-full h-full",
              theme.style === "rounded" && "rounded-lg",
              theme.style === "sharp" && "rounded-sm",
              theme.style === "pixel" && "rounded-none"
            )}
            style={{ backgroundColor: theme.colors.surface }}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div
      className={cn(
        "absolute",
        isAttacked && isTextBlock && "relative"
      )}
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        width: `${position.width}%`,
        height: `${position.height}%`,
        zIndex: block.zIndex ?? 1,
      }}
    >
      {renderContent()}
      
      {/* Scratch marks overlay when attacked */}
      {isAttacked && isTextBlock && (
        <div className="zombie-scratch-overlay" />
      )}
    </div>
  );
}

