export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed",
    });
  }

  try {
    const { prompt } = req.body;

    const response = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4.1-mini",
          messages: [
            {
              role: "system",
              content:
                "Je bent een onderwijs AI die oefeningen genereert in JSON formaat.",
            },
            {
              role: "user",
              content: `
Genereer 5 multiple choice oefeningen.

Onderwerp:
${prompt}

Geef enkel JSON terug in dit formaat:

[
  {
    "question": "...",
    "options": ["...", "...", "..."],
    "correctAnswer": 0
  }
]
`,
            },
          ],
          temperature: 0.7,
        }),
      }
    );

    const data = await response.json();

    const content =
      data.choices[0].message.content;

    res.status(200).json({
      result: JSON.parse(content),
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      error: "AI generation failed",
    });
  }
}
