"use client";

import { useState, useEffect, useCallback } from "react";
import type { ZombieAttackConfig } from "@/lib/themes";

interface ZombieAttackProps {
  config: ZombieAttackConfig;
  isActive: boolean;
  onAttack: () => void;
  onReset: () => void;
}

/**
 * ZombieAttack Component
 * Displays a zombie walking toward text with a countdown timer
 * When timer hits 0, triggers the attack effect on text
 */
export function ZombieAttack({ config, isActive, onAttack, onReset }: ZombieAttackProps) {
  const [timeLeft, setTimeLeft] = useState(config.timerSeconds);
  const [isAttacking, setIsAttacking] = useState(false);
  
  // Zombie position: starts off-screen right (110%), ends at center (50%)
  const START_POSITION = 110;
  const END_POSITION = 50;
  const [zombiePosition, setZombiePosition] = useState(START_POSITION);

  // Calculate zombie speed to sync EXACTLY with timer
  // Distance to travel = START - END = 60%
  // Timer counts down every 1 second, walking updates every 100ms
  // Total walk updates = timerSeconds * 10
  // Speed per update = distance / total_updates
  const distance = START_POSITION - END_POSITION;
  const totalUpdates = config.timerSeconds * 10;
  const zombieSpeed = distance / totalUpdates;

  // Reset state when slide becomes active
  useEffect(() => {
    if (isActive) {
      setTimeLeft(config.timerSeconds);
      setZombiePosition(START_POSITION);
      setIsAttacking(false);
    }
  }, [isActive, config.timerSeconds]);

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
      onAttack();
    }
  }, [isAttacking, onAttack]);

  // Zombie walking animation - synced with timer
  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setZombiePosition((prev) => {
        // Stop at target when attacking
        if (isAttacking && prev <= END_POSITION) {
          return END_POSITION;
        }
        // Keep walking until we reach target
        const newPos = prev - zombieSpeed;
        return Math.max(newPos, END_POSITION);
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isActive, isAttacking, zombieSpeed]);

  if (!isActive || !config.enabled) return null;

  return (
    <>
      {/* Timer display - dramatic survival counter */}
      <div className="absolute top-6 left-6 z-50 pointer-events-none">
        <div 
          className={`
            px-6 py-3 rounded-xl backdrop-blur-md border-2
            font-bold transition-all duration-300
            ${isAttacking 
              ? "bg-red-900/90 text-red-100 border-red-600 animate-pulse scale-110" 
              : timeLeft <= 3 
                ? "bg-red-900/80 text-yellow-300 border-red-500 animate-pulse"
                : "bg-black/70 text-green-400 border-green-800"
            }
          `}
          style={{ fontFamily: "'Creepster', cursive" }}
        >
          {isAttacking ? (
            <span className="flex items-center gap-3 text-4xl">
              <span className="text-5xl">💀</span>
              <span>BRAAAINS!</span>
            </span>
          ) : (
            <span className="flex items-center gap-3">
              <span className="text-3xl">{timeLeft <= 3 ? "☠️" : "⏱️"}</span>
              <span className="text-3xl">
                {timeLeft <= 3 ? `RUN! ${timeLeft}s` : `Survive: ${timeLeft}s`}
              </span>
            </span>
          )}
        </div>
      </div>

      {/* Walking zombie - BIG and menacing */}
      <div
        className="absolute bottom-0 z-40 pointer-events-none"
        style={{
          left: `${zombiePosition}%`,
          transform: "translateX(-50%)",
          transition: "left 100ms linear",
        }}
      >
        <div 
          className={`
            leading-none
            ${isAttacking ? "animate-zombie-attack" : "animate-zombie-walk"}
          `}
          style={{
            fontSize: "min(300px, 30vh)", // Huge zombie, responsive to screen
            filter: "drop-shadow(0 0 40px rgba(0,0,0,0.9)) drop-shadow(0 0 80px rgba(139,0,0,0.5))",
            transform: "scaleX(-1)", // Face left (toward text)
          }}
        >
          🧟
        </div>
      </div>

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
        
        @keyframes textShake {
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
        
        @keyframes textBleed {
          0% { 
            filter: none;
            color: inherit;
          }
          30% {
            filter: blur(1px);
            color: #8b0000;
          }
          60% {
            filter: blur(2px);
            color: #660000;
          }
          100% {
            filter: blur(3px);
            color: #440000;
            opacity: 0.6;
          }
        }
        
        @keyframes scratchMark {
          0% { 
            clip-path: polygon(0 0, 0 0, 0 100%, 0 100%);
            opacity: 0;
          }
          100% { 
            clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
            opacity: 1;
          }
        }
        
        .animate-zombie-walk {
          animation: zombieWalk 0.4s ease-in-out infinite;
        }
        
        .animate-zombie-attack {
          animation: zombieAttack 0.5s ease-out forwards;
        }
        
        .zombie-text-attacked {
          animation: textShake 0.5s ease-in-out, textBleed 2s ease-out 0.5s forwards;
        }
        
        .zombie-scratch-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            135deg,
            transparent 0%,
            transparent 45%,
            rgba(139, 0, 0, 0.6) 45%,
            rgba(139, 0, 0, 0.6) 47%,
            transparent 47%,
            transparent 52%,
            rgba(139, 0, 0, 0.5) 52%,
            rgba(139, 0, 0, 0.5) 54%,
            transparent 54%,
            transparent 58%,
            rgba(139, 0, 0, 0.4) 58%,
            rgba(139, 0, 0, 0.4) 60%,
            transparent 60%
          );
          animation: scratchMark 0.3s ease-out forwards;
          pointer-events: none;
        }
      `}</style>
    </>
  );
}
