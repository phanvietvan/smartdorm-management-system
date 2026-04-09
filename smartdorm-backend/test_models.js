const { GoogleAutomatedAI, GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

async function listModels() {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    try {
        // const result = await genAI.listModels();
        // The above is older SDK. New SDK:
        // Actually, just try to generate content with a known model
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
        const result = await model.generateContent("Hello");
        console.log("Success:", result.response.text());
    } catch (e) {
        console.log("Error listing models:", e.message);
    }
}
listModels();
