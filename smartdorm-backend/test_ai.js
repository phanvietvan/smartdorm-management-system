const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

async function testAI() {
  console.log("Testing Gemini AI...");
  const apiKey = process.env.GEMINI_API_KEY;
  console.log("API Key loaded (length):", apiKey ? apiKey.length : 0);

  if (!apiKey) {
    console.error("❌ No API Key found in .env");
    return;
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    
    console.log("Listing models...");
        const modelName = "gemini-2.0-flash";
        console.log(`Trying ${modelName}...`);
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Hi");
            const response = await result.response;
            console.log(`✅ ${modelName} works! Response:`, response.text());
        } catch (e) {
            console.log(`❌ ${modelName} failed:`, e.message);
        }

  } catch (err) {
    console.error("❌ AI Error:", err.message);
  }
}

testAI();
