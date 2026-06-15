from typing import List
from pydantic import BaseModel


class FunnelStep(BaseModel):
    step: str
    event: str
    users: int
    conversion_rate: float
    drop_off_rate: float


class FunnelResponse(BaseModel):
    steps: List[FunnelStep]
