const { GoogleAutomatedAI, GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

async function listModels() {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    try {
        const result = await genAI.getGenerativeModel({ model: "gemini-1.5-flash" }).listModels();
        // SDK can sometimes be used to list models
        console.log("Models:", JSON.stringify(result, null, 2));
    } catch (e) {
        console.log("Error listing models:", e.message);
    }
}
listModels();
