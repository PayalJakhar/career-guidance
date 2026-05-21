import { PrismaClient } from "@prisma/client";
import { COURSES } from "./courses-data.js";
import { config } from "dotenv";

config();

const db = new PrismaClient();

async function main() {
  console.log(`Seeding ${COURSES.length} courses...`);

  await db.course.deleteMany({});
  console.log("Cleared existing courses.");

  let seeded = 0;
  for (const course of COURSES) {
    try {
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
          embedding: [],
        },
      });

      seeded++;
      console.log(`[${seeded}/${COURSES.length}] Seeded: ${course.title}`);
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
