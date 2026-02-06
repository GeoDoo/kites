"use client";

import { useState, useEffect, useMemo } from "react";
import type { ZombieAttackConfig } from "@/lib/themes";

// 5 different attack types for variety
export type AttackType = "scratch" | "infection" | "devour" | "drag" | "splatter";
const ATTACK_TYPES: AttackType[] = ["scratch", "infection", "devour", "drag", "splatter"];

interface ZombieAttackProps {
  config: ZombieAttackConfig;
  timerSeconds: number;  // Calculated time per kite (totalTalkTime / numKites)
  isActive: boolean;
  onAttack: (attackType: AttackType) => void;  // Now passes attack type
  onReset: () => void;
}

// Direction zombie can come from
type Direction = "left" | "right" | "top" | "bottom" | "top-left" | "top-right" | "bottom-left" | "bottom-right";

// Zombie horde member configuration
interface HordeZombie {
  id: number;
  emoji: string;
  name: string; // LLM name tag
  size: number;
  direction: Direction;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  startDelay: number;
  speedVariation: number;
  rotation: number; // Rotation to face center
}

// Zombie sprites only (no skulls - just the undead walkers)
const ZOMBIE_SPRITES = ["🧟", "🧟‍♂️", "🧟‍♀️"];

// The undead AI horde — each zombie gets a name tag
const LLM_NAMES = [
  "GPT-4o", "Claude", "Gemini", "LLaMA", "Mixtral", "Copilot",
  "Grok", "Devin", "Cursor", "Codex", "Bard†", "PaLM†",
  "DALL·E", "Midjourney", "Stable Diff", "Perplexity",
  "ChatGPT", "v0", "Bolt", "Windsurf", "Sonnet", "Opus",
  "o1", "o3", "Haiku", "Command R", "Phi-3", "Qwen",
];

const DIRECTIONS: Direction[] = [
  "left", "right", "top", "bottom", 
  "top-left", "top-right", "bottom-left", "bottom-right"
];

// Get start position based on direction (off-screen)
function getStartPosition(direction: Direction): { x: number; y: number } {
  const offset = 15; // How far off-screen
  const randomSpread = () => 20 + Math.random() * 60; // 20-80% for spread along edge
  
  switch (direction) {
    case "left":
      return { x: -offset, y: randomSpread() };
    case "right":
      return { x: 100 + offset, y: randomSpread() };
    case "top":
      return { x: randomSpread(), y: -offset };
    case "bottom":
      return { x: randomSpread(), y: 100 + offset };
    case "top-left":
      return { x: -offset, y: -offset + Math.random() * 20 };
    case "top-right":
      return { x: 100 + offset, y: -offset + Math.random() * 20 };
    case "bottom-left":
      return { x: -offset, y: 80 + offset + Math.random() * 20 };
    case "bottom-right":
      return { x: 100 + offset, y: 80 + offset + Math.random() * 20 };
  }
}

// Get rotation angle to face the center
function getRotation(direction: Direction): number {
  switch (direction) {
    case "left": return 0;
    case "right": return 180;
    case "top": return 90;
    case "bottom": return -90;
    case "top-left": return 45;
    case "top-right": return 135;
    case "bottom-left": return -45;
    case "bottom-right": return -135;
  }
}

// Generate randomized horde from all directions
function generateHorde(count: number): HordeZombie[] {
  // Shuffle LLM names so each run is different
  const shuffled = [...LLM_NAMES].sort(() => Math.random() - 0.5);

  return Array.from({ length: count }, (_, i) => {
    const direction = DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)];
    const start = getStartPosition(direction);
    // End position: cluster around center with some randomness
    const endX = 40 + Math.random() * 20; // 40-60%
    const endY = 35 + Math.random() * 30; // 35-65%
    
    return {
      id: i,
      emoji: ZOMBIE_SPRITES[Math.floor(Math.random() * ZOMBIE_SPRITES.length)],
      name: shuffled[i % shuffled.length], // Each zombie gets an LLM name
      size: 50 + Math.random() * 100, // 50-150px
      direction,
      startX: start.x,
      startY: start.y,
      endX,
      endY,
      startDelay: Math.random() * 4, // 0-4 seconds delay
      speedVariation: 0.6 + Math.random() * 0.8, // 0.6x - 1.4x speed
      rotation: getRotation(direction),
    };
  });
}

