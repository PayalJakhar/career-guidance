"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { generateEmbedding, buildUserQueryText } from "@/lib/ml/embeddings";
import { cosineSimilarity } from "@/lib/ml/similarity";

export async function getRecommendedCourses({ filters = {} } = {}) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    select: {
      role: true,
      targetRole: true,
      targetLevel: true,
      industry: true,
      skills: true,
      industryInsight: {
        select: {
          recommendedSkills: true,
        },
      },
    },
  });

  if (!user) throw new Error("User not found");

  const recommendedSkills = user.industryInsight?.recommendedSkills || [];
  const userSkills = user.skills || [];
  const missingSkills = recommendedSkills.filter(
    (s) => !userSkills.some((us) => us.toLowerCase() === s.toLowerCase())
  );

  const queryText = buildUserQueryText({
    targetRole: user.targetRole,
    targetLevel: user.targetLevel,
    currentRole: user.role,
    industry: user.industry,
    skills: userSkills,
    missingSkills,
  });

  const userEmbedding = await generateEmbedding(queryText);

  const where = {};
  if (filters.category) where.category = filters.category;
  if (filters.level) where.level = filters.level;

  const courses = await db.course.findMany({ where });

  const scored = courses
    .map((course) => ({
      ...course,
      matchScore: Math.round(cosineSimilarity(userEmbedding, course.embedding) * 100),
    }))
    .sort((a, b) => b.matchScore - a.matchScore);

  return {
    courses: scored.slice(0, 20),
    userContext: {
      targetRole: user.targetRole,
      targetLevel: user.targetLevel,
      currentRole: user.role,
      industry: user.industry,
      missingSkills,
    },
  };
}

export async function getCourseFilters() {
  const categories = await db.course.findMany({
    select: { category: true },
    distinct: ["category"],
  });
  const levels = await db.course.findMany({
    select: { level: true },
    distinct: ["level"],
  });

  return {
    categories: categories.map((c) => c.category).sort(),
    levels: levels.map((l) => l.level),
  };
}
