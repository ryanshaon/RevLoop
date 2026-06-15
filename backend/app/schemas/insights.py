from typing import List
from pydantic import BaseModel


class InsightsSummary(BaseModel):
    summary: str
    risks: List[str]
    opportunities: List[str]
    recommended_experiments: List[str]
