"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { buildVocabulary, tokenize, vectorize, cosineUnit } from "@/lib/ml/tfidf";

function buildCourseText(course) {
  return [
    course.title,
    course.description,
    `Skills: ${course.skills.join(" ")}`,
    `Category: ${course.category}`,
    `Level: ${course.level}`,
  ].join(". ");
}

function buildUserQueryText({ targetRole, targetLevel, currentRole, industry, skills, missingSkills }) {
  const parts = [];
  if (targetRole) parts.push(`I want to become a ${targetRole}.`);
  if (targetLevel) parts.push(`Targeting ${targetLevel} level.`);
  if (currentRole) parts.push(`Currently working as ${currentRole}.`);
  if (industry) parts.push(`In the ${industry} industry.`);
  if (skills?.length) parts.push(`My existing skills: ${skills.join(", ")}.`);
  if (missingSkills?.length) {
    parts.push(`I need to learn: ${missingSkills.join(", ")}.`);
    parts.push(`${missingSkills.join(" ")} ${missingSkills.join(" ")}.`);
  }
  return parts.join(" ") || "General career development courses";
}

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
        select: { recommendedSkills: true },
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

  const where = {};
  if (filters.category) where.category = filters.category;
  if (filters.level) where.level = filters.level;

  const allCourses = await db.course.findMany({ where });

  if (allCourses.length === 0) {
    return {
      courses: [],
      userContext: {
        targetRole: user.targetRole,
        targetLevel: user.targetLevel,
        currentRole: user.role,
        industry: user.industry,
        missingSkills,
      },
    };
  }

  const courseTexts = allCourses.map(buildCourseText);
  const { vocab, idf, tokenized } = buildVocabulary(courseTexts);

  const courseVectors = tokenized.map((tokens) => vectorize(tokens, vocab, idf));
  const queryVector = vectorize(tokenize(queryText), vocab, idf);

  const scored = allCourses
    .map((course, i) => ({
      ...course,
      matchScore: Math.round(cosineUnit(queryVector, courseVectors[i]) * 100),
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
