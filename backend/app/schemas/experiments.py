from __future__ import annotations

from datetime import date, datetime
from typing import List, Literal, Optional

from pydantic import BaseModel, Field, field_validator, model_validator

ExperimentStatus = Literal["planned", "running", "completed", "cancelled"]
ExperimentListStatus = Literal[
    "all", "planned", "running", "completed", "cancelled"
]


class ExperimentBase(BaseModel):
    org_id: int = Field(default=1, ge=1)
    experiment_name: str
    hypothesis: str
    target_metric: str
    status: ExperimentStatus
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    result_summary: Optional[str] = None


class ExperimentCreate(ExperimentBase):
    @field_validator("experiment_name", "hypothesis", "target_metric")
    @classmethod
    def must_not_be_empty(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("field must not be empty")
        return v


class ExperimentUpdate(BaseModel):
    experiment_name: Optional[str] = None
    hypothesis: Optional[str] = None
    target_metric: Optional[str] = None
    status: Optional[ExperimentStatus] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    result_summary: Optional[str] = None

    @field_validator("experiment_name", "hypothesis", "target_metric")
    @classmethod
    def must_not_be_empty(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            raise ValueError("field may not be null")
        if not v.strip():
            raise ValueError("field must not be empty")
        return v

    @field_validator("status")
    @classmethod
    def status_must_not_be_null(
        cls, v: Optional[ExperimentStatus]
    ) -> Optional[ExperimentStatus]:
        if v is None:
            raise ValueError("status may not be null")
        return v

    @model_validator(mode="after")
    def at_least_one_field(self) -> "ExperimentUpdate":
        if not self.model_fields_set:
            raise ValueError("at least one field must be provided for update")
        return self


class ExperimentResponse(ExperimentBase):
    id: int
    created_at: datetime

    @field_validator("status", mode="before")
    @classmethod
    def normalize_legacy_draft(cls, v: str) -> str:
        return "planned" if v == "draft" else v

    model_config = {"from_attributes": True}


class ExperimentListResponse(BaseModel):
    experiments: List[ExperimentResponse]


class ExperimentStatsResponse(BaseModel):
    total: int
    planned: int
    running: int
    completed: int
    cancelled: int
    win_rate: float
