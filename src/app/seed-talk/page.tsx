"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// ─── Types ───────────────────────────────────────────────────────────────────

interface BlockDef {
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

interface SlideDef {
  blocks: BlockDef[];
  speakerNotes?: string;
}

// ─── Layout helpers ──────────────────────────────────────────────────────────
// All positions are percentages (0-100) of the kite canvas.
// Designed for 16:9 presentation ratio.

/** Title slide: big h1, subtitle h3, small footer text */
function titleSlide(
  title: string,
  subtitle: string,
  footer: string
): SlideDef {
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

/** Quote slide: large centered quote + attribution */
function quoteSlide(quote: string, attribution: string): SlideDef {
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

/** Big statement: single centered h1 */
function bigStatement(text: string, fontSize: number = 56): SlideDef {
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

/** Section break: centered heading with subtle presence */
function sectionBreak(text: string): SlideDef {
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

/** Content slide: heading at top + body text below */
function contentSlide(heading: string, body: string): SlideDef {
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

/** Statement + supporting text below */
function statementSub(
  statement: string,
  sub: string,
  statementSize: number = 48
): SlideDef {
  return {
    blocks: [
      {
        type: "h2",
        content: statement,
        position: { x: 5, y: 15, width: 90, height: 22 },
        style: {
          fontSize: statementSize,
          fontWeight: "bold",
          textAlign: "center",
        },
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

/** Scenario title: big number/label + subtitle description */
function scenarioTitle(label: string, description: string): SlideDef {
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

/** Content with a punchline: heading, body, and emphasized closer */
function contentWithPunchline(
  heading: string,
  body: string,
  punchline: string
): SlideDef {
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

/** Unordered bullet list */
function ul(...items: string[]): string {
  return `<ul>${items.map((i) => `<li>${i}</li>`).join("")}</ul>`;
}

/** Ordered numbered list */
function ol(...items: string[]): string {
  return `<ol>${items.map((i) => `<li>${i}</li>`).join("")}</ol>`;
}

/** Line break shorthand */
const br = "<br>";

/** Double line break for spacing */
const br2 = "<br><br>";

/** Bold shorthand */
function b(text: string): string {
  return `<b>${text}</b>`;
}

/** Italic shorthand */
function i(text: string): string {
  return `<i>${text}</i>`;
}

// ─── All 48 slides ───────────────────────────────────────────────────────────

const TALK_SLIDES: SlideDef[] = [
  // ── 1. Title ──────────────────────────────────────────────────────────────
  titleSlide(
    "Imagination vs. Reality",
    "A Survivor's Guide to AI Hype",
    "JSMonthly | 2026"
  ),

  // ── 2. Seneca Hook ────────────────────────────────────────────────────────
  quoteSlide(
    "We suffer more often in imagination than in reality.",
    "Seneca, 2,000 years ago"
  ),

  // ── 3. The Question ───────────────────────────────────────────────────────
  bigStatement("&ldquo;Will AI take my job?&rdquo;", 60),

  // ── 4. The Promise ────────────────────────────────────────────────────────
  contentSlide(
    "Tonight",
    `Every scenario${br2}Every angle${br2}One honest answer`
  ),

  // ── 5. My Credentials ─────────────────────────────────────────────────────
  contentWithPunchline(
    "My Credentials (for Surviving Hype)",
    [
      "jQuery 1.4 (2010)",
      "Angular &rarr; React &rarr; Vue",
      "SPAs &rarr; SSR &rarr; Server Components",
      "Monoliths &rarr; Microservices &rarr; Monoliths",
      "2008 crash. Pandemic. Crypto. Now AI.",
    ].join(br2),
    "Still here."
  ),

  // ── 6. The Hype Cycles ────────────────────────────────────────────────────
  contentSlide(
    "The Hype Cycles",
    ul(
      `${b("2010")} &mdash; jQuery &mdash; ${i("&ldquo;Learn this or die&rdquo;")}`,
      `${b("2012")} &mdash; Angular &mdash; ${i("&ldquo;MVC in the browser!&rdquo;")}`,
      `${b("2015")} &mdash; React &mdash; ${i("&ldquo;Everything is components&rdquo;")}`,
      `${b("2017")} &mdash; Microservices &mdash; ${i("&ldquo;Monoliths are dead&rdquo;")}`,
      `${b("2019")} &mdash; Serverless &mdash; ${i("&ldquo;Servers are dead&rdquo;")}`,
      `${b("2022")} &mdash; Web3 &mdash; ${i("&ldquo;Learn Solidity or be left behind&rdquo;")}`,
      `${b("2024")} &mdash; AI &mdash; ${i("&ldquo;Engineers are dead&rdquo;")}`
    )
  ),

  // ── 7. The World Events ───────────────────────────────────────────────────
  contentSlide(
    "The World Events",
    ul(
      `${b("2008")} &mdash; Financial crisis &mdash; ${i("&ldquo;Is tech safe?&rdquo;")}`,
      `${b("2020")} &mdash; Pandemic &mdash; ${i("&ldquo;Is remote forever?&rdquo;")}`,
      `${b("2022")} &mdash; Crypto crash &mdash; ${i("&ldquo;Web3 was the future&rdquo;")}`,
      `${b("2024")} &mdash; AI hype &mdash; ${i("Sound familiar?")}`
    )
  ),

  // ── 8. The Punchline ──────────────────────────────────────────────────────
  statementSub(
    `Four existential threats.${br}15 years.`,
    `${b("I'm still here. So are you.")}`,
    44
  ),

  // ── 9. What Stayed Constant ───────────────────────────────────────────────
  contentSlide(
    "What Actually Stayed Constant",
    ul(
      "Server &harr; Client",
      "Request &rarr; Response",
      "State &rarr; UI",
      "A human decides what to build"
    )
  ),

  // ── 10. Section Break: Scenarios ──────────────────────────────────────────
  sectionBreak("Let's explore the scenarios."),

  // ── 11. Scenario 1 ────────────────────────────────────────────────────────
  scenarioTitle("Scenario 1", "&ldquo;Everyone becomes an engineer&rdquo;"),

  // ── 12. Dentist Analogy ───────────────────────────────────────────────────
  statementSub(
    "The Dentist Analogy",
    `If AI made dentistry available to everyone&hellip;${br2}Would ${i("you")} want to become a dentist?`
  ),

  // ── 13. Capability ≠ Desire ───────────────────────────────────────────────
  statementSub(
    "Capability &ne; Desire",
    `Just because you ${i("can")}${br}doesn't mean you ${i("want to")}.`
  ),

  // ── 14. Engineering Self-Selects ──────────────────────────────────────────
  contentWithPunchline(
    "Engineering Self-Selects",
    `The three virtues of a programmer:${br2}${ul("Laziness", "Impatience", "Hubris")}${br}&mdash; Larry Wall${br2}Plus: curiosity, problem-solving, imagination.`,
    "AI doesn't change who's drawn to this."
  ),

  // ── 15. The Economics ─────────────────────────────────────────────────────
  contentWithPunchline(
    "The Economics",
    `More engineers${br}&rarr; salaries drop${br}&rarr; incentive disappears${br}&rarr; supply stabilizes`,
    "Self-correcting."
  ),

  // ── 16. Counter-Argument ──────────────────────────────────────────────────
  contentWithPunchline(
    "The Counter-Argument",
    `Cheaper engineering${br}&rarr; more projects get funded${br}&rarr; more demand for engineers`,
    "Induced demand."
  ),

  // ── 17. Scenario 2 ────────────────────────────────────────────────────────
  scenarioTitle("Scenario 2", "&ldquo;AI replaces engineers directly&rdquo;"),

  // ── 18. Limits of Statistics ──────────────────────────────────────────────
  statementSub(
    "The Limits of Statistics",
    `AI can be right ${i("often")}.${br2}AI can never be right ${i("always")}.`
  ),

  // ── 19. The Human Edge ────────────────────────────────────────────────────
  contentSlide(
    "The Human Edge",
    `When AI gets it wrong, you need:${br2}${ul(
      "Judgment",
      "Creativity",
      "The ability to reframe the problem entirely"
    )}`
  ),

  // ── 20. Connection ────────────────────────────────────────────────────────
  statementSub(
    "Connection",
    `We build software ${b("to connect")}.${br2}Would you want to work with machines only?`
  ),

  // ── 21. Scenario 3 ────────────────────────────────────────────────────────
  scenarioTitle("Scenario 3", "&ldquo;Full automation&rdquo;"),

  // ── 22. The Doom Version ──────────────────────────────────────────────────
  statementSub(
    "The Doom Version",
    `AI automates everything${br}&rarr; mass unemployment${br}&rarr; economic collapse`
  ),

  // ── 23. The Flip ──────────────────────────────────────────────────────────
  statementSub(
    "The Flip",
    `If ${i("everyone")} is replaced&hellip;${br}do we even need money?${br2}That's not dystopia.${br}That's ${b("utopia")}.`
  ),

  // ── 24. The Real Constraint ───────────────────────────────────────────────
  contentWithPunchline(
    "The Real Constraint",
    `AI is expensive:${br2}${ul(
      "Training costs billions",
      "Inference eats GPUs",
      "Energy bills are real"
    )}`,
    "Economics limits the apocalypse."
  ),

  // ── 25. Section Break: Deeper Truth ───────────────────────────────────────
  sectionBreak("The deeper truth."),

  // ── 26. Pattern Illusion ──────────────────────────────────────────────────
  statementSub(
    "The Pattern Illusion",
    `LLMs assume:${br2}${b("The future looks like the past.")}`
  ),

  // ── 27. When Patterns Break ───────────────────────────────────────────────
  contentWithPunchline(
    "When Patterns Break",
    ul(
      "Novelty",
      "Edge cases",
      "Black swans",
      "Context shifts"
    ),
    "No pattern to match."
  ),

  // ── 28. The Difference ────────────────────────────────────────────────────
  contentWithPunchline(
    "The Difference",
    `LLMs can't say:${br}${i("&ldquo;I've never seen this before.&rdquo;")}${br2}Humans can.`,
    "That's when you earn your salary."
  ),

  // ── 29. Lossy Meta-Programming ────────────────────────────────────────────
  statementSub(
    "Lossy Meta-Programming",
    `AI is a ${i("probabilistic compiler for intent")}.${br2}Prompt &rarr; code${br}(no guarantees)`
  ),

  // ── 30. The Laziness Trap ─────────────────────────────────────────────────
  statementSub(
    "The Laziness Trap",
    `Are you outsourcing ${i("typing")}? &rarr; Fine.${br2}Are you outsourcing ${i("thinking")}? &rarr; Dangerous.`
  ),

  // ── 31. The Creator's Ceiling ─────────────────────────────────────────────
  statementSub(
    "The Creator's Ceiling",
    `Can a creation surpass its creator?${br2}Yes &mdash; but only in ${i("narrow dimensions")}.`
  ),

  // ── 32. The Line ──────────────────────────────────────────────────────────
  contentWithPunchline(
    "The Line",
    `A calculator is better at arithmetic.${br}It can't decide what's worth calculating.`,
    `AI can write code faster than you.${br}It can't decide if the code should exist.`
  ),

  // ── 33. Paradox of Code ───────────────────────────────────────────────────
  contentSlide(
    "The Paradox of Code",
    `AI makes code ${b("abundant")}.${br2}But more code = more cost:${br2}${ul(
      "Maintenance",
      "Bugs",
      "Complexity",
      "Security surface",
      "Coordination overhead"
    )}`
  ),

  // ── 34. The Mastery Flip ──────────────────────────────────────────────────
  contentSlide(
    "The Mastery Flip",
    `Mastery has always been about writing ${b("less")}.${br2}The elegant solution.${br}The right abstraction.${br}Knowing when to say no.`
  ),

  // ── 35. Code is expensive ─────────────────────────────────────────────────
  bigStatement(
    `&ldquo;AI makes code free to write${br}and expensive to keep.&rdquo;`,
    48
  ),

  // ── 36. Section Break: What Matters ───────────────────────────────────────
  sectionBreak("What actually matters."),

  // ── 37. The Fundamentals ──────────────────────────────────────────────────
  contentWithPunchline(
    "The Fundamentals",
    ul(
      "Systems thinking",
      "Problem decomposition",
      "Debugging",
      "Simplification"
    ),
    "These compound. Frameworks don't."
  ),

  // ── 38. The Human Skills ──────────────────────────────────────────────────
  contentWithPunchline(
    "The Human Skills",
    ul("Judgment", "Communication", "Connection"),
    "AI can't attend your stakeholder meeting."
  ),

  // ── 39. The Strategy ──────────────────────────────────────────────────────
  contentSlide(
    "The Strategy",
    ol(
      "Be the curator, not the generator",
      "Stay close to the problem",
      "Use AI aggressively",
      "Know when to override"
    )
  ),

  // ── 40. Section Break: Close ──────────────────────────────────────────────
  sectionBreak("The close."),

  // ── 41. The Meteorite ─────────────────────────────────────────────────────
  statementSub(
    "The Meteorite",
    `What if AI really does change everything?${br2}What do you do?`
  ),

  // ── 42. Marcus Aurelius ───────────────────────────────────────────────────
  quoteSlide(
    "Never let the future disturb you. You will meet it with the same weapons of reason which today arm you against the present.",
    "Marcus Aurelius"
  ),

  // ── 43. Epictetus ─────────────────────────────────────────────────────────
  quoteSlide(
    "Make the best use of what is in your power, and take the rest as it happens.",
    "Epictetus"
  ),

  // ── 44. Focus ─────────────────────────────────────────────────────────────
  contentSlide(
    "Focus",
    `You can't control AI progress.${br2}You can control:${br2}${ul(
      "Your skills",
      "Your adaptability",
      "Your fundamentals"
    )}`
  ),

  // ── 45. The Job ───────────────────────────────────────────────────────────
  contentWithPunchline(
    "The Job",
    `You can't control whether AI changes everything.${br2}You ${i("can")} control whether you're the kind of person who adapts.`,
    "That's always been the job. It still is."
  ),

  // ── 46. Remember ──────────────────────────────────────────────────────────
  quoteSlide(
    "We suffer more often in imagination than in reality.",
    "Seneca"
  ),

  // ── 47. Everything Will Be Alright ────────────────────────────────────────
  bigStatement("Everything will be alright.", 60),

  // ── 48. Thank You ─────────────────────────────────────────────────────────
  titleSlide("Thank You", "Questions?", ""),
];

// ─── Convert slide definitions to Kite objects ───────────────────────────────

function buildKites() {
  const now = new Date().toISOString();

  return TALK_SLIDES.map((slide) => ({
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

// ─── Page Component ──────────────────────────────────────────────────────────

export default function SeedTalkPage() {
  const router = useRouter();
  const [status, setStatus] = useState<string>("");
  const [generating, setGenerating] = useState(false);

  const seedDeck = async () => {
    setGenerating(true);
    setStatus("Building 48 slides...");

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
        setStatus(`Done! ${kites.length} slides created. Redirecting...`);
        setTimeout(() => router.push("/"), 1000);
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
          <p className="text-gray-500 text-sm mt-1">48 slides, ready to present</p>
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
