import logging
from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.routes.common import require_organization
from app.schemas.churn import ChurnRiskResponse
from app.services import metrics

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/churn-risk", tags=["churn"])
OrganizationId = Annotated[int, Query(ge=1)]


@router.get("", response_model=ChurnRiskResponse)
def get_churn_risk(
    org_id: OrganizationId = 1,
    limit: Annotated[int, Query(ge=1, le=500)] = 50,
    db: Session = Depends(get_db),
):
    require_organization(db, org_id)

    try:
        from ml.predict import load_model, predict_churn_risk

        model, _, _ = load_model()
        if model is not None:
            users = predict_churn_risk(db, org_id=org_id, limit=limit)
            return {"model_version": "ml_v1", "users": users}
    except Exception as exc:
        logger.warning(
            "ML prediction failed, using rule-based fallback (%s)",
            type(exc).__name__,
        )

    users = metrics.get_churn_risk_users(db, org_id, limit=limit)
    return {"model_version": "rule_based", "users": users}
