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
Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
},
body: JSON.stringify({
model: "gpt-4o-mini",
messages: [
{
role: "system",
content:
"Je bent een leerkracht die oefeningen maakt.",
},
{
role: "user",
content: `
Maak 5 multiple choice oefeningen in JSON formaat.

Onderwerp:
${req.body.prompt}

Geef enkel geldige JSON terug.

Voorbeeld:
[
{
"question":"Wat is 21% btw op 100 euro?",
"options":["10","21","50"],
"answer":"21"
}
]
`,
},
],
}),
}
);

```
const data =
  await response.json();

const result =
  data.choices?.[0]?.message?.content;

res.status(200).json({
  result,
});
```

} catch (err) {
res.status(500).json({
error: err.message,
});
}
}
