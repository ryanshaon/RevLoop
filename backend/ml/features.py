from datetime import timedelta

import pandas as pd
from sqlalchemy import distinct, func
from sqlalchemy.orm import Session

MEANINGFUL_EVENTS = [
    "user_returned",
    "event_viewed",
    "event_registered",
    "search_performed",
    "invite_sent",
    "payment_completed",
]

CHANNEL_ENCODING = {
    "Instagram": 0,
    "WhatsApp": 1,
    "Referral": 2,
    "LinkedIn": 3,
    "Organic": 4,
    "Paid Ads": 5,
}

PLAN_ENCODING = {
    "free": 0,
    "paid": 1,
    "premium": 2,
}

FEATURE_COLUMNS = [
    "days_since_signup",
    "days_since_last_active",
    "total_sessions",
    "total_events",
    "meaningful_events_count",
    "completed_onboarding",
    "registered_event",
    "invited_friend",
    "made_payment",
    "acquisition_channel_encoded",
    "plan_type_encoded",
    "events_last_7_days",
    "events_last_14_days",
    "week_of_signup",
]


def build_user_features(db: Session, org_id: int = 1, include_label: bool = False) -> pd.DataFrame:
    from app.models.models import Event, RevenueEvent, User

    ref_date = (
        db.query(func.max(func.date(Event.event_time)))
        .filter(Event.org_id == org_id)
        .scalar()
    )
    if ref_date is None:
        return pd.DataFrame()

    earliest_signup = (
        db.query(func.min(User.signup_date))
        .filter(User.org_id == org_id)
        .scalar()
    )

    users = db.query(User).filter(User.org_id == org_id).all()
    if not users:
        return pd.DataFrame()

    user_ids = [u.id for u in users]

    last_meaningful_rows = (
        db.query(Event.user_id, func.max(func.date(Event.event_time)).label("last_active"))
        .filter(
            Event.org_id == org_id,
            Event.user_id.in_(user_ids),
            Event.event_name.in_(MEANINGFUL_EVENTS),
        )
        .group_by(Event.user_id)
        .all()
    )
    last_meaningful_by_user = {uid: d for uid, d in last_meaningful_rows}

    total_sessions_rows = (
        db.query(Event.user_id, func.count(distinct(Event.session_id)).label("sessions"))
        .filter(Event.org_id == org_id, Event.user_id.in_(user_ids))
        .group_by(Event.user_id)
        .all()
    )
    total_sessions_by_user = {uid: cnt for uid, cnt in total_sessions_rows}

    total_events_rows = (
        db.query(Event.user_id, func.count(Event.id).label("total"))
        .filter(Event.org_id == org_id, Event.user_id.in_(user_ids))
        .group_by(Event.user_id)
        .all()
    )
    total_events_by_user = {uid: cnt for uid, cnt in total_events_rows}

    meaningful_events_rows = (
        db.query(Event.user_id, func.count(Event.id).label("cnt"))
        .filter(
            Event.org_id == org_id,
            Event.user_id.in_(user_ids),
            Event.event_name.in_(MEANINGFUL_EVENTS),
        )
        .group_by(Event.user_id)
        .all()
    )
    meaningful_events_by_user = {uid: cnt for uid, cnt in meaningful_events_rows}

    onboarded_ids = {
        row[0]
        for row in db.query(distinct(Event.user_id))
        .filter(
            Event.org_id == org_id,
            Event.user_id.in_(user_ids),
            Event.event_name == "onboarding_completed",
        )
        .all()
    }

    registered_ids = {
        row[0]
        for row in db.query(distinct(Event.user_id))
        .filter(
            Event.org_id == org_id,
            Event.user_id.in_(user_ids),
            Event.event_name == "event_registered",
        )
        .all()
    }

    invited_ids = {
        row[0]
        for row in db.query(distinct(Event.user_id))
        .filter(
            Event.org_id == org_id,
            Event.user_id.in_(user_ids),
            Event.event_name == "invite_sent",
        )
        .all()
    }

    paid_from_events = {
        row[0]
        for row in db.query(distinct(Event.user_id))
        .filter(
            Event.org_id == org_id,
            Event.user_id.in_(user_ids),
            Event.event_name == "payment_completed",
        )
        .all()
    }
    paid_from_revenue = {
        row[0]
        for row in db.query(distinct(RevenueEvent.user_id))
        .filter(RevenueEvent.org_id == org_id)
        .all()
    }
    paid_ids = paid_from_events | paid_from_revenue

    cutoff_7 = ref_date - timedelta(days=7)
    events_last_7_rows = (
        db.query(Event.user_id, func.count(Event.id).label("cnt"))
        .filter(
            Event.org_id == org_id,
            Event.user_id.in_(user_ids),
            Event.event_name.in_(MEANINGFUL_EVENTS),
            func.date(Event.event_time) > cutoff_7,
        )
        .group_by(Event.user_id)
        .all()
    )
    events_last_7_by_user = {uid: cnt for uid, cnt in events_last_7_rows}

    cutoff_14 = ref_date - timedelta(days=14)
    events_last_14_rows = (
        db.query(Event.user_id, func.count(Event.id).label("cnt"))
        .filter(
            Event.org_id == org_id,
            Event.user_id.in_(user_ids),
            Event.event_name.in_(MEANINGFUL_EVENTS),
            func.date(Event.event_time) > cutoff_14,
        )
        .group_by(Event.user_id)
        .all()
    )
    events_last_14_by_user = {uid: cnt for uid, cnt in events_last_14_rows}

    rows = []
    for user in users:
        days_since_signup = (ref_date - user.signup_date).days

        last_meaningful = last_meaningful_by_user.get(user.id)
        if last_meaningful is not None:
            days_since_last_active = (ref_date - last_meaningful).days
            last_active_at = str(last_meaningful)
        else:
            days_since_last_active = days_since_signup
            last_active_at = str(user.signup_date)

        week_of_signup = (
            min((user.signup_date - earliest_signup).days // 7, 7)
            if earliest_signup is not None
            else 0
        )

        row = {
            "user_id": user.id,
            "external_user_id": user.external_user_id,
            "acquisition_channel": user.acquisition_channel,
            "signup_date": str(user.signup_date),
            "last_active_at": last_active_at,
            "days_since_last_active": days_since_last_active,
            "total_events": total_events_by_user.get(user.id, 0),
            # model feature columns
            "days_since_signup": days_since_signup,
            "total_sessions": total_sessions_by_user.get(user.id, 0),
            "meaningful_events_count": meaningful_events_by_user.get(user.id, 0),
            "completed_onboarding": 1 if user.id in onboarded_ids else 0,
            "registered_event": 1 if user.id in registered_ids else 0,
            "invited_friend": 1 if user.id in invited_ids else 0,
            "made_payment": 1 if user.id in paid_ids else 0,
            "acquisition_channel_encoded": CHANNEL_ENCODING.get(user.acquisition_channel, -1),
            "plan_type_encoded": PLAN_ENCODING.get(user.plan_type, -1),
            "events_last_7_days": events_last_7_by_user.get(user.id, 0),
            "events_last_14_days": events_last_14_by_user.get(user.id, 0),
            "week_of_signup": week_of_signup,
        }

        if include_label:
            row["churn"] = 1 if days_since_last_active >= 14 else 0

        rows.append(row)

    return pd.DataFrame(rows)
