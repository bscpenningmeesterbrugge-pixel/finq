import OpenAI from "openai";

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

    const response =
      await openai.chat.completions.create({
        model: "gpt-4o-mini",

        messages: [
          {
            role: "system",
            content:
              `
Maak multiple choice oefeningen.

Geef ALTIJD geldige JSON terug.

Formaat:

[
  {
    "question":"...",
    "options":[
      "...",
      "...",
      "...",
      "..."
    ],
    "correctAnswer":0
  }
]
`,
          },
          {
            role: "user",
            content: prompt,
          },
        ],

        temperature: 0.7,
      });

    const text =
      response.choices[0]
        .message.content;

    const cleaned = text
  .replace(/```json/g, "")
  .replace(/```/g, "")
  .trim();

const parsed = JSON.parse(cleaned);

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
