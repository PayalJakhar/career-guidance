import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const embeddingModel = genAI.getGenerativeModel({ model: "models/text-embedding-004" });

export async function generateEmbedding(text) {
  const result = await embeddingModel.embedContent(text);
  return result.embedding.values;
}

export function buildCourseText(course) {
  return [
    course.title,
    course.description,
    `Skills: ${course.skills.join(", ")}`,
    `Category: ${course.category}`,
    `Level: ${course.level}`,
  ].join(". ");
}

export function buildUserQueryText({ targetRole, targetLevel, currentRole, industry, skills, missingSkills }) {
  const parts = [];
  if (targetRole) parts.push(`I want to become a ${targetRole}.`);
  if (targetLevel) parts.push(`Targeting ${targetLevel} level.`);
  if (currentRole) parts.push(`Currently working as ${currentRole}.`);
  if (industry) parts.push(`In the ${industry} industry.`);
  if (skills?.length) parts.push(`My existing skills: ${skills.join(", ")}.`);
  if (missingSkills?.length) parts.push(`I need to learn: ${missingSkills.join(", ")}.`);
  return parts.join(" ") || "General career development courses";
}
