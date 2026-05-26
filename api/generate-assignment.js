import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  return res.status(200).json({
    ok: true,
    method: req.method,
    body: req.body,
    keyExists: !!process.env.OPENAI_API_KEY,
  });
}

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const body =
      typeof req.body === "string"
        ? JSON.parse(req.body)
        : req.body;

    const prompt = body?.prompt;

    if (!prompt) {
      return res.status(400).json({
        error: "Missing prompt",
      });
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `
Geef altijd dit formaat terug:

{
  "questions": [
    {
      "question": "...",
      "options": ["...", "...", "...", "..."],
      "correctAnswer": 0
    }
  ]
}
          `,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const parsed = JSON.parse(
      response.choices[0].message.content
    );

    return res.status(200).json({
      result: parsed,
    });

  } catch (err) {
    console.log("API ERROR:", err);

    return res.status(500).json({
      error: err.message || "Unknown error",
    });
  }
}
