"use server";

import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
});

export async function careerChat(message) {
  const { userId } = await auth();

  const prompt = `
You are an AI Career Coach chatbot.

RULES:
- Reply ONLY to career-related questions.
- Always structure answers in bullet points.
- Keep answers short and clear.
- No paragraphs.
- No emojis except 1 max.
- If greeting, reply politely.
- If non-career question, say:
  "I can help only with career-related questions."

FORMAT STRICTLY LIKE THIS:

• Point 1  
• Point 2  
• Point 3  

User question:
"${message}"
`;

  const result = await model.generateContent(prompt);

  return result.response.text();
}
