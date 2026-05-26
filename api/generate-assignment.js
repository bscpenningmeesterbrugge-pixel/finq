export const config = {
  runtime: "nodejs",
};

import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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
      temperature: 0.7,
      messages: [
        {
          role: "system",
          content:
            "Je bent een docent-assistent. Geef ALTIJD geldige JSON terug zonder extra tekst.",
        },
        {
          role: "user",
          content: `
Maak 3 multiple choice vragen over: ${prompt}

FORMAT (STRICT JSON):
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

    let text = completion.choices[0].message.content;

    text = text.replace(/```json/g, "").replace(/```/g, "").trim();

    let json;

    try {
      json = JSON.parse(text);
    } catch (e) {
      return res.status(500).json({
        error: "Invalid JSON from OpenAI",
        raw: text,
      });
    }

    return res.status(200).json({
      ok: true,
      result: json,
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      error: err.message || "Unknown error",
    });
  }
}
