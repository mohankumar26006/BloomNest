async function testPollinations() {
  console.log('Testing Pollinations AI text endpoint...');
  const prompt = `You are "BloomNest Nutrition AI", an evidence-based, medically cautious pregnancy nutrition assistant for an expectant mother (Trimester 2).

Target User Query: "Can I eat pineapple during pregnancy?"

CRITICAL RULES:
1. Output STRICT VALID JSON ONLY matching this exact schema:
{
  "foodName": "Food or Dish Name",
  "safetyStatus": "SAFE" | "MODERATION" | "AVOID" | "UNKNOWN",
  "summary": "Clear, reassuring pregnancy dietary explanation",
  "nutrition": {
    "servingSize": "e.g. 1 cup (150g)",
    "calories": 250,
    "proteinG": 12,
    "ironMg": 2.5,
    "calciumMg": 180,
    "folateMcg": 90,
    "carbsG": 30,
    "fiberG": 4
  },
  "benefits": ["Benefit 1", "Benefit 2"],
  "considerations": ["Consideration 1", "Consideration 2"],
  "recommendation": "BloomNest practical dietary suggestion",
  "foodSafety": "Preparation/safety guideline",
  "sources": [
    { "title": "ACOG Maternal Nutrition Guidelines", "source": "ACOG Practice Bulletin" }
  ]
}

DO NOT Output Markdown Code Blocks. Output raw valid JSON only.`;

  try {
    const t0 = Date.now();
    const res = await fetch('https://text.pollinations.ai/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: prompt },
          { role: 'user', content: 'Can I eat pineapple during pregnancy?' }
        ],
        model: 'openai',
        jsonMode: true
      })
    });
    const text = await res.text();
    console.log(`Took ${Date.now() - t0}ms`);
    console.log('Raw text:', text);
    try {
      const parsed = JSON.parse(text.replace(/```json/gi, '').replace(/```/g, '').trim());
      console.log('Parsed successfully:', Object.keys(parsed));
      console.log('safetyStatus:', parsed.safetyStatus);
      console.log('nutrition:', parsed.nutrition);
    } catch (e) {
      console.error('Failed to parse JSON:', e.message);
    }
  } catch (err) {
    console.error('Fetch error:', err);
  }
}

testPollinations();
