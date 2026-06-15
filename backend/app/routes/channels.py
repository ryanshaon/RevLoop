from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.routes.common import require_organization
from app.schemas.channels import ChannelsResponse
from app.services import metrics

router = APIRouter(prefix="/channels", tags=["channels"])


@router.get("/performance", response_model=ChannelsResponse)
def get_channel_performance(org_id: int = 1, db: Session = Depends(get_db)):
    require_organization(db, org_id)
    return {"channels": metrics.get_channel_stats(db, org_id)}
