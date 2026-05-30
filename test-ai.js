import { GoogleGenerativeAI } from "@google/generative-ai"; // Updated import name for standard SDK
import dotenv from "dotenv";

dotenv.config();

async function haHuModelCheck() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return console.error("❌ No GEMINI_API_KEY found in your .env file.");

    const genAI = new GoogleGenerativeAI(apiKey);

    const targets = [
        "gemini-3.1-flash-lite-preview", 
        "gemini-3-flash-preview",       
        "gemini-2.0-flash",              
        "gemini-1.5-flash"           
    ];

    console.log("🚀 Testing models for HaHu Market Biometrics... it is working or not");

    for (const modelId of targets) {
        try {
            process.stdout.write(`📡 Probing ${modelId}... `);
            
            // 1. Get the model
            const model = genAI.getGenerativeModel({ model: modelId });

            // 2. Generate content (Missing in your previous snippet)
            const result = await model.generateContent("Ping check for biometric audit system.");
            const response = await result.response;

            // 3. Extract text safely
            const responseText = typeof response.text === 'function' 
                ? response.text() 
                : response.text;

            if (responseText) {
                console.log(`✅ WORKING!`);
                console.log(`📝 AI Response: "${responseText.trim()}"`);
                console.log(`-----------------------------------------------`);
                console.log(`👉 FIX: Use this model in your app: "${modelId}"`);
                return; 
            }
        } catch (error) {
            if (error.message.includes("404") || error.message.includes("not found")) {
                console.log(`❌ Not Found.`);
            } else if (error.message.includes("429") || error.message.includes("limit")) {
                console.log(`⚠️ Busy (Rate Limit).`);
            } else if (error.message.includes("503") || error.message.includes("overloaded")) {
                console.log(`🔥 Model Overloaded.`);
            } else {
                console.log(`❌ Error: ${error.message.split('\n')[0]}`);
            }
        }
    }
    
    console.log("\n⚠️ No high-performance models responded. Check your API Key permissions in Google AI Studio.");
}

haHuModelCheck();
