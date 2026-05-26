import OpenAI from "openai";

export const config = {
  runtime: "nodejs",
};

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function safeJSONParse(text) {
  try {
    return JSON.parse(text);
  } catch (e) {
    console.log("RAW AI OUTPUT:", text);
    return null;
  }
}

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Only POST allowed" });
    }

    const { prompt } = req.body || {};

    if (!prompt) {
      return res.status(400).json({ error: "Missing prompt" });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "Je bent een AI die ALTIJD geldige JSON teruggeeft. Geen tekst.",
        },
        {
          role: "user",
          content: `Maak 3 MC vragen over: ${prompt}
Return EXACT:
{
  "questions": [
    {
      "question": "string",
      "options": ["A","B","C","D"],
      "correct": 0
    }
  ]
}`,
        },
      ],
    });

    const raw = completion.choices?.[0]?.message?.content;

    if (!raw) {
      return res.status(500).json({
        error: "Empty OpenAI response",
      });
    }

    const json = safeJSONParse(raw);

    if (!json) {
      return res.status(500).json({
        error: "Invalid JSON from OpenAI",
        raw,
      });
    }

    return res.status(200).json({
      ok: true,
      result: json,
    });
  } catch (err) {
    console.error("FATAL ERROR:", err);

    return res.status(500).json({
      error: err.message,
    });
  }
}
