"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { type Kite, type ContentBlock } from "@/lib/types";
import { type KiteTheme, getBackgroundForKite } from "@/lib/themes";
import { cn, sanitizeBlockHtml, BLOCK_CONTENT_CLASSES } from "@/lib/utils";
import { ZombieAttack, type AttackType } from "./ZombieAttack";
import { PresentationTimer } from "./PresentationTimer";

// Design dimensions — must match the editor canvas
const DESIGN_W = 1920;
const DESIGN_H = 1080;

interface KiteViewProps {
  kite: Kite;
  index: number;
  isActive?: boolean;
  theme: KiteTheme;
  timerSeconds: number;  // Pre-resolved duration for this kite
  timerStarted?: boolean;  // Whether the timer has been started (for presenter view)
}

/**
 * KiteView Component
 * Renders a single kite in presentation mode (full-screen with scroll-snap)
 */
export function KiteView({ kite, index, isActive = false, theme, timerSeconds, timerStarted = true }: KiteViewProps) {
  const backgroundImage = getBackgroundForKite(theme, index);
  const [isAttacked, setIsAttacked] = useState(false);
  const [attackType, setAttackType] = useState<AttackType>("scratch");
  
  // Check if this theme has zombie attack enabled
  const hasZombieAttack = theme.effects?.zombieAttack?.enabled;
  // Check if timer is enabled for this theme
  const hasTimer = theme.timer?.enabled;
  
  // Reset attack state when kite becomes active (e.g., navigating back to it)
  useEffect(() => {
    if (isActive) {
      setIsAttacked(false);
    }
  }, [isActive]);

  // Handle zombie attack - receives attack type from ZombieAttack
  const handleZombieAttack = useCallback((type: AttackType) => {
    setAttackType(type);
    setIsAttacked(true);
  }, []);

  // Reset attack state when moving to next kite
  const handleZombieReset = useCallback(() => {
    setIsAttacked(false);
  }, []);
  
  // Scale the 1920×1080 design to fit the viewport — guarantees WYSIWYG
  const sectionRef = useRef<HTMLElement>(null);
  const [presentationScale, setPresentationScale] = useState(1);

  useEffect(() => {
    const computeScale = () => {
      if (!sectionRef.current) return;
      const parent = sectionRef.current;
      const sw = parent.clientWidth / DESIGN_W;
      const sh = parent.clientHeight / DESIGN_H;
      setPresentationScale(Math.min(sw, sh));
    };
    computeScale();
    window.addEventListener("resize", computeScale);
    return () => window.removeEventListener("resize", computeScale);
  }, []);

  return (
    <section
      ref={sectionRef}
      id={`kite-${kite.id}`}
      data-kite-index={index}
      className={cn(
        "h-screen w-full flex-shrink-0 snap-start snap-always",
        "relative overflow-hidden flex items-center justify-center"
      )}
      style={{
        backgroundColor: theme.colors.background,
        fontFamily: theme.font ? `"${theme.font}", sans-serif` : undefined,
        willChange: "transform",
        transform: "translateZ(0)",
      }}
    >
      {/* Full-bleed background — fills entire viewport (no letterbox bars) */}
      {backgroundImage && (
        <>
          <div 
            className="absolute inset-0 z-0"
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
              margin: theme.backgroundTreatment?.blur ? `-${theme.backgroundTreatment.blur * 2}px` : undefined,
              padding: theme.backgroundTreatment?.blur ? `${theme.backgroundTreatment.blur * 2}px` : undefined,
            }}
          />
          {theme.backgroundTreatment?.overlay && (
            <div 
              className="absolute inset-0 z-0"
              style={{ backgroundColor: theme.backgroundTreatment.overlay }}
            />
          )}
        </>
      )}

      {/* Full-bleed theme effects */}
      {theme.effects?.scanlines && (
        <div 
          className="absolute inset-0 pointer-events-none z-10"
          style={{
            backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,0,0.03) 2px, rgba(0,255,0,0.03) 4px)",
          }}
        />
      )}
      {theme.effects?.noise && (
        <div 
          className="absolute inset-0 pointer-events-none z-10 opacity-20"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />
      )}
      {theme.effects?.glow && (
        <div 
          className="absolute inset-0 pointer-events-none z-10"
          style={{
            background: `radial-gradient(ellipse at center, transparent 0%, transparent 50%, ${theme.colors.accent}15 100%)`,
            boxShadow: `inset 0 0 150px ${theme.colors.accent}30`,
          }}
        />
      )}

      {/* Scaled 1920×1080 canvas for content — WYSIWYG with editor */}
      <div
        className="z-20"
        style={{
          width: DESIGN_W,
          height: DESIGN_H,
          transform: `scale(${presentationScale})`,
          transformOrigin: "center center",
          position: "relative",
          flexShrink: 0,
        }}
      >
        {/* Presentation Timer */}
        {hasTimer && !hasZombieAttack && timerStarted && (
          <PresentationTimer
            timerSeconds={timerSeconds}
            isActive={isActive}
            theme={theme}
          />
        )}

        {/* Zombie Attack Effect */}
        {hasZombieAttack && timerStarted && (
          <ZombieAttack
            config={theme.effects!.zombieAttack!}
            timerSeconds={timerSeconds}
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
            attackType={attackType}
          />
        ))}
      </div>
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
  isAttacked = false,
  attackType = "scratch"
}: { 
  block: ContentBlock; 
  theme: KiteTheme;
  isAttacked?: boolean;
  attackType?: AttackType;
}) {
  const { type, position, content, style } = block;

  const isHeading = type === "h1" || type === "h2" || type === "h3" || type === "h4";
  const isTextBlock = isHeading || type === "text";
  
  // Get attack-specific CSS class
  const attackClass = isAttacked ? `zombie-attack-${attackType}` : "";

  // Default font sizes for each type (in case style is missing)
  const defaultFontSizes: Record<string, number> = {
    h1: 72,
    h2: 56,
    h3: 40,
    h4: 32,
    text: 24,
  };

  // Determine the appropriate color based on block type
  // Headings use theme.colors.heading, text uses theme.colors.text
  // User-set color (style.color) overrides theme defaults
  const getTextColor = () => {
    if (style?.color) return style.color; // User override
    if (isHeading) return theme.colors.heading;
    return theme.colors.text;
  };

  // Get text shadow - headings get special shadow for contrast
  const getTextShadow = () => {
    if (theme.effects?.glow) {
      return `0 0 10px ${theme.colors.accent}, 0 0 20px ${theme.colors.accent}, 0 0 40px ${theme.colors.accent}60`;
    }
    if (isHeading && theme.colors.headingShadow) {
      return theme.colors.headingShadow;
    }
    return undefined;
  };

  const baseStyle: React.CSSProperties = {
    fontSize: style?.fontSize || defaultFontSizes[type] || 24,
    fontWeight: style?.fontWeight || (isHeading ? "bold" : undefined),
    textAlign: style?.textAlign,
    color: getTextColor(),
    fontFamily: theme.font ? `"${theme.font}", sans-serif` : undefined,
    textShadow: getTextShadow(),
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
              BLOCK_CONTENT_CLASSES,
              attackClass
            )}
            style={baseStyle}
            dangerouslySetInnerHTML={{ __html: sanitizeBlockHtml(content) }}
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
      
      {/* Attack-specific overlay */}
      {isAttacked && isTextBlock && (
        <div className={`zombie-overlay-${attackType}`} />
      )}
    </div>
  );
}

