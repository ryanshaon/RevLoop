from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.routes.common import require_organization
from app.schemas.churn import ChurnRiskResponse
from app.services import metrics

router = APIRouter(prefix="/churn-risk", tags=["churn"])


@router.get("", response_model=ChurnRiskResponse)
def get_churn_risk(
    org_id: int = 1,
    limit: Annotated[int, Query(ge=1, le=500)] = 50,
    db: Session = Depends(get_db),
):
    require_organization(db, org_id)
    return {"users": metrics.get_churn_risk_users(db, org_id, limit=limit)}
