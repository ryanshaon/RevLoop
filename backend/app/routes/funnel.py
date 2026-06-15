from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.routes.common import require_organization
from app.schemas.funnel import FunnelResponse
from app.services import metrics

router = APIRouter(prefix="/funnel", tags=["funnel"])


@router.get("", response_model=FunnelResponse)
def get_funnel(org_id: int = 1, db: Session = Depends(get_db)):
    require_organization(db, org_id)
    return {"steps": metrics.get_funnel_steps(db, org_id)}
