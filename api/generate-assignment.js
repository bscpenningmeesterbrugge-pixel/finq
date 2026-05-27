export default async function handler(req, res) {
  console.log("FUNCTION START");

  try {
    console.log("OPENAI KEY:", process.env.OPENAI_API_KEY);

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
              role: "user",
              content: "Maak 3 simpele btw oefeningen.",
            },
          ],
        }),
      }
    );

    console.log("OPENAI STATUS:", response.status);

    const data = await response.json();

    console.log("OPENAI DATA:", data);

    res.status(200).json({
      result: data.choices?.[0]?.message?.content,
    });
  } catch (err) {
    console.log("SERVER ERROR:", err);

    res.status(500).json({
      error: err.message,
    });
  }
}
