const USE_MOCK_AI = true; // 👈 BOVENAAN DEFINIEREN

export default async function handler(req, res) {
  try {
    console.log("AI MODE:", USE_MOCK_AI ? "MOCK" : "OPENAI");

    // 🟢 MOCK MODE
    if (USE_MOCK_AI) {
      return res.status(200).json({
        ok: true,
        result: {
          questions: [
            {
              question: "Wat betekent BTW?",
              options: [
                "Belasting Toegevoegde Waarde",
                "Bank Transfer Waarde",
                "Basis Totale Winst",
                "Belasting Technische Waarde"
              ],
              correct: 0
            },
            {
              question: "Hoeveel is 21% van 100?",
              options: ["10", "21", "15", "50"],
              correct: 1
            },
            {
              question: "BTW is een ...",
              options: ["belasting", "lening", "subsidie", "bonus"],
              correct: 0
            }
          ]
        }
      });
    }

    // 🔴 REAL OPENAI MODE
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
          temperature: 0.2,
          messages: [
            {
              role: "user",
              content: "Maak 3 multiple choice btw oefeningen in JSON format"
            }
          ],
        }),
      }
    );

    const data = await response.json();

    return res.status(200).json({
      ok: true,
      result: data.choices?.[0]?.message?.content,
    });

  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: err.message });
  }
}
