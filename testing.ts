// The client gets the API key from the environment variable `GEMINI_API_KEY`.
require('dotenv').config();

async function main() {
  const { GoogleGenAI } = await import('@google/genai');
  const ai = new GoogleGenAI({});

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: 'Explain how AI works in a few words',
  });
  console.log(response.text);
}

main();
