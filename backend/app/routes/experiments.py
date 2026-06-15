from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.models import Experiment
from app.routes.common import require_organization
from app.schemas.experiments import (
    ExperimentCreate,
    ExperimentListResponse,
    ExperimentListStatus,
    ExperimentResponse,
    ExperimentStatsResponse,
    ExperimentUpdate,
)

router = APIRouter(prefix="/experiments", tags=["experiments"])
OrganizationId = Annotated[int, Query(ge=1)]

_WIN_KEYWORDS = {
    "increased",
    "improved",
    "higher",
    "better",
    "up",
    "grew",
    "lifted",
    "boosted",
}


def _compute_win_rate(experiments: list[Experiment]) -> float:
    completed = [e for e in experiments if e.status == "completed"]
    if not completed:
        return 0.0
    wins = sum(
        1
        for e in completed
        if e.result_summary
        and any(kw in e.result_summary.lower() for kw in _WIN_KEYWORDS)
    )
    return round(wins / len(completed), 4)


@router.get("/stats", response_model=ExperimentStatsResponse)
def get_experiment_stats(
    org_id: OrganizationId = 1, db: Session = Depends(get_db)
):
    require_organization(db, org_id)
    all_experiments = (
        db.query(Experiment).filter(Experiment.org_id == org_id).all()
    )
    counts = {"planned": 0, "running": 0, "completed": 0, "cancelled": 0}
    for exp in all_experiments:
        status = "planned" if exp.status == "draft" else exp.status
        if status in counts:
            counts[status] += 1
    return ExperimentStatsResponse(
        total=len(all_experiments),
        planned=counts["planned"],
        running=counts["running"],
        completed=counts["completed"],
        cancelled=counts["cancelled"],
        win_rate=_compute_win_rate(all_experiments),
    )


@router.get("", response_model=ExperimentListResponse)
def list_experiments(
    org_id: OrganizationId = 1,
    status: ExperimentListStatus = "all",
    db: Session = Depends(get_db),
):
    require_organization(db, org_id)
    query = db.query(Experiment).filter(Experiment.org_id == org_id)
    if status == "planned":
        query = query.filter(
            or_(Experiment.status == "planned", Experiment.status == "draft")
        )
    elif status != "all":
        query = query.filter(Experiment.status == status)
    experiments = query.order_by(Experiment.created_at.desc()).all()
    return ExperimentListResponse(experiments=experiments)


@router.post("", response_model=ExperimentResponse, status_code=201)
def create_experiment(
    payload: ExperimentCreate, db: Session = Depends(get_db)
):
    require_organization(db, payload.org_id)
    exp = Experiment(
        org_id=payload.org_id,
        experiment_name=payload.experiment_name,
        hypothesis=payload.hypothesis,
        target_metric=payload.target_metric,
        status=payload.status,
        start_date=payload.start_date,
        end_date=payload.end_date,
        result_summary=payload.result_summary,
    )
    db.add(exp)
    db.commit()
    db.refresh(exp)
    return exp


@router.patch("/{experiment_id}", response_model=ExperimentResponse)
def update_experiment(
    experiment_id: int,
    payload: ExperimentUpdate,
    db: Session = Depends(get_db),
):
    exp = db.query(Experiment).filter(Experiment.id == experiment_id).first()
    if exp is None:
        raise HTTPException(
            status_code=404,
            detail=f"Experiment {experiment_id} not found",
        )
    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(exp, field, value)
    db.commit()
    db.refresh(exp)
    return exp


@router.delete("/{experiment_id}", response_model=ExperimentResponse)
def cancel_experiment(experiment_id: int, db: Session = Depends(get_db)):
    exp = db.query(Experiment).filter(Experiment.id == experiment_id).first()
    if exp is None:
        raise HTTPException(
            status_code=404,
            detail=f"Experiment {experiment_id} not found",
        )
    exp.status = "cancelled"
    db.commit()
    db.refresh(exp)
    return exp
