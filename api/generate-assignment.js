export const config = {
  runtime: "nodejs",
};

import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 🔥 helper: extract JSON uit rommel
function extractJSON(text) {
  if (!text) return null;

  // 1. direct parse poging
  try {
    return JSON.parse(text);
  } catch {}

  // 2. strip markdown
  const cleaned = text
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch {}

  // 3. brute force: zoek eerste { ... laatste }
  const first = text.indexOf("{");
  const last = text.lastIndexOf("}");

  if (first !== -1 && last !== -1) {
    const slice = text.slice(first, last + 1);

    try {
      return JSON.parse(slice);
    } catch {}
  }

  return null;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  const { prompt } = req.body || {};

  if (!prompt) {
    return res.status(400).json({ error: "Missing prompt" });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.4,

      // 🔥 BELANGRIJK: native JSON mode (game changer)
      response_format: { type: "json_object" },

      messages: [
        {
          role: "system",
          content:
            "Je bent een AI die ALTIJD geldige JSON teruggeeft. Geen uitleg, geen markdown.",
        },
        {
          role: "user",
          content: `
Maak 3 multiple choice vragen over: ${prompt}

Return EXACT dit JSON schema:

{
  "questions": [
    {
      "question": "string",
      "options": ["A", "B", "C", "D"],
      "correct": 0
    }
  ]
}
          `,
        },
      ],
    });

    const raw = completion.choices?.[0]?.message?.content;

    const json = extractJSON(raw);

    if (!json) {
      return res.status(500).json({
        error: "Failed to parse JSON from model",
        raw,
      });
    }

    // 🔥 extra safety checks
    if (!Array.isArray(json.questions)) {
      return res.status(500).json({
        error: "Invalid structure: questions missing",
        raw: json,
      });
    }

    return res.status(200).json({
      ok: true,
      result: json,
    });
  } catch (err) {
    console.error("AI ERROR:", err);

    return res.status(500).json({
      error: err.message || "Unknown error",
    });
  }
}
