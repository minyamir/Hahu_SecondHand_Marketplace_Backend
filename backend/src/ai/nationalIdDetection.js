import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";
import path from "path";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const prepareFileForAI = (fileArray) => {
    if (!fileArray || fileArray.length === 0) return null;
    const file = fileArray[0];
    const data = fs.readFileSync(file.path).toString("base64");
    return { inlineData: { mimeType: "image/jpeg", data } };
};

export const performDeepAudit = async (files, registeredName) => {
    const model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite-preview" }); // Standardized model

  const prompt = `
    You are a Forensic Document Auditor for HaHu Market.
    Analyze the provided ID documents.
    
    1. Extract the Full Name and FCN from 'idFront'.
    2. Perform Fuzzy Name Comparison: Calculate a match percentage (0-100) between 
       the ID name and "${registeredName}". 
       - 90-100%: High Confidence Match (Exact or minor typo).
       - 70-89%: Possible Match (Phonetic or transliteration differences).
       - <70%: Mismatch.
    3. Return ONLY valid JSON:
    {
        "fullNameOnId": "string",
        "fcnNumber": "string",
        "nameMatchScore": number, 
        "documentAuthentic": boolean,
        "reason": "Detailed forensic report including explanation of name similarity"
    }
`;
const parts = [
        { text: prompt },
        prepareFileForAI(files.idFront),
        prepareFileForAI(files.idBack)
    ].filter(part => part !== null);
  try {
        const result = await model.generateContent({ 
            contents: [{ role: "user", parts }],
            // Removed responseMimeType: "application/json" to prevent strict-mode formatting errors
            generationConfig: { temperature: 0.2 } 
        });
        
        let responseText = result.response.text();
        
        // 1. STRIP MARKDOWN BACKTICKS AND EXTRA TEXT
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error("No JSON found in AI response");
        }
        
        const audit = JSON.parse(jsonMatch[0]);

        // 2. Logic remains the same
        const isHighConfidence = (audit.nameMatchScore || 0) >= 85 && audit.documentAuthentic === true;

        return { 
            ...audit, 
            success: isHighConfidence,
            decision: isHighConfidence ? "PASS" : "FLAG"
        };

    } catch (error) {
        // 3. LOG THE ACTUAL ERROR TO HELP US SEE WHY
        console.error("Forensic Audit Error:", error.message);
        return { success: false, reason: "Forensic audit failed.", decision: "FLAG" };
    }
};