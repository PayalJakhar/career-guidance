import { computeRuleBasedGap } from "./skill-rules";
import modelWeights from "../../scripts/model_weights.json" assert { type: "json" };

const { coef, intercept } = modelWeights;
// coef[0] = avg_quiz_score weight
// coef[1] = skills_coverage weight
// coef[2] = experience_norm weight
// Learned via LinearRegression on training_data.csv (R²=0.92, MAE=3.21pp)

/**
 * Predicts skill match score (0–100) using weights learned offline by
 * scripts/train_skill_gap_model.py (scikit-learn LinearRegression).
 *
 * To retrain with real data:
 *   1. Export user data to scripts/training_data.csv
 *   2. python3 scripts/train_skill_gap_model.py
 *   3. Commit the updated scripts/model_weights.json
 */
export function predictSkillMatchScore({ userSkills = [], targetRole = "", experience = 0, assessments = [] }) {
  const avgQuizScore =
    assessments.length > 0
      ? assessments.reduce((s, a) => s + a.quizScore, 0) / assessments.length
      : 50;

  const { requiredSkills, matchedSkills } = computeRuleBasedGap(userSkills, targetRole);
  const skillsCoverage =
    requiredSkills.length > 0
      ? (matchedSkills.length / requiredSkills.length) * 100
      : 50;

  const expNorm = Math.min((experience || 0) / 10, 1) * 100;

  const predicted =
    coef[0] * avgQuizScore +
    coef[1] * skillsCoverage +
    coef[2] * expNorm +
    intercept;

  return Math.round(Math.min(Math.max(predicted, 0), 100));
}

/**
 * Builds a per-assessment timeline: recalculates the predicted match at
 * each quiz attempt using only assessments up to that point.
 */
export function buildPredictionTimeline({ userSkills = [], targetRole = "", experience = 0, assessments = [] }) {
  const sorted = [...assessments].sort(
    (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
  );

  return sorted.map((assessment, idx) => {
    const subset = sorted.slice(0, idx + 1);
    const predicted = predictSkillMatchScore({
      userSkills,
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
