"use client";

import { useState, useEffect } from "react";
import { useKitesStore } from "@/lib/store";
import { useRouter } from "next/navigation";

// Random generators
function randomId(): string {
  return crypto.randomUUID();
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Content generators
const LOREM_WORDS = [
  "lorem", "ipsum", "dolor", "sit", "amet", "consectetur", "adipiscing", "elit",
  "sed", "do", "eiusmod", "tempor", "incididunt", "ut", "labore", "et", "dolore",
  "magna", "aliqua", "enim", "ad", "minim", "veniam", "quis", "nostrud",
  "exercitation", "ullamco", "laboris", "nisi", "aliquip", "ex", "ea", "commodo",
];

const TECH_WORDS = [
  "React", "TypeScript", "JavaScript", "API", "Database", "Cloud", "DevOps",
  "Microservices", "Kubernetes", "Docker", "AWS", "Azure", "GraphQL", "REST",
  "Frontend", "Backend", "Fullstack", "Agile", "Scrum", "CI/CD", "Testing",
];

const ZOMBIE_WORDS = [
  "Survive", "Apocalypse", "Undead", "Outbreak", "Infection", "Horde", "Escape",
  "Shelter", "Weapons", "Resources", "Strategy", "Defense", "Attack", "Brains",
];

function randomLorem(wordCount: number): string {
  return Array.from({ length: wordCount }, () => randomChoice(LOREM_WORDS)).join(" ");
}

function randomHeading(): string {
  const styles = [
    () => randomChoice(TECH_WORDS) + " " + randomChoice(["Overview", "Deep Dive", "Introduction", "Best Practices"]),
    () => "Chapter " + randomInt(1, 10) + ": " + randomLorem(3),
    () => randomChoice(ZOMBIE_WORDS) + " " + randomChoice(["Guide", "Protocol", "Strategy", "Plan"]),
    () => "How to " + randomLorem(3),
    () => randomInt(3, 10) + " Ways to " + randomLorem(2),
    () => randomChoice(["The", "A", "Your"]) + " " + randomChoice(TECH_WORDS) + " " + randomChoice(["Journey", "Story", "Challenge"]),
  ];
  return randomChoice(styles)();
}

function randomParagraph(): string {
  const sentences = randomInt(2, 5);
  return Array.from({ length: sentences }, () => {
    const words = randomInt(8, 20);
    let sentence = randomLorem(words);
    sentence = sentence.charAt(0).toUpperCase() + sentence.slice(1);
    return sentence + ".";
  }).join(" ");
}

function randomRichText(): string {
  const formats = [
    () => `<b>${randomLorem(3)}</b> ${randomLorem(5)}`,
    () => `${randomLorem(3)} <i>${randomLorem(2)}</i> ${randomLorem(4)}`,
    () => `<u>${randomLorem(2)}</u> - ${randomLorem(6)}`,
    () => `${randomLorem(4)}<br>${randomLorem(5)}<br>${randomLorem(3)}`,
    () => `<b>${randomLorem(2)}</b>: ${randomLorem(8)}`,
  ];
  return randomChoice(formats)();
}

// Position generators
function randomPosition(constraints?: { minX?: number; maxX?: number; minY?: number; maxY?: number }) {
  const { minX = 5, maxX = 70, minY = 5, maxY = 70 } = constraints || {};
  return {
    x: randomFloat(minX, maxX),
    y: randomFloat(minY, maxY),
    width: randomFloat(20, 50),
    height: randomFloat(10, 30),
  };
}

// Block generators
type BlockType = "h1" | "h2" | "h3" | "h4" | "text" | "image";

function createRandomBlock(type?: BlockType) {
  const blockType = type || randomChoice(["h1", "h2", "h3", "h4", "text", "text", "text"] as BlockType[]);
  const isHeading = ["h1", "h2", "h3", "h4"].includes(blockType);
  
  const defaultFontSize: Record<BlockType, number> = {
    h1: 72, h2: 56, h3: 40, h4: 32, text: 24, image: 24
  };
  
  return {
    id: randomId(),
    type: blockType,
    position: randomPosition(),
    content: isHeading ? randomHeading() : (Math.random() > 0.5 ? randomParagraph() : randomRichText()),
    style: {
      fontSize: defaultFontSize[blockType],
      fontWeight: isHeading ? "bold" : undefined,
      textAlign: randomChoice(["left", "center", "right"]) as "left" | "center" | "right",
      color: Math.random() > 0.7 ? randomChoice(["#ffffff", "#ffcc00", "#00ff00", "#ff6600"]) : undefined,
    },
    zIndex: randomInt(1, 10),
  };
}

// Sample images for testing (placeholder services)
const TEST_IMAGES = [
  "https://picsum.photos/seed/kite1/800/600",
  "https://picsum.photos/seed/kite2/600/800",
  "https://picsum.photos/seed/kite3/800/800",
  "https://picsum.photos/seed/kite4/1200/600",
  "https://picsum.photos/seed/kite5/600/400",
  "https://picsum.photos/seed/kite6/400/600",
  "https://picsum.photos/seed/kite7/900/500",
  "https://picsum.photos/seed/kite8/500/700",
  "https://picsum.photos/seed/zombie1/800/600",
  "https://picsum.photos/seed/zombie2/700/500",
  "https://picsum.photos/seed/tech1/800/450",
  "https://picsum.photos/seed/tech2/600/600",
  "https://picsum.photos/seed/nature1/1000/600",
  "https://picsum.photos/seed/nature2/800/500",
  "https://picsum.photos/seed/abstract1/600/600",
  "https://picsum.photos/seed/abstract2/700/700",
];

// Layout presets for variety
const LAYOUT_PRESETS = [
  // Title top, content below
  {
    title: { x: 5, y: 5, width: 90, height: 15 },
    subtitle: { x: 5, y: 22, width: 60, height: 8 },
    text1: { x: 5, y: 35, width: 45, height: 30 },
    text2: { x: 55, y: 35, width: 40, height: 30 },
    image1: { x: 5, y: 68, width: 40, height: 28 },
    image2: { x: 50, y: 68, width: 45, height: 28 },
  },
  // Big image left, text right
  {
    title: { x: 55, y: 5, width: 40, height: 12 },
    subtitle: { x: 55, y: 20, width: 40, height: 8 },
    text1: { x: 55, y: 32, width: 40, height: 25 },
    text2: { x: 55, y: 60, width: 40, height: 20 },
    image1: { x: 3, y: 5, width: 48, height: 55 },
    image2: { x: 3, y: 63, width: 48, height: 32 },
  },
  // Centered title, split content
  {
    title: { x: 10, y: 3, width: 80, height: 18 },
    subtitle: { x: 20, y: 23, width: 60, height: 8 },
    text1: { x: 3, y: 35, width: 30, height: 35 },
    text2: { x: 35, y: 35, width: 30, height: 35 },
    image1: { x: 67, y: 35, width: 30, height: 35 },
    image2: { x: 3, y: 73, width: 94, height: 24 },
  },
  // Image top, text bottom
  {
    title: { x: 5, y: 55, width: 55, height: 12 },
    subtitle: { x: 5, y: 70, width: 55, height: 8 },
    text1: { x: 5, y: 80, width: 55, height: 17 },
    text2: { x: 65, y: 55, width: 30, height: 42 },
    image1: { x: 5, y: 3, width: 90, height: 48 },
    image2: null,
  },
  // Grid layout
  {
    title: { x: 5, y: 3, width: 90, height: 10 },
    subtitle: { x: 5, y: 15, width: 50, height: 6 },
    text1: { x: 5, y: 24, width: 28, height: 35 },
    text2: { x: 36, y: 24, width: 28, height: 35 },
    image1: { x: 67, y: 24, width: 28, height: 35 },
    image2: { x: 5, y: 62, width: 90, height: 35 },
  },
  // Diagonal flow
  {
    title: { x: 3, y: 3, width: 50, height: 15 },
    subtitle: { x: 25, y: 20, width: 50, height: 8 },
    text1: { x: 45, y: 30, width: 50, height: 25 },
    text2: { x: 3, y: 58, width: 40, height: 38 },
    image1: { x: 55, y: 3, width: 42, height: 25 },
    image2: { x: 46, y: 58, width: 50, height: 38 },
  },
  // Magazine style
  {
    title: { x: 3, y: 3, width: 45, height: 20 },
    subtitle: { x: 3, y: 25, width: 45, height: 10 },
    text1: { x: 3, y: 38, width: 45, height: 58 },
    text2: { x: 52, y: 50, width: 45, height: 46 },
    image1: { x: 52, y: 3, width: 45, height: 44 },
    image2: null,
  },
  // Quote style
  {
    title: { x: 10, y: 10, width: 80, height: 25 },
    subtitle: { x: 20, y: 38, width: 60, height: 10 },
    text1: { x: 10, y: 52, width: 35, height: 40 },
    text2: { x: 50, y: 52, width: 40, height: 25 },
    image1: { x: 50, y: 78, width: 40, height: 18 },
    image2: null,
  },
];

// Create a unique kite with varied content
function createUniqueKite(index: number) {
  const now = new Date().toISOString();
  const layout = LAYOUT_PRESETS[index % LAYOUT_PRESETS.length];
  const blocks: any[] = [];
  
  // Randomize title size for each kite
  const titleSizes: BlockType[] = ["h1", "h2", "h3", "h4"];
  const titleType = titleSizes[index % 4];
  const subtitleType = titleSizes[(index + 2) % 4];
  
  // Add title with varied size
  blocks.push({
    id: randomId(),
    type: titleType,
    position: { ...layout.title },
    content: randomHeading(),
    style: {
      fontSize: { h1: 72, h2: 56, h3: 44, h4: 36 }[titleType],
      fontWeight: "bold",
      textAlign: randomChoice(["left", "center"]) as "left" | "center",
      color: Math.random() > 0.6 ? randomChoice(["#ffffff", "#ffcc00", "#00ffcc"]) : undefined,
    },
    zIndex: 10,
  });
  
  // Add subtitle (different heading size)
  blocks.push({
    id: randomId(),
    type: subtitleType,
    position: { ...layout.subtitle },
    content: randomChoice([
      randomLorem(4) + " " + randomChoice(TECH_WORDS),
      "By " + randomChoice(["John", "Sarah", "Alex", "Maria"]) + " " + randomChoice(["Smith", "Johnson", "Lee", "Garcia"]),
      randomChoice(["Chapter", "Section", "Part"]) + " " + randomInt(1, 12),
      randomChoice(ZOMBIE_WORDS) + " " + randomChoice(["Protocol", "Guide", "Manual"]),
    ]),
    style: {
      fontSize: { h1: 48, h2: 40, h3: 32, h4: 28 }[subtitleType],
      fontWeight: "semibold",
      textAlign: randomChoice(["left", "center"]) as "left" | "center",
      color: Math.random() > 0.7 ? "#aaaaaa" : undefined,
    },
    zIndex: 9,
  });
  
  // Add text blocks with rich content
  blocks.push({
    id: randomId(),
    type: "text",
    position: { ...layout.text1 },
    content: createRichTextContent(),
    style: {
      fontSize: randomChoice([18, 20, 22, 24]),
      textAlign: "left",
    },
    zIndex: 8,
  });
  
  blocks.push({
    id: randomId(),
    type: "text",
    position: { ...layout.text2 },
    content: createRichTextContent(),
    style: {
      fontSize: randomChoice([16, 18, 20, 22]),
      textAlign: randomChoice(["left", "justify"]) as "left" | "justify",
    },
    zIndex: 7,
  });
  
  // Add images
  blocks.push({
    id: randomId(),
    type: "image",
    position: { ...layout.image1 },
    content: TEST_IMAGES[(index * 2) % TEST_IMAGES.length],
    zIndex: randomChoice([1, 2, 3]), // Some in back, some in front
  });
  
  if (layout.image2) {
    blocks.push({
      id: randomId(),
      type: "image",
      position: { ...layout.image2 },
      content: TEST_IMAGES[(index * 2 + 1) % TEST_IMAGES.length],
      zIndex: randomChoice([1, 2, 4]),
    });
  }
  
  // Randomly add extra elements for more variety
  if (Math.random() > 0.5) {
    blocks.push({
      id: randomId(),
      type: randomChoice(["h3", "h4", "text"]) as BlockType,
      position: {
        x: randomFloat(5, 60),
        y: randomFloat(40, 80),
        width: randomFloat(25, 40),
        height: randomFloat(8, 20),
      },
      content: Math.random() > 0.5 ? randomHeading() : randomRichText(),
      style: {
        fontSize: randomChoice([20, 24, 28, 32]),
        textAlign: randomChoice(["left", "center", "right"]) as "left" | "center" | "right",
        color: Math.random() > 0.5 ? randomChoice(["#ff6600", "#00ff00", "#ff00ff", "#00ccff"]) : undefined,
      },
      zIndex: randomInt(5, 12),
    });
  }
  
  // Add random position jitter for uniqueness
  blocks.forEach(block => {
    block.position.x += randomFloat(-3, 3);
    block.position.y += randomFloat(-2, 2);
    block.position.width += randomFloat(-5, 5);
    block.position.height += randomFloat(-3, 3);
    // Clamp values
    block.position.x = Math.max(0, Math.min(85, block.position.x));
    block.position.y = Math.max(0, Math.min(85, block.position.y));
    block.position.width = Math.max(10, Math.min(95, block.position.width));
    block.position.height = Math.max(5, Math.min(60, block.position.height));
  });
  
  return {
    id: randomId(),
    contentBlocks: blocks,
    createdAt: now,
    updatedAt: now,
  };
}

// Create rich text with formatting
function createRichTextContent(): string {
  const templates = [
    () => `<b>${randomLorem(3)}</b><br><br>${randomParagraph()}<br><br><i>${randomLorem(5)}</i>`,
    () => `${randomParagraph()}<br><br><b>${randomChoice(TECH_WORDS)}:</b> ${randomLorem(8)}<br><br>${randomLorem(10)}`,
    () => `<u>${randomLorem(2)}</u><br><br>• ${randomLorem(5)}<br>• ${randomLorem(4)}<br>• ${randomLorem(6)}<br><br>${randomLorem(8)}`,
    () => `"<i>${randomParagraph()}</i>"<br><br>— ${randomChoice(["Anonymous", "Expert", "Source"])}<br><br>${randomLorem(6)}`,
    () => `<b>Key Points:</b><br><br>1. ${randomLorem(6)}<br>2. ${randomLorem(5)}<br>3. ${randomLorem(7)}<br><br>${randomLorem(10)}`,
    () => `${randomParagraph()}<br><br><b>${randomChoice(ZOMBIE_WORDS)}</b> - ${randomLorem(8)}<br><br>${randomLorem(6)}`,
    () => `<b>${randomChoice(TECH_WORDS)} Overview</b><br><br>${randomParagraph()}<br><br><i>Note: ${randomLorem(5)}</i>`,
  ];
  return randomChoice(templates)();
}

// Kite generators (legacy - keeping for other scenarios)
function createRandomKite(blockCount?: number) {
  const count = blockCount ?? randomInt(2, 6);
  const now = new Date().toISOString();
  
  // Always include at least one heading
  const blocks = [createRandomBlock(randomChoice(["h1", "h2"]))];
  
  // Add remaining blocks
  for (let i = 1; i < count; i++) {
    blocks.push(createRandomBlock());
  }
  
  return {
    id: randomId(),
    contentBlocks: blocks,
    createdAt: now,
    updatedAt: now,
  };
}

// Test scenarios
const SCENARIOS = {
  unique: {
    name: "⭐ Full Variety (Recommended)",
    description: "50 unique kites with different title sizes, text, images, layouts",
    generate: () => Array.from({ length: 50 }, (_, i) => createUniqueKite(i)),
  },
  random: {
    name: "Random Mix",
    description: "50 random kites with varied content",
    generate: () => Array.from({ length: 50 }, () => createRandomKite()),
  },
  minimal: {
    name: "Minimal",
    description: "50 kites with 1-2 blocks each",
    generate: () => Array.from({ length: 50 }, () => createRandomKite(randomInt(1, 2))),
  },
  dense: {
    name: "Dense",
    description: "50 kites packed with 5-8 blocks each",
    generate: () => Array.from({ length: 50 }, () => createRandomKite(randomInt(5, 8))),
  },
  headingsOnly: {
    name: "Headings Only",
    description: "50 kites with only heading blocks",
    generate: () => Array.from({ length: 50 }, () => {
      const kite = createRandomKite(randomInt(2, 4));
      kite.contentBlocks = kite.contentBlocks.map(b => ({
        ...b,
        type: randomChoice(["h1", "h2", "h3", "h4"]) as BlockType,
        content: randomHeading(),
        style: { ...b.style, fontWeight: "bold" },
      }));
      return kite;
    }),
  },
  extremePositions: {
    name: "Extreme Positions",
    description: "50 kites with blocks at edges and corners",
    generate: () => Array.from({ length: 50 }, () => {
      const corners = [
        { minX: 0, maxX: 10, minY: 0, maxY: 10 },
        { minX: 70, maxX: 80, minY: 0, maxY: 10 },
        { minX: 0, maxX: 10, minY: 70, maxY: 80 },
        { minX: 70, maxX: 80, minY: 70, maxY: 80 },
      ];
      const kite = createRandomKite(4);
      kite.contentBlocks = kite.contentBlocks.map((b, i) => ({
        ...b,
        position: { ...randomPosition(corners[i % 4]), width: 25, height: 15 },
      }));
      return kite;
    }),
  },
  longText: {
    name: "Long Text",
    description: "50 kites with long paragraphs",
    generate: () => Array.from({ length: 50 }, () => {
      const kite = createRandomKite(3);
      kite.contentBlocks = kite.contentBlocks.map(b => ({
        ...b,
        content: b.type === "text" 
          ? Array.from({ length: 5 }, () => randomParagraph()).join("<br><br>")
          : b.content,
      }));
      return kite;
    }),
  },
};

export default function TestDataPage() {
  const router = useRouter();
  const { kites, clearAllKites, _isLoaded, loadFromAPI } = useKitesStore();
  const [generating, setGenerating] = useState(false);
  const [status, setStatus] = useState<string>("");

  useEffect(() => {
    if (!_isLoaded) {
      loadFromAPI();
    }
  }, [_isLoaded, loadFromAPI]);

  const generateTestData = async (scenarioKey: keyof typeof SCENARIOS) => {
    setGenerating(true);
    setStatus("Clearing existing data...");
    
    // Clear existing
    clearAllKites();
    await new Promise(r => setTimeout(r, 500));
    
    setStatus("Generating 50 random kites...");
    const scenario = SCENARIOS[scenarioKey];
    const newKites = scenario.generate();
    
    // Save directly via API
    setStatus("Saving to database...");
    try {
      const response = await fetch("/api/kites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kites: newKites,
          currentKiteIndex: 0,
          currentTheme: useKitesStore.getState().currentTheme,
        }),
      });
      
      if (response.ok) {
        setStatus(`✅ Created ${newKites.length} test kites! Reloading...`);
        await loadFromAPI();
        setTimeout(() => {
          setStatus(`✅ Ready! ${newKites.length} kites loaded.`);
          setGenerating(false);
        }, 500);
      } else {
        setStatus("❌ Failed to save");
        setGenerating(false);
      }
    } catch (error) {
      setStatus("❌ Error: " + String(error));
      setGenerating(false);
    }
  };

  const tearDown = async () => {
    setGenerating(true);
    setStatus("Tearing down test data...");
    
    clearAllKites();
    
    try {
      await fetch("/api/kites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kites: [],
          currentKiteIndex: 0,
          currentTheme: "sky",
        }),
      });
      
      setStatus("✅ All data cleared!");
      setGenerating(false);
    } catch (error) {
      setStatus("❌ Teardown failed");
      setGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">Test Data Generator</h1>
        <p className="text-gray-400 mb-8">Generate random kites for manual testing</p>
        
        {/* Current State */}
        <div className="bg-gray-800 rounded-lg p-4 mb-8">
          <h2 className="text-lg font-semibold mb-2">Current State</h2>
          <p className="text-2xl font-mono">
            {_isLoaded ? `${kites.length} kites` : "Loading..."}
          </p>
          {status && (
            <p className="mt-2 text-yellow-400">{status}</p>
          )}
        </div>

        {/* Scenarios */}
        <h2 className="text-2xl font-semibold mb-4">Generate Test Data</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {Object.entries(SCENARIOS).map(([key, scenario]) => (
            <button
              key={key}
              onClick={() => generateTestData(key as keyof typeof SCENARIOS)}
              disabled={generating}
              className={`rounded-lg p-4 text-left transition-colors ${
                key === "unique" 
                  ? "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 border-2 border-purple-400 md:col-span-2"
                  : "bg-blue-600 hover:bg-blue-700"
              } disabled:bg-gray-600`}
            >
              <h3 className="font-semibold text-lg">{scenario.name}</h3>
              <p className={key === "unique" ? "text-purple-100 text-sm" : "text-blue-200 text-sm"}>
                {scenario.description}
              </p>
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <button
            onClick={tearDown}
            disabled={generating}
            className="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 
                       rounded-lg px-6 py-3 font-semibold transition-colors"
          >
            🗑️ Tear Down (Clear All)
          </button>
          
          <button
            onClick={() => router.push("/")}
            className="bg-green-600 hover:bg-green-700 
                       rounded-lg px-6 py-3 font-semibold transition-colors"
          >
            ▶️ Go to Editor
          </button>
          
          <button
            onClick={() => {
              useKitesStore.setState({ currentTheme: "zombie" });
              router.push("/");
            }}
            className="bg-purple-600 hover:bg-purple-700 
                       rounded-lg px-6 py-3 font-semibold transition-colors"
          >
            🧟 Test with Zombie Theme
          </button>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-gray-800 rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-2">How to Use</h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-300">
            <li>Choose a test scenario above to generate 50 random kites</li>
            <li>Click "Go to Editor" to test them visually</li>
            <li>Try "Test with Zombie Theme" to see zombie attacks in action</li>
            <li>Click "Tear Down" when done to clear all test data</li>
          </ol>
        </div>

        {/* URL hint */}
        <p className="mt-4 text-gray-500 text-sm">
          Bookmark this page: <code className="bg-gray-800 px-2 py-1 rounded">/test-data</code>
        </p>
      </div>
    </div>
  );
}
