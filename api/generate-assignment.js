export default async function handler(req, res) {
  try {
    const response = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content:
                "Maak een multiple choice quiz in JSON formaat.",
            },
            {
              role: "user",
              content: req.body.prompt,
            },
          ],
          temperature: 0.7,
        }),
      }
    );

    const data = await response.json();

    console.log(data);

    const text =
      data.choices?.[0]?.message?.content;

    let parsed = [];

    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = [
        {
          question: text,
          options: [],
        },
      ];
    }

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
