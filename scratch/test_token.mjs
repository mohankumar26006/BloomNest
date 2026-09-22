import dotenv from 'dotenv';
dotenv.config();

async function testToken() {
  const token = (process.env.GEMINI_API_KEY || '').replace(/^["']|["']$/g, '');
  console.log('Testing token with Bearer header...');
  try {
    const res = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: 'Say Hello' }] }]
      })
    });
    console.log('Status:', res.status, res.statusText);
    const data = await res.json();
    console.log('Response:', JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Fetch error:', err);
  }
}

testToken();
