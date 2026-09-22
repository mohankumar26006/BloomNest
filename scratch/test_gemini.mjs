import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

async function test() {
  const key = (process.env.GEMINI_API_KEY || '').replace(/^["']|["']$/g, '');
  console.log('Testing with key:', key.slice(0, 10) + '...');
  try {
    const ai = new GoogleGenAI({ apiKey: key });
    const models = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];
    for (const m of models) {
      try {
        console.log('Trying model:', m);
        const res = await ai.models.generateContent({
          model: m,
          contents: 'Say Hello in one word'
        });
        console.log(`Success on ${m}:`, res.text);
        return;
      } catch (err) {
        console.log(`Failed on ${m}:`, err.message || err);
      }
    }
  } catch (e) {
    console.error('Overall error:', e);
  }
}

test();
