/**
 * Seed Talk Data & Helpers
 * Pure data module — no React, no "use client".
 * Exported so both the page component and tests can use the real code.
 */

// ─── Types ───────────────────────────────────────────────────────────────────

export interface BlockDef {
  type: "h1" | "h2" | "h3" | "h4" | "text" | "image";
  content: string;
  position: { x: number; y: number; width: number; height: number };
  style?: {
    fontSize?: number;
    fontWeight?: "normal" | "medium" | "semibold" | "bold";
    textAlign?: "left" | "center" | "right";
    color?: string;
  };
  zIndex?: number;
}

export interface KiteDef {
  blocks: BlockDef[];
  speakerNotes?: string;
}

// ─── Layout helpers ──────────────────────────────────────────────────────────

export function titleKite(title: string, subtitle: string, footer: string): KiteDef {
  const blocks: BlockDef[] = [
    {
      type: "h1",
      content: title,
      position: { x: 5, y: 20, width: 90, height: 25 },
      style: { fontSize: 64, fontWeight: "bold", textAlign: "center" },
      zIndex: 10,
    },
    {
      type: "h3",
      content: subtitle,
      position: { x: 10, y: 50, width: 80, height: 12 },
      style: { fontSize: 36, fontWeight: "semibold", textAlign: "center" },
      zIndex: 10,
    },
  ];
  if (footer) {
    blocks.push({
      type: "text",
      content: footer,
      position: { x: 20, y: 78, width: 60, height: 8 },
      style: { fontSize: 20, textAlign: "center" },
      zIndex: 10,
    });
  }
  return { blocks };
}

export function quoteKite(quote: string, attribution: string): KiteDef {
  return {
    blocks: [
      {
        type: "h2",
        content: `<i>&ldquo;${quote}&rdquo;</i>`,
        position: { x: 8, y: 15, width: 84, height: 45 },
        style: { fontSize: 42, fontWeight: "medium", textAlign: "center" },
        zIndex: 10,
      },
      {
        type: "text",
        content: `&mdash; ${attribution}`,
        position: { x: 25, y: 68, width: 50, height: 10 },
        style: { fontSize: 24, textAlign: "center" },
        zIndex: 10,
      },
    ],
  };
}

export function bigStatement(text: string, fontSize: number = 56): KiteDef {
  return {
    blocks: [
      {
        type: "h1",
        content: text,
        position: { x: 5, y: 25, width: 90, height: 40 },
        style: { fontSize, fontWeight: "bold", textAlign: "center" },
        zIndex: 10,
      },
    ],
  };
}

export function sectionBreak(text: string): KiteDef {
  return {
    blocks: [
      {
        type: "h1",
        content: text,
        position: { x: 10, y: 32, width: 80, height: 28 },
        style: { fontSize: 52, fontWeight: "bold", textAlign: "center" },
        zIndex: 10,
      },
    ],
  };
}

export function contentKite(heading: string, body: string): KiteDef {
  return {
    blocks: [
      {
        type: "h2",
        content: heading,
        position: { x: 5, y: 5, width: 90, height: 14 },
        style: { fontSize: 48, fontWeight: "bold", textAlign: "left" },
        zIndex: 10,
      },
      {
        type: "text",
        content: body,
        position: { x: 5, y: 24, width: 88, height: 68 },
        style: { fontSize: 28, textAlign: "left" },
        zIndex: 10,
      },
    ],
  };
}

export function statementSub(statement: string, sub: string, statementSize: number = 48): KiteDef {
  return {
    blocks: [
      {
        type: "h2",
        content: statement,
        position: { x: 5, y: 15, width: 90, height: 22 },
        style: { fontSize: statementSize, fontWeight: "bold", textAlign: "center" },
        zIndex: 10,
      },
      {
        type: "text",
        content: sub,
        position: { x: 10, y: 45, width: 80, height: 42 },
        style: { fontSize: 30, textAlign: "center" },
        zIndex: 10,
      },
    ],
  };
}

export function scenarioTitle(label: string, description: string): KiteDef {
  return {
    blocks: [
      {
        type: "h1",
        content: label,
        position: { x: 10, y: 22, width: 80, height: 22 },
        style: { fontSize: 60, fontWeight: "bold", textAlign: "center" },
        zIndex: 10,
      },
      {
        type: "h3",
        content: description,
        position: { x: 10, y: 52, width: 80, height: 16 },
        style: { fontSize: 36, fontWeight: "semibold", textAlign: "center" },
        zIndex: 10,
      },
    ],
  };
}

