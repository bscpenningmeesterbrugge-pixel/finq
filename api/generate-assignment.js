export default async function handler(req, res) {
  console.log("FUNCTION STARTED");

  try {
    const key = process.env.OPENAI_API_KEY;

    if (!key) {
      console.log("❌ NO API KEY FOUND");
      return res.status(500).json({ error: "Missing API key" });
    }

    console.log("KEY OK:", key.slice(0, 8));

    const response = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${key}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "user",
              content: "Maak 3 simpele btw oefeningen.",
            },
          ],
        }),
      }
    );

    console.log("STATUS:", response.status);

    const text = await response.text();
    console.log("RAW RESPONSE:", text);

    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      return res.status(500).json({
        error: "Invalid JSON from OpenAI",
        raw: text,
      });
    }

    return res.status(200).json({
      result: data.choices?.[0]?.message?.content,
    });
  } catch (err) {
    console.log("FATAL:", err);

    return res.status(500).json({
      error: err.message,
    });
  }
}
