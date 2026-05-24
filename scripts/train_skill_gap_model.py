"""
Trains a LinearRegression model on skill-gap prediction data and exports
the learned weights to model_weights.json for use in the Node.js app.

Usage:
    # First time (synthetic data):
    python3 scripts/generate_synthetic_data.py
    python3 scripts/train_skill_gap_model.py

    # With real DB export:
    # Export from DB:
    #   SELECT avg_quiz_score, skills_coverage, experience_years, actual_match
    #   FROM user_snapshots;   (or build the CSV from raw tables)
    # Then replace training_data.csv and re-run this script.

Output:
    scripts/model_weights.json  — committed to repo, read by Node.js at runtime
"""

import json
import os
import numpy as np
import csv
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, r2_score
from sklearn.preprocessing import MinMaxScaler

SCRIPT_DIR = os.path.dirname(__file__)
DATA_PATH   = os.path.join(SCRIPT_DIR, "training_data.csv")
OUTPUT_PATH = os.path.join(SCRIPT_DIR, "model_weights.json")


def load_csv(path):
    rows = []
    with open(path, newline="") as f:
        reader = csv.DictReader(f)
        for row in reader:
            rows.append({k: float(v) for k, v in row.items()})
    return rows


def main():
    if not os.path.exists(DATA_PATH):
        raise FileNotFoundError(
            f"{DATA_PATH} not found. Run generate_synthetic_data.py first."
        )

    rows = load_csv(DATA_PATH)
    print(f"Loaded {len(rows)} training rows from {DATA_PATH}")

    # Features: 4 inputs — skills_coverage is the label, not a feature
    # Excluded: skills_count (indirect leakage via seed structure),
    #           recent_quiz_avg (collinear with avg_quiz_score)
    X = np.array([
        [
            r["avg_quiz_score"],
            min(r["experience_years"] / 10, 1.0) * 100,
            r["quizzes_taken"],
            r["role_similarity"],
        ]
        for r in rows
    ])
    y = np.array([r["actual_match"] for r in rows])

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    model = LinearRegression()
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    mae  = mean_absolute_error(y_test, y_pred)
    r2   = r2_score(y_test, y_pred)

    print(f"\n── Model Evaluation ──────────────────")
    print(f"  MAE  : {mae:.2f} percentage points")
    print(f"  R²   : {r2:.4f}")
    print(f"\n── Learned Coefficients ──────────────")
    features = ["avg_quiz_score", "experience_norm", "quizzes_taken", "role_similarity"]
    for name, coef in zip(features, model.coef_):
        print(f"  {name:25s}: {coef:.4f}")
    print(f"  {'intercept':25s}: {model.intercept_:.4f}")

    features = ["avg_quiz_score", "experience_norm", "quizzes_taken", "role_similarity"]
    weights = {
        "features": features,
        "coef": [round(float(c), 6) for c in model.coef_],
        "intercept": round(float(model.intercept_), 6),
        "train_samples": len(X_train),
        "test_mae": round(mae, 4),
        "test_r2": round(r2, 4),
        "note": (
            "Predicts skills_coverage from 4 features: avg_quiz_score, experience_norm, "
            "quizzes_taken, role_similarity. skills_coverage is the label only — no leakage. "
            "Re-run after exporting real DB data for production weights."
        ),
    }

    with open(OUTPUT_PATH, "w") as f:
        json.dump(weights, f, indent=2)

    print(f"\nWeights saved → {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
