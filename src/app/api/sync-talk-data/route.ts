import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

const TALK_DATA_PATH = path.join(
  process.cwd(),
  "src",
  "app",
  "seed-talk",
  "talk-data.ts"
);

// Marker: the line that starts the TALK_KITES array
const ARRAY_START = "export const TALK_KITES: KiteDef[] = [";
const ARRAY_END = "];";

interface BlockFromDB {
  type: string;
  position: { x: number; y: number; width: number; height: number };
  content: string;
  style?: Record<string, unknown>;
  zIndex?: number;
}

interface KiteFromDB {
  contentBlocks: BlockFromDB[];
  speakerNotes?: string;
}

/**
 * Serialize a string value for TypeScript source.
 * Uses backtick template literals when the content contains quotes or HTML,
 * otherwise uses double quotes.
 */
function serializeString(value: string): string {
  // If it contains backticks, fall back to JSON-escaped double quotes
  if (value.includes("`")) {
    return JSON.stringify(value);
  }
  // Use template literal for content with quotes, newlines, or HTML
  if (
    value.includes('"') ||
    value.includes("'") ||
    value.includes("\n") ||
    value.includes("<")
  ) {
    return `\`${value.replace(/\\/g, "\\\\").replace(/\$\{/g, "\\${")}\``;
  }
  return JSON.stringify(value);
}

/**
 * Serialize a style object, omitting undefined/null values.
 */
function serializeStyle(style: Record<string, unknown>): string {
  const entries = Object.entries(style).filter(
    ([, v]) => v != null && v !== undefined
  );
  if (entries.length === 0) return "{}";
  const inner = entries
    .map(([k, v]) => {
      if (typeof v === "string") return `${k}: ${JSON.stringify(v)}`;
      return `${k}: ${v}`;
    })
    .join(", ");
  return `{ ${inner} }`;
}

/**
 * Convert a DB kite to a KiteDef source string.
 */
function kiteToKiteDef(kite: KiteFromDB): string {
  const blockStrings = kite.contentBlocks.map((block) => {
    const parts: string[] = [
      `      type: ${JSON.stringify(block.type)}`,
      `      content: ${serializeString(block.content)}`,
      `      position: { x: ${block.position.x}, y: ${block.position.y}, width: ${block.position.width}, height: ${block.position.height} }`,
    ];
    if (block.style && Object.keys(block.style).length > 0) {
      parts.push(`      style: ${serializeStyle(block.style)}`);
    }
    if (block.zIndex != null) {
      parts.push(`      zIndex: ${block.zIndex}`);
    }
    return `    {\n${parts.join(",\n")},\n    }`;
  });

  const blockArray = `[\n${blockStrings.join(",\n")},\n  ]`;

  if (kite.speakerNotes?.trim()) {
    return `  {\n    blocks: ${blockArray},\n    speakerNotes: ${serializeString(kite.speakerNotes)},\n  }`;
  }
  return `  {\n    blocks: ${blockArray},\n  }`;
}

export async function POST(request: Request) {
  try {
    const { kites } = (await request.json()) as { kites: KiteFromDB[] };

    if (!kites || !Array.isArray(kites)) {
      return NextResponse.json(
        { error: "Missing kites array" },
        { status: 400 }
      );
    }

    // Read the current file
    const source = fs.readFileSync(TALK_DATA_PATH, "utf-8");

    // Find the TALK_KITES array boundaries
    const startIdx = source.indexOf(ARRAY_START);
    if (startIdx === -1) {
      return NextResponse.json(
        { error: "Could not find TALK_KITES declaration in talk-data.ts" },
        { status: 500 }
      );
    }

    // Find the matching closing "];" after the start
    const afterStart = startIdx + ARRAY_START.length;
    const endIdx = source.indexOf(`\n${ARRAY_END}`, afterStart);
    if (endIdx === -1) {
      return NextResponse.json(
        { error: "Could not find closing ]; for TALK_KITES" },
        { status: 500 }
      );
    }

    // Build the new array contents
    const kiteEntries = kites.map((kite) => kiteToKiteDef(kite));
    const newArrayBody = `\n${kiteEntries.join(",\n")},\n`;

    // Splice the file: keep everything before the array body, replace body, keep everything after
    const before = source.slice(0, afterStart);
    const after = source.slice(endIdx);
    const newSource = before + newArrayBody + after;

    fs.writeFileSync(TALK_DATA_PATH, newSource, "utf-8");

    return NextResponse.json({ success: true, kites: kites.length });
  } catch (error) {
    console.error("Sync talk data failed:", error);
    return NextResponse.json(
      { error: "Failed to sync talk data" },
      { status: 500 }
    );
  }
}
