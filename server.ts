import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialized Gemini client
let aiClient: GoogleGenAI | null = null;

function getGenAI(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Helper to detect invalid, trivial, or greeting inputs
function isInvalidOrTrivialInput(text?: string): boolean {
  if (!text || typeof text !== "string") return true;
  const clean = text.trim().toLowerCase();
  
  if (clean.length < 5) return true;

  // Common trivial/greeting patterns
  const trivialPatterns = [
    /^(hi|hello|hey|namaste|sup|yo|greetings|hola|gm|gn)[\s!.]*$/i,
    /^(test|testing|demo|sample|check|asdf|qwerty|1234|abc)[\s!.]*$/i,
    /^(ok|okay|yes|no|yeah|nah|idk|dunno|sure|fine|cool|whatever)[\s!.]*$/i,
    /^(none|nothing|n\/a|nil|pass|skip)[\s!.]*$/i,
    /^(haha|lol|lmao|rofl|hehe)[\s!.]*$/i,
    /^([a-z])\1{3,}$/i, // e.g. "aaaaa", "zzzz"
  ];

  for (const pattern of trivialPatterns) {
    if (pattern.test(clean)) return true;
  }

  // Count distinct words of meaningful length (>1 letter)
  const words = clean.split(/\s+/).filter(w => w.length > 1);
  if (words.length < 3 && clean.length < 15) return true;

  return false;
}

// System Persona Prompts
const PERSONAS: Record<string, { name: string; title: string; prompt: string }> = {
  cfo: {
    name: "VARMA, A. (CFO)",
    title: "Chief Financial Officer",
    prompt:
      "You are Arjun Varma, a battle-hardened Chief Financial Officer in the Indian corporate and startup ecosystem. You scrutinize every proposal against unforgiving unit economics: post-GST contribution margins, working capital cycles in ₹ Crores, quick-commerce platform cuts (25%+), burn rates, and customer acquisition costs vs lifetime value in Indian markets. You speak with crisp, surgical, uncompromising precision.",
  },
  competitor: {
    name: "SEN, R. (RIVAL FOUNDER & CEO)",
    title: "Hostile Competitor",
    prompt:
      "You are Rhea Sen, an aggressive founder & CEO of a well-funded rival startup backed by top Tier-1 VCs in Bengaluru and Gurugram. You actively look to exploit your opponent's pricing mistakes, supply-chain bottlenecks, Kirana distribution channel conflicts, festival-season stockouts, and margin vulnerabilities in Indian Tier-1 and Tier-2 markets.",
  },
  board: {
    name: "SINGHANIA, V. (MANAGING DIRECTOR)",
    title: "Board of Directors",
    prompt:
      "You are Vikramaditya Singhania, veteran corporate Managing Director on prominent Indian boards and private equity panels. Having navigated market downturns, regulatory headwinds (RBI, CCI, GST), and Dalal Street scrutiny, you have zero tolerance for vanity GMV, empty buzzwords, or unhedged corporate risks. You demand disciplined governance, clear downside caps, and exit milestones.",
  },
};

// API: Start Interrogation
app.post("/api/interrogate/start", async (req, res) => {
  try {
    const { decision, objective, stakeholders, stakes, protocol, personaKey = "cfo" } = req.body;
    const persona = PERSONAS[personaKey] || PERSONAS.cfo;
    const isBrutal = protocol === "brutal";

    // Immediate check for invalid/trivial decision prompt (e.g. "hi")
    if (isInvalidOrTrivialInput(decision) || isInvalidOrTrivialInput(objective)) {
      return res.json({
        openingStatement: `CONTEMPT OF TRIBUNAL: You entered "${decision || 'an invalid statement'}". A single-word greeting or placeholder is not a business decision. You have entered an adversarial stress test without a case. State a concrete corporate initiative with clear financial trade-offs, or this session will be recorded as an immediate forfeit.`,
        speaker: persona.name,
        title: persona.title,
        isInvalidPrompt: true,
      });
    }

    const ai = getGenAI();
    if (ai) {
      const prompt = `
You are acting in an adversarial corporate interrogation deposition called "DEVIL'S ADVOCATE" set in the Indian business landscape (Bandra Kurla Complex / Bengaluru / Gurugram).
Persona: ${persona.prompt}
Tone: ${isBrutal ? "Brutal, biting, zero tolerance for vague startup buzzwords, aggressively challenging unit economics and market risks" : "Formal, sharp, analytical, exposing flawed assumptions in the Indian market"}.

CASE DETAILS:
- Proposed Decision: "${decision}"
- Stated Objective: "${objective}"
- Affected Stakeholders: "${stakeholders}"
- Associated Stakes/Risks: "${stakes || "Unspecified"}"

TASK:
Deliver your OPENING CROSS-EXAMINATION CHALLENGE to the defendant.
Length: 2-3 tight, punchy, intimidating sentences.
Directly target their core assumption, a financial/operational trap, or a dangerous blind spot in their proposal (such as cash flow in ₹, unit economics, distributor pushback, Tier-2 trust, or channel conflict).
Demand an immediate, concrete defense. Do not say hello or pleasantries. Jump straight into the cross-examination.
`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
      });

      if (response.text) {
        return res.json({
          openingStatement: response.text.trim(),
          speaker: persona.name,
          title: persona.title,
        });
      }
    }
  } catch (err) {
    console.error("Gemini start error:", err);
  }

  // Domain-specific intelligent fallback with Indian context
  const { decision, objective, protocol, personaKey = "cfo" } = req.body;
  const persona = PERSONAS[personaKey] || PERSONAS.cfo;
  const isBrutal = protocol === "brutal";

  if (isInvalidOrTrivialInput(decision)) {
    return res.json({
      openingStatement: `CONTEMPT OF TRIBUNAL: "${decision || 'Hi'}" is not a valid business proposal. The tribunal demands a concrete strategic initiative with measurable financial and operational consequences.`,
      speaker: persona.name,
      title: persona.title,
    });
  }

  const defaultOpening = isBrutal
    ? `I've reviewed your proposal regarding "${decision || 'this initiative'}". Explain how you reconcile your objective to "${objective || 'expand'}" against immediate gross margin erosion, distributor backlash, and working capital strain in the Indian market, or admit this is a blind gamble.`
    : `Let's examine your proposal to "${decision || 'proceed'}". Your stated objective is "${objective || 'growth'}", yet there is immediate tension between your stakeholder costs and projected ₹ contribution margins. How do you justify this trade-off with hard metrics?`;

  return res.json({
    openingStatement: defaultOpening,
    speaker: persona.name,
    title: persona.title,
  });
});

