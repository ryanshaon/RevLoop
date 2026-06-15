from sqlalchemy import (
    BigInteger, Column, Date, ForeignKey, Integer, Numeric, Text, TIMESTAMP,
    func, text,
)
from sqlalchemy.dialects.postgresql import JSONB

from app.database import Base


class Organization(Base):
    __tablename__ = "organizations"

    id = Column(Integer, primary_key=True)
    name = Column(Text, nullable=False)
    website = Column(Text)
    industry = Column(Text)
    created_at = Column(
        TIMESTAMP(timezone=True),
        nullable=False,
        server_default=func.now(),
    )


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    org_id = Column(Integer, ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False)
    external_user_id = Column(Text, nullable=False)
    email_hash = Column(Text)
    signup_date = Column(Date, nullable=False)
    acquisition_channel = Column(Text, nullable=False)
    country = Column(Text)
    device = Column(Text)
    plan_type = Column(Text, nullable=False, server_default="free")
    created_at = Column(
        TIMESTAMP(timezone=True),
        nullable=False,
        server_default=func.now(),
    )


class Event(Base):
    __tablename__ = "events"

    id = Column(BigInteger, primary_key=True)
    org_id = Column(Integer, ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    anonymous_id = Column(Text, nullable=True)
    event_name = Column(Text, nullable=False)
    event_time = Column(TIMESTAMP(timezone=True), nullable=False)
    session_id = Column(Text)
    source = Column(Text)
    page = Column(Text)
    properties_json = Column(
        JSONB,
        nullable=False,
        default=dict,
        server_default=text("'{}'::jsonb"),
    )
    created_at = Column(
        TIMESTAMP(timezone=True),
        nullable=False,
        server_default=func.now(),
    )


class Campaign(Base):
    __tablename__ = "campaigns"

    id = Column(Integer, primary_key=True)
    org_id = Column(Integer, ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False)
    campaign_name = Column(Text, nullable=False)
    channel = Column(Text, nullable=False)
    spend = Column(Numeric(12, 2))
    start_date = Column(Date)
    end_date = Column(Date)
    created_at = Column(
        TIMESTAMP(timezone=True),
        nullable=False,
        server_default=func.now(),
    )


class RevenueEvent(Base):
    __tablename__ = "revenue_events"

    id = Column(BigInteger, primary_key=True)
    org_id = Column(Integer, ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    event_time = Column(TIMESTAMP(timezone=True), nullable=False)
    amount = Column(Numeric(12, 2), nullable=False)
    currency = Column(Text, nullable=False, server_default="USD")
    revenue_type = Column(Text, nullable=False)
    created_at = Column(
        TIMESTAMP(timezone=True),
        nullable=False,
        server_default=func.now(),
    )


class Experiment(Base):
    __tablename__ = "experiments"

    id = Column(Integer, primary_key=True)
    org_id = Column(Integer, ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False)
    experiment_name = Column(Text, nullable=False)
    hypothesis = Column(Text)
    target_metric = Column(Text)
    status = Column(Text, nullable=False, server_default="draft")
    start_date = Column(Date)
    end_date = Column(Date)
    result_summary = Column(Text)
    created_at = Column(
        TIMESTAMP(timezone=True),
        nullable=False,
        server_default=func.now(),
    )


class Insight(Base):
    __tablename__ = "insights"

    id = Column(Integer, primary_key=True)
    org_id = Column(Integer, ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False)
    insight_type = Column(Text, nullable=False)
    insight_title = Column(Text, nullable=False)
    insight_text = Column(Text, nullable=False)
    severity = Column(Text, nullable=False, server_default="info")
    created_at = Column(
        TIMESTAMP(timezone=True),
        nullable=False,
        server_default=func.now(),
    )
