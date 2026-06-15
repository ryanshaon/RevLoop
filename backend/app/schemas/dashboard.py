from pydantic import BaseModel


class DashboardSummary(BaseModel):
    total_users: int
    new_users_this_week: int
    activation_rate: float
    retention_rate: float
    churn_risk_average: float
    best_channel: str
    worst_funnel_step: str
    weekly_growth_percent: float
