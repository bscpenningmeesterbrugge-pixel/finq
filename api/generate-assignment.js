import OpenAI from "openai";

function extractJSON(text) {
  const match = text.match(/\[[\s\S]*\]/);
  if (!match) throw new Error("No JSON array found");
  return JSON.parse(match[0]);
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(
  req,
  res
) {
  try {
    if (req.method !== "POST") {
      return res
        .status(405)
        .json({
          error:
            "Method not allowed",
        });
    }

    const { prompt } = req.body;

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
    const text =
      response.choices[0]
        .message.content;

    const cleaned = text
  .replace(/```json/g, "")
  .replace(/```/g, "")
  .trim();

const parsed = JSON.parse(response.choices[0].message.content);

    res.status(200).json({
      result: parsed,
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      error: err.message,
    });
  }
}
