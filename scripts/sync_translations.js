import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config();

const API_KEY = process.env.GROK_API_KEY; // The Groq API key is stored here

async function translateMissing(text, targetLangName) {
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${API_KEY}`
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: `You are a software localization expert. Translate the given English UI text into ${targetLangName}. Maintain any formatting like {week} or {count}. Return ONLY the translated text.` },
        { role: "user", content: text }
      ],
      temperature: 0.3
    })
  });

  if (!response.ok) {
    throw new Error(`Groq API Error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0].message.content.trim().replace(/"/g, '\\"');
}

async function run() {
  const filePath = path.resolve('./src/data/translations.ts');
  let content = fs.readFileSync(filePath, 'utf-8');

  // Extract English keys
  const enBlockMatch = content.match(/en:\s*\{([\s\S]*?)\},\n\s+hi:/);
  if (!enBlockMatch) {
    console.log("Could not parse EN block");
    return;
  }

  const enBlock = enBlockMatch[1];
  const enKeys = [];
  const enKeyMap = {};
  const keyRegex = /^\s*([a-zA-Z0-9_]+):\s*"(.*?)",?$/gm;
  let match;
  while ((match = keyRegex.exec(enBlock)) !== null) {
    enKeys.push(match[1]);
    enKeyMap[match[1]] = match[2];
  }

  const languages = [
    { code: 'hi', name: 'Hindi' },
    { code: 'ta', name: 'Tamil' },
    { code: 'te', name: 'Telugu' },
    { code: 'mr', name: 'Marathi' },
    { code: 'bn', name: 'Bengali' }
  ];

  for (const lang of languages) {
    const langRegex = new RegExp(`(${lang.code}:\\s*\\{[\\s\\S]*?\\})(\\n\\s+(?:ta|te|mr|bn):|\\n\\})`);
    const langMatch = content.match(langRegex);
    if (!langMatch) {
      console.log(`Could not parse ${lang.code} block`);
      continue;
    }

    const langBlock = langMatch[1];
    const langKeys = new Set();
    const existingKeyRegex = /^\s*([a-zA-Z0-9_]+):/gm;
    let m;
    while ((m = existingKeyRegex.exec(langBlock)) !== null) {
      langKeys.add(m[1]);
    }

    const missing = enKeys.filter(k => !langKeys.has(k));
    if (missing.length > 0) {
      console.log(`Translating ${missing.length} keys for ${lang.name}...`);
      let appendedContent = "\n    // --- AI Auto Translations ---\n";
      for (const key of missing) {
        console.log(` Translating key: ${key}`);
        const englishText = enKeyMap[key];
        try {
          const translated = await translateMissing(englishText, lang.name);
          appendedContent += `    ${key}: "${translated}",\n`;
          // Prevent rate limits
          await new Promise(r => setTimeout(r, 600)); 
        } catch (e) {
          console.error(`Failed to translate ${key}:`, e);
        }
      }

      // Inject the translations at the end of the block
      const updatedBlock = langBlock.replace(/\s*\}$/, '') + appendedContent + "  }";
      content = content.replace(langBlock, updatedBlock);
    } else {
      console.log(`${lang.name} is fully translated.`);
    }
  }

  fs.writeFileSync(filePath, content, 'utf-8');
  console.log("All translations updated successfully!");
}

run();
