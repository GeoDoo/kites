/**
 * Seed Talk Data & Helpers
 * Pure data module — no React, no "use client".
 * Exported so both the page component and tests can use the real code.
 */

// ─── Types ───────────────────────────────────────────────────────────────────

export interface BlockDef {
  type: "h1" | "h2" | "h3" | "h4" | "text";
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

export interface SlideDef {
  blocks: BlockDef[];
  speakerNotes?: string;
}

// ─── Layout helpers ──────────────────────────────────────────────────────────

export function titleSlide(title: string, subtitle: string, footer: string): SlideDef {
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

export function quoteSlide(quote: string, attribution: string): SlideDef {
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

export function bigStatement(text: string, fontSize: number = 56): SlideDef {
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

export function sectionBreak(text: string): SlideDef {
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

export function contentSlide(heading: string, body: string): SlideDef {
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

export function statementSub(statement: string, sub: string, statementSize: number = 48): SlideDef {
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

export function scenarioTitle(label: string, description: string): SlideDef {
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

export function contentWithPunchline(heading: string, body: string, punchline: string): SlideDef {
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

// ─── All 48 slides ───────────────────────────────────────────────────────────

export const TALK_SLIDES: SlideDef[] = [
  titleSlide("Imagination vs. Reality", "A Survivor's Guide to AI Hype", "JSMonthly | 2026"),
  contentSlide("&ldquo;Will AI take my job?&rdquo;", `Possible scenarios${br2}Every possible angle${br2}One hopeful answer`),
  contentWithPunchline(
    "My Credentials (for Surviving Hype)",
    ["jQuery 1.4 (2010)", "Angular &rarr; React &rarr; Vue", "SPAs &rarr; SSR &rarr; Server Components", "Monoliths &rarr; Microservices &rarr; Monoliths", "2008 crash. Pandemic. Crypto. Now AI."].join(br2),
    "Still here."
  ),
  contentSlide("The Hype Cycles", ul(
    `${b("2010")} &mdash; jQuery &mdash; ${i("&ldquo;Learn this or die&rdquo;")}`,
    `${b("2012")} &mdash; Angular &mdash; ${i("&ldquo;MVC in the browser!&rdquo;")}`,
    `${b("2015")} &mdash; React &mdash; ${i("&ldquo;Everything is components&rdquo;")}`,
    `${b("2017")} &mdash; Microservices &mdash; ${i("&ldquo;Monoliths are dead&rdquo;")}`,
    `${b("2019")} &mdash; Serverless &mdash; ${i("&ldquo;Servers are dead&rdquo;")}`,
    `${b("2022")} &mdash; Web3 &mdash; ${i("&ldquo;Learn Solidity or be left behind&rdquo;")}`,
    `${b("2024")} &mdash; AI &mdash; ${i("&ldquo;Engineers are dead&rdquo;")}`
  )),
  contentSlide("The World Events", ul(
    `${b("2008")} &mdash; Financial crisis &mdash; ${i("&ldquo;Is tech safe?&rdquo;")}`,
    `${b("2020")} &mdash; Pandemic &mdash; ${i("&ldquo;Is remote forever?&rdquo;")}`,
    `${b("2022")} &mdash; Crypto crash &mdash; ${i("&ldquo;Web3 was the future&rdquo;")}`,
    `${b("2024")} &mdash; AI hype &mdash; ${i("Sound familiar?")}`
  )),
  statementSub(`Four existential threats.${br}15 years.`, `${b("I'm still here. So are you.")}`, 44),
  contentSlide("What Actually Stayed Constant", ul("Server &harr; Client", "Request &rarr; Response", "State &rarr; UI", "A human decides what to build")),
  sectionBreak("Let's explore the scenarios."),

  // ── Scenario 1 ──────────────────────────────────────────────────────────────
  scenarioTitle("Scenario 1", "&ldquo;Everyone becomes an engineer&rdquo;"),
  contentWithPunchline(
    "1a &mdash; The Desire Argument",
    `${b("P1:")} Every profession requires a specific disposition${br}(laziness, impatience, hubris &mdash; Larry Wall).${br2}${b("P2:")} AI lowers the ${i("barrier to entry")} but does not alter human disposition.`,
    "&there4; AI does not meaningfully increase the number of people who want to be engineers."
  ),
  contentWithPunchline(
    "1b &mdash; The Economics Argument",
    `${b("P1:")} If supply of engineers increases, wages fall.${br2}${b("P2:")} If wages fall, the incentive to enter the profession disappears.`,
    "&there4; An oversupply of engineers is self-correcting."
  ),
  contentWithPunchline(
    "1c &mdash; The Counter: Induced Demand",
    `${b("P1:")} If the cost of engineering labour falls, more projects become viable.${br2}${b("P2:")} More viable projects create more demand for engineers.`,
    "&there4; Cheaper engineering can increase, not decrease, total employment."
  ),

  // ── Scenario 2 ──────────────────────────────────────────────────────────────
  scenarioTitle("Scenario 2", "&ldquo;AI replaces engineers directly&rdquo;"),
  contentWithPunchline(
    "2a &mdash; The Statistical Ceiling",
    `${b("P1:")} AI is a statistical model; it generalises from observed patterns.${br2}${b("P2:")} Novel problems, edge cases, and black swans have no prior pattern to match.`,
    "&there4; AI cannot reliably solve problems it has never seen &mdash; which is when engineers are most needed."
  ),
  contentWithPunchline(
    "2b &mdash; The Judgment Argument",
    `${b("P1:")} Software that matters requires judgment about ${i("what to build")} and ${i("whether it should exist")}.${br2}${b("P2:")} Judgment requires context, values, and accountability &mdash; none of which a statistical model possesses.`,
    "&there4; AI can generate code but cannot replace the decision-maker."
  ),
  contentWithPunchline(
    "2c &mdash; The Connection Argument",
    `${b("P1:")} Software exists to serve and connect people.${br2}${b("P2:")} People prefer to collaborate with other people (trust, empathy, shared stakes).`,
    "&there4; Fully replacing engineers with machines undermines the purpose of building software."
  ),

  // ── Scenario 3 ──────────────────────────────────────────────────────────────
  scenarioTitle("Scenario 3", "&ldquo;Full automation&rdquo;"),
  contentWithPunchline(
    "3a &mdash; The Doom Path",
    `${b("P1:")} If AI automates all productive labour, mass unemployment follows.${br2}${b("P2:")} Mass unemployment causes economic collapse (no wages &rarr; no consumption &rarr; no economy).`,
    "&there4; Full automation within the current system is self-destructive &mdash; and thus self-limiting."
  ),
  contentWithPunchline(
    "3b &mdash; The Utopia Flip",
    `${b("P1:")} If no human labour is needed, the scarcity that money mediates vanishes.${br2}${b("P2:")} If scarcity vanishes, money and power dynamics become unnecessary.`,
    "&there4; Full automation leads to post-scarcity &mdash; utopia, not dystopia."
  ),
  contentWithPunchline(
    "3c &mdash; The Resource Constraint",
    `${b("P1:")} AI training and inference require enormous capital, energy, and hardware.${br2}${b("P2:")} These resources are finite and expensive.`,
    "&there4; The speed of automation is bounded by physics and economics. The apocalypse has a budget."
  ),
  sectionBreak("The deeper truth."),
  statementSub("The Pattern Illusion", `LLMs assume:${br2}${b("The future looks like the past.")}`),
  contentWithPunchline("When Patterns Break", ul("Novelty", "Edge cases", "Black swans", "Context shifts"), "No pattern to match."),
  contentWithPunchline("The Difference", `LLMs can't say:${br}${i("&ldquo;I've never seen this before.&rdquo;")}${br2}Humans can.`, "That's when you earn your salary."),
  statementSub("Lossy Meta-Programming", `AI is a ${i("probabilistic compiler for intent")}.${br2}Prompt &rarr; code${br}(no guarantees)`),
  statementSub("The Laziness Trap", `Are you outsourcing ${i("typing")}? &rarr; Fine.${br2}Are you outsourcing ${i("thinking")}? &rarr; Dangerous.`),
  statementSub("The Creator's Ceiling", `Can a creation surpass its creator?${br2}Yes &mdash; but only in ${i("narrow dimensions")}.`),
  contentWithPunchline("The Line", `A calculator is better at arithmetic.${br}It can't decide what's worth calculating.`, `AI can write code faster than you.${br}It can't decide if the code should exist.`),
  contentSlide("The Paradox of Code", `AI makes code ${b("abundant")}.${br2}But more code = more cost:${br2}${ul("Maintenance", "Bugs", "Complexity", "Security surface", "Coordination overhead")}`),
  contentSlide("The Mastery Flip", `Mastery has always been about writing ${b("less")}.${br2}The elegant solution.${br}The right abstraction.${br}Knowing when to say no.`),
  bigStatement(`&ldquo;AI makes code free to write${br}and expensive to keep.&rdquo;`, 48),
  sectionBreak("What actually matters."),
  contentWithPunchline("The Fundamentals", ul("Systems thinking", "Problem decomposition", "Debugging", "Simplification"), "These compound. Frameworks don't."),
  contentWithPunchline("The Human Skills", ul("Judgment", "Communication", "Connection"), "AI can't attend your stakeholder meeting."),
  contentSlide("The Strategy", ol("Be the curator, not the generator", "Stay close to the problem", "Use AI aggressively", "Know when to override")),
  sectionBreak("The close."),
  statementSub("The Meteorite", `What if AI really does change everything?${br2}What do you do?`),
  quoteSlide("Never let the future disturb you. You will meet it with the same weapons of reason which today arm you against the present.", "Marcus Aurelius"),
  quoteSlide("Make the best use of what is in your power, and take the rest as it happens.", "Epictetus"),
  contentSlide("Focus", `You can't control AI progress.${br2}You can control:${br2}${ul("Your skills", "Your adaptability", "Your fundamentals")}`),
  contentWithPunchline("The Job", `You can't control whether AI changes everything.${br2}You ${i("can")} control whether you're the kind of person who adapts.`, "That's always been the job. It still is."),
  quoteSlide("We suffer more often in imagination than in reality.", "Seneca"),
  bigStatement("Everything will be alright.", 60),
  titleSlide("Thank You", "Questions?", ""),
];

// ─── Convert slide definitions to Kite objects ───────────────────────────────

export function buildKites(slides: SlideDef[] = TALK_SLIDES) {
  const now = new Date().toISOString();

  return slides.map((slide) => ({
    id: crypto.randomUUID(),
    contentBlocks: slide.blocks.map((block) => ({
      id: crypto.randomUUID(),
      type: block.type,
      position: block.position,
      content: block.content,
      style: block.style ?? {},
      zIndex: block.zIndex ?? 10,
    })),
    speakerNotes: slide.speakerNotes,
    createdAt: now,
    updatedAt: now,
  }));
}
