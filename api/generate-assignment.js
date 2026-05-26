import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  try {
    const { prompt } = req.body;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: `
Maak 3 multiple choice vragen over: ${prompt}

Geef JSON terug zoals:
{
  "questions": [
    {
      "question": "...",
      "options": ["A", "B", "C"]
    }
  ]
}
          `,
        },
      ],
    });

    const text = response.choices[0].message.content;

    const json = JSON.parse(text);

    return res.status(200).json({
      ok: true,
      result: json,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      error: err.message,
    });
  }
}
