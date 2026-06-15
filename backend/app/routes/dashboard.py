from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.routes.common import require_organization
from app.schemas.dashboard import DashboardSummary
from app.services import metrics

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/summary", response_model=DashboardSummary)
def get_dashboard_summary(org_id: int = 1, db: Session = Depends(get_db)):
    require_organization(db, org_id)
    return {
        "total_users": metrics.get_total_visitors(db, org_id),
        "new_users_this_week": metrics.get_new_users_this_week(db, org_id),
        "activation_rate": metrics.get_activation_rate(db, org_id),
        "retention_rate": metrics.get_retention_rate(db, org_id),
        "churn_risk_average": 0.0,
        "best_channel": metrics.get_best_channel(db, org_id),
        "worst_funnel_step": metrics.get_worst_funnel_step(db, org_id),
        "weekly_growth_percent": metrics.get_weekly_growth_percent(db, org_id),
    }
