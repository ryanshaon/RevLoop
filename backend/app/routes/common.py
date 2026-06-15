from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.models import Organization


def require_organization(db: Session, org_id: int) -> Organization:
    organization = (
        db.query(Organization)
        .filter(Organization.id == org_id)
        .first()
    )
    if organization is None:
        raise HTTPException(
            status_code=404,
            detail=f"Organization {org_id} not found",
        )
    return organization
