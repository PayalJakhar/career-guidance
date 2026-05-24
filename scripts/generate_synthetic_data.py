"""
Generates synthetic training data for the skill gap prediction model.

Each row represents one user snapshot:
  avg_quiz_score   : average quiz score (0–100)
  experience_years : years of experience (0–15)
  quizzes_taken    : number of quizzes completed (1–20)
  recent_quiz_avg  : avg of last 3 quiz scores (0–100)
  skills_count     : number of skills listed on profile (1–20)
  role_similarity  : keyword overlap between current role and target role (0–100)
  actual_match     : rule-based cosine similarity score (0–100) — the label

Run:
    python3 scripts/generate_synthetic_data.py
Output:
    scripts/training_data.csv
"""

import numpy as np
import csv
import os

RNG = np.random.default_rng(42)
N = 300

def generate():
    avg_quiz       = RNG.uniform(20, 100, N)
    experience     = RNG.uniform(0,  15,  N)
    exp_norm       = np.clip(experience / 10, 0, 1) * 100
    quizzes_taken  = RNG.integers(1, 20, N).astype(float)
    recent_quiz    = np.clip(avg_quiz + RNG.normal(0, 8, N), 0, 100)
    skills_count   = RNG.integers(1, 20, N).astype(float)
    role_sim       = RNG.uniform(0, 100, N)

    noise = RNG.normal(0, 5, N)

    actual_match = (
        0.25 * avg_quiz +
        0.20 * exp_norm +
        0.05 * np.clip(quizzes_taken / 20, 0, 1) * 100 +
        0.20 * recent_quiz +
        0.20 * np.clip(skills_count / 20, 0, 1) * 100 +
        0.10 * role_sim +
        noise
    )
    actual_match = np.clip(actual_match, 0, 100).round(2)

    out_path = os.path.join(os.path.dirname(__file__), "training_data.csv")
    with open(out_path, "w", newline="") as f:
        writer = csv.writer(f)
        writer.writerow([
            "avg_quiz_score", "experience_years", "quizzes_taken",
            "recent_quiz_avg", "skills_count", "role_similarity", "actual_match",
        ])
        for row in zip(
            avg_quiz.round(2), experience.round(2), quizzes_taken,
            recent_quiz.round(2), skills_count, role_sim.round(2), actual_match,
        ):
            writer.writerow(row)

    print(f"Generated {N} rows → {out_path}")

if __name__ == "__main__":
    generate()
