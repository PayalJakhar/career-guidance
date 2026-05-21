import { db } from "@/lib/prisma";
import { inngest } from "./client";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { computeRuleBasedGap } from "@/lib/ml/skill-rules";
import { buildVocabulary, tokenize, vectorize, cosineUnit } from "@/lib/ml/tfidf";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export const runCareerPipeline = inngest.createFunction(
  { name: "Career Pipeline Agent", id: "career-pipeline" },
  { event: "user/profile.completed" },
  async ({ event, step }) => {
    const { clerkUserId } = event.data;

    const user = await step.run("fetch-user-profile", async () => {
      return await db.user.findUnique({
        where: { clerkUserId },
        select: {
          id: true,
          clerkUserId: true,
          skills: true,
          targetRole: true,
          targetLevel: true,
          role: true,
          industry: true,
        },
      });
    });

    if (!user || !user.targetRole) {
      return { status: "skipped", reason: "incomplete profile" };
    }

    const gapResult = await step.run("compute-rule-based-gap", async () => {
      return computeRuleBasedGap(user.skills || [], user.targetRole);
    });

    const topCourses = await step.run("recommend-courses-tfidf", async () => {
      const allCourses = await db.course.findMany({ take: 100 });
      if (!allCourses.length) return [];

      const missingSkills = gapResult.missingSkills.length
        ? gapResult.missingSkills
        : [user.targetRole];

      const queryText = `${user.targetRole} ${missingSkills.join(" ")}`;
      const courseTexts = allCourses.map(
        (c) => `${c.title} ${c.description} ${c.skills.join(" ")}`
      );
      const { vocab, idf, tokenized } = buildVocabulary(courseTexts);
      const courseVectors = tokenized.map((t) => vectorize(t, vocab, idf));
      const qVec = vectorize(tokenize(queryText), vocab, idf);

      return allCourses
        .map((c, i) => ({
          title: c.title,
          score: Math.round(cosineUnit(qVec, courseVectors[i]) * 100),
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);
    });

    return {
      status: "completed",
      clerkUserId,
      skillGapSummary: {
        matchedRole: gapResult.matchedRole,
        similarityScore: gapResult.similarityScore,
        missingSkillsCount: gapResult.missingSkills.length,
      },
      topCourseRecommendations: topCourses,
    };
  }
);

export const generateIndustryInsights = inngest.createFunction(
  { name: "Generate Industry Insights" },
  { cron: "0 0 * * 0" }, // Run every Sunday at midnight
  async ({ event, step }) => {
    const industries = await step.run("Fetch industries", async () => {
      return await db.industryInsight.findMany({
        select: { industry: true },
      });
    });

    for (const { industry } of industries) {
      const prompt = `
          Analyze the current state of the ${industry} industry and provide insights in ONLY the following JSON format without any additional notes or explanations:
          {
            "salaryRanges": [
              { "role": "string", "min": number, "max": number, "median": number, "location": "string" }
            ],
            "growthRate": number,
            "demandLevel": "High" | "Medium" | "Low",
            "topSkills": ["skill1", "skill2"],
            "marketOutlook": "Positive" | "Neutral" | "Negative",
            "keyTrends": ["trend1", "trend2"],
            "recommendedSkills": ["skill1", "skill2"]
          }
          
          IMPORTANT: Return ONLY the JSON. No additional text, notes, or markdown formatting.
          Include at least 5 common roles for salary ranges.
          Growth rate should be a percentage.
          Include at least 5 skills and trends.
        `;

      const res = await step.ai.wrap(
        "gemini",
        async (p) => {
          return await model.generateContent(p);
        },
        prompt
      );

      const text = res.response.candidates[0].content.parts[0].text || "";
      const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();

      const insights = JSON.parse(cleanedText);

      await step.run(`Update ${industry} insights`, async () => {
        await db.industryInsight.update({
          where: { industry },
          data: {
            ...insights,
            lastUpdated: new Date(),
            nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          },
        });
      });
    }
  }
);
