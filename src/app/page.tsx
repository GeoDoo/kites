"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { EditorLayout } from "@/components/Editor";
import { DeckContainer } from "@/components/Deck";
import { useKites, useCurrentKiteIndex, useCurrentTheme } from "@/lib/store";
import { getTheme } from "@/lib/themes";

// Check and clear corrupted storage on load
function checkAndClearStorage() {
  if (typeof window === "undefined") return;
  
  try {
    // Test if we can write to localStorage
    const testKey = "__storage_test__";
    localStorage.setItem(testKey, "test");
    localStorage.removeItem(testKey);
  } catch (e) {
    // Storage is full or corrupted - clear kites-storage
    // Storage is full or corrupted - attempt to recover
    try {
      localStorage.removeItem("kites-storage");
      window.location.reload();
    } catch {
      // If even that fails, clear everything
      localStorage.clear();
      window.location.reload();
    }
  }
}

interface PresentationViewProps {
  onExit: () => void;
  timerStarted: boolean;
}

function PresentationView({ onExit, timerStarted }: PresentationViewProps) {
  const kites = useKites();
  const currentKiteIndex = useCurrentKiteIndex();

  return (
    <div className="relative bg-white">
      {/* Exit button */}
      <button
        onClick={onExit}
        className="fixed top-4 right-4 z-50 px-4 py-2 rounded-xl bg-slate-900/50 text-white hover:bg-slate-900/70 transition-colors backdrop-blur-sm text-sm font-medium"
      >
        Exit (Esc)
      </button>

      {/* Kite counter */}
      {kites.length > 1 && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-slate-900/50 text-white backdrop-blur-sm text-sm font-medium">
          {currentKiteIndex + 1} / {kites.length}
        </div>
      )}

      <DeckContainer onExit={onExit} timerStarted={timerStarted} />
    </div>
  );
}

// Extend Window for PiP API
declare global {
  interface Window {
    documentPictureInPicture?: {
      requestWindow: (options?: { width?: number; height?: number }) => Promise<Window>;
    };
  }
}

