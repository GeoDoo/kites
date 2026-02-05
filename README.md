# Kites

**A modern presentation platform** — Airy, lightweight, drag-and-drop presentations that feel like flying.

Competitor to Pitch/Tome with a focus on smooth animations and delightful UX.

## Core Concepts

- **Kites** — Our name for slides. Each kite is a canvas you can fill with content.
- **Content Blocks** — Headings, text, and images that you drag and position freely.
- **Sky Theme** — Light blues, whites, and airy grays for a fresh, modern feel.

## Features

- **Canvas Editor** — Drag and drop content blocks anywhere
- **Inline Editing** — Double-click to edit text directly on the canvas
- **Alignment Guides** — Snap to center, edges, and common positions
- **Presentation Mode** — Full-screen with keyboard navigation
- **Auto-save** — Changes persist to localStorage
- **Sky Theme** — Beautiful blue-tinted UI with smooth animations

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

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

Open [http://localhost:3000](http://localhost:3000) to use the editor.

## Usage

### Editor Mode

1. **Add content** — Use the toolbar (Heading, Text, Image)
2. **Select** — Click any block to select it
3. **Move** — Drag blocks to reposition
4. **Resize** — Use the corner handle
5. **Edit** — Double-click text to edit inline
6. **Delete** — Press `Delete` or use the trash icon

### Kite Management

- **Add kite** — Click `+` in the sidebar
- **Select kite** — Click a thumbnail
- **Duplicate/Delete** — Hover for action buttons

### Presentation Mode

- Click **Present** (top-right)
- Navigate: Arrow keys, Space, or scroll
- Exit: Press `Escape`

## Project Structure

```
src/
├── app/
│   ├── globals.css      # Sky theme + Tailwind
│   ├── layout.tsx       # Root layout
│   └── page.tsx         # Editor/Present toggle
├── components/
│   ├── Deck/
│   │   ├── DeckContainer.tsx   # Presentation mode
│   │   └── SlideView.tsx       # Single kite renderer
│   └── Editor/
│       ├── CanvasElement.tsx   # Draggable content block
│       ├── EditorLayout.tsx    # Main layout
│       ├── ElementToolbar.tsx  # Add content toolbar
│       ├── SlideCanvas.tsx     # Interactive canvas
│       ├── SlideList.tsx       # Kite thumbnails
│       └── AlignmentGuides.tsx # Snap guides
└── lib/
    ├── store.ts         # Zustand store (kites, blocks)
    ├── types.ts         # Zod schemas (Kite, ContentBlock)
    └── utils.ts         # Utilities (cn)
```

## Data Model

```typescript
interface Kite {
  id: string;
  contentBlocks: ContentBlock[];
  backgroundColor?: string;
}

interface ContentBlock {
  id: string;
  type: "h1" | "h2" | "h3" | "h4" | "text" | "image";
  position: { x, y, width, height }; // percentages
  content: string;
  style?: { fontSize, fontWeight, textAlign, ... };
}
```

## Sky Theme

The UI uses a cohesive sky-blue palette:

```css
--accent-primary: #0ea5e9;   /* sky-500 */
--bg-primary: #f0f9ff;       /* sky-50 */
--text-primary: #0f172a;     /* slate-900 */
```

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Delete` | Delete selected block |
| `Escape` | Deselect / Exit presentation |
| `↑` `↓` `←` `→` | Navigate kites (presentation) |
| `Space` | Next kite (presentation) |
| `Home` / `End` | First / Last kite |

## License

MIT
