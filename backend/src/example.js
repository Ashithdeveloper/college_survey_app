import { config } from "dotenv";
config();

import { GoogleGenerativeAI } from "@google/generative-ai";

const genai = new GoogleGenerativeAI({});

async function testGeminiAuth() {
  try {
    const response = await genai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ type: "text", text: "Hello world" }],
    });
    console.log("Authenticated! AI says:", response.text);
  } catch (error) {
    console.error("Authentication failed:", error);
  }
}

export default testGeminiAuth;

console.log("Using API Key:", process.env.GEMINI_API_KEY);
