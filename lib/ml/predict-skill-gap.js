import { computeRuleBasedGap } from "./skill-rules";
import modelWeights from "../../scripts/model_weights.json" assert { type: "json" };

const { coef, intercept } = modelWeights;
// coef[0] = avg_quiz_score weight
// coef[1] = experience_norm weight
// Label = skills_coverage (rule-based cosine similarity) — no leakage
// Learned via LinearRegression on training_data.csv

/**
 * Predicts skill match score (0–100) using only quiz performance and
 * experience — skills_coverage is NOT a feature (it is the label).
 * Weights loaded from scripts/model_weights.json (trained offline).
 *
 * To retrain:
 *   npm run ml:retrain
 */
export function predictSkillMatchScore({ experience = 0, assessments = [], userSkills = [], role = "", targetRole = "" }) {
  const avgQuizScore =
    assessments.length > 0
      ? assessments.reduce((s, a) => s + a.quizScore, 0) / assessments.length
      : 50;

  const expNorm = Math.min((experience || 0) / 10, 1) * 100;

  const quizzesTaken = assessments.length;

  const sorted = [...assessments].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  const last3 = sorted.slice(-3);
  const recentQuizAvg = last3.length > 0
    ? last3.reduce((s, a) => s + a.quizScore, 0) / last3.length
    : avgQuizScore;

  const skillsCount = (userSkills || []).length;

  const roleWords   = (role || "").toLowerCase().trim().split(/\s+/).filter(Boolean);
  const targetWords = (targetRole || "").toLowerCase().trim().split(/\s+/).filter(Boolean);
  const overlap = roleWords.filter(w =>
    targetWords.some(t => t.includes(w) || w.includes(t))
  ).length;
  const roleSimilarity = roleWords.length > 0 && targetWords.length > 0
    ? (overlap / Math.max(roleWords.length, targetWords.length)) * 100
    : 50;

  const predicted =
    coef[0] * avgQuizScore +
    coef[1] * expNorm +
    coef[2] * quizzesTaken +
    coef[3] * recentQuizAvg +
    coef[4] * skillsCount +
    coef[5] * roleSimilarity +
    intercept;

  return Math.round(Math.min(Math.max(predicted, 0), 100));
}

/**
 * Builds a per-assessment timeline: recalculates the predicted match at
 * each quiz attempt using only assessments up to that point.
 */
export function buildPredictionTimeline({ userSkills = [], role = "", targetRole = "", experience = 0, assessments = [] }) {
  const sorted = [...assessments].sort(
    (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
  );

  return sorted.map((assessment, idx) => {
    const subset = sorted.slice(0, idx + 1);
    const predicted = predictSkillMatchScore({
      userSkills,
      role,
      targetRole,
      experience,
      assessments: subset,
    });
    return {
      date: assessment.createdAt,
      quizScore: Math.round(assessment.quizScore),
      predictedMatch: predicted,
    };
  });
}

export function computeMAE(predicted, actual) {
  return Math.round(Math.abs(predicted - actual));
}

export { modelWeights };
