from typing import List
from pydantic import BaseModel


class ChurnUser(BaseModel):
    user_id: int
    external_user_id: str
    acquisition_channel: str
    signup_date: str
    last_active_at: str
    days_since_last_active: int
    total_events: int
    risk_score: float
    risk_level: str
    risk_reason: str
    suggested_action: str


class ChurnRiskResponse(BaseModel):
    users: List[ChurnUser]
