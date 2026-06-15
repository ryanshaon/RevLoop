from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.routes.common import require_organization
from app.schemas.retention import RetentionResponse
from app.services import metrics

router = APIRouter(prefix="/retention", tags=["retention"])


@router.get("", response_model=RetentionResponse)
def get_retention(org_id: int = 1, db: Session = Depends(get_db)):
    require_organization(db, org_id)
    return {"cohorts": metrics.get_retention_cohorts(db, org_id)}
