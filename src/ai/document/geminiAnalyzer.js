import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const analyze = async (files, fcn) => {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `Analyze these files for FCN ${fcn}. Return JSON status, decision, and reason.`;
    
    // Add logic to prepare file parts as base64 and send to Gemini
    const result = await model.generateContent([prompt, ...formattedFiles]);
    return JSON.parse(result.response.text());
};