/**
 * Test Fixtures and Factories
 * Generate test data for kites, blocks, and themes
 */

import type { Kite, ContentBlock, BlockType, BlockPosition } from "@/lib/types";

// ============================================
// RANDOM GENERATORS
// ============================================

export function randomId(): string {
  return `test-${Math.random().toString(36).substring(2, 11)}`;
}

export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function randomFloat(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

export function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function randomBoolean(): boolean {
  return Math.random() > 0.5;
}

// ============================================
// CONTENT GENERATORS
// ============================================

const LOREM_WORDS = [
  "lorem", "ipsum", "dolor", "sit", "amet", "consectetur", "adipiscing", "elit",
  "sed", "do", "eiusmod", "tempor", "incididunt", "ut", "labore", "et", "dolore",
  "magna", "aliqua", "enim", "ad", "minim", "veniam", "quis", "nostrud",
];

const HEADINGS = [
  "Welcome to the Future",
  "Key Features",
  "How It Works",
  "Getting Started",
  "Advanced Topics",
  "Best Practices",
  "Case Studies",
  "Q&A Session",
  "Thank You!",
  "Contact Us",
  "Next Steps",
  "Summary",
];

export function randomLorem(wordCount: number): string {
  return Array.from({ length: wordCount }, () => randomChoice(LOREM_WORDS)).join(" ");
}

export function randomHeading(): string {
  return randomChoice(HEADINGS);
}

export function randomParagraph(): string {
  const sentences = randomInt(2, 5);
  return Array.from({ length: sentences }, () => {
    const words = randomInt(8, 15);
    const sentence = randomLorem(words);
    return sentence.charAt(0).toUpperCase() + sentence.slice(1) + ".";
  }).join(" ");
}

// ============================================
// POSITION GENERATORS
// ============================================

export function randomPosition(
  constraints?: Partial<{ minX: number; maxX: number; minY: number; maxY: number }>
): BlockPosition {
  const { minX = 5, maxX = 70, minY = 5, maxY = 70 } = constraints || {};
  return {
    x: randomFloat(minX, maxX),
    y: randomFloat(minY, maxY),
    width: randomFloat(15, 50),
    height: randomFloat(10, 30),
  };
}

export function centeredPosition(): BlockPosition {
  return {
    x: 10,
    y: 40,
    width: 80,
    height: 20,
  };
}

export function cornerPosition(corner: "top-left" | "top-right" | "bottom-left" | "bottom-right"): BlockPosition {
  const positions = {
    "top-left": { x: 5, y: 5, width: 30, height: 20 },
    "top-right": { x: 65, y: 5, width: 30, height: 20 },
    "bottom-left": { x: 5, y: 75, width: 30, height: 20 },
    "bottom-right": { x: 65, y: 75, width: 30, height: 20 },
  };
  return positions[corner];
}

// ============================================
// BLOCK FACTORIES
// ============================================

const BLOCK_TYPES: BlockType[] = ["h1", "h2", "h3", "h4", "text", "image"];
const TEXT_BLOCK_TYPES: BlockType[] = ["h1", "h2", "h3", "h4", "text"];

export function createBlock(overrides?: Partial<ContentBlock>): ContentBlock {
  const type = overrides?.type || randomChoice(TEXT_BLOCK_TYPES);
  const isHeading = ["h1", "h2", "h3", "h4"].includes(type);
  
  const defaultContent = isHeading ? randomHeading() : randomParagraph();
  const defaultFontSize = { h1: 72, h2: 56, h3: 40, h4: 32, text: 24, image: 24 }[type];
  
  return {
    id: randomId(),
    type,
    position: randomPosition(),
    content: defaultContent,
    style: {
      fontSize: defaultFontSize,
      fontWeight: isHeading ? "bold" : undefined,
      textAlign: randomChoice(["left", "center", "right"]),
    },
    zIndex: randomInt(1, 10),
    ...overrides,
  };
}

export function createHeadingBlock(level: 1 | 2 | 3 | 4 = 1): ContentBlock {
  return createBlock({
    type: `h${level}` as BlockType,
    position: centeredPosition(),
  });
}

export function createTextBlock(): ContentBlock {
  return createBlock({
    type: "text",
    content: randomParagraph(),
  });
}

export function createImageBlock(imageUrl?: string): ContentBlock {
  return createBlock({
    type: "image",
    content: imageUrl || `https://picsum.photos/seed/${randomId()}/800/600`,
    position: {
      x: randomFloat(10, 40),
      y: randomFloat(20, 50),
      width: randomFloat(30, 50),
      height: randomFloat(30, 50),
    },
  });
}

// ============================================
// KITE FACTORIES
// ============================================

export function createKite(overrides?: Partial<Kite>): Kite {
  const now = new Date().toISOString();
  return {
    id: randomId(),
    contentBlocks: [],
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

export function createKiteWithBlocks(blockCount: number = 3): Kite {
  const blocks: ContentBlock[] = [];
  
  // Always include at least one heading
  blocks.push(createHeadingBlock(1));
  
  // Add random blocks
  for (let i = 1; i < blockCount; i++) {
    const type = randomChoice(TEXT_BLOCK_TYPES);
    blocks.push(createBlock({ type }));
  }
  
  return createKite({ contentBlocks: blocks });
}

export function createEmptyKite(): Kite {
  return createKite({ contentBlocks: [] });
}

// ============================================
// TEST SCENARIO GENERATORS
// ============================================

export interface TestScenario {
  name: string;
  kites: Kite[];
  description: string;
}

export function generateEdgeCaseScenarios(): TestScenario[] {
  return [
    {
      name: "empty-presentation",
      description: "No kites at all",
      kites: [],
    },
    {
      name: "single-empty-kite",
      description: "One kite with no content",
      kites: [createEmptyKite()],
    },
    {
      name: "single-heading-only",
      description: "One kite with just a heading",
      kites: [createKite({ contentBlocks: [createHeadingBlock(1)] })],
    },
    {
      name: "many-blocks",
      description: "One kite with many overlapping blocks",
      kites: [createKiteWithBlocks(20)],
    },
    {
      name: "extreme-positions",
      description: "Blocks at screen edges",
      kites: [
        createKite({
          contentBlocks: [
            createBlock({ position: { x: 0, y: 0, width: 20, height: 10 } }),
            createBlock({ position: { x: 80, y: 0, width: 20, height: 10 } }),
            createBlock({ position: { x: 0, y: 90, width: 20, height: 10 } }),
            createBlock({ position: { x: 80, y: 90, width: 20, height: 10 } }),
          ],
        }),
      ],
    },
    {
      name: "tiny-blocks",
      description: "Very small blocks",
      kites: [
        createKite({
          contentBlocks: Array.from({ length: 5 }, () =>
            createBlock({ position: { x: randomFloat(10, 80), y: randomFloat(10, 80), width: 5, height: 3 } })
          ),
        }),
      ],
    },
    {
      name: "huge-blocks",
      description: "Very large blocks covering most of screen",
      kites: [
        createKite({
          contentBlocks: [
            createBlock({ position: { x: 5, y: 5, width: 90, height: 90 } }),
          ],
        }),
      ],
    },
    {
      name: "long-text",
      description: "Very long text content",
      kites: [
        createKite({
          contentBlocks: [
            createBlock({
              type: "text",
              content: Array.from({ length: 10 }, () => randomParagraph()).join("\n\n"),
            }),
          ],
        }),
      ],
    },
    {
      name: "many-kites",
      description: "Large presentation with 50 kites",
      kites: Array.from({ length: 50 }, () => createKiteWithBlocks(randomInt(1, 5))),
    },
    {
      name: "z-index-stacking",
      description: "Multiple overlapping blocks with different z-indices",
      kites: [
        createKite({
          contentBlocks: Array.from({ length: 10 }, (_, i) =>
            createBlock({
              position: { x: 30 + i * 2, y: 30 + i * 2, width: 30, height: 20 },
              zIndex: i + 1,
            })
          ),
        }),
      ],
    },
  ];
}

export function generateRandomPresentation(kiteCount: number = 10): Kite[] {
  return Array.from({ length: kiteCount }, () => 
    createKiteWithBlocks(randomInt(1, 6))
  );
}

// ============================================
// THEME TEST DATA
// ============================================

export const TEST_THEMES = ["sky", "retro", "neon", "rpg", "zombie"] as const;
export type TestTheme = typeof TEST_THEMES[number];

export function randomTheme(): TestTheme {
  return randomChoice([...TEST_THEMES]);
}

// ============================================
// ATTACK TYPE TEST DATA
// ============================================

export const TEST_ATTACK_TYPES = ["scratch", "infection", "devour", "drag", "splatter"] as const;
export type TestAttackType = typeof TEST_ATTACK_TYPES[number];

export function randomAttackType(): TestAttackType {
  return randomChoice([...TEST_ATTACK_TYPES]);
}
