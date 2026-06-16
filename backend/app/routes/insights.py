from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.routes.common import require_organization
from app.schemas.insights import InsightsSummary
from app.services import metrics

router = APIRouter(prefix="/insights", tags=["insights"])


@router.get("/weekly-summary", response_model=InsightsSummary)
def get_weekly_summary(org_id: int = 1, db: Session = Depends(get_db)):
    org = require_organization(db, org_id)
    return metrics.get_weekly_insights(db, org_id, org.name)
