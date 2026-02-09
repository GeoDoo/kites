# Kites

**A modern presentation platform** — Airy, lightweight, drag-and-drop presentations that feel like flying.

Built as a personal tool for crafting talks with full creative control: free-form canvas editing, multiple themes, per-kite timing, and a zombie apocalypse mode where LLM-named undead attack your slides.

## Core Concepts

- **Kites** — Each kite is a 1920×1080 canvas you can fill with content blocks.
- **Content Blocks** — Headings (H1–H4), text, and images — drag, resize, and position freely.
- **Themes** — Sky, Retro Gaming, Neon Cyberpunk, RPG Fantasy, Zombie Apocalypse — or mix them per-kite with Hybrid mode.
- **WYSIWYG** — Editor, thumbnails, and presentation mode all render a native 1920×1080 canvas scaled via CSS `transform`, so what you see is exactly what your audience sees.

## Features

### Editor
- **Canvas Editor** — Drag and drop content blocks on a free-form 1920×1080 canvas
- **Inline Editing** — Double-click to edit text directly, with a rich formatting toolbar (bold, italic, underline, lists, alignment, font size, color)
- **Heading Type Switcher** — Change heading level (H1–H4) inline without losing content
- **Image Blocks** — Upload images with automatic aspect-ratio detection and proportional resize
- **Alignment Guides** — Snap to center, edges, and grid while dragging
- **Drag & Drop Reorder** — Rearrange kites by dragging thumbnails in the sidebar
- **Undo / Redo** — Cmd+Z / Cmd+Shift+Z with up to 80 history steps
- **Speaker Notes** — Per-kite notes panel for presenter reference

### Presentation
- **Full-screen Mode** — Keyboard navigation (arrows, space, Home/End, Escape)
- **Per-Kite Themes** — Hybrid mode lets you assign a different theme to each kite
- **Presentation Timer** — Configurable total duration, distributed across kites
- **Zombie Attack** — LLM-named zombies (GPT-4o, Claude, Gemini, etc.) shamble from all directions and attack your content when time runs out

### Persistence & Export
- **SQLite Database** — All data persists server-side via better-sqlite3
- **Auto-save** — Debounced saves on edit, `sendBeacon` on tab close, `visibilitychange` on tab switch
- **PDF Export** — Via html2canvas + jsPDF
- **PPTX Export** — Via PptxGenJS
- **Live Sync to Source** — Toggle to auto-write DB state back to `talk-data.ts` for version control

### Themes

| Theme | Vibe | Special Effects |
|-------|------|-----------------|
| Sky | Light, airy, modern | — |
| Retro Gaming | CRT terminal, green-on-black | Scanlines, glow |
| Neon Cyberpunk | Glowing futuristic | Glow, noise |
| RPG Fantasy | Dark fantasy atmosphere | Noise |
| Zombie Apocalypse | Undead wasteland | Noise, zombie horde attack |
| Hybrid | Mix any of the above per kite | Inherits per-kite theme effects |

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| State | Zustand (with Immer & Persist) |
| Validation | Zod |
| Animation | Framer Motion |
| Icons | Lucide React |
| Database | better-sqlite3 |
| Testing | Vitest, React Testing Library |
| PDF Export | html2canvas, jsPDF |
| PPTX Export | PptxGenJS |

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

Open [http://localhost:3000](http://localhost:3000) to use the editor.

### Seed a Talk

Visit [http://localhost:3000/seed-talk](http://localhost:3000/seed-talk) to generate a pre-built presentation from `src/app/seed-talk/talk-data.ts`.

## Usage

### Editor Mode

1. **Add content** — Use the toolbar (Heading, Text, Image)
2. **Select** — Click any block to select it
3. **Move** — Drag blocks to reposition
4. **Resize** — Corner handles (proportional for images, free for text)
5. **Edit** — Double-click text to edit inline with formatting toolbar
6. **Delete** — Press `Delete`/`Backspace` or use the trash icon
7. **Reorder** — Drag thumbnails in the sidebar to rearrange kites
8. **Undo/Redo** — Cmd+Z / Cmd+Shift+Z

### Kite Management

- **Add kite** — Click `+` in the sidebar
- **Select kite** — Click a thumbnail
- **Duplicate/Delete** — Use the action buttons on the selected block
- **Theme per kite** — Use the dropdown on each thumbnail (Hybrid mode)
- **Duration per kite** — Set individual timings in Hybrid mode

### Presentation Mode

- Click **Present** (top-right)
- Navigate: Arrow keys, Space, or scroll
- Exit: Press `Escape`

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── kites/route.ts          # GET/POST kites data (SQLite)
│   │   └── sync-talk-data/route.ts # Live sync DB → source file
│   ├── seed-talk/
│   │   ├── page.tsx                # Seed UI
│   │   └── talk-data.ts           # Talk content definitions
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                    # Editor/Present toggle
├── components/
│   ├── Deck/
│   │   ├── DeckContainer.tsx       # Presentation mode wrapper
│   │   ├── KiteView.tsx            # Single kite renderer (1920×1080 scaled)
│   │   ├── PresentationTimer.tsx   # Countdown timer
│   │   └── ZombieAttack.tsx        # Zombie horde with LLM names
│   └── Editor/
│       ├── CanvasElement.tsx       # Draggable/resizable content block
│       ├── EditorLayout.tsx        # Main editor layout
│       ├── ElementToolbar.tsx      # Add content toolbar
│       ├── ImageUploadModal.tsx    # Image upload with compression
│       ├── KiteCanvas.tsx          # 1920×1080 canvas with CSS transform
│       ├── KiteList.tsx            # Sidebar thumbnails with drag reorder
│       ├── SpeakerNotesPanel.tsx   # Per-kite speaker notes
│       ├── ThemeSelector.tsx       # Theme/Hybrid mode selector
│       ├── AlignmentGuides.tsx     # Snap guides
│       └── ContextMenu.tsx         # Right-click menu
├── lib/
│   ├── db.ts                       # SQLite persistence
│   ├── export-pdf.ts               # PDF export
│   ├── export-pptx.ts              # PPTX export
│   ├── store.ts                    # Zustand store (kites, blocks, undo/redo)
│   ├── themes.ts                   # Theme definitions & resolution
│   ├── types.ts                    # Zod schemas
│   └── utils.ts                    # Utilities, HTML sanitizer, block CSS
└── __tests__/                      # Vitest + RTL tests
```

## Data Model

```typescript
interface Kite {
  id: string;
  contentBlocks: ContentBlock[];
  backgroundColor?: string;
  speakerNotes?: string;
  themeOverride?: string;      // Per-kite theme (Hybrid mode)
  durationOverride?: number;   // Per-kite duration in seconds
}

interface ContentBlock {
  id: string;
  type: "h1" | "h2" | "h3" | "h4" | "text" | "image";
  position: { x, y, width, height }; // percentages of 1920×1080
  content: string;                    // HTML for text, URL/data for images
  style?: { fontSize, fontWeight, textAlign, color };
  zIndex?: number;
}
```

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Delete` / `Backspace` | Delete selected block |
| `Tab` / `Shift+Tab` | Cycle through blocks |
| `Cmd+Z` | Undo |
| `Cmd+Shift+Z` | Redo |
| `Escape` | Deselect / Exit editing / Exit presentation |
| `↑` `↓` `←` `→` | Navigate kites (presentation) |
| `Space` | Next kite (presentation) |
| `Home` / `End` | First / Last kite |

## License

MIT