export default function Home() {
  const [mode, setMode] = useState<"editor" | "present">("editor");
  const [isPresenterMode, setIsPresenterMode] = useState(false);
  const [timerStarted, setTimerStarted] = useState(false);
  const [timerValue, setTimerValue] = useState(0); // Current countdown value
  const kites = useKites();
  const currentKiteIndex = useCurrentKiteIndex();
  const currentThemeId = useCurrentTheme();
  const theme = getTheme(currentThemeId);
  const presenterWindowRef = useRef<Window | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Calculate timer per kite
  const timerPerKite = theme.timer?.totalTalkMinutes
    ? Math.floor((theme.timer.totalTalkMinutes * 60) / kites.length)
    : 60;

  // Check storage on mount
  useEffect(() => {
    checkAndClearStorage();
  }, []);

  // Expose startTimer function for popup to call
  useEffect(() => {
    (window as Window & { __kitesStartTimer?: () => void }).__kitesStartTimer = () => {
      setTimerStarted(true);
    };
    return () => {
      delete (window as Window & { __kitesStartTimer?: () => void }).__kitesStartTimer;
    };
  }, []);

  // Timer countdown logic for presenter mode
  useEffect(() => {
    if (!isPresenterMode || !timerStarted) {
      setTimerValue(timerPerKite);
      return;
    }

    setTimerValue(timerPerKite);
    
    timerIntervalRef.current = setInterval(() => {
      setTimerValue(prev => {
        if (prev <= 0) return 0;
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [isPresenterMode, timerStarted, currentKiteIndex, timerPerKite]);

  // Update presenter window when kite changes or timer updates
  useEffect(() => {
    const popup = presenterWindowRef.current;
    if (!popup || popup.closed) return;

    try {
      const currentKite = kites[currentKiteIndex];
      const notes = currentKite?.speakerNotes || "";
      
      const kiteEl = popup.document.getElementById("kite-num");
      const totalEl = popup.document.getElementById("total");
      const notesEl = popup.document.getElementById("notes");
      const timerEl = popup.document.getElementById("timer");
      const startBtn = popup.document.getElementById("startBtn");

      if (kiteEl) kiteEl.textContent = `Kite ${currentKiteIndex + 1}`;
      if (totalEl) totalEl.textContent = `of ${kites.length}`;
      if (notesEl) {
        notesEl.innerHTML = notes 
          ? notes.replace(/</g, '&lt;').replace(/>/g, '&gt;')
          : '<em style="color:#666">No speaker notes for this kite.</em>';
      }
      
      // Update timer display
      if (timerEl) {
        if (timerStarted) {
          const mins = Math.floor(timerValue / 60);
          const secs = timerValue % 60;
          const timeStr = mins > 0 ? `${mins}:${secs.toString().padStart(2, '0')}` : `${secs}s`;
          const isUrgent = timerValue <= 10;
          const isWarning = timerValue <= 30 && timerValue > 10;
          const color = timerValue === 0 ? '#ef4444' : isUrgent ? '#f97316' : isWarning ? '#eab308' : '#22c55e';
          timerEl.innerHTML = `<span style="color:${color};font-size:32px;font-weight:bold">${timerValue === 0 ? "⏰ TIME'S UP!" : timeStr}</span>`;
        } else {
          timerEl.innerHTML = `<span style="color:#888;font-size:24px">Timer: ${Math.floor(timerPerKite / 60)}:${(timerPerKite % 60).toString().padStart(2, '0')} per kite</span>`;
        }
      }

      // Hide start button once timer started
      if (startBtn) {
        startBtn.style.display = timerStarted ? 'none' : 'block';
      }
    } catch {
      // Window might be closed
    }
  }, [currentKiteIndex, kites, timerStarted, timerValue, timerPerKite]);

  // Open presenter window (PiP or popup)
  const openPresenterWindow = useCallback(async () => {
    const currentKite = kites[currentKiteIndex];
    const notes = currentKite?.speakerNotes || "";
    const notesHtml = notes 
      ? notes.replace(/</g, '&lt;').replace(/>/g, '&gt;')
      : '<em style="color:#666">No speaker notes for this kite.</em>';

    let popup: Window | null = null;

    // Try Document Picture-in-Picture API first
    if (window.documentPictureInPicture) {
      try {
        popup = await window.documentPictureInPicture.requestWindow({
          width: 450,
          height: 400,
        });
      } catch (err) {
        // PiP not available, fall back to popup
      }
    }

    // Fallback to regular popup
    if (!popup) {
      const left = window.screen.availWidth - 500;
      const top = window.screen.availHeight - 450;
      popup = window.open("about:blank", "KitesPresenter", 
        `width=450,height=400,left=${left},top=${top},menubar=no,toolbar=no`);
    }

    if (!popup) return null;

    popup.document.write(`<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Presenter View</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:system-ui,-apple-system,sans-serif;background:#1a1a2e;color:#fff;padding:16px;height:100vh;display:flex;flex-direction:column}
.header{display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid #333;padding-bottom:10px;margin-bottom:12px}
.kite-info{display:flex;flex-direction:column}
.kite-num{font-size:24px;font-weight:bold;color:#f59e0b}
.total{font-size:12px;color:#888}
.timer-section{text-align:center;padding:12px;background:#252545;border-radius:8px;margin-bottom:12px}
.start-btn{background:#22c55e;color:white;border:none;padding:12px 24px;font-size:18px;font-weight:bold;border-radius:8px;cursor:pointer;margin-top:8px}
.start-btn:hover{background:#16a34a}
.label{color:#f59e0b;font-size:11px;font-weight:600;text-transform:uppercase;margin-bottom:8px}
.notes{flex:1;overflow-y:auto;font-size:16px;line-height:1.5;color:#e0e0e0;white-space:pre-wrap}
</style></head><body>
<div class="header">
<div class="kite-info">
<div class="kite-num" id="kite-num">Kite ${currentKiteIndex + 1}</div>
<div class="total" id="total">of ${kites.length}</div>
</div>
</div>
<div class="timer-section">
<div id="timer"><span style="color:#888;font-size:24px">Timer: ${Math.floor(timerPerKite / 60)}:${(timerPerKite % 60).toString().padStart(2, '0')} per kite</span></div>
<button id="startBtn" class="start-btn" onclick="window.opener.__kitesStartTimer && window.opener.__kitesStartTimer()">▶️ START TIMER</button>
</div>
<div class="label">📝 SPEAKER NOTES</div>
<div class="notes" id="notes">${notesHtml}</div>
</body></html>`);
    popup.document.close();

    return popup;
  }, [kites, currentKiteIndex, timerPerKite]);

  // Enter presentation mode - opens presenter window FIRST, then fullscreen
  const enterPresentMode = useCallback(async (withPresenterView: boolean) => {
    // Reset timer state
    setTimerStarted(!withPresenterView); // Auto-start only if NOT presenter view
    setIsPresenterMode(withPresenterView);

    // If presenter view requested, open it BEFORE fullscreen
    if (withPresenterView) {
      const popup = await openPresenterWindow();
      presenterWindowRef.current = popup;
    }

    // Small delay to ensure popup is ready
    await new Promise(r => setTimeout(r, 50));

    // NOW enter fullscreen
    try {
      await document.documentElement.requestFullscreen();
    } catch {
      // Continue anyway
    }
    
    setMode("present");
  }, [openPresenterWindow]);

  // Exit presentation mode
  const exitPresentMode = useCallback(async () => {
    // Close presenter window
    if (presenterWindowRef.current && !presenterWindowRef.current.closed) {
      presenterWindowRef.current.close();
      presenterWindowRef.current = null;
    }

    // Clear timer
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
    setTimerStarted(false);
    setIsPresenterMode(false);

    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      }
    } catch {
      // Ignore
    }
    setMode("editor");
  }, []);

  if (mode === "present") {
    return <PresentationView onExit={exitPresentMode} timerStarted={timerStarted} />;
  }

  return <EditorLayout onPresentMode={enterPresentMode} />;
}