// API: Cross-Examination Response
app.post("/api/interrogate/respond", async (req, res) => {
  try {
    const { caseDetails, transcript, userResponse, turnCount = 1, protocol, personaKey = "cfo" } = req.body;
    const persona = PERSONAS[personaKey] || PERSONAS.cfo;
    const isBrutal = protocol === "brutal";

    // Detect trivial or evasive user answer (e.g. "hi", "ok", "idk", keyboard mash)
    const isTrivial = isInvalidOrTrivialInput(userResponse);

    const ai = getGenAI();
    if (ai) {
      const prompt = `
You are acting in an adversarial corporate interrogation deposition ("DEVIL'S ADVOCATE") in the Indian market context.
Persona: ${persona.prompt}
Mode: ${isBrutal ? "BRUTAL (mock vague answers, call out contradictions instantly, push hard on metrics)" : "POLITE (systematic disassembly, pointed analytical counter-inquiries)"}.

CASE:
- Decision: "${caseDetails?.decision}"
- Objective: "${caseDetails?.objective}"
- Stakeholders: "${caseDetails?.stakeholders}"
- Stakes: "${caseDetails?.stakes || "None specified"}"

TRANSCRIPT SO FAR:
${(transcript || []).map((t: any) => `${t.speaker}: ${t.content}`).join("\n")}

DEFENDANT'S LATEST STATEMENT:
"${userResponse}"

${isTrivial ? "NOTE: The defendant responded with a trivial, evasive, or nonsensical answer ('" + userResponse + "'). Sternly call out their contempt of the panel, mockery of capital discipline, and refusal to provide operational substance." : ""}

CURRENT ROUND: Round ${turnCount} of 3.

TASK:
${
  turnCount >= 3
    ? `Deliver your FINAL CLOSING REBUKE or concluding assessment of their defense (2-3 sentences). Tell them the record is now closed and their case is proceeding to verdict.`
    : `Dismantle their response in 2-3 sharp sentences. Call out specific weaknesses (e.g. lack of quantitative thresholds, circular reasoning, wishful customer loyalty, platform commissions, working capital drain). Ask a ruthless follow-up probe.`
}
`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
      });

      if (response.text) {
        return res.json({
          response: response.text.trim(),
          speaker: persona.name,
          isFinal: turnCount >= 3,
        });
      }
    }
  } catch (err) {
    console.error("Gemini respond error:", err);
  }

  // Fallback responses with Indian business context & contempt handling
  const { turnCount = 1, userResponse, protocol, personaKey = "cfo" } = req.body;
  const persona = PERSONAS[personaKey] || PERSONAS.cfo;
  const isBrutal = protocol === "brutal";
  const isTrivial = isInvalidOrTrivialInput(userResponse);

  if (isTrivial) {
    return res.json({
      response: `Contempt of the Chamber. The defendant responds with "${userResponse || 'evasion'}". A flippant deflection is not a defense for capital allocation. The panel notes your refusal or inability to articulate operational mechanics. State a verifiable metric or concede the floor.`,
      speaker: persona.name,
      isFinal: turnCount >= 3,
    });
  }

  const fallbacks = [
    isBrutal
      ? `Vague. You are hiding behind optimistic assumptions while ignoring channel commissions and working capital cycles in ₹ Crores. What specific quantitative metric triggers an immediate rollback?`
      : `That addresses the sentiment, but fails to account for secondary order effects. If your primary regional distributors push back within the first 30 days, what is your verified contingency?`,
    isBrutal
      ? `Contradictory. You claim to protect customer lifetime value, yet this move directly alienates your core base while subsidizing unproven acquisition channels. Where is the verified unit margin?`
      : `Notice how your thesis depends entirely on competitor inaction in Bengaluru and NCR. What prevents a rival from capitalizing on this exact vulnerability immediately?`,
    `The record reflects your position. However, these defenses rely far too heavily on ideal conditions rather than market friction. The interrogation is concluded. Proceeding to verdict.`,
  ];

  const reply = fallbacks[Math.min(turnCount - 1, fallbacks.length - 1)];

  return res.json({
    response: reply,
    speaker: persona.name,
    isFinal: turnCount >= 3,
  });
});

