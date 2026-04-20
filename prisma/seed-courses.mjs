import { PrismaClient } from "@prisma/client";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { COURSES } from "./courses-data.js";
import { config } from "dotenv";

config();

const db = new PrismaClient();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const embeddingModel = genAI.getGenerativeModel({ model: "models/text-embedding-004" });

function buildCourseText(course) {
  return [
    course.title,
    course.description,
    `Skills: ${course.skills.join(", ")}`,
    `Category: ${course.category}`,
    `Level: ${course.level}`,
  ].join(". ");
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  console.log(`Seeding ${COURSES.length} courses with ML embeddings...`);

  await db.course.deleteMany({});
  console.log("Cleared existing courses.");

  let seeded = 0;
  for (const course of COURSES) {
    try {
      const text = buildCourseText(course);
      const result = await embeddingModel.embedContent(text);
      const embedding = result.embedding.values;

      await db.course.create({
        data: {
          title: course.title,
          description: course.description,
          platform: course.platform,
          provider: course.provider || null,
          url: course.url,
          level: course.level,
          duration: course.duration || null,
          price: course.price || null,
          rating: course.rating || null,
          skills: course.skills,
          category: course.category,
          embedding,
        },
      });

      seeded++;
      console.log(`[${seeded}/${COURSES.length}] Seeded: ${course.title}`);
      await sleep(150);
    } catch (error) {
      console.error(`Failed to seed "${course.title}":`, error.message);
    }
  }

  console.log(`\nDone! Seeded ${seeded}/${COURSES.length} courses.`);
  await db.$disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
