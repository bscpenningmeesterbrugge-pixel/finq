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
"Je bent een leerkracht die oefeningen maakt in JSON formaat.",
},
{
role: "user",
content: `
Maak 5 multiple choice oefeningen.

Onderwerp:
${req.body.prompt}

Geef ENKEL geldige JSON terug.

Voorbeeld:

[
{
"question":"Wat is 21% van 100?",
"options":["10","21","50"],
"answer":"21"
}
]
`,
},
],
temperature: 0.7,
}),
}
);

```
const data = await response.json();

console.log(data);

const result =
  data.choices?.[0]?.message?.content;

res.status(200).json({
  result,
});
```

} catch (err) {
console.log(err);

```
res.status(500).json({
  error: err.message,
});
```

}
}
