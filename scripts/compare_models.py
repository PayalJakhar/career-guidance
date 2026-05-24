"""
Compares Linear Regression, Random Forest, and XGBoost on the skill gap
prediction task. Evaluates each model using MAE, RMSE, and R², then saves
the full comparison to scripts/model_comparison.json.

Install dependencies first:
    pip install numpy scikit-learn xgboost

Run:
    python3 scripts/compare_models.py
"""

import json
import os
import numpy as np
import csv
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from xgboost import XGBRegressor

SCRIPT_DIR  = os.path.dirname(__file__)
DATA_PATH   = os.path.join(SCRIPT_DIR, "training_data.csv")
OUTPUT_PATH = os.path.join(SCRIPT_DIR, "model_comparison.json")
WEIGHTS_PATH = os.path.join(SCRIPT_DIR, "model_weights.json")


def load_csv(path):
    rows = []
    with open(path, newline="") as f:
        reader = csv.DictReader(f)
        for row in reader:
            rows.append({k: float(v) for k, v in row.items()})
    return rows


def build_features(rows):
    # Features: quiz + experience only — skills_coverage is the label
    X = np.array([
        [
            r["avg_quiz_score"],
            min(r["experience_years"] / 10, 1.0) * 100,
        ]
        for r in rows
    ])
    y = np.array([r["actual_match"] for r in rows])
    return X, y


def evaluate(name, model, X_train, X_test, y_train, y_test, X_all, y_all):
    model.fit(X_train, y_train)
    y_pred = model.predict(X_test)

    mae  = mean_absolute_error(y_test, y_pred)
    rmse = np.sqrt(mean_squared_error(y_test, y_pred))
    r2   = r2_score(y_test, y_pred)

    # 5-fold cross-validation MAE for robustness
    cv_scores = cross_val_score(model, X_all, y_all, cv=5,
                                scoring="neg_mean_absolute_error")
    cv_mae = -cv_scores.mean()

    return {
        "model":  name,
        "mae":    round(mae, 4),
        "rmse":   round(rmse, 4),
        "r2":     round(r2, 4),
        "cv_mae": round(cv_mae, 4),
    }


def main():
    if not os.path.exists(DATA_PATH):
        raise FileNotFoundError(
            f"{DATA_PATH} not found.\n"
            "Run:  node prisma/seed-users.mjs\n"
            "Then: npm run ml:export"
        )

    rows = load_csv(DATA_PATH)
    print(f"Loaded {len(rows)} rows from {DATA_PATH}\n")

    X, y = build_features(rows)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    models = [
        ("Linear Regression", LinearRegression()),
        ("Random Forest",     RandomForestRegressor(n_estimators=100, random_state=42)),
        ("XGBoost",           XGBRegressor(n_estimators=100, learning_rate=0.1,
                                           max_depth=4, random_state=42,
                                           verbosity=0)),
    ]

    results = []
    for name, model in models:
        result = evaluate(name, model, X_train, X_test, y_train, y_test, X, y)
        results.append(result)

    # ── Print comparison table ──────────────────────────────────────────────
    print("=" * 65)
    print(f"{'Model':<22} {'MAE':>6} {'RMSE':>7} {'R²':>7} {'CV-MAE':>8}")
    print("-" * 65)
    for r in results:
        print(f"{r['model']:<22} {r['mae']:>6.2f} {r['rmse']:>7.2f} "
              f"{r['r2']:>7.4f} {r['cv_mae']:>8.2f}")
    print("=" * 65)

    best = min(results, key=lambda r: r["mae"])
    print(f"\n✔  Best model: {best['model']}  (MAE = {best['mae']}, R² = {best['r2']})")

    # ── Feature importances for RF and XGBoost ─────────────────────────────
    features = ["avg_quiz_score", "experience_norm"]
    importances = {}
    for name, model in models:
        if hasattr(model, "feature_importances_"):
            imp = model.feature_importances_
            importances[name] = {f: round(float(v), 4) for f, v in zip(features, imp)}

    if importances:
        print("\nFeature Importances:")
        for model_name, imp in importances.items():
            print(f"  {model_name}:")
            for feat, val in imp.items():
                bar = "█" * int(val * 30)
                print(f"    {feat:<25} {val:.4f}  {bar}")

    # ── Save comparison JSON ────────────────────────────────────────────────
    output = {
        "dataset_size": len(rows),
        "train_size":   len(X_train),
        "test_size":    len(X_test),
        "results":      results,
        "best_model":   best["model"],
        "feature_importances": importances,
    }
    with open(OUTPUT_PATH, "w") as f:
        json.dump(output, f, indent=2)
    print(f"\nComparison saved → {OUTPUT_PATH}")

    # ── Update model_weights.json with Linear Regression coefficients ───────
    lr_model = next(m for name, m in models if name == "Linear Regression")
    lr_result = next(r for r in results if r["model"] == "Linear Regression")
    weights = {
        "features":      ["avg_quiz_score", "experience_norm"],
        "coef":          [round(float(c), 6) for c in lr_model.coef_],
        "intercept":     round(float(lr_model.intercept_), 6),
        "train_samples": int(len(X_train)),
        "test_mae":      lr_result["mae"],
        "test_r2":       lr_result["r2"],
        "note": (
            f"Best overall model: {best['model']} (MAE={best['mae']}). "
            "Predicts skills_coverage from quiz + experience (no leakage). "
            "Node.js uses Linear Regression weights for inference."
        ),
    }
    with open(WEIGHTS_PATH, "w") as f:
        json.dump(weights, f, indent=2)
    print(f"Linear Regression weights updated → {WEIGHTS_PATH}")


if __name__ == "__main__":
    main()
