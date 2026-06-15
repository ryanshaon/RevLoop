from typing import List
from pydantic import BaseModel


class CohortRow(BaseModel):
    cohort_week: str
    cohort_size: int
    week_0: float
    week_1: float
    week_2: float
    week_3: float
    week_4: float


class RetentionResponse(BaseModel):
    cohorts: List[CohortRow]
