import json
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

import joblib

ML_DIR = Path(__file__).parent
MODEL_PATH = ML_DIR / "model.pkl"
SCALER_PATH = ML_DIR / "scaler.pkl"
COLUMNS_PATH = ML_DIR / "feature_columns.json"

_model = None
_scaler = None
_feature_columns: Optional[List[str]] = None
_artifact_signature: Optional[Tuple[Tuple[int, int], ...]] = None


def _get_artifact_signature() -> Optional[Tuple[Tuple[int, int], ...]]:
    paths = (MODEL_PATH, SCALER_PATH, COLUMNS_PATH)
    if not all(path.is_file() for path in paths):
        return None
    return tuple(
        (path.stat().st_mtime_ns, path.stat().st_size) for path in paths
    )


def load_model():
    global _model, _scaler, _feature_columns, _artifact_signature

    signature = _get_artifact_signature()
    if signature is None:
        _model = None
        _scaler = None
        _feature_columns = None
        _artifact_signature = None
        return None, None, None

    if _model is not None and signature == _artifact_signature:
        return _model, _scaler, _feature_columns

    model = joblib.load(MODEL_PATH)
    scaler = joblib.load(SCALER_PATH)
    with COLUMNS_PATH.open(encoding="utf-8") as file:
        feature_columns = json.load(file)

    from ml.features import FEATURE_COLUMNS

    if feature_columns != FEATURE_COLUMNS:
        raise ValueError("Model feature columns do not match the feature pipeline")
    if not hasattr(model, "predict_proba") or not hasattr(scaler, "transform"):
        raise TypeError("Model artifacts do not expose the required prediction APIs")

    _model = model
    _scaler = scaler
    _feature_columns = feature_columns
    _artifact_signature = signature
    return _model, _scaler, _feature_columns


def _build_risk_reason(row: Dict[str, Any], risk_level: str) -> str:
    reasons = []
    days_inactive = int(row.get("days_since_last_active", 0))

    if risk_level == "high":
        if days_inactive >= 14:
            reasons.append(f"Inactive for {days_inactive} days")
        if row.get("events_last_14_days", 0) == 0:
            reasons.append("No meaningful activity in the last 14 days")
        if row.get("completed_onboarding", 1) == 0:
            reasons.append("Did not complete onboarding")
        if row.get("meaningful_events_count", 99) <= 2:
            reasons.append("Very low product engagement")
    elif risk_level == "medium":
        if row.get("events_last_7_days", 0) == 0:
            reasons.append("No meaningful activity in the last 7 days")
        if row.get("completed_onboarding", 1) == 0:
            reasons.append("Did not complete onboarding")
        elif row.get("registered_event", 1) == 0:
            reasons.append(
                "Completed onboarding but has not registered for an event"
            )
        if row.get("meaningful_events_count", 99) <= 4:
            reasons.append("Limited product engagement")
    else:
        if days_inactive <= 4:
            reasons.append(f"Active within the last {days_inactive} days")
        else:
            reasons.append(
                f"Last meaningful activity was {days_inactive} days ago"
            )
        if row.get("made_payment", 0) == 1:
            reasons.append("Paid user with recent engagement")
        elif row.get("completed_onboarding", 0) == 1:
            reasons.append("Completed onboarding")
        elif row.get("meaningful_events_count", 0) > 0:
            reasons.append(
                f"{int(row['meaningful_events_count'])} meaningful events recorded"
            )

    if not reasons:
        reasons.append("Engagement pattern indicates limited churn risk")

    return " and ".join(reasons[:2])


def predict_churn_risk(db: Any, org_id: int = 1, limit: int = 50) -> List[Dict[str, Any]]:
    from ml.features import build_user_features

    model, scaler, feature_columns = load_model()
    if model is None:
        raise RuntimeError("Model artifacts not found")

    df = build_user_features(db, org_id=org_id, include_label=False)
    if df.empty:
        return []

    X = df[feature_columns]
    X_scaled = scaler.transform(X)
    probs = model.predict_proba(X_scaled)[:, 1]

    results = []
    for idx, (_, row) in enumerate(df.iterrows()):
        risk_score = round(float(probs[idx]), 8)

        if risk_score >= 0.65:
            risk_level = "high"
            suggested_action = (
                "Send a personalized re-engagement campaign immediately"
            )
        elif risk_score >= 0.35:
            risk_level = "medium"
            suggested_action = "Send a feature nudge and monitor engagement"
        else:
            risk_level = "low"
            suggested_action = (
                "Maintain engagement and ask for feedback or referral"
            )

        risk_reason = _build_risk_reason(row.to_dict(), risk_level)

        results.append(
            {
                "user_id": int(row["user_id"]),
                "external_user_id": str(row["external_user_id"]),
                "acquisition_channel": str(row["acquisition_channel"]),
                "signup_date": str(row["signup_date"]),
                "last_active_at": str(row["last_active_at"]),
                "days_since_last_active": int(row["days_since_last_active"]),
                "total_events": int(row["total_events"]),
                "risk_score": risk_score,
                "risk_level": risk_level,
                "risk_reason": risk_reason,
                "suggested_action": suggested_action,
            }
        )

    results.sort(key=lambda x: x["risk_score"], reverse=True)
    return results[:limit]
