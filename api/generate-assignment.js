export default async function handler(
  req,
  res
) {
  try {
    const response = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",

          Authorization:
            `Bearer ${process.env.OPENAI_API_KEY}`,
        },

        body: JSON.stringify({
          model: "gpt-4o-mini",

          messages: [
            {
              role: "user",
              content:
                "Maak 3 simpele btw oefeningen.",
            },
          ],
        }),
      }
    );

    const data =
      await response.json();

    console.log(data);

    // EXTRA CHECK
    if (!response.ok) {
      return res.status(500).json({
        error:
          data.error?.message ||
          "OpenAI fout",
      });
    }

    res.status(200).json({
      result:
        data.choices[0].message.content,
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      error: err.message,
    });
  }
}
