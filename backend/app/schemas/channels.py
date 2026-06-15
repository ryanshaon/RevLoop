from typing import List
from pydantic import BaseModel


class ChannelStats(BaseModel):
    channel: str
    visitors: int
    signups: int
    activated_users: int
    retained_users: int
    paid_users: int
    activation_rate: float
    retention_rate: float
    paid_conversion_rate: float
    revenue: float
    spend: float
    cac: float
    roi: float
    channel_quality_score: float


class ChannelsResponse(BaseModel):
    channels: List[ChannelStats]