// API: Final Verdict & Pre-Mortem Synthesis
app.post("/api/verdict/evaluate", async (req, res) => {
  try {
    const { caseDetails, transcript, protocol } = req.body;

    // Check if the entire case or transcript was low-effort / trivial (e.g. user submitted "hi" or 1-word replies)
    const isDecisionTrivial = isInvalidOrTrivialInput(caseDetails?.decision) || isInvalidOrTrivialInput(caseDetails?.objective);
    
    // Check substantive quality of defendant transcript entries
    const defendantEntries = (transcript || []).filter((t: any) => t.speakerType === "defendant");
    const trivialDefenseCount = defendantEntries.filter((t: any) => isInvalidOrTrivialInput(t.content)).length;
    const isSeverelyTrivial = isDecisionTrivial || (defendantEntries.length > 0 && trivialDefenseCount >= defendantEntries.length);

    // If completely invalid or trivial, return a harsh FAIL verdict (score 12-18%)
    if (isSeverelyTrivial) {
      return res.json({
        score: 14,
        status: "CONTEMPT OF TRIBUNAL",
        diagnosis: "The defendant failed to submit a coherent strategic proposition or defend capital allocation under cross-examination. The record contains empty placeholders, trivial greetings, or unbacked deflections.",
        scores: {
          specificity: {
            score: 2,
            max: 40,
            critique: "Zero quantitative substance, unit economics, or verifiable operational thresholds submitted for the record.",
          },
          consistency: {
            score: 4,
            max: 30,
            critique: "Total absence of structural logic. The defense collapsed into single-word deflections or procedural evasion.",
          },
          falsifiability: {
            score: 3,
            max: 30,
            critique: "Completely unfalsifiable. No timeline, milestone, or rollback criteria exist to evaluate this premise.",
          },
        },
        preMortem: {
          howThisFails: [
            {
              number: "01",
              title: "Immediate board withdrawal of mandate due to total absence of operational forethought.",
            },
            {
              number: "02",
              title: "Rapid capital exhaustion and liquidation within 45 days of deployment.",
            },
            {
              number: "03",
              title: "Predatory rivals capturing 100% of market share while internal leadership scrambles.",
            },
          ],
          warningMetric: "CAPITAL DRAIN: 100% UNGUARDED",
          warningSubtext: "A non-decision leads to guaranteed liquidation.",
          unaddressedBlindspot: "Everything. The defendant treated a high-stakes executive deposition as casual banter without producing a single defensible number.",
          concludingDictum: "A proposal without substance is an abdication of leadership.",
        },
      });
    }

    const ai = getGenAI();
    if (ai) {
      const prompt = `
You are the Chief Arbiter of the Adversarial Decision Stress Test ("DEVIL'S ADVOCATE") evaluating an Indian market business decision.
Evaluate the defendant's decision and their defense during the cross-examination deposition.

CASE UNDER REVIEW:
- Decision: "${caseDetails?.decision}"
- Objective: "${caseDetails?.objective}"
- Stakeholders: "${caseDetails?.stakeholders}"
- Stakes: "${caseDetails?.stakes || "Unspecified"}"

FULL TRANSCRIPT:
${(transcript || []).map((t: any) => `${t.speaker}: ${t.content}`).join("\n")}

EVALUATION CRITERIA:
1. Ground the evaluation in realistic Indian market dynamics (e.g., GST, ₹ Crores / Lakhs, distributor terms, Quick Commerce 25% take-rates, Kirana credit defaults, Tier-2/3 trust barriers, festive seasonal demand).
2. If the defendant's defense was vague, short, evasive, or lacking hard numbers, penalize heavily (give a score between 15 and 45).
3. If the defendant provided solid trade-offs, rollback thresholds, and quantitative metrics, award a realistic score between 60 and 85 (rarely above 85).

Generate a comprehensive, rigorous JSON evaluation matching this exact schema:
{
  "score": <integer number between 10 and 88, representing structural integrity of decision>,
  "status": "<short uppercase status like 'CONTEMPT OF TRIBUNAL', 'STRUCTURALLY EXPOSED', 'FRAGILE CONSTRUCT', 'DEFICIENT PREMISE', 'MODERATELY RESILIENT', or 'BATTLE TESTED'>",
  "diagnosis": "<1-2 sentence piercing diagnosis of why this decision is structurally sound or exposed in the Indian market>",
  "scores": {
    "specificity": {
      "score": <number 0-40>,
      "max": 40,
      "critique": "<Specific critique regarding absence or presence of concrete metrics, thresholds in INR / %, and exact parameters>"
    },
    "consistency": {
      "score": <number 0-30>,
      "max": 30,
      "critique": "<Critique on internal contradictions, stakeholder friction, distributor conflicts, or conflicting priorities>"
    },
    "falsifiability": {
      "score": <number 0-30>,
      "max": 30,
      "critique": "<Critique on whether the premise has clear testable exit criteria and rollback conditions>"
    }
  },
  "preMortem": {
    "howThisFails": [
      { "number": "01", "title": "<Concise, realistic Indian market failure mode 1>" },
      { "number": "02", "title": "<Concise, realistic Indian market failure mode 2>" },
      { "number": "03", "title": "<Concise, realistic Indian market failure mode 3>" }
    ],
    "warningMetric": "<Single primary quantitative metric and threshold that would warn them, e.g. 90-DAY REPEAT RATE < 20% or BLINKIT COMMISSION > 26% or 14-DAY NPA > 4.5%>",
    "warningSubtext": "Track this, don't just say it.",
    "unaddressedBlindspot": "<The single most dangerous variable or systemic shock that the user failed to account for in the Indian market>",
    "concludingDictum": "<A bold, memorable final verdict quote, e.g., 'This decision has not yet earned its confidence.'>"
  }
}
`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });

      if (response.text) {
        const json = JSON.parse(response.text);
        return res.json(json);
      }
    }
  } catch (err) {
    console.error("Gemini verdict error:", err);
  }

  // Fallback verdict with Indian market context
  const { caseDetails } = req.body;
  const decision = caseDetails?.decision || "The proposed initiative";

  return res.json({
    score: 58,
    status: "STRUCTURALLY EXPOSED",
    diagnosis: "The decision logic presented lacks necessary structural integrity for the Indian market. Critical blindspots identified in working capital friction, channel distributor margins, and seasonal demand volatility.",
    scores: {
      specificity: {
        score: 16,
        max: 40,
        critique: "User failed to name a specific reversal metric in ₹ or actionable threshold for rollback under unexpected distributor or platform stress.",
      },
      consistency: {
        score: 20,
        max: 30,
        critique: "Defense strategy relies on mutually exclusive priorities—promising high customer loyalty while absorbing heavy channel margin cuts.",
      },
      falsifiability: {
        score: 22,
        max: 30,
        critique: "Clear exit condition provided in principle, though lacks timeline. The premise can be tested, but the evaluation window is ambiguous.",
      },
    },
    preMortem: {
      howThisFails: [
        {
          number: "01",
          title: "Quick-commerce / channel take-rate compression leaving negative post-GST contribution margins.",
        },
        {
          number: "02",
          title: "Regional Kirana distributor revolt and credit defaults across Tier-2 dealer clusters.",
        },
        {
          number: "03",
          title: "Post-festive demand cliff resulting in stranded inventory and emergency write-downs.",
        },
      ],
      warningMetric: "CONTRIBUTION MARGIN 2 < 12%",
      warningSubtext: "Track this, don't just say it.",
      unaddressedBlindspot: `Working capital lock-in during peak shipment cycles and cascading distributor credit defaults for ${decision}.`,
      concludingDictum: "This decision has not yet earned its confidence in the Indian market.",
    },
  });
});

// Vite middleware and static serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true, host: "0.0.0.0", port: PORT },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Devil's Advocate server running on port ${PORT}`);
  });
}

startServer();
