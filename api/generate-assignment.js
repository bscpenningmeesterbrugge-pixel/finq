import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default function handler(req, res) {
  return res.status(200).json({ ok: true });
}

// fallback zodat frontend nooit crasht
function fallbackResponse(prompt) {
  return {
    ok: true,
    result: {
      questions: [
        {
          question: `Wat is een basisbegrip rond: ${prompt}?`,
          options: ["A", "B", "C", "D"],
          correct: 0,
        },
        {
          question: `Welke stelling past bij: ${prompt}?`,
          options: ["A", "B", "C", "D"],
          correct: 1,
        },
        {
          question: `Toepassing van: ${prompt}?`,
          options: ["A", "B", "C", "D"],
          correct: 2,
        },
      ],
    },
  };
}

// veilige JSON parser
function safeParse(text) {
  try {
    return JSON.parse(text);
  } catch (e) {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("No JSON found");
    return JSON.parse(match[0]);
  }
}

// validatie
function validate(data) {
  if (!data?.questions || !Array.isArray(data.questions)) {
    throw new Error("Invalid structure");
  }

  return data;
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
    let attempts = 0;
    let lastError = null;

    while (attempts < 2) {
      attempts++;

      try {
        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          temperature: 0.2,

          // 🔥 BELANGRIJK: force JSON output
          response_format: { type: "json_object" },

          messages: [
            {
              role: "system",
              content:
                "Je bent een docent-assistent. Geef enkel geldige JSON terug. Geen tekst, geen markdown.",
            },
            {
              role: "user",
              content: `
Maak 3 multiple choice vragen over: ${prompt}

Formaat:
{
  "questions": [
    {
      "question": "string",
      "options": ["A","B","C","D"],
      "correct": 0
    }
  ]
}
              `,
            },
          ],
        });

        const text = completion.choices?.[0]?.message?.content;

        if (!text) throw new Error("Empty response");

        const parsed = validate(safeParse(text));

        return res.status(200).json({
          ok: true,
          result: parsed,
        });
      } catch (err) {
        lastError = err;
        console.log("Attempt failed:", err.message);
      }
    }

    // fallback als AI faalt
    console.log("AI failed, using fallback:", lastError?.message);

    return res.status(200).json(fallbackResponse(prompt));
  } catch (err) {
    console.error("FATAL AI ERROR:", err);

    return res.status(500).json({
      error: "AI service crashed",
      details: err.message,
    });
  }
}
