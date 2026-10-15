import dotenv from 'dotenv';
dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.log('No key found');
  process.exit(1);
}

async function listModels() {
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await res.json();
    if (data.models) {
      console.log('Available models for generateContent:');
      data.models
        .filter(m => m.supportedGenerationMethods && m.supportedGenerationMethods.includes('generateContent'))
        .forEach(m => console.log(`- ${m.name} (${m.displayName})`));
    } else {
      console.log('Response:', JSON.stringify(data));
    }
  } catch (err) {
    console.error('Fetch error:', err.message);
  }
}

listModels();