export function contentWithPunchline(heading: string, body: string, punchline: string): KiteDef {
  return {
    blocks: [
      {
        type: "h2",
        content: heading,
        position: { x: 5, y: 5, width: 90, height: 12 },
        style: { fontSize: 44, fontWeight: "bold", textAlign: "left" },
        zIndex: 10,
      },
      {
        type: "text",
        content: body,
        position: { x: 5, y: 22, width: 88, height: 45 },
        style: { fontSize: 28, textAlign: "left" },
        zIndex: 10,
      },
      {
        type: "h3",
        content: punchline,
        position: { x: 5, y: 74, width: 90, height: 18 },
        style: { fontSize: 36, fontWeight: "bold", textAlign: "center" },
        zIndex: 10,
      },
    ],
  };
}

// ─── HTML helpers ────────────────────────────────────────────────────────────

export function ul(...items: string[]): string {
  return `<ul>${items.map((i) => `<li>${i}</li>`).join("")}</ul>`;
}

export function ol(...items: string[]): string {
  return `<ol>${items.map((i) => `<li>${i}</li>`).join("")}</ol>`;
}

export const br = "<br>";
export const br2 = "<br><br>";

export function b(text: string): string {
  return `<b>${text}</b>`;
}

export function i(text: string): string {
  return `<i>${text}</i>`;
}

// ─── All kites ───────────────────────────────────────────────────────────────

