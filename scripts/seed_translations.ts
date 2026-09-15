import { PrismaClient } from '@prisma/client';
import { TRANSLATIONS } from '../src/data/translations';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const prisma = new PrismaClient();
const apiKey = process.env.GROK_API_KEY;
const LANGUAGES = ['hi', 'ta', 'te', 'mr', 'bn'];
const CHUNK_SIZE = 40;

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

async function main() {
  const enKeys = Object.keys(TRANSLATIONS.en);

  for (const lang of LANGUAGES) {
    console.log(`\n--- Seeding ${lang} ---`);
    
    // Check what we already have in DB
    const existing = await prisma.translation.findMany({ where: { language: lang } });
    const existingKeys = new Set(existing.map(e => e.key));
    
    // Find missing keys
    const missingKeys = enKeys.filter(k => !existingKeys.has(k));
    if (missingKeys.length === 0) {
      console.log(`All keys for ${lang} are already in DB!`);
      continue;
    }

    console.log(`Need to translate ${missingKeys.length} keys for ${lang}...`);

    const targetLanguage = lang === "ta" ? "Tamil" : 
                           lang === "hi" ? "Hindi" : 
                           lang === "te" ? "Telugu" : 
                           lang === "mr" ? "Marathi" : 
                           lang === "bn" ? "Bengali" : lang;

    for (let i = 0; i < missingKeys.length; i += CHUNK_SIZE) {
      const chunkKeys = missingKeys.slice(i, i + CHUNK_SIZE);
      const chunkDict: Record<string, string> = {};
      chunkKeys.forEach(k => { chunkDict[k] = TRANSLATIONS.en[k]; });

      console.log(`Translating chunk ${i / CHUNK_SIZE + 1} of Math.ceil(${missingKeys.length / CHUNK_SIZE}) for ${lang}...`);

      const systemInstruction = `You are a professional localization expert. Translate the following JSON object's values into ${targetLanguage}.
CRITICAL RULES:
1. Return ONLY valid JSON.
2. Keep the EXACT same keys.
3. Keep all placeholders like {week} exactly as they are.`;

      let success = false;
      let retries = 0;

      while (!success && retries < 5) {
        try {
          const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
            body: JSON.stringify({
              model: "llama-3.3-70b-versatile",
              messages: [
                { role: "system", content: systemInstruction },
                { role: "user", content: JSON.stringify(chunkDict, null, 2) }
              ],
              temperature: 0.1,
              response_format: { type: "json_object" }
            })
          });

          if (!response.ok) {
            const err = await response.text();
            if (err.includes("rate_limit") || response.status === 429) {
              console.log(`Rate limit hit. Waiting 12 seconds... (Retry ${retries + 1}/5)`);
              await delay(12000);
              retries++;
              continue;
            }
            throw new Error(err);
          }

          const data = await response.json();
          const translatedChunk = JSON.parse(data.choices[0].message.content);
          
          const createData = Object.entries(translatedChunk).map(([key, value]) => ({
            language: lang,
            key,
            value: String(value)
          }));

          await prisma.translation.createMany({ data: createData, skipDuplicates: true });
          console.log(`Saved ${createData.length} keys to DB.`);
          success = true;
          
          // Wait 3 seconds between successful chunks to avoid hitting TPM limit
          await delay(3000); 
        } catch (e) {
          console.error("Error on chunk:", e);
          retries++;
          await delay(5000);
        }
      }
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