/**
 * ZombieAttack Component
 * Displays a horde of zombies attacking from ALL directions with countdown timer
 * When timer hits 0, triggers the attack effect on text
 */
export function ZombieAttack({ config, timerSeconds, isActive, onAttack, onReset }: ZombieAttackProps) {
  const [timeLeft, setTimeLeft] = useState(timerSeconds);
  const [isAttacking, setIsAttacking] = useState(false);
  const [hordeKey, setHordeKey] = useState(0);
  const [attackType, setAttackType] = useState<AttackType>("scratch");
  const [isReady, setIsReady] = useState(false);
  
  // Generate randomized horde when kite becomes active
  const hordeConfig = useMemo(() => generateHorde(12), [hordeKey]); // 12 zombies from all angles
  
  // Track positions for each zombie { x, y }
  const [hordePositions, setHordePositions] = useState<{ x: number; y: number }[]>([]);

  // Calculate base speed - zombies need to travel their distance in timerSeconds
  const totalUpdates = timerSeconds * 10;

  // Reset state when kite becomes active - randomly select attack type
  useEffect(() => {
    if (isActive) {
      setIsReady(false); // Hide zombies during transition
      setTimeLeft(timerSeconds);
      setIsAttacking(false);
      setHordeKey(prev => prev + 1);
      // Randomly select attack type for this kite
      setAttackType(ATTACK_TYPES[Math.floor(Math.random() * ATTACK_TYPES.length)]);
    } else {
      setIsReady(false); // Hide when not active
    }
  }, [isActive, timerSeconds]);

  // Initialize positions after horde is generated, then show
  useEffect(() => {
    const newPositions = hordeConfig.map(z => ({ x: z.startX, y: z.startY }));
    setHordePositions(newPositions);
    // Small delay to ensure positions are applied before showing
    const timer = setTimeout(() => {
      if (isActive) setIsReady(true);
    }, 50);
    return () => clearTimeout(timer);
  }, [hordeConfig, isActive]);

  // Countdown timer
  useEffect(() => {
    if (!isActive || isAttacking) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsAttacking(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, isAttacking]);

  // Trigger attack callback when isAttacking becomes true
  useEffect(() => {
    if (isAttacking) {
      onAttack(attackType);
    }
  }, [isAttacking, onAttack, attackType]);

  // Horde walking animation - each zombie moves toward center
  useEffect(() => {
    if (!isActive || hordePositions.length === 0) return;

    const startTime = Date.now();
    
    const interval = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      
      setHordePositions(prev => 
        prev.map((pos, i) => {
          const zombie = hordeConfig[i];
          if (!zombie) return pos;
          
          // Don't move until delay has passed
          if (elapsed < zombie.startDelay) {
            return { x: zombie.startX, y: zombie.startY };
          }
          
          // Calculate distance and speed for this zombie
          const distX = zombie.endX - zombie.startX;
          const distY = zombie.endY - zombie.startY;
          const totalDist = Math.sqrt(distX * distX + distY * distY);
          
          // Adjust speed based on distance so all zombies arrive roughly together
          const baseSpeed = totalDist / totalUpdates;
          const speed = baseSpeed * zombie.speedVariation;
          
          // Calculate movement direction
          const angle = Math.atan2(distY, distX);
          const moveX = Math.cos(angle) * speed;
          const moveY = Math.sin(angle) * speed;
          
          // Calculate new position
          let newX = pos.x + moveX;
          let newY = pos.y + moveY;
          
          // Check if we've reached or passed the target
          const remainingX = zombie.endX - newX;
          const remainingY = zombie.endY - newY;
          const passedTarget = (distX > 0 ? remainingX <= 0 : remainingX >= 0) &&
                              (distY > 0 ? remainingY <= 0 : remainingY >= 0);
          
          if (passedTarget || isAttacking) {
            return { x: zombie.endX, y: zombie.endY };
          }
          
          return { x: newX, y: newY };
        })
      );
    }, 100);

    return () => clearInterval(interval);
  }, [isActive, isAttacking, hordeConfig, hordePositions.length, totalUpdates]);

  if (!isActive || !config.enabled) return null;

  return (
    <>
      {/* Timer display - compact survival counter */}
      <div className="absolute top-4 left-4 z-50 pointer-events-none">
        <div 
          className={`
            px-3 py-1.5 rounded-lg backdrop-blur-md border
            font-bold transition-all duration-300
            ${isAttacking 
              ? "bg-red-900/90 text-red-100 border-red-600 animate-pulse" 
              : timeLeft <= 3 
                ? "bg-red-900/80 text-yellow-300 border-red-500 animate-pulse"
                : "bg-black/70 text-green-400 border-green-800"
            }
          `}
          style={{ fontFamily: "'Creepster', cursive" }}
        >
          {isAttacking ? (
            <span className="flex items-center gap-2 text-lg">
              <span className="text-xl">
                {attackType === "scratch" && "🩸"}
                {attackType === "infection" && "🦠"}
                {attackType === "devour" && "🦷"}
                {attackType === "drag" && "🪦"}
                {attackType === "splatter" && "💥"}
              </span>
              <span>
                {attackType === "scratch" && "CLAWED!"}
                {attackType === "infection" && "INFECTED!"}
                {attackType === "devour" && "DEVOURED!"}
                {attackType === "drag" && "DRAGGED!"}
                {attackType === "splatter" && "OBLITERATED!"}
              </span>
            </span>
          ) : (
            <span className="flex items-center gap-2 text-base">
              <span>{timeLeft <= 3 ? "☠️" : "⏱️"}</span>
              <span>
                {timeLeft <= 3 ? `RUN! ${timeLeft}s` : `${timeLeft}s`}
              </span>
            </span>
          )}
        </div>
      </div>

      {/* Walking zombie horde from ALL directions - only show when ready */}
      {isReady && hordeConfig.map((zombie, i) => {
        const pos = hordePositions[i] ?? { x: zombie.startX, y: zombie.startY };
        return (
          <div
            key={zombie.id}
            className="absolute z-40 pointer-events-none"
            style={{
              left: `${pos.x}%`,
              top: `${pos.y}%`,
              transform: "translate(-50%, -50%)",
              transition: "left 100ms linear, top 100ms linear",
              zIndex: 40 + Math.floor(pos.y), // Lower zombies (higher Y) in front
            }}
          >
            <div className="flex flex-col items-center">
              <div 
                className={`
                  leading-none
                  ${isAttacking ? "animate-zombie-attack" : "animate-zombie-walk"}
                `}
                style={{
                  fontSize: `${zombie.size}px`,
                  filter: `drop-shadow(0 0 ${zombie.size / 4}px rgba(0,0,0,0.9))`,
                  transform: `rotate(${zombie.rotation}deg)`,
                  animationDelay: `${(zombie.id * 0.15) % 0.6}s`,
                }}
              >
                {zombie.emoji}
              </div>
              {/* LLM name tag */}
              <span
                className="whitespace-nowrap font-bold text-center"
                style={{
                  fontFamily: "'Creepster', cursive",
                  fontSize: `${Math.max(18, zombie.size * 0.3)}px`,
                  color: "#39ff14",
                  textShadow: "0 0 8px rgba(57,255,20,0.6), 0 0 16px rgba(57,255,20,0.3), 0 2px 3px rgba(0,0,0,0.9)",
                  letterSpacing: "1px",
                  marginTop: `-${zombie.size * 0.08}px`,
                }}
              >
                {zombie.name}
              </span>
            </div>
          </div>
        );
      })}

      {/* Blood splatter overlay when attacking */}
      {isAttacking && (
        <div className="absolute inset-0 z-30 pointer-events-none animate-blood-splatter">
          <div 
            className="absolute inset-0 opacity-0"
            style={{
              background: "radial-gradient(ellipse at center, rgba(139,0,0,0.3) 0%, transparent 70%)",
              animation: "bloodPulse 0.5s ease-out forwards",
            }}
          />
        </div>
      )}

      {/* Zombie attack CSS animations */}
      <style jsx global>{`
        @keyframes zombieWalk {
          0%, 100% { transform: scaleX(-1) translateY(0) rotate(0deg); }
          25% { transform: scaleX(-1) translateY(-5px) rotate(-3deg); }
          50% { transform: scaleX(-1) translateY(0) rotate(0deg); }
          75% { transform: scaleX(-1) translateY(-5px) rotate(3deg); }
        }
        
        @keyframes zombieAttack {
          0% { transform: scaleX(-1) scale(1); }
          10% { transform: scaleX(-1) scale(1.3) rotate(-10deg); }
          20% { transform: scaleX(-1) scale(1) rotate(10deg); }
          30% { transform: scaleX(-1) scale(1.2) rotate(-5deg); }
          40% { transform: scaleX(-1) scale(1); }
          100% { transform: scaleX(-1) scale(1); }
        }
        
        @keyframes bloodPulse {
          0% { opacity: 0; }
          50% { opacity: 1; }
          100% { opacity: 0.3; }
        }
        
        .animate-zombie-walk {
          animation: zombieWalk 0.4s ease-in-out infinite;
        }
        
        .animate-zombie-attack {
          animation: zombieAttack 0.5s ease-out forwards;
        }
        
        /* ===== ATTACK TYPE 1: SCRATCH ===== */
        @keyframes scratchShake {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          10% { transform: translate(-5px, -5px) rotate(-1deg); }
          20% { transform: translate(5px, 5px) rotate(1deg); }
          30% { transform: translate(-5px, 5px) rotate(-1deg); }
          40% { transform: translate(5px, -5px) rotate(1deg); }
          50% { transform: translate(-5px, 0) rotate(-1deg); }
          60% { transform: translate(5px, 0) rotate(1deg); }
          70% { transform: translate(0, -5px) rotate(-1deg); }
          80% { transform: translate(0, 5px) rotate(1deg); }
          90% { transform: translate(-3px, -3px) rotate(0deg); }
        }
        
        @keyframes scratchBleed {
          0% { filter: none; color: inherit; }
          30% { filter: blur(1px); color: #8b0000; }
          60% { filter: blur(2px); color: #660000; }
          100% { filter: blur(3px); color: #440000; opacity: 0.6; }
        }
        
        .zombie-attack-scratch {
          animation: scratchShake 0.5s ease-in-out, scratchBleed 2s ease-out 0.5s forwards;
        }
        
        .zombie-overlay-scratch {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, transparent 45%, rgba(139,0,0,0.6) 45%, rgba(139,0,0,0.6) 47%, transparent 47%, transparent 52%, rgba(139,0,0,0.5) 52%, rgba(139,0,0,0.5) 54%, transparent 54%, transparent 58%, rgba(139,0,0,0.4) 58%, rgba(139,0,0,0.4) 60%, transparent 60%);
          animation: fadeIn 0.3s ease-out forwards;
          pointer-events: none;
        }
        
        /* ===== ATTACK TYPE 2: INFECTION ===== */
        @keyframes infectionPulse {
          0% { transform: scale(1); filter: none; }
          20% { transform: scale(1.02); filter: hue-rotate(60deg) saturate(2); }
          40% { transform: scale(0.98); filter: hue-rotate(90deg) saturate(3); }
          60% { transform: scale(1.01); filter: hue-rotate(120deg) saturate(2) blur(1px); }
          80% { transform: scale(0.99); filter: hue-rotate(100deg) saturate(1.5) blur(2px); }
          100% { transform: scale(1); filter: hue-rotate(80deg) saturate(0.5) blur(3px); color: #4a7023; opacity: 0.7; }
        }
        
        @keyframes drip {
          0% { transform: translateY(0); opacity: 1; }
          100% { transform: translateY(30px); opacity: 0; }
        }
        
        .zombie-attack-infection {
          animation: infectionPulse 2.5s ease-in-out forwards;
          color: #6b8e23 !important;
        }
        
        .zombie-overlay-infection {
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse at center, rgba(107,142,35,0.4) 0%, rgba(85,107,47,0.2) 50%, transparent 70%);
          animation: fadeIn 0.5s ease-out forwards;
          pointer-events: none;
        }
        
        /* ===== ATTACK TYPE 3: DEVOUR ===== */
        @keyframes devourChomp {
          0% { clip-path: inset(0 0 0 0); transform: scale(1); }
          15% { clip-path: inset(5% 0 0 0); transform: scale(0.98); }
          30% { clip-path: inset(10% 5% 5% 0); transform: scale(0.95); }
          45% { clip-path: inset(20% 10% 10% 5%); transform: scale(0.9); }
          60% { clip-path: inset(30% 20% 20% 15%); transform: scale(0.85); }
          75% { clip-path: inset(40% 30% 30% 25%); transform: scale(0.75); opacity: 0.7; }
          90% { clip-path: inset(50% 40% 40% 35%); transform: scale(0.6); opacity: 0.4; }
          100% { clip-path: inset(50% 50% 50% 50%); transform: scale(0.3); opacity: 0; }
        }
        
        .zombie-attack-devour {
          animation: devourChomp 2s ease-in forwards;
        }
        
        .zombie-overlay-devour {
          position: absolute;
          inset: -10%;
          background: 
            radial-gradient(ellipse 30% 40% at 20% 30%, rgba(139,0,0,0.7) 0%, transparent 70%),
            radial-gradient(ellipse 25% 35% at 75% 25%, rgba(100,0,0,0.6) 0%, transparent 70%),
            radial-gradient(ellipse 35% 30% at 50% 70%, rgba(139,0,0,0.8) 0%, transparent 70%),
            radial-gradient(ellipse 20% 25% at 85% 65%, rgba(120,0,0,0.5) 0%, transparent 70%),
            radial-gradient(ellipse 28% 32% at 15% 75%, rgba(139,0,0,0.6) 0%, transparent 70%);
          animation: bloodDrip 2s ease-out forwards;
          pointer-events: none;
        }
        
        @keyframes bloodDrip {
          0% { opacity: 0; transform: translateY(-20px); }
          30% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0.8; transform: translateY(10px); }
        }
        
        /* ===== ATTACK TYPE 4: DRAG ===== */
        @keyframes dragDown {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          20% { transform: translateY(10px) rotate(-2deg); opacity: 1; }
          40% { transform: translateY(30px) rotate(3deg); opacity: 0.9; }
          60% { transform: translateY(80px) rotate(-5deg); opacity: 0.7; }
          80% { transform: translateY(150px) rotate(8deg); opacity: 0.4; }
          100% { transform: translateY(300px) rotate(-10deg); opacity: 0; }
        }
        
        .zombie-attack-drag {
          animation: dragDown 1.5s ease-in forwards;
        }
        
        .zombie-overlay-drag {
          position: absolute;
          inset: 0;
          background: linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.3) 50%, rgba(20,10,5,0.8) 100%);
          animation: fadeIn 0.5s ease-out forwards;
          pointer-events: none;
        }
        
        /* ===== ATTACK TYPE 5: SPLATTER ===== */
        @keyframes splatterExplode {
          0% { transform: scale(1); filter: none; opacity: 1; }
          10% { transform: scale(1.5); filter: blur(0); }
          20% { transform: scale(0.8); filter: blur(2px); }
          40% { transform: scale(1.2); filter: blur(5px); opacity: 0.8; }
          60% { transform: scale(0.6); filter: blur(10px); opacity: 0.5; }
          100% { transform: scale(0.2); filter: blur(20px); opacity: 0; }
        }
        
        .zombie-attack-splatter {
          animation: splatterExplode 1s ease-out forwards;
        }
        
        .zombie-overlay-splatter {
          position: absolute;
          inset: -20%;
          background: radial-gradient(circle at 30% 40%, rgba(139,0,0,0.8) 0%, transparent 30%),
                      radial-gradient(circle at 70% 30%, rgba(139,0,0,0.7) 0%, transparent 25%),
                      radial-gradient(circle at 50% 60%, rgba(139,0,0,0.9) 0%, transparent 35%),
                      radial-gradient(circle at 20% 70%, rgba(139,0,0,0.6) 0%, transparent 20%),
                      radial-gradient(circle at 80% 70%, rgba(139,0,0,0.7) 0%, transparent 28%);
          animation: fadeIn 0.2s ease-out forwards;
          pointer-events: none;
        }
        
        @keyframes fadeIn {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
      `}</style>
    </>
  );
}
