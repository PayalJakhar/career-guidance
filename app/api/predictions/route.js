import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { computeRuleBasedGap } from "@/lib/ml/skill-rules";
import { predictSkillMatchScore, buildPredictionTimeline, computeMAE, modelWeights } from "@/lib/ml/predict-skill-gap";
import { buildVocabulary, tokenize, vectorize, cosineUnit } from "@/lib/ml/tfidf";

async function getTopRecommendedCourseIds(user, k = 5) {
  const allCourses = await db.course.findMany({ take: 100 });
  if (!allCourses.length) return [];

  const { missingSkills } = computeRuleBasedGap(user.skills || [], user.targetRole || "");
  const queryText = `${user.targetRole || ""} ${(missingSkills.length ? missingSkills : [user.targetRole || ""]).join(" ")}`;
  const courseTexts = allCourses.map((c) => `${c.title} ${c.description} ${c.skills.join(" ")}`);
  const { vocab, idf, tokenized } = buildVocabulary(courseTexts);
  const courseVectors = tokenized.map((t) => vectorize(t, vocab, idf));
  const qVec = vectorize(tokenize(queryText), vocab, idf);

  return allCourses
    .map((c, i) => ({ id: c.id, score: cosineUnit(qVec, courseVectors[i]) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, k)
    .map((c) => c.id);
}

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
      select: {
        id: true,
        skills: true,
        experience: true,
        role: true,
        targetRole: true,
        targetLevel: true,
        industry: true,
      },
    });

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const assessments = await db.assessment.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "asc" },
    });

    // --- Skill Gap Accuracy ---
    const ruleGap = computeRuleBasedGap(user.skills || [], user.targetRole || "");
    const actualMatch = ruleGap.similarityScore;
    const predictedMatch = predictSkillMatchScore({
      experience: user.experience || 0,
      assessments,
      role:       user.role || "",
      targetRole: user.targetRole || "",
    });
    const mae = computeMAE(predictedMatch, actualMatch);
    const timeline = buildPredictionTimeline({
      role:       user.role || "",
      targetRole: user.targetRole || "",
      experience: user.experience || 0,
      assessments,
    });

    // Feature values used by the model (4 features)
    const avgQuizScore = assessments.length > 0
      ? Math.round(assessments.reduce((s, a) => s + a.quizScore, 0) / assessments.length)
      : 50;
    const expContribution = Math.round(Math.min((user.experience || 0) / 10, 1) * 100);
    const quizzesTaken = assessments.length;
    const roleWords   = (user.role || "").toLowerCase().trim().split(/\s+/).filter(Boolean);
    const targetWords = (user.targetRole || "").toLowerCase().trim().split(/\s+/).filter(Boolean);
    const overlap = roleWords.filter(w => targetWords.some(t => t.includes(w) || w.includes(t))).length;
    const roleSimilarity = roleWords.length > 0 && targetWords.length > 0
      ? Math.round((overlap / Math.max(roleWords.length, targetWords.length)) * 100)
      : 50;

    // --- Recommendation Accuracy ---
    let interactedCourseIds = [];
    let precision3 = null;
    let precision5 = null;
    let topRecommendedIds = [];

    try {
      const interactions = await db.courseInteraction.findMany({
        where: { userId: user.id },
        select: { courseId: true },
      });
      interactedCourseIds = [...new Set(interactions.map((i) => i.courseId))];

      if (interactedCourseIds.length > 0) {
        topRecommendedIds = await getTopRecommendedCourseIds(user, 5);
        const top3 = topRecommendedIds.slice(0, 3);
        const top5 = topRecommendedIds.slice(0, 5);
        const hits3 = top3.filter((id) => interactedCourseIds.includes(id)).length;
        const hits5 = top5.filter((id) => interactedCourseIds.includes(id)).length;
        precision3 = Math.round((hits3 / Math.max(top3.length, 1)) * 100);
        precision5 = Math.round((hits5 / Math.max(top5.length, 1)) * 100);
      }
    } catch (_) {
      // CourseInteraction table may not exist yet — handled gracefully
    }

    return NextResponse.json({
      modelInfo: {
        trainSamples: modelWeights.train_samples,
        testMAE: modelWeights.test_mae,
        testR2: modelWeights.test_r2,
        note: modelWeights.note,
      },
      skillGapAccuracy: {
        predictedMatch,
        actualMatch,
        mae,
        matchedRole: ruleGap.matchedRole,
        featureContributions: {
          quizPerformance: avgQuizScore,
          experienceFactor: expContribution,
          quizzesTaken,
          roleSimilarity,
        },
        timeline,
      },
      recommendationAccuracy: {
        precision3,
        precision5,
        interactedCount: interactedCourseIds.length,
        topRecommendedIds,
        interactedCourseIds,
      },
    });
  } catch (error) {
    console.error("Predictions error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
