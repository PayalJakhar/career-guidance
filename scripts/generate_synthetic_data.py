"""
Generates synthetic training data for the skill gap prediction model.

Each row represents one user-quiz snapshot:
  - avg_quiz_score    : average quiz score so far (0–100)
  - skills_coverage   : (matched skills / required skills) * 100 (0–100)
  - experience        : years of experience (0–15), normalised to 0–100 in training
  - actual_match      : rule-based cosine similarity score (0–100) — the label

Relationship baked in (with noise):
  actual_match ≈ 0.45 * avg_quiz + 0.35 * skills_coverage + 0.20 * exp_norm + noise

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
    avg_quiz      = RNG.uniform(20, 100, N)
    skills_cov    = RNG.uniform(0,  100, N)
    experience    = RNG.uniform(0,  15,  N)   # raw years
    exp_norm      = np.clip(experience / 10, 0, 1) * 100  # normalised 0–100

    noise = RNG.normal(0, 5, N)

    actual_match = (
        0.45 * avg_quiz +
        0.35 * skills_cov +
        0.20 * exp_norm +
        noise
    )
    actual_match = np.clip(actual_match, 0, 100).round(2)

    out_path = os.path.join(os.path.dirname(__file__), "training_data.csv")
    with open(out_path, "w", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(["avg_quiz_score", "skills_coverage", "experience_years", "actual_match"])
        for row in zip(avg_quiz.round(2), skills_cov.round(2), experience.round(2), actual_match):
            writer.writerow(row)

    print(f"Generated {N} rows → {out_path}")

if __name__ == "__main__":
    generate()
