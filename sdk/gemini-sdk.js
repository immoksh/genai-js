import { GoogleGenAI } from "@google/genai";
import 'dotenv/config'
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({apiKey: GEMINI_API_KEY});

async function init() {
    const result = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: "Why is the sky blue?"
    });

    console.log(result.text)
}

init()