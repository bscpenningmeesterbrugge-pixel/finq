export default async function handler(req, res) {
  try {
    return res.status(200).json({
      ok: true,
      method: req.method,
      hasBody: !!req.body,
      body: req.body,
      openaiKeyExists: !!process.env.OPENAI_API_KEY,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      error: err.message,
    });
  }
}
