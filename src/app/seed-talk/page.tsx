"use client";

import { useState, useEffect } from "react";
import { buildKites } from "./talk-data";

const SYNC_KEY = "kites-sync-to-source";

// ─── Page Component ──────────────────────────────────────────────────────────

export default function SeedTalkPage() {
  const [status, setStatus] = useState<string>("");
  const [generating, setGenerating] = useState(false);
  const [syncEnabled, setSyncEnabled] = useState(false);

  // Hydrate toggle from localStorage
  useEffect(() => {
    setSyncEnabled(localStorage.getItem(SYNC_KEY) === "true");
  }, []);

  const toggleSync = () => {
    const next = !syncEnabled;
    setSyncEnabled(next);
    localStorage.setItem(SYNC_KEY, next ? "true" : "false");
  };

  const seedDeck = async () => {
    setGenerating(true);
    setStatus("Building kites...");

    const kites = buildKites();

    setStatus("Saving to database...");
    try {
      const response = await fetch("/api/kites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kites,
          currentKiteIndex: 0,
          currentTheme: "sky",
          title: "Imagination vs. Reality: A Survivor's Guide to AI Hype",
        }),
      });

      if (response.ok) {
        setStatus(`Done! ${kites.length} kites created.`);
        setGenerating(false);
      } else {
        setStatus("Failed to save. Check console.");
        setGenerating(false);
      }
    } catch (error) {
      setStatus(`Error: ${String(error)}`);
      setGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <div className="max-w-lg text-center space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Seed Talk</h1>
          <p className="text-gray-400">
            Imagination vs. Reality: A Survivor&apos;s Guide to AI Hype
          </p>
          <p className="text-gray-500 text-sm mt-1">Ready to present</p>
        </div>

        <button
          onClick={seedDeck}
          disabled={generating}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700
                     disabled:from-gray-600 disabled:to-gray-600
                     text-white font-semibold text-lg
                     rounded-xl px-10 py-4 transition-all
                     shadow-lg hover:shadow-xl"
        >
          {generating ? "Generating..." : "Generate Deck"}
        </button>

        {status && (
          <p className="text-yellow-400 text-sm animate-pulse">{status}</p>
        )}

        {/* Live sync toggle */}
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={toggleSync}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              syncEnabled ? "bg-green-500" : "bg-gray-600"
            }`}
            role="switch"
            aria-checked={syncEnabled}
          >
            <span
              className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                syncEnabled ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
          <div className="text-left">
            <p className={`text-sm font-medium ${syncEnabled ? "text-green-400" : "text-gray-400"}`}>
              Live sync edits to seed data
            </p>
            <p className="text-gray-600 text-xs">
              When ON, editor changes are written back to talk-data.ts automatically
            </p>
          </div>
        </div>

        <div className="text-gray-600 text-xs space-y-1">
          <p>This will replace any existing deck.</p>
          <p>
            Delete <code className="bg-gray-800 px-1.5 py-0.5 rounded">src/app/seed-talk/</code> when done.
          </p>
        </div>
      </div>
    </div>
  );
}
