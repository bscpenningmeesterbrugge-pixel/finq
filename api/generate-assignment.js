export default async function handler(req, res) {
  try {
    console.log("METHOD:", req.method);
    console.log("BODY:", req.body);

    if (req.method !== "POST") {
      return res.status(405).json({ error: "Only POST allowed" });
    }

    const { prompt } = req.body || {};

    if (!prompt) {
      return res.status(400).json({ error: "Missing prompt" });
    }

    return res.status(200).json({
      ok: true,
      result: {
        questions: [
          {
            question: "Wat is 2 + 2?",
            options: ["3", "4", "5"],
          },
        ],
      },
    });
  } catch (err) {
    console.error("ERROR:", err);
    return res.status(500).json({
      error: err.message,
    });
  }
}
