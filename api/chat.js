// /api/chat.js
// Vercel serverless function. 
// Grounds answers STRICTLY in data/diseases.json (No Anthropic API Key required!).
//
// Flow: browser -> POST /api/chat { message }
//   1. check for urgent/emergency health keywords
//   2. retrieve matching conditions from the dataset
//   3. format the data directly into a user-friendly reply
//   4. return { reply, sources }

let diseases = [];
try {
  diseases = require("../data/diseases.json");
} catch (err) {
  console.error("Failed to load diseases.json:", err);
}

function escapeRegExp(s) {
  return s.replace(/[.*+?^\${}()|[\]\\]/g, "\\$&");
}

// Precompile regex per alias.
const indexed = diseases.map((d) => ({
  disease: d,
  patterns: (d.aliases || []).map((alias) => ({
    re: new RegExp("\\b" + escapeRegExp(alias.toLowerCase()) + "\\b"),
    weight: alias.trim().split(/\s+/).length,
  })),
}));

// Keyword retrieval engine
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

// Quick keyword scanner for emergency warning signs
function checkEmergency(message) {
  const text = String(message).toLowerCase();
  const criticalKeywords = [
    "chest pain", "trouble breathing", "shortness of breath", "stroke", 
    "severe bleeding", "heavy bleeding", "confusion", "suicidal", 
    "unconscious", "heart attack", "choking"
  ];
  return criticalKeywords.some(keyword => text.includes(keyword));
}

// Formats your raw JSON records into clean, educational text
function formatLocalResponse(matches) {
  return matches
    .map((d) => {
      return `### ${d.name} (${d.category})\n` +
             `• **What it is & Causes:** Common causes include ${d.causes.join(", ")}.\n` +
             `• **Symptoms:** Watch out for ${d.symptoms.join(", ")}.\n` +
             `• **Curability:** This condition is ${d.curability.toLowerCase()}.\n` +
             `• **Management:** Conventional treatment approaches include ${d.conventional_treatment.join(", ")}. Helpful exercise and lifestyle choices include ${d.exercise_and_lifestyle.join(", ")}.\n` +
             `• **Caution:** ${d.caution}`;
    })
    .join("\n\n---\n\n");
}

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

  // 1. Check for red-flag emergency symptoms first
  if (checkEmergency(message)) {
    return res.status(200).json({
      reply: "🚨 **Emergency Notice:** If you or someone else is experiencing severe symptoms like chest pain, trouble breathing, heavy bleeding, sudden confusion, or deep distress, please contact your local emergency services immediately. Do not rely on self-care advice. Please consult a medical professional for an urgent diagnosis.",
      sources: []
    });
  }

  // 2. Query your local database using your search algorithm
  const matches = findRelevantDiseases(message);

  let reply = "";
  if (matches.length > 0) {
    // 3. Match found: Build clean educational output
    reply = `Hello! Based on Vitalline's health database, here is some information related to your request:\n\n` + 
            formatLocalResponse(matches) + 
            `\n\n*Reminder: Vitalline provides educational information only. Always consult a licensed doctor or medical provider for a true diagnosis, prescriptions, or personalized treatment.*`;
  } else {
    // 4. Fallback if no conditions match the keywords
    reply = "I couldn't find a matching health condition or specific symptom in our current database. Please check your spelling or search for common terms (such as 'Diabetes', 'Fatigue', or 'Hypertension'). For any persistent symptoms, always remember to consult a healthcare professional.";
  }

  // Return the output back to your frontend UI
  return res.status(200).json({ 
    reply: reply, 
    sources: matches.map((d) => d.name) 
  });
}

module.exports = handler;
module.exports.findRelevantDiseases = findRelevantDiseases;
