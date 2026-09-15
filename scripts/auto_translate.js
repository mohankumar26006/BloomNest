const fs = require('fs');
const dotenv = require('dotenv');

dotenv.config({ path: '../.env' }); // Adjust path to point to your .env file

async function translateWithGrok(text, targetLanguage) {
  const apiKey = process.env.GROK_API_KEY;
  if (!apiKey) {
    console.error("Missing GROK_API_KEY in .env");
    process.exit(1);
  }

  const response = await fetch("https://api.x.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "grok-beta",
      messages: [
        { role: "system", content: `You are a professional software localization expert. Translate the given English UI text into ${targetLanguage}. Maintain any formatting like {week} or {count}. Return ONLY the translated text, nothing else.` },
        { role: "user", content: text }
      ],
      temperature: 0.3
    })
  });

  if (!response.ok) {
    throw new Error(`Grok API Error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0].message.content.trim();
}

// Usage Example:
// translateWithGrok("Emergency Triage", "Tamil").then(console.log);
