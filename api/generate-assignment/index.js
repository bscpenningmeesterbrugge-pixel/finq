import OpenAI from "openai";

export const config = {
  runtime: "nodejs",
};

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  try {
    console.log("API HIT");

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
          content: "Geef enkel geldige JSON, geen tekst.",
        },
        {
          role: "user",
          content: `
Maak 3 multiple choice vragen over: ${prompt}

{
  "questions": [
    {
      "question": "",
      "options": ["A","B","C","D"],
      "correct": 0
    }
  ]
}
          `,
        },
      ],
    });

    const data = JSON.parse(completion.choices[0].message.content);

    return res.status(200).json({
      ok: true,
      result: data,
    });
  } catch (err) {
    console.error("FATAL ERROR:", err);

    return res.status(500).json({
      error: err.message,
    });
  }
}
