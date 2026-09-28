// /api/chat.js
// Vercel serverless function. Keeps the Anthropic API key on the server and
// grounds answers in data/diseases.json (80 curated conditions).
//
// Flow: browser -> POST /api/chat { message }
//   1. retrieve matching conditions from the dataset
//   2. inject them into the system prompt as reference data
//   3. call Anthropic
//   4. return { reply, sources }
//
// Set ANTHROPIC_API_KEY in Vercel > Settings > Environment Variables.

// Pure CommonJS on purpose: require() + module.exports, no ESM syntax mixed in.
// A literal relative require() path lets Vercel's bundler include the JSON file.
let diseases = [];
try {
  diseases = require("../data/diseases.json");
} catch (err) {
  console.error("Failed to load diseases.json:", err);
}

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Precompile one word-boundary regex per alias. \b prevents "tb" matching
// inside "outbreak" or "ra" inside "brain". Runs once per cold start.
const indexed = diseases.map((d) => ({
  disease: d,
  patterns: d.aliases.map((alias) => ({
    re: new RegExp("\\b" + escapeRegExp(alias.toLowerCase()) + "\\b"),
    weight: alias.trim().split(/\s+/).length, // multi-word aliases are more specific
  })),
}));

// Keyword retrieval (RAG-lite). Score = sum of weights of matched aliases,
// so "type 1 diabetes" (weight 3) outranks a bare "diabetes" (weight 1).
function findRelevantDiseases(message, maxResults = 3) {
  const text = String(message).toLowerCase();
  return indexed
    .map(({ disease, patterns }) => ({
      disease,
      score: patterns.reduce((acc, p) => (p.re.test(text) ? acc + p.weight : acc), 0),
    }))
    .filter((e) => e.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults)
    .map((e) => e.disease);
}

function buildContext(matches) {
  if (matches.length === 0) return null;
  return matches
    .map((d) =>
      [
        `### ${d.name} (${d.category})`,
        `Symptoms: ${d.symptoms.join(", ")}`,
        `Common causes: ${d.causes.join(", ")}`,
        `Curability: ${d.curability}`,
        `Conventional treatment approaches: ${d.conventional_treatment.join(", ")}`,
        `Exercise & lifestyle: ${d.exercise_and_lifestyle.join(", ")}`,
        `Caution: ${d.caution}`,
      ].join("\n")
    )
    .join("\n\n");
}

const BASE_SYSTEM_PROMPT = `You are Vitalline, a friendly health-education assistant on a wellness website.

Explain diseases and conditions in plain language: what they are, common symptoms, whether they are curable or manageable, the usual treatment approaches, and which exercise or lifestyle changes help. Keep answers to 4-7 sentences, warm but factual.

If reference data is provided below, treat it as verified and ground your answer in it. Do not contradict it and prefer it over your own general knowledge. If none is provided, answer from general knowledge but stay conservative and evidence-based.

Be honest about "cure": say clearly whether a condition is curable, self-limiting, or only manageable. Never present a treatment as a guaranteed cure.

Never state specific medication dosages. Mention treatment categories only (for example "an antibiotic" or "a statin") and say that any medicine must be chosen and prescribed by a licensed doctor. Never advise starting or stopping prescription medicine.

You are not a doctor and cannot diagnose. If the person describes an emergency or red-flag symptoms (chest pain, trouble breathing, stroke signs, severe bleeding, confusion, suicidal thoughts, and similar), tell them to contact local emergency services immediately instead of giving self-care advice. End with a short reminder to consult a doctor for diagnosis and treatment.`;

async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { message } = req.body || {};
  if (!message || typeof message !== "string" || !message.trim()) {
    return res.status(400).json({ error: "Missing 'message' in request body" });
  }
  if (message.length > 1000) {
    return res.status(400).json({ error: "Message too long (max 1000 characters)" });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "Server is missing ANTHROPIC_API_KEY" });
  }

  const matches = findRelevantDiseases(message);
  const context = buildContext(matches);
  const systemPrompt = context
    ? `${BASE_SYSTEM_PROMPT}\n\n---\nREFERENCE DATA (verified; prefer this over general knowledge):\n\n${context}`
    : BASE_SYSTEM_PROMPT;

  try {
    const upstream = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1000,
        system: systemPrompt,
        messages: [{ role: "user", content: message }],
      }),
    });

    if (!upstream.ok) {
      const errText = await upstream.text();
      console.error("Anthropic API error:", upstream.status, errText);
      return res.status(502).json({ error: "Upstream AI service error" });
    }

    const data = await upstream.json();
    const reply =
      (data.content || [])
        .map((b) => b.text || "")
        .filter(Boolean)
        .join(" ")
        .trim() || "I couldn't generate a response just now. Please try again.";

    return res.status(200).json({ reply, sources: matches.map((d) => d.name) });
  } catch (err) {
    console.error("Handler error:", err);
    return res.status(500).json({ error: "Something went wrong reaching the AI service" });
  }
}

module.exports = handler;
// Exposed only so retrieval can be unit-tested without calling the API.
module.exports.findRelevantDiseases = findRelevantDiseases;
