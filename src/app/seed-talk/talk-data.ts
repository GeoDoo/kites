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
      position: { x: 67.36951185158357, y: 14.267399267399268, width: 22.666666666666668, height: 40.476190476190474 },
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
      style: { fontSize: 44, textAlign: "left" },
      zIndex: 10,
    },
  ],
  },
  {
    blocks: [
    {
      type: "h2",
      content: "War stories",
      position: { x: 5.5151112720833835, y: 5, width: 90, height: 10 },
      style: { fontSize: 48, fontWeight: "bold", textAlign: "left" },
      zIndex: 10,
    },
    {
      type: "text",
      content: `<table> <tbody><tr><td><b>Year</b></td><td><b>Tech Hype</b></td><td><b>World</b></td><td><b>Me</b></td></tr> <tr><td><b>2010</b></td><td>jQuery dominance</td><td>Post-crisis recovery</td><td>Paying off family debt. No phone. Started learning to code</td></tr> <tr><td><b>2011</b></td><td>Node.js gains traction</td><td>—</td><td>Motorcycle crash — nearly died. First €30 from coding</td></tr> <tr><td><b>2012</b></td><td>AngularJS — <i>"MVC in the browser"</i></td><td>Facebook IPO flops</td><td>Finished BA (started 1998!)</td></tr> <tr><td><b>2013</b></td><td>React released. NoSQL peak</td><td>Snowden. EU debt crisis, GrEXit</td><td>Made redundant. Co-founded Fort Security. New job</td></tr> <tr><td><b>2015</b></td><td>React mainstream. GraphQL</td><td>—</td><td>Working toward Senior FE. Met love of my life</td></tr> <tr><td><b>2017</b></td><td>Microservices peak</td><td>Bitcoin $20K</td><td>Engaged! Moved to Treviso, Italy</td></tr> <tr><td><b>2018</b></td><td>Serverless peak. GraphQL peak</td><td>Crypto crash. GDPR</td><td>Remote job. Crypto wallet project. Senior FE</td></tr> <tr><td><b>2019</b></td><td>JAMstack hype</td><td>—</td><td>London! VIOOH. Got married!</td></tr> <tr><td><b>2020</b></td><td>SSR returns (Next.js)</td><td>COVID-19. Brexit</td><td>Pandemic + Brexit at the same time</td></tr> <tr><td><b>2021</b></td><td>Web3/NFT peak ($17B)</td><td>Great Resignation</td><td>Left → Tech Lead → back to VIOOH as Tech Lead</td></tr> <tr><td><b>2022</b></td><td>Web3 crash. ChatGPT (Nov)</td><td>War. Inflation. FTX. Layoffs</td><td>—</td></tr> <tr><td><b>2023</b></td><td>AI explosion — GPT-4, Claude</td><td>167K layoffs. SVB</td><td>Engineering Manager</td></tr> <tr><td><b>2024</b></td><td>AI agents — <i>"Engineers are dead"</i></td><td>Continued layoffs</td><td>—</td></tr> <tr><td><b>2025</b></td><td>42% return to monoliths</td><td>127K+ tech layoffs</td><td>Working towards HoE</td></tr> <tr><td><b>2026</b></td><td>AI everywhere — <i>"Now what?"</i></td><td>Epstein files!!</td><td><b>This talk</b></td></tr></tbody></table>`,
      position: { x: 5.35715722966719, y: 15.84249084249084, width: 90, height: 75 },
      style: { fontSize: 20, textAlign: "left", color: "#ffffff" },
      zIndex: 11,
    },
    {
      type: "text",
      content: `<br>`,
      position: { x: 10, y: 50, width: 80, height: 15 },
      style: { fontSize: 24, textAlign: "left" },
      zIndex: 10,
    },
  ],
  },
  {
    blocks: [
    {
      type: "h2",
      content: "Observe any patterns below?",
      position: { x: 5, y: 4, width: 90, height: 12 },
      style: { fontSize: 44, fontWeight: "bold", textAlign: "left" },
      zIndex: 10,
    },
    {
      type: "text",
      content: `<span>1. <b>Server → Client → Server (rendering)</b> We spent a decade moving rendering from PHP/Rails to the browser with SPAs, then spent the next decade moving it back with SSR and React Server Components. </span><div><span>2. <b>Monoliths → Microservices → Monoliths (architecture)</b> Netflix proved microservices work at scale; the rest of us proved they don't work at ours — and "modular monolith" became the new best practice. </span></div><div><span>3. <b>SQL → NoSQL → SQL (data)</b> We abandoned relational databases for MongoDB because "web scale," then spent years reimplementing joins in application code before crawling back to Postgres. </span></div><div><span>4. <b>REST → GraphQL → REST (APIs)</b> GraphQL was supposed to solve over-fetching forever; most teams ended up with a complexity explosion and quietly went back to simple REST (or tRPC). </span></div><div><span>5. <b>Native → Web → Native-ish (mobile) </b>We built native iOS/Android apps (2010), then bet on "the mobile web is the future" and PWAs (2015), then came crawling back to React Native and Flutter because the web couldn't match native UX.</span></div><div><span>6. <b>CSS → CSS-in-JS → CSS (styling) </b>We wrote CSS files (2010), then decided CSS was broken and put styles in JavaScript with styled-components (2016), then realised CSS itself got good (container queries, nesting, :has) and Tailwind won.</span></div>`,
      position: { x: 5, y: 21.08974358974359, width: 90, height: 75 },
      style: { fontSize: 36, textAlign: "left" },
      zIndex: 10,
    },
  ],
  },
  {
    blocks: [
    {
      type: "h2",
      content: `4 existential threats...<div>20 disasters...<br>15+ years of egineering experience, and...<div>1002 failed applications later...</div></div>`,
      position: { x: 5, y: 14, width: 90, height: 28.95970695970696 },
      style: { fontSize: 44, fontWeight: "bold", textAlign: "center" },
      zIndex: 13,
    },
    {
      type: "text",
      content: `<b>I'm still here. So are you.</b>`,
      position: { x: 10, y: 85, width: 80, height: 10 },
      style: { fontSize: 30, textAlign: "center" },
      zIndex: 2,
    },
    {
      type: "image",
      content: "data:image/png;base64,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/C3Cq3zBbislT/cViqved51XeQqQAAlEL4ErV67I5cuX5erVq0nq5NGjR+WXX36Rzz//XCZPniwrVqyQa9eu+VXmzZs3Zc2aNfLdd9/JmDFjZP78+bJ//36/yoDwrVu3ZNeuXfLTTz/JunXrlP4hni5yCXz318LIbbyFW35f5hyidcamtihZXna/MUauD5opq18ZKJWy5zGKJEu4dMasunZniI8PWTt477miTXZF/+mPN0uurssd7q43/pLb9pVy16aaxzzw9hpHXpRTu/8Gc8EQxP6+/ayu1GXb9GFdYoCBq36wCLAKZiOB0BJg6UkmAMX+nXfekeLFi0uJEiWkRo0aAZV58eJF6devn1SsWFHatm0r/fv3l169eknTpk2levXqirLuS8HLly+XRx55RBo1aiTdu3eXAQMGSPv27ZUyunXrJidPnvRazJ49e6RFixZSsGBBqV27trz00kvSsGFDpX916tSRWbNmeS2DAtYkMGndYms2LIJb1bREWVnX50uda1S0jK5Hnz3XS4rmzCfxcfFSsXBpGdW8iy49uQKb3/la1+6PGrQOWVN477mijXONSt6Y/67dkl83nvapEWv3nJdd567rZG+FUTFuVTO3ru6WhrAukQESIAESCIDAjh07pEGDBjJ+/HhH7hs3bjj8vnqQp0OHDjJ27FjTLFjlh7I+Y8YM03Q18o8//pBmzZrJzp071Sjdddq0adK8eXM5f/68Ll4bWLZsmTz22GPy+++/a6MdfpT96quvygcffCBY8Xck0GN5Aou3r5Ut5055bWcoBF6vWFtuDv5BcbeGzBY4hCtn0z+rQ1F3qMtMYXNV11LEOeNq5CogmdKm1zWjQsFSunByBWyGio1OvLesAAAQAElEQVRhQ3KSgrj3cA8mqZAoy+y8SyzUsfGLj/jUmq8WH/VJLlRClUtkktVv3S99GxSS37qWlWdrWeM1mfB/JEACEU/gzp07MnHiRHnooYfcKtX+dHLw4MGydOlSJUuOHDmUiQMmETCX6dy5sxKPny5dusi2bdvgdXHHjx9XlHg1AQo9zH52794t06dPl2LFiilJ27dvlzfeeEPxG38g27JlS8HbBaQ988wz8s033yjmQz/88IP07NkT0YobPXq0zJkzR/HzJzIILNy2Otka2r5WY7HZbIpTG2Gz2aTHw83UYNRel584LFduXNP1b/d/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1wCWnCQCGBuMEcYKY4axwxhiLDGmGFuMcZIqYWaPBKjoe8TDRBIgARIgARIgAb8IhEi4eO4C0qTiQ/L2E23la/tK/+LuI2T7u9/ImQ+/l1tDZtNZkAHGBmOEscKYYewwhhjLEN0mLNZAgIq+AQiDJEACJEACJEACJEACJBANBKyi6EcDS/aBBEiABEiABEiABEiABCxDgIq+ZYaCDSEBEtATYIgESIAESIAESCApBKjoJ4Ue85IACZAACZAACYSPAGsiARLwiwAVfb9wUZgESIAESIAESIAESIAEIoNALCj6kTESbCUJkAAJkAAJkAAJkAAJBJEAFf0gwmRRJEACkUKA7SQBEiABEiCB6CdART/6x5g9JAESIAESIAES8EaA6SQQhQSo6EfhoLJLJEACJEACJEACJEACJOBW0V/VObN4cps2bRK6TWTA+4D3AO8B3gNRcg9QJSABEiCBaCPgVtGPto6yPyRAAiQQHgKshQRIgARIgASsQcCtol+uXDmhIwPeA7wHeA/wHoiVe8Aaj2W2IioJsFMkkEwE3Cr6ydQeVksCJEACJEACJEACJEACJBAEAlT0gwAxREWwWBIgARIgARIgARIgARIImAAV/YDRMSMJkAAJhJsA6yMBEiABEiAB3wn8PwAAAP//IPhikwAAAAZJREFUAwDBpd3oPWesngAAAABJRU5ErkJggg==",
      position: { x: 2.8089661555796965, y: 47.23027170638301, width: 25.07545575274659, height: 11.583412631190024 },
      zIndex: 3,
    },
  ],
  },
  {
    blocks: [
    {
      type: "h2",
      content: "What Actually Stayed Constant",
      position: { x: 3.8667583367686564, y: 5, width: 90, height: 14 },
      style: { fontSize: 48, fontWeight: "bold", textAlign: "left" },
      zIndex: 10,
    },
    {
      type: "text",
      content: `<ol><li><b>Server ↔ Client</b> — Mainframe/terminal (1960s) → browser/server → SPA/API → edge/SSR. The names change, the shape never does.</li><li><b>Request → Response</b> — HTTP/0.9 to HTTP/3, REST to GraphQL to gRPC. Different envelopes, same letter.</li><li><b>State → UI</b> — MVC (1979) → jQuery → Backbone → React → Signals. "Your screen is a projection of your data." 45 years and counting.</li><li><b>Data in → Transform → Data out</b> — Unix pipes (1973). MapReduce. Lambdas. <code>f(x) → y</code>. Functions all the way down.</li><li><b>Complexity is managed, never eliminated</b> — Brooks' No Silver Bullet (1986). New tools reduce accidental complexity. Essential complexity stays.</li><li><b>Abstractions leak</b> — Spolsky's Law (2002). Every abstraction hides details until it doesn't. You still need to know what's underneath.</li><li><b>Read → Think → Write</b> — The developer loop. vim in '91 or Cursor in '26 — understand, reason, express. Tools accelerate each step but eliminate none.</li></ol>`,
      position: { x: 3.91826932146099, y: 14.743589743589743, width: 90, height: 55.4029304029304 },
      style: { fontSize: 32, textAlign: "left" },
      zIndex: 10,
    },
    {
      type: "text",
      content: `<section id="markdown-section-874c6afa-db11-478a-8b6f-308b379b53f9-2" style="border-radius: 4px; margin-top: 6px; margin-bottom: 6px; position: relative; scroll-margin-bottom: 40px; scroll-margin-top: 40px"><span style="animation: 0.25s ease 0s 1 normal none running fade-in"><span style="animation: 0.25s ease 0s 1 normal none running fade-in">Brooks, F.P.</span></span><span style="animation: 0.25s ease 0s 1 normal none running fade-in">&nbsp;(1987) 'No Silver Bullet: Essence and Accidents of Software Engineering',&nbsp;</span><span style="animation: 0.25s ease 0s 1 normal none running fade-in"><span style="animation: 0.25s ease 0s 1 normal none running fade-in">Computer</span></span><span style="animation: 0.25s ease 0s 1 normal none running fade-in">, 20(4), pp. 10–19. doi: 10.1109/MC.1987.1663532.</span></section><section id="markdown-section-874c6afa-db11-478a-8b6f-308b379b53f9-4" style="border-radius: 4px; margin-top: 6px; margin-bottom: 6px; position: relative; scroll-margin-bottom: 40px; scroll-margin-top: 40px"><span style="animation: 0.25s ease 0s 1 normal none running fade-in"><span style="animation: 0.25s ease 0s 1 normal none running fade-in">Spolsky, J.</span></span><span style="animation: 0.25s ease 0s 1 normal none running fade-in">&nbsp;(2002) 'The Law of Leaky Abstractions',&nbsp;</span><span style="animation: 0.25s ease 0s 1 normal none running fade-in"><span style="animation: 0.25s ease 0s 1 normal none running fade-in">Joel on Software</span></span><span style="animation: 0.25s ease 0s 1 normal none running fade-in">, 11 November. Available at: https://www.joelonsoftware.com/2002/11/11</span><span style="animation: 0.25s ease 0s 1 normal none running fade-in">/the-law-of-leaky</span><span style="animation: 0.25s ease 0s 1 normal none running fade-in">-abstractions/ (Accessed: 5 February 2026).</span></section><section id="markdown-section-874c6afa-db11-478a-8b6f-308b379b53f9-6" style="border-radius: 4px; margin-top: 6px; margin-bottom: 6px; position: relative; scroll-margin-bottom: 40px; scroll-margin-top: 40px"><span style="animation: 0.25s ease 0s 1 normal none running fade-in"><span style="animation: 0.25s ease 0s 1 normal none running fade-in">Reenskaug, T.</span></span><span style="animation: 0.25s ease 0s 1 normal none running fade-in">&nbsp;(1979)&nbsp;</span><span style="animation: 0.25s ease 0s 1 normal none running fade-in"><span style="animation: 0.25s ease 0s 1 normal none running fade-in">Models - Views - Controllers</span></span><span style="animation: 0.25s ease 0s 1 normal none running fade-in">. Technical note, Xerox PARC. Available at: https://folk.universitetetioslo</span><span style="animation: 0.25s ease 0s 1 normal none running fade-in">.no/trygver/themes/mvc/mvc-index.html (Accessed: 5 February 2026).</span></section><br>`,
      position: { x: 4.333791683843283, y: 71.15384615384616, width: 90, height: 25 },
      style: { fontSize: 24, textAlign: "left" },
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
