import { z } from "zod";

/**
 * Content Block Position Schema
 * Position and size of a block on the kite canvas
 */
export const BlockPositionSchema = z.object({
  x: z.number(), // percentage from left (0-100)
  y: z.number(), // percentage from top (0-100)
  width: z.number(), // percentage of kite width
  height: z.number(), // percentage of kite height
});

/**
 * Content Block Types
 */
export const BlockTypeSchema = z.enum([
  "h1",
  "h2",
  "h3",
  "h4",
  "text",
  "image",
]);

/**
 * Content Block Schema
 * Individual content block within a Kite
 */
export const ContentBlockSchema = z.object({
  id: z.string().uuid(),
  type: BlockTypeSchema,
  position: BlockPositionSchema,
  content: z.string(),
  zIndex: z.number().optional(), // Layer order (higher = on top)
  style: z.object({
    fontSize: z.number().optional(),
    fontWeight: z.enum(["normal", "medium", "semibold", "bold"]).optional(),
    textAlign: z.enum(["left", "center", "right"]).optional(),
    color: z.string().optional(),
    backgroundColor: z.string().optional(),
    borderRadius: z.number().optional(),
  }).optional(),
});

/**
 * Kite Schema
 * A single presentation unit - we call them Kites
 */
export const KiteSchema = z.object({
  id: z.string().uuid(),
  contentBlocks: z.array(ContentBlockSchema),
  backgroundColor: z.string().optional(),
  speakerNotes: z.string().optional(), // Notes visible only to presenter
  themeOverride: z.string().optional(), // Per-kite theme override (used in Hybrid mode)
  durationOverride: z.number().optional(), // Per-kite timer duration in seconds (used in Hybrid mode)
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

/**
 * Deck Schema (collection of Kites)
 */
export const DeckSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  description: z.string().optional(),
  kites: z.array(KiteSchema),
  theme: z.string().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

// TypeScript types inferred from Zod schemas
export type BlockPosition = z.infer<typeof BlockPositionSchema>;
export type BlockType = z.infer<typeof BlockTypeSchema>;
export type ContentBlock = z.infer<typeof ContentBlockSchema>;
export type Kite = z.infer<typeof KiteSchema>;
export type Deck = z.infer<typeof DeckSchema>;

// Partial types for updates
export type ContentBlockUpdate = Partial<Omit<ContentBlock, "id">>;
export type KiteUpdate = Partial<Omit<Kite, "id">>;

/**
 * Validation helpers
 */
export function validateKite(data: unknown): Kite {
  return KiteSchema.parse(data);
}

export function validateContentBlock(data: unknown): ContentBlock {
  return ContentBlockSchema.parse(data);
}

export function safeValidateKite(data: unknown) {
  return KiteSchema.safeParse(data);
}