export const TALK_KITES: KiteDef[] = [
  {
    blocks: [
    {
      type: "h1",
      content: "Imagination vs. Reality",
      position: { x: 5, y: 20, width: 90, height: 25 },
      style: { fontSize: 72, fontWeight: "bold", textAlign: "center" },
      zIndex: 10,
    },
    {
      type: "h3",
      content: `A Survivor's Guide to AI Hype`,
      position: { x: 10, y: 50, width: 80, height: 12 },
      style: { fontSize: 36, fontWeight: "semibold", textAlign: "center" },
      zIndex: 10,
    },
    {
      type: "text",
      content: "JSMonthly | Feb 19, 2026",
      position: { x: 20, y: 78, width: 60, height: 8 },
      style: { fontSize: 36, textAlign: "center" },
      zIndex: 10,
    },
  ],
  },
  {
    blocks: [
    {
      type: "h2",
      content: "Georgios Karametas",
      position: { x: 5.206044508833354, y: 4, width: 55, height: 12 },
      style: { fontSize: 56, fontWeight: "bold", textAlign: "left" },
      zIndex: 10,
    },
    {
      type: "text",
      content: `Engineering Manager — FE &amp; BE<br>15+ years in software engineering<br>MBA — Imperial Business School, London`,
      position: { x: 5.309066763250033, y: 19.871794871794872, width: 55, height: 55 },
      style: { fontSize: 34, textAlign: "left" },
      zIndex: 10,
    },
    {
      type: "image",
      content: "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=https%3A%2F%2Fwww.linkedin.com%2Fin%2Fgeorgekarametas%2F",
      position: { x: 65, y: 15, width: 28, height: 50 },
      zIndex: 10,
    },
    {
      type: "text",
      content: `<img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/linkedin/linkedin-original.svg" style="width:20px;height:20px;vertical-align:middle;display:inline-block;margin-right:6px">linkedin.com/in/georgekarametas`,
      position: { x: 62, y: 68, width: 34, height: 8 },
      style: { fontSize: 30, textAlign: "center" },
      zIndex: 10,
    },
  ],
  },
  {
    blocks: [
    {
      type: "h1",
      content: "“Will AI take my job?”",
      position: { x: 5, y: 5, width: 90, height: 14 },
      style: { fontSize: 72, fontWeight: "bold", textAlign: "left" },
      zIndex: 10,
    },
    {
      type: "text",
      content: `<ol><li>Possible scenarios</li><li>Every possible angle</li><li>One hopeful answer</li></ol>`,
      position: { x: 6, y: 25, width: 88, height: 68 },
      style: { fontSize: 36, textAlign: "left" },
      zIndex: 10,
    },
  ],
  },
  {
    blocks: [
    {
      type: "h2",
      content: "My Credentials (for Surviving Hype)",
      position: { x: 5, y: 5, width: 90, height: 12 },
      style: { fontSize: 44, fontWeight: "bold", textAlign: "left" },
      zIndex: 10,
    },
    {
      type: "text",
      content: `jQuery 1.4 (2010) → Angular → React (and Vue)<br><br>SPAs → SSR → Server Components<br><br>Monoliths → Microservices → Monoliths<br><br>2008 crash. Pandemic. Crypto. Now AI.`,
      position: { x: 5, y: 22, width: 88, height: 45 },
      style: { fontSize: 28, textAlign: "left" },
      zIndex: 10,
    },
    {
      type: "h3",
      content: "Still here.",
      position: { x: 5, y: 74, width: 90, height: 18 },
      style: { fontSize: 36, fontWeight: "bold", textAlign: "center" },
      zIndex: 10,
    },
  ],
  },
  {
    blocks: [
    {
      type: "h2",
      content: "The Hype Cycles",
      position: { x: 5, y: 5, width: 90, height: 14 },
      style: { fontSize: 48, fontWeight: "bold", textAlign: "left" },
      zIndex: 10,
    },
    {
      type: "text",
      content: `<ul><li><b>2010</b> &mdash; jQuery &mdash; <i>&ldquo;Learn this or die&rdquo;</i></li><li><b>2012</b> &mdash; Angular &mdash; <i>&ldquo;MVC in the browser!&rdquo;</i></li><li><b>2015</b> &mdash; React &mdash; <i>&ldquo;Everything is components&rdquo;</i></li><li><b>2017</b> &mdash; Microservices &mdash; <i>&ldquo;Monoliths are dead&rdquo;</i></li><li><b>2019</b> &mdash; Serverless &mdash; <i>&ldquo;Servers are dead&rdquo;</i></li><li><b>2022</b> &mdash; Web3 &mdash; <i>&ldquo;Learn Solidity or be left behind&rdquo;</i></li><li><b>2024</b> &mdash; AI &mdash; <i>&ldquo;Engineers are dead&rdquo;</i></li></ul>`,
      position: { x: 5, y: 24, width: 88, height: 68 },
      style: { fontSize: 28, textAlign: "left" },
      zIndex: 10,
    },
  ],
  },
  {
    blocks: [
    {
      type: "h2",
      content: "The World Events",
      position: { x: 5, y: 5, width: 90, height: 14 },
      style: { fontSize: 48, fontWeight: "bold", textAlign: "left" },
      zIndex: 10,
    },
    {
      type: "text",
      content: `<ul><li><b>2008</b> &mdash; Financial crisis &mdash; <i>&ldquo;Is tech safe?&rdquo;</i></li><li><b>2020</b> &mdash; Pandemic &mdash; <i>&ldquo;Is remote forever?&rdquo;</i></li><li><b>2022</b> &mdash; Crypto crash &mdash; <i>&ldquo;Web3 was the future&rdquo;</i></li><li><b>2024</b> &mdash; AI hype &mdash; <i>Sound familiar?</i></li></ul>`,
      position: { x: 5, y: 24, width: 88, height: 68 },
      style: { fontSize: 28, textAlign: "left" },
      zIndex: 10,
    },
  ],
  },
  {
    blocks: [
    {
      type: "h2",
      content: `Four existential threats.<br>15 years.`,
      position: { x: 5, y: 15, width: 90, height: 22 },
      style: { fontSize: 44, fontWeight: "bold", textAlign: "center" },
      zIndex: 10,
    },
    {
      type: "text",
      content: `<b>I'm still here. So are you.</b>`,
      position: { x: 10, y: 45, width: 80, height: 42 },
      style: { fontSize: 30, textAlign: "center" },
      zIndex: 10,
    },
  ],
  },
  {
    blocks: [
    {
      type: "h2",
      content: "What Actually Stayed Constant",
      position: { x: 5, y: 5, width: 90, height: 14 },
      style: { fontSize: 48, fontWeight: "bold", textAlign: "left" },
      zIndex: 10,
    },
    {
      type: "text",
      content: `<ul><li>Server &harr; Client</li><li>Request &rarr; Response</li><li>State &rarr; UI</li><li>A human decides what to build</li></ul>`,
      position: { x: 5, y: 24, width: 88, height: 68 },
      style: { fontSize: 28, textAlign: "left" },
      zIndex: 10,
    },
  ],
  },
  {
    blocks: [
    {
      type: "h1",
      content: `Let's explore the scenarios.`,
      position: { x: 10, y: 32, width: 80, height: 28 },
      style: { fontSize: 52, fontWeight: "bold", textAlign: "center" },
      zIndex: 10,
    },
  ],
  },
  {
    blocks: [
    {
      type: "h1",
      content: "Scenario 1",
      position: { x: 10, y: 22, width: 80, height: 22 },
      style: { fontSize: 60, fontWeight: "bold", textAlign: "center" },
      zIndex: 10,
    },
    {
      type: "h3",
      content: "&ldquo;Everyone becomes an engineer&rdquo;",
      position: { x: 10, y: 52, width: 80, height: 16 },
      style: { fontSize: 36, fontWeight: "semibold", textAlign: "center" },
      zIndex: 10,
    },
  ],
  },
  {
    blocks: [
    {
      type: "h2",
      content: "1a &mdash; The Desire Argument",
      position: { x: 5, y: 5, width: 90, height: 12 },
      style: { fontSize: 44, fontWeight: "bold", textAlign: "left" },
      zIndex: 10,
    },
    {
      type: "text",
      content: `<b>P1:</b> Every profession requires a specific disposition<br>(laziness, impatience, hubris &mdash; Larry Wall).<br><br><b>P2:</b> AI lowers the <i>barrier to entry</i> but does not alter human disposition.`,
      position: { x: 5, y: 22, width: 88, height: 45 },
      style: { fontSize: 28, textAlign: "left" },
      zIndex: 10,
    },
    {
      type: "h3",
      content: "&there4; AI does not meaningfully increase the number of people who want to be engineers.",
      position: { x: 5, y: 74, width: 90, height: 18 },
      style: { fontSize: 36, fontWeight: "bold", textAlign: "center" },
      zIndex: 10,
    },
  ],
  },
  {
    blocks: [
    {
      type: "h2",
      content: "1b &mdash; The Economics Argument",
      position: { x: 5, y: 5, width: 90, height: 12 },
      style: { fontSize: 44, fontWeight: "bold", textAlign: "left" },
      zIndex: 10,
    },
    {
      type: "text",
      content: `<b>P1:</b> If supply of engineers increases, wages fall.<br><br><b>P2:</b> If wages fall, the incentive to enter the profession disappears.`,
      position: { x: 5, y: 22, width: 88, height: 45 },
      style: { fontSize: 28, textAlign: "left" },
      zIndex: 10,
    },
    {
      type: "h3",
      content: "&there4; An oversupply of engineers is self-correcting.",
      position: { x: 5, y: 74, width: 90, height: 18 },
      style: { fontSize: 36, fontWeight: "bold", textAlign: "center" },
      zIndex: 10,
    },
  ],
  },
  {
    blocks: [
    {
      type: "h2",
      content: "1c &mdash; The Counter: Induced Demand",
      position: { x: 5, y: 5, width: 90, height: 12 },
      style: { fontSize: 44, fontWeight: "bold", textAlign: "left" },
      zIndex: 10,
    },
    {
      type: "text",
      content: `<b>P1:</b> If the cost of engineering labour falls, more projects become viable.<br><br><b>P2:</b> More viable projects create more demand for engineers.`,
      position: { x: 5, y: 22, width: 88, height: 45 },
      style: { fontSize: 28, textAlign: "left" },
      zIndex: 10,
    },
    {
      type: "h3",
      content: "&there4; Cheaper engineering can increase, not decrease, total employment.",
      position: { x: 5, y: 74, width: 90, height: 18 },
      style: { fontSize: 36, fontWeight: "bold", textAlign: "center" },
      zIndex: 10,
    },
  ],
  },
  {
    blocks: [
    {
      type: "h1",
      content: "Scenario 2",
      position: { x: 10, y: 22, width: 80, height: 22 },
      style: { fontSize: 60, fontWeight: "bold", textAlign: "center" },
      zIndex: 10,
    },
    {
      type: "h3",
      content: "&ldquo;AI replaces engineers directly&rdquo;",
      position: { x: 10, y: 52, width: 80, height: 16 },
      style: { fontSize: 36, fontWeight: "semibold", textAlign: "center" },
      zIndex: 10,
    },
  ],
  },
  {
    blocks: [
    {
      type: "h2",
      content: "2a &mdash; The Statistical Ceiling",
      position: { x: 5, y: 5, width: 90, height: 12 },
      style: { fontSize: 44, fontWeight: "bold", textAlign: "left" },
      zIndex: 10,
    },
    {
      type: "text",
      content: `<b>P1:</b> AI is a statistical model; it generalises from observed patterns.<br><br><b>P2:</b> Novel problems, edge cases, and black swans have no prior pattern to match.`,
      position: { x: 5, y: 22, width: 88, height: 45 },
      style: { fontSize: 28, textAlign: "left" },
      zIndex: 10,
    },
    {
      type: "h3",
      content: "&there4; AI cannot reliably solve problems it has never seen &mdash; which is when engineers are most needed.",
      position: { x: 5, y: 74, width: 90, height: 18 },
      style: { fontSize: 36, fontWeight: "bold", textAlign: "center" },
      zIndex: 10,
    },
  ],
  },
  {
    blocks: [
    {
      type: "h2",
      content: "2b &mdash; The Judgment Argument",
      position: { x: 5, y: 5, width: 90, height: 12 },
      style: { fontSize: 44, fontWeight: "bold", textAlign: "left" },
      zIndex: 10,
    },
    {
      type: "text",
      content: `<b>P1:</b> Software that matters requires judgment about <i>what to build</i> and <i>whether it should exist</i>.<br><br><b>P2:</b> Judgment requires context, values, and accountability &mdash; none of which a statistical model possesses.`,
      position: { x: 5, y: 22, width: 88, height: 45 },
      style: { fontSize: 28, textAlign: "left" },
      zIndex: 10,
    },
    {
      type: "h3",
      content: "&there4; AI can generate code but cannot replace the decision-maker.",
      position: { x: 5, y: 74, width: 90, height: 18 },
      style: { fontSize: 36, fontWeight: "bold", textAlign: "center" },
      zIndex: 10,
    },
  ],
  },
  {
    blocks: [
    {
      type: "h2",
      content: "2c &mdash; The Connection Argument",
      position: { x: 5, y: 5, width: 90, height: 12 },
      style: { fontSize: 44, fontWeight: "bold", textAlign: "left" },
      zIndex: 10,
    },
    {
      type: "text",
      content: `<b>P1:</b> Software exists to serve and connect people.<br><br><b>P2:</b> People prefer to collaborate with other people (trust, empathy, shared stakes).`,
      position: { x: 5, y: 22, width: 88, height: 45 },
      style: { fontSize: 28, textAlign: "left" },
      zIndex: 10,
    },
    {
      type: "h3",
      content: "&there4; Fully replacing engineers with machines undermines the purpose of building software.",
      position: { x: 5, y: 74, width: 90, height: 18 },
      style: { fontSize: 36, fontWeight: "bold", textAlign: "center" },
      zIndex: 10,
    },
  ],
  },
  {
    blocks: [
    {
      type: "h1",
      content: "Scenario 3",
      position: { x: 10, y: 22, width: 80, height: 22 },
      style: { fontSize: 60, fontWeight: "bold", textAlign: "center" },
      zIndex: 10,
    },
    {
      type: "h3",
      content: "&ldquo;Full automation&rdquo;",
      position: { x: 10, y: 52, width: 80, height: 16 },
      style: { fontSize: 36, fontWeight: "semibold", textAlign: "center" },
      zIndex: 10,
    },
  ],
  },
  {
    blocks: [
    {
      type: "h2",
      content: "3a &mdash; The Doom Path",
      position: { x: 5, y: 5, width: 90, height: 12 },
      style: { fontSize: 44, fontWeight: "bold", textAlign: "left" },
      zIndex: 10,
    },
    {
      type: "text",
      content: `<b>P1:</b> If AI automates all productive labour, mass unemployment follows.<br><br><b>P2:</b> Mass unemployment causes economic collapse (no wages &rarr; no consumption &rarr; no economy).`,
      position: { x: 5, y: 22, width: 88, height: 45 },
      style: { fontSize: 28, textAlign: "left" },
      zIndex: 10,
    },
    {
      type: "h3",
      content: "&there4; Full automation within the current system is self-destructive &mdash; and thus self-limiting.",
      position: { x: 5, y: 74, width: 90, height: 18 },
      style: { fontSize: 36, fontWeight: "bold", textAlign: "center" },
      zIndex: 10,
    },
  ],
  },
  {
    blocks: [
    {
      type: "h2",
      content: "3b &mdash; The Utopia Flip",
      position: { x: 5, y: 5, width: 90, height: 12 },
      style: { fontSize: 44, fontWeight: "bold", textAlign: "left" },
      zIndex: 10,
    },
    {
      type: "text",
      content: `<b>P1:</b> If no human labour is needed, the scarcity that money mediates vanishes.<br><br><b>P2:</b> If scarcity vanishes, money and power dynamics become unnecessary.`,
      position: { x: 5, y: 22, width: 88, height: 45 },
      style: { fontSize: 28, textAlign: "left" },
      zIndex: 10,
    },
    {
      type: "h3",
      content: "&there4; Full automation leads to post-scarcity &mdash; utopia, not dystopia.",
      position: { x: 5, y: 74, width: 90, height: 18 },
      style: { fontSize: 36, fontWeight: "bold", textAlign: "center" },
      zIndex: 10,
    },
  ],
  },
  {
    blocks: [
    {
      type: "h2",
      content: "3c &mdash; The Resource Constraint",
      position: { x: 5, y: 5, width: 90, height: 12 },
      style: { fontSize: 44, fontWeight: "bold", textAlign: "left" },
      zIndex: 10,
    },
    {
      type: "text",
      content: `<b>P1:</b> AI training and inference require enormous capital, energy, and hardware.<br><br><b>P2:</b> These resources are finite and expensive.`,
      position: { x: 5, y: 22, width: 88, height: 45 },
      style: { fontSize: 28, textAlign: "left" },
      zIndex: 10,
    },
    {
      type: "h3",
      content: "&there4; The speed of automation is bounded by physics and economics. The apocalypse has a budget.",
      position: { x: 5, y: 74, width: 90, height: 18 },
      style: { fontSize: 36, fontWeight: "bold", textAlign: "center" },
      zIndex: 10,
    },
  ],
  },
  {
    blocks: [
    {
      type: "h1",
      content: "The deeper truth.",
      position: { x: 10, y: 32, width: 80, height: 28 },
      style: { fontSize: 52, fontWeight: "bold", textAlign: "center" },
      zIndex: 10,
    },
  ],
  },
  {
    blocks: [
    {
      type: "h2",
      content: "The Pattern Illusion",
      position: { x: 5, y: 15, width: 90, height: 22 },
      style: { fontSize: 48, fontWeight: "bold", textAlign: "center" },
      zIndex: 10,
    },
    {
      type: "text",
      content: `LLMs assume:<br><br><b>The future looks like the past.</b>`,
      position: { x: 10, y: 45, width: 80, height: 42 },
      style: { fontSize: 30, textAlign: "center" },
      zIndex: 10,
    },
  ],
  },
  {
    blocks: [
    {
      type: "h2",
      content: "When Patterns Break",
      position: { x: 5, y: 5, width: 90, height: 12 },
      style: { fontSize: 44, fontWeight: "bold", textAlign: "left" },
      zIndex: 10,
    },
    {
      type: "text",
      content: `<ul><li>Novelty</li><li>Edge cases</li><li>Black swans</li><li>Context shifts</li></ul>`,
      position: { x: 5, y: 22, width: 88, height: 45 },
      style: { fontSize: 28, textAlign: "left" },
      zIndex: 10,
    },
    {
      type: "h3",
      content: "No pattern to match.",
      position: { x: 5, y: 74, width: 90, height: 18 },
      style: { fontSize: 36, fontWeight: "bold", textAlign: "center" },
      zIndex: 10,
    },
  ],
  },
  {
    blocks: [
    {
      type: "h2",
      content: "The Difference",
      position: { x: 5, y: 5, width: 90, height: 12 },
      style: { fontSize: 44, fontWeight: "bold", textAlign: "left" },
      zIndex: 10,
    },
    {
      type: "text",
      content: `LLMs can't say:<br><i>&ldquo;I've never seen this before.&rdquo;</i><br><br>Humans can.`,
      position: { x: 5, y: 22, width: 88, height: 45 },
      style: { fontSize: 28, textAlign: "left" },
      zIndex: 10,
    },
    {
      type: "h3",
      content: `That's when you earn your salary.`,
      position: { x: 5, y: 74, width: 90, height: 18 },
      style: { fontSize: 36, fontWeight: "bold", textAlign: "center" },
      zIndex: 10,
    },
  ],
  },
  {
    blocks: [
    {
      type: "h2",
      content: "Lossy Meta-Programming",
      position: { x: 5, y: 15, width: 90, height: 22 },
      style: { fontSize: 48, fontWeight: "bold", textAlign: "center" },
      zIndex: 10,
    },
    {
      type: "text",
      content: `AI is a <i>probabilistic compiler for intent</i>.<br><br>Prompt &rarr; code<br>(no guarantees)`,
      position: { x: 10, y: 45, width: 80, height: 42 },
      style: { fontSize: 30, textAlign: "center" },
      zIndex: 10,
    },
  ],
  },
  {
    blocks: [
    {
      type: "h2",
      content: "The Laziness Trap",
      position: { x: 5, y: 15, width: 90, height: 22 },
      style: { fontSize: 48, fontWeight: "bold", textAlign: "center" },
      zIndex: 10,
    },
    {
      type: "text",
      content: `Are you outsourcing <i>typing</i>? &rarr; Fine.<br><br>Are you outsourcing <i>thinking</i>? &rarr; Dangerous.`,
      position: { x: 10, y: 45, width: 80, height: 42 },
      style: { fontSize: 30, textAlign: "center" },
      zIndex: 10,
    },
  ],
  },
  {
    blocks: [
    {
      type: "h2",
      content: `The Creator's Ceiling`,
      position: { x: 5, y: 15, width: 90, height: 22 },
      style: { fontSize: 48, fontWeight: "bold", textAlign: "center" },
      zIndex: 10,
    },
    {
      type: "text",
      content: `Can a creation surpass its creator?<br><br>Yes &mdash; but only in <i>narrow dimensions</i>.`,
      position: { x: 10, y: 45, width: 80, height: 42 },
      style: { fontSize: 30, textAlign: "center" },
      zIndex: 10,
    },
  ],
  },
  {
    blocks: [
    {
      type: "h2",
      content: "The Line",
      position: { x: 5, y: 5, width: 90, height: 12 },
      style: { fontSize: 44, fontWeight: "bold", textAlign: "left" },
      zIndex: 10,
    },
    {
      type: "text",
      content: `A calculator is better at arithmetic.<br>It can't decide what's worth calculating.`,
      position: { x: 5, y: 22, width: 88, height: 45 },
      style: { fontSize: 28, textAlign: "left" },
      zIndex: 10,
    },
    {
      type: "h3",
      content: `AI can write code faster than you.<br>It can't decide if the code should exist.`,
      position: { x: 5, y: 74, width: 90, height: 18 },
      style: { fontSize: 36, fontWeight: "bold", textAlign: "center" },
      zIndex: 10,
    },
  ],
  },
  {
    blocks: [
    {
      type: "h2",
      content: "The Paradox of Code",
      position: { x: 5, y: 5, width: 90, height: 14 },
      style: { fontSize: 48, fontWeight: "bold", textAlign: "left" },
      zIndex: 10,
    },
    {
      type: "text",
      content: `AI makes code <b>abundant</b>.<br><br>But more code = more cost:<br><br><ul><li>Maintenance</li><li>Bugs</li><li>Complexity</li><li>Security surface</li><li>Coordination overhead</li></ul>`,
      position: { x: 5, y: 24, width: 88, height: 68 },
      style: { fontSize: 28, textAlign: "left" },
      zIndex: 10,
    },
  ],
  },
  {
    blocks: [
    {
      type: "h2",
      content: "The Mastery Flip",
      position: { x: 5, y: 5, width: 90, height: 14 },
      style: { fontSize: 48, fontWeight: "bold", textAlign: "left" },
      zIndex: 10,
    },
    {
      type: "text",
      content: `Mastery has always been about writing <b>less</b>.<br><br>The elegant solution.<br>The right abstraction.<br>Knowing when to say no.`,
      position: { x: 5, y: 24, width: 88, height: 68 },
      style: { fontSize: 28, textAlign: "left" },
      zIndex: 10,
    },
  ],
  },
  {
    blocks: [
    {
      type: "h1",
      content: `&ldquo;AI makes code free to write<br>and expensive to keep.&rdquo;`,
      position: { x: 5, y: 25, width: 90, height: 40 },
      style: { fontSize: 48, fontWeight: "bold", textAlign: "center" },
      zIndex: 10,
    },
  ],
  },
  {
    blocks: [
    {
      type: "h1",
      content: "What actually matters.",
      position: { x: 10, y: 32, width: 80, height: 28 },
      style: { fontSize: 52, fontWeight: "bold", textAlign: "center" },
      zIndex: 10,
    },
  ],
  },
  {
    blocks: [
    {
      type: "h2",
      content: "The Fundamentals",
      position: { x: 5, y: 5, width: 90, height: 12 },
      style: { fontSize: 44, fontWeight: "bold", textAlign: "left" },
      zIndex: 10,
    },
    {
      type: "text",
      content: `<ul><li>Systems thinking</li><li>Problem decomposition</li><li>Debugging</li><li>Simplification</li></ul>`,
      position: { x: 5, y: 22, width: 88, height: 45 },
      style: { fontSize: 28, textAlign: "left" },
      zIndex: 10,
    },
    {
      type: "h3",
      content: `These compound. Frameworks don't.`,
      position: { x: 5, y: 74, width: 90, height: 18 },
      style: { fontSize: 36, fontWeight: "bold", textAlign: "center" },
      zIndex: 10,
    },
  ],
  },
  {
    blocks: [
    {
      type: "h2",
      content: "The Human Skills",
      position: { x: 5, y: 5, width: 90, height: 12 },
      style: { fontSize: 44, fontWeight: "bold", textAlign: "left" },
      zIndex: 10,
    },
    {
      type: "text",
      content: `<ul><li>Judgment</li><li>Communication</li><li>Connection</li></ul>`,
      position: { x: 5, y: 22, width: 88, height: 45 },
      style: { fontSize: 28, textAlign: "left" },
      zIndex: 10,
    },
    {
      type: "h3",
      content: `AI can't attend your stakeholder meeting.`,
      position: { x: 5, y: 74, width: 90, height: 18 },
      style: { fontSize: 36, fontWeight: "bold", textAlign: "center" },
      zIndex: 10,
    },
  ],
  },
  {
    blocks: [
    {
      type: "h2",
      content: "The Strategy",
      position: { x: 5, y: 5, width: 90, height: 14 },
      style: { fontSize: 48, fontWeight: "bold", textAlign: "left" },
      zIndex: 10,
    },
    {
      type: "text",
      content: `<ol><li>Be the curator, not the generator</li><li>Stay close to the problem</li><li>Use AI aggressively</li><li>Know when to override</li></ol>`,
      position: { x: 5, y: 24, width: 88, height: 68 },
      style: { fontSize: 28, textAlign: "left" },
      zIndex: 10,
    },
  ],
  },
  {
    blocks: [
    {
      type: "h1",
      content: "The close.",
      position: { x: 10, y: 32, width: 80, height: 28 },
      style: { fontSize: 52, fontWeight: "bold", textAlign: "center" },
      zIndex: 10,
    },
  ],
  },
  {
    blocks: [
    {
      type: "h2",
      content: "The Meteorite",
      position: { x: 5, y: 15, width: 90, height: 22 },
      style: { fontSize: 48, fontWeight: "bold", textAlign: "center" },
      zIndex: 10,
    },
    {
      type: "text",
      content: `What if AI really does change everything?<br><br>What do you do?`,
      position: { x: 10, y: 45, width: 80, height: 42 },
      style: { fontSize: 30, textAlign: "center" },
      zIndex: 10,
    },
  ],
  },
  {
    blocks: [
    {
      type: "h2",
      content: `<i>&ldquo;Never let the future disturb you. You will meet it with the same weapons of reason which today arm you against the present.&rdquo;</i>`,
      position: { x: 8, y: 15, width: 84, height: 45 },
      style: { fontSize: 42, fontWeight: "medium", textAlign: "center" },
      zIndex: 10,
    },
    {
      type: "text",
      content: "&mdash; Marcus Aurelius",
      position: { x: 25, y: 68, width: 50, height: 10 },
      style: { fontSize: 24, textAlign: "center" },
      zIndex: 10,
    },
  ],
  },
  {
    blocks: [
    {
      type: "h2",
      content: `<i>&ldquo;Make the best use of what is in your power, and take the rest as it happens.&rdquo;</i>`,
      position: { x: 8, y: 15, width: 84, height: 45 },
      style: { fontSize: 42, fontWeight: "medium", textAlign: "center" },
      zIndex: 10,
    },
    {
      type: "text",
      content: "&mdash; Epictetus",
      position: { x: 25, y: 68, width: 50, height: 10 },
      style: { fontSize: 24, textAlign: "center" },
      zIndex: 10,
    },
  ],
  },
  {
    blocks: [
    {
      type: "h2",
      content: "Focus",
      position: { x: 5, y: 5, width: 90, height: 14 },
      style: { fontSize: 48, fontWeight: "bold", textAlign: "left" },
      zIndex: 10,
    },
    {
      type: "text",
      content: `You can't control AI progress.<br><br>You can control:<br><br><ul><li>Your skills</li><li>Your adaptability</li><li>Your fundamentals</li></ul>`,
      position: { x: 5, y: 24, width: 88, height: 68 },
      style: { fontSize: 28, textAlign: "left" },
      zIndex: 10,
    },
  ],
  },
  {
    blocks: [
    {
      type: "h2",
      content: "The Job",
      position: { x: 5, y: 5, width: 90, height: 12 },
      style: { fontSize: 44, fontWeight: "bold", textAlign: "left" },
      zIndex: 10,
    },
    {
      type: "text",
      content: `You can't control whether AI changes everything.<br><br>You <i>can</i> control whether you're the kind of person who adapts.`,
      position: { x: 5, y: 22, width: 88, height: 45 },
      style: { fontSize: 28, textAlign: "left" },
      zIndex: 10,
    },
    {
      type: "h3",
      content: `That's always been the job. It still is.`,
      position: { x: 5, y: 74, width: 90, height: 18 },
      style: { fontSize: 36, fontWeight: "bold", textAlign: "center" },
      zIndex: 10,
    },
  ],
  },
  {
    blocks: [
    {
      type: "h2",
      content: `<i>&ldquo;We suffer more often in imagination than in reality.&rdquo;</i>`,
      position: { x: 8, y: 15, width: 84, height: 45 },
      style: { fontSize: 42, fontWeight: "medium", textAlign: "center" },
      zIndex: 10,
    },
    {
      type: "text",
      content: "&mdash; Seneca",
      position: { x: 25, y: 68, width: 50, height: 10 },
      style: { fontSize: 24, textAlign: "center" },
      zIndex: 10,
    },
  ],
  },
  {
    blocks: [
    {
      type: "h1",
      content: "Everything will be alright.",
      position: { x: 5, y: 25, width: 90, height: 40 },
      style: { fontSize: 60, fontWeight: "bold", textAlign: "center" },
      zIndex: 10,
    },
  ],
  },
  {
    blocks: [
    {
      type: "h1",
      content: "Thank You",
      position: { x: 5, y: 20, width: 90, height: 25 },
      style: { fontSize: 64, fontWeight: "bold", textAlign: "center" },
      zIndex: 10,
    },
    {
      type: "h3",
      content: "Questions?",
      position: { x: 10, y: 50, width: 80, height: 12 },
      style: { fontSize: 36, fontWeight: "semibold", textAlign: "center" },
      zIndex: 10,
    },
  ],
  },

];

// ─── Convert kite definitions to Kite objects ───────────────────────────────

export function buildKites(kiteDefs: KiteDef[] = TALK_KITES) {
  const now = new Date().toISOString();

  return kiteDefs.map((def) => ({
    id: crypto.randomUUID(),
    contentBlocks: def.blocks.map((block) => ({
      id: crypto.randomUUID(),
      type: block.type,
      position: block.position,
      content: block.content,
      style: block.style ?? {},
      zIndex: block.zIndex ?? 10,
    })),
    speakerNotes: def.speakerNotes,
    createdAt: now,
    updatedAt: now,
  }));
}
