import json
import os
import sys
from datetime import datetime, timezone
from pathlib import Path

# Add backend/ to sys.path so app and ml modules are importable when run as a script
sys.path.insert(0, str(Path(__file__).parent.parent))

import joblib
from dotenv import load_dotenv
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    brier_score_loss,
    f1_score,
    log_loss,
    precision_score,
    recall_score,
    roc_auc_score,
)
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

load_dotenv(Path(__file__).parent.parent / ".env")

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL not set in backend/.env")

from ml.features import FEATURE_COLUMNS, build_user_features

ML_DIR = Path(__file__).parent


def _evaluate(model, X_test_scaled, y_test):
    y_pred = model.predict(X_test_scaled)
    y_prob = model.predict_proba(X_test_scaled)[:, 1]
    return {
        "accuracy": round(float(accuracy_score(y_test, y_pred)), 4),
        "precision": round(float(precision_score(y_test, y_pred, zero_division=0)), 4),
        "recall": round(float(recall_score(y_test, y_pred, zero_division=0)), 4),
        "f1": round(float(f1_score(y_test, y_pred, zero_division=0)), 4),
        "roc_auc": round(float(roc_auc_score(y_test, y_prob)), 4),
        "brier_score": round(float(brier_score_loss(y_test, y_prob)), 4),
        "log_loss": round(float(log_loss(y_test, y_prob)), 4),
    }


def main():
    engine = create_engine(DATABASE_URL, pool_pre_ping=True)
    Session = sessionmaker(bind=engine)
    db = Session()

    try:
        print("Extracting features from database...")
        df = build_user_features(db, org_id=1, include_label=True)
    finally:
        db.close()

    if df.empty:
        print("No data found. Exiting.")
        return

    print(f"\nDataset size: {len(df)} users")

    y = df["churn"]
    X = df[FEATURE_COLUMNS]

    churned = int(y.sum())
    not_churned = int((y == 0).sum())
    print(f"\nClass distribution:")
    print(f"  Churned (1):     {churned}")
    print(f"  Not churned (0): {not_churned}")

    if churned == 0 or not_churned == 0:
        print("Cannot train: only one class present in dataset.")
        return

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    print(f"\nTrain/test split:")
    print(f"  Train: {len(X_train)} samples")
    print(f"  Test:  {len(X_test)} samples")

    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    print("\nTraining Logistic Regression candidate...")
    lr = LogisticRegression(class_weight="balanced", random_state=42, max_iter=1000)
    lr.fit(X_train_scaled, y_train)
    lr_metrics = _evaluate(lr, X_test_scaled, y_test)

    print("Training Random Forest benchmark...")
    rf = RandomForestClassifier(
        n_estimators=100,
        class_weight="balanced",
        random_state=42,
    )
    rf.fit(X_train_scaled, y_train)
    rf_metrics = _evaluate(rf, X_test_scaled, y_test)

    print("\nLogistic Regression metrics:")
    for k, v in lr_metrics.items():
        print(f"  {k}: {v}")

    print("\nRandom Forest metrics:")
    for k, v in rf_metrics.items():
        print(f"  {k}: {v}")

    rf_feature_importances = dict(
        zip(FEATURE_COLUMNS, rf.feature_importances_.tolist())
    )
    lr_coefficients = dict(zip(FEATURE_COLUMNS, lr.coef_[0].tolist()))
    top5 = sorted(
        lr_coefficients.items(),
        key=lambda item: abs(item[1]),
        reverse=True,
    )[:5]
    print("\nTop 5 coefficients by magnitude (selected Logistic Regression):")
    for feature, coefficient in top5:
        print(f"  {feature}: {coefficient:.4f}")

    # The linear model produces smoother risk estimates on this simulated data.
    # Random Forest remains in the metadata as a benchmark.
    joblib.dump(lr, ML_DIR / "model.pkl")
    joblib.dump(scaler, ML_DIR / "scaler.pkl")

    with open(ML_DIR / "feature_columns.json", "w", encoding="utf-8") as f:
        json.dump(FEATURE_COLUMNS, f, indent=2)

    metadata = {
        "model_name": "LogisticRegression",
        "model_version": "ml_v1",
        "trained_at": datetime.now(timezone.utc).isoformat(),
        "dataset_size": len(df),
        "data_source": "Deterministic simulated Campus Connect Demo data",
        "label_definition": (
            "churn = 1 when days_since_last_active >= 14, measured against "
            "the latest event date in the organization dataset"
        ),
        "class_distribution": {"churned": churned, "not_churned": not_churned},
        "logistic_regression_metrics": lr_metrics,
        "random_forest_metrics": rf_metrics,
        "selected_model_metrics": lr_metrics,
        "selected_model_reason": (
            "Logistic Regression is served because it preserves excellent ranking "
            "performance while producing smoother risk probabilities than the "
            "near-binary Random Forest probabilities on this deterministic dataset."
        ),
        "logistic_regression_coefficients": lr_coefficients,
        "random_forest_feature_importances": rf_feature_importances,
        "limitations": (
            "This is a recency-based churn model trained on simulated data. "
            "days_since_last_active intentionally overlaps strongly with the label, "
            "and recent-activity count features are also highly predictive. Metrics "
            "should not be treated as production generalization evidence."
        ),
    }

    with open(ML_DIR / "model_metadata.json", "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)

    print("\nModel saved successfully.")
    print("  backend/ml/model.pkl")
    print("  backend/ml/scaler.pkl")
    print("  backend/ml/feature_columns.json")
    print("  backend/ml/model_metadata.json")


if __name__ == "__main__":
    main()
