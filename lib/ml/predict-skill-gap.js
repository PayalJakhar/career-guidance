import { computeRuleBasedGap } from "./skill-rules";

/**
 * Predicts skill match score using three features:
 *   - Quiz performance (50% weight) — proxy for demonstrated knowledge
 *   - Skills coverage  (30% weight) — user skills vs. required skills count
 *   - Experience factor(20% weight) — years of experience, capped at 10
 *
 * Returns a 0–100 percentage (higher = better match).
 */
export function predictSkillMatchScore({ userSkills = [], targetRole = "", experience = 0, assessments = [] }) {
  const avgQuizScore =
    assessments.length > 0
      ? assessments.reduce((s, a) => s + a.quizScore, 0) / assessments.length / 100
      : 0.5;

  const { requiredSkills, matchedSkills } = computeRuleBasedGap(userSkills, targetRole);
  const skillsCoverage =
    requiredSkills.length > 0 ? matchedSkills.length / requiredSkills.length : 0.5;

  const expFactor = Math.min((experience || 0) / 10, 1);

  const predicted = (avgQuizScore * 0.5 + skillsCoverage * 0.3 + expFactor * 0.2) * 100;
  return Math.round(Math.min(Math.max(predicted, 0), 100));
}

/**
 * Builds a per-assessment timeline: at each quiz attempt (chronological),
 * recalculates the predicted match using only assessments up to that point.
 */
export function buildPredictionTimeline({ userSkills = [], targetRole = "", experience = 0, assessments = [] }) {
  const sorted = [...assessments].sort(
    (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
  );

  return sorted.map((assessment, idx) => {
    const subset = sorted.slice(0, idx + 1);
    const predicted = predictSkillMatchScore({ userSkills, targetRole, experience, assessments: subset });
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
