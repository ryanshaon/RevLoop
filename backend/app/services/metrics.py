from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional

from sqlalchemy import cast, case, func, String
from sqlalchemy.orm import Session

from app.models.models import Campaign, Event, RevenueEvent, User

ACTIVATION_EVENTS = ["onboarding_completed", "event_registered"]

MEANINGFUL_EVENTS = [
    "user_returned",
    "event_viewed",
    "event_registered",
    "search_performed",
    "invite_sent",
    "payment_completed",
]


def _actor_expr():
    """Return user_id-as-string when present, else anonymous_id (for counting distinct actors)."""
    return case(
        (Event.user_id.isnot(None), cast(Event.user_id, String)),
        else_=Event.anonymous_id,
    )


# ---------------------------------------------------------------------------
# Required shared functions
# ---------------------------------------------------------------------------

def get_total_visitors(db: Session, org_id: int) -> int:
    return db.query(func.count(User.id)).filter(User.org_id == org_id).scalar() or 0


def get_activation_rate(db: Session, org_id: int) -> float:
    total = get_total_visitors(db, org_id)
    if total == 0:
        return 0.0
    activated = (
        db.query(func.count(func.distinct(Event.user_id)))
        .filter(
            Event.org_id == org_id,
            Event.user_id.isnot(None),
            Event.event_name.in_(ACTIVATION_EVENTS),
        )
        .scalar()
        or 0
    )
    return round(activated / total, 4)


def get_retention_rate(db: Session, org_id: int) -> float:
    total = get_total_visitors(db, org_id)
    if total == 0:
        return 0.0
    retained = (
        db.query(func.count(func.distinct(Event.user_id)))
        .filter(
            Event.org_id == org_id,
            Event.user_id.isnot(None),
            Event.event_name == "user_returned",
        )
        .scalar()
        or 0
    )
    return round(retained / total, 4)


def get_funnel_steps(db: Session, org_id: int) -> List[Dict[str, Any]]:
    # (step label, event name, count_type: "actor" | "user")
    funnel_definition = [
        ("Landing Page Visited", "page_viewed", "actor"),
        ("Signup Started", "signup_started", "actor"),
        ("Signup Completed", "signup_completed", "user"),
        ("Onboarding Completed", "onboarding_completed", "user"),
        ("Key Action", "event_registered", "user"),
        ("Retained", "user_returned", "user"),
    ]

    steps: List[Dict[str, Any]] = []
    prev_count: Optional[int] = None

    for step_name, event_name, count_type in funnel_definition:
        if count_type == "actor":
            count = (
                db.query(func.count(func.distinct(_actor_expr())))
                .filter(
                    Event.org_id == org_id,
                    Event.event_name == event_name,
                )
                .scalar()
                or 0
            )
        else:
            count = (
                db.query(func.count(func.distinct(Event.user_id)))
                .filter(
                    Event.org_id == org_id,
                    Event.event_name == event_name,
                    Event.user_id.isnot(None),
                )
                .scalar()
                or 0
            )

        if prev_count is None:
            conversion_rate = 1.0
            drop_off_rate = 0.0
        elif prev_count == 0:
            conversion_rate = 0.0
            drop_off_rate = 1.0
        else:
            conversion_rate = round(count / prev_count, 4)
            drop_off_rate = round(1.0 - conversion_rate, 4)

        steps.append(
            {
                "step": step_name,
                "event": event_name,
                "users": count,
                "conversion_rate": conversion_rate,
                "drop_off_rate": drop_off_rate,
            }
        )
        prev_count = count

    return steps


def get_channel_stats(db: Session, org_id: int) -> List[Dict[str, Any]]:
    user_rows = db.query(User.acquisition_channel, User.id).filter(User.org_id == org_id).all()
    channel_users: Dict[str, List[int]] = {}
    for channel, uid in user_rows:
        channel_users.setdefault(channel, []).append(uid)

    if not channel_users:
        return []

    activated_ids = {
        row[0]
        for row in db.query(func.distinct(Event.user_id))
        .filter(
            Event.org_id == org_id,
            Event.event_name.in_(ACTIVATION_EVENTS),
            Event.user_id.isnot(None),
        )
        .all()
    }

    retained_ids = {
        row[0]
        for row in db.query(func.distinct(Event.user_id))
        .filter(
            Event.org_id == org_id,
            Event.event_name == "user_returned",
            Event.user_id.isnot(None),
        )
        .all()
    }

    paid_from_events = {
        row[0]
        for row in db.query(func.distinct(Event.user_id))
        .filter(
            Event.org_id == org_id,
            Event.event_name == "payment_completed",
            Event.user_id.isnot(None),
        )
        .all()
    }
    paid_from_revenue = {
        row[0]
        for row in db.query(func.distinct(RevenueEvent.user_id))
        .filter(RevenueEvent.org_id == org_id)
        .all()
    }
    paid_ids = paid_from_events | paid_from_revenue

    revenue_by_user: Dict[int, float] = {
        uid: float(amt)
        for uid, amt in db.query(RevenueEvent.user_id, func.sum(RevenueEvent.amount))
        .filter(RevenueEvent.org_id == org_id)
        .group_by(RevenueEvent.user_id)
        .all()
    }

    spend_by_channel: Dict[str, float] = {
        ch: float(amt or 0)
        for ch, amt in db.query(Campaign.channel, func.sum(Campaign.spend))
        .filter(Campaign.org_id == org_id)
        .group_by(Campaign.channel)
        .all()
    }

    visitors_by_source: Dict[str, int] = {
        src: cnt
        for src, cnt in db.query(Event.source, func.count(func.distinct(_actor_expr())))
        .filter(Event.org_id == org_id, Event.source.isnot(None))
        .group_by(Event.source)
        .all()
    }

    result = []
    for channel, user_ids in channel_users.items():
        uid_set = set(user_ids)
        signups = len(user_ids)
        activated = len(uid_set & activated_ids)
        retained = len(uid_set & retained_ids)
        paid = len(uid_set & paid_ids)
        revenue = sum(revenue_by_user.get(uid, 0.0) for uid in user_ids)
        spend = spend_by_channel.get(channel, 0.0)
        visitors = visitors_by_source.get(channel, signups)

        activation_rate = round(activated / signups, 4) if signups > 0 else 0.0
        retention_rate = round(retained / signups, 4) if signups > 0 else 0.0
        paid_conversion_rate = round(paid / signups, 4) if signups > 0 else 0.0
        cac = round(spend / signups, 2) if signups > 0 else 0.0
        roi = round(revenue / spend, 2) if spend > 0 else 0.0
        quality_score = round(
            0.4 * activation_rate + 0.4 * retention_rate + 0.2 * paid_conversion_rate, 4
        )

        result.append(
            {
                "channel": channel,
                "visitors": visitors,
                "signups": signups,
                "activated_users": activated,
                "retained_users": retained,
                "paid_users": paid,
                "activation_rate": activation_rate,
                "retention_rate": retention_rate,
                "paid_conversion_rate": paid_conversion_rate,
                "revenue": round(revenue, 2),
                "spend": round(spend, 2),
                "cac": cac,
                "roi": roi,
                "channel_quality_score": quality_score,
            }
        )

    return sorted(result, key=lambda x: x["channel_quality_score"], reverse=True)


def get_weekly_growth_percent(db: Session, org_id: int) -> float:
    latest = db.query(func.max(User.signup_date)).filter(User.org_id == org_id).scalar()
    if not latest:
        return 0.0

    week_start = latest - timedelta(days=6)
    prev_end = week_start - timedelta(days=1)
    prev_start = prev_end - timedelta(days=6)

    current_week = (
        db.query(func.count(User.id))
        .filter(User.org_id == org_id, User.signup_date >= week_start, User.signup_date <= latest)
        .scalar()
        or 0
    )
    prev_week = (
        db.query(func.count(User.id))
        .filter(User.org_id == org_id, User.signup_date >= prev_start, User.signup_date <= prev_end)
        .scalar()
        or 0
    )

    if prev_week == 0:
        return 100.0 if current_week > 0 else 0.0
    return round((current_week - prev_week) / prev_week * 100, 2)


def get_best_channel(db: Session, org_id: int) -> str:
    MIN_SAMPLE = 5

    channel_totals = (
        db.query(User.acquisition_channel, func.count(User.id).label("total"))
        .filter(User.org_id == org_id)
        .group_by(User.acquisition_channel)
        .all()
    )

    best_channel: Optional[str] = None
    best_rate = -1.0

    for channel, total in channel_totals:
        if total < MIN_SAMPLE:
            continue
        activated = (
            db.query(func.count(func.distinct(Event.user_id)))
            .join(User, Event.user_id == User.id)
            .filter(
                User.org_id == org_id,
                User.acquisition_channel == channel,
                Event.event_name.in_(ACTIVATION_EVENTS),
                Event.user_id.isnot(None),
            )
            .scalar()
            or 0
        )
        rate = activated / total
        if rate > best_rate:
            best_rate = rate
            best_channel = channel

    return best_channel or "unknown"


def get_worst_funnel_step(db: Session, org_id: int) -> str:
    steps = get_funnel_steps(db, org_id)
    worst: Optional[str] = None
    worst_drop = -1.0
    for step in steps[1:]:  # skip first step (always 0% drop-off)
        if step["drop_off_rate"] > worst_drop:
            worst_drop = step["drop_off_rate"]
            worst = step["step"]
    return worst or "unknown"


# ---------------------------------------------------------------------------
# Additional helpers used by specific endpoints
# ---------------------------------------------------------------------------

# ---------------------------------------------------------------------------
# Insights helper functions
# ---------------------------------------------------------------------------

def format_percent(value: float) -> str:
    """Convert a 0-1 float to a clean percentage string, e.g. 0.525 -> '52.5%'."""
    return f"{value * 100:.1f}%"


def get_total_users(db: Session, org_id: int) -> int:
    return get_total_visitors(db, org_id)


def get_activated_users_count(db: Session, org_id: int) -> int:
    return (
        db.query(func.count(func.distinct(Event.user_id)))
        .filter(
            Event.org_id == org_id,
            Event.user_id.isnot(None),
            Event.event_name.in_(ACTIVATION_EVENTS),
        )
        .scalar()
        or 0
    )


def get_paid_users_count(db: Session, org_id: int) -> int:
    paid_from_events = {
        row[0]
        for row in db.query(func.distinct(Event.user_id))
        .filter(
            Event.org_id == org_id,
            Event.event_name == "payment_completed",
            Event.user_id.isnot(None),
        )
        .all()
    }
    paid_from_revenue = {
        row[0]
        for row in db.query(func.distinct(RevenueEvent.user_id))
        .filter(RevenueEvent.org_id == org_id)
        .all()
    }
    return len(paid_from_events | paid_from_revenue)


def get_onboarding_completion_rate(db: Session, org_id: int) -> float:
    total = get_total_visitors(db, org_id)
    if total == 0:
        return 0.0
    completed = (
        db.query(func.count(func.distinct(Event.user_id)))
        .filter(
            Event.org_id == org_id,
            Event.event_name == "onboarding_completed",
            Event.user_id.isnot(None),
        )
        .scalar()
        or 0
    )
    return round(completed / total, 4)


def get_average_week_1_retention(db: Session, org_id: int) -> float:
    """Weighted week-1 retention across mature cohorts with at least 5 users."""
    cohorts = get_retention_cohorts(db, org_id)
    latest_event_date = (
        db.query(func.max(func.date(Event.event_time)))
        .filter(Event.org_id == org_id)
        .scalar()
    )
    if isinstance(latest_event_date, str):
        latest_event_date = datetime.strptime(latest_event_date, "%Y-%m-%d").date()
    if not latest_event_date:
        return 0.0

    eligible = []
    for cohort in cohorts:
        if cohort["cohort_size"] < 5:
            continue
        cohort_start = datetime.strptime(cohort["cohort_week"], "%Y-%m-%d").date()
        if latest_event_date >= cohort_start + timedelta(days=14):
            eligible.append(cohort)

    total_users = sum(c["cohort_size"] for c in eligible)
    if total_users == 0:
        return 0.0
    retained_users = sum(c["cohort_size"] * (c["week_1"] / 100) for c in eligible)
    return round(retained_users / total_users, 4)


def get_high_risk_churn_count(db: Session, org_id: int) -> tuple:
    """Return (high_risk_count, ml_used). Falls back to rule-based if ML unavailable."""
    try:
        from ml.predict import load_model, predict_churn_risk

        model, _, _ = load_model()
        if model is not None:
            predictions = predict_churn_risk(db, org_id=org_id, limit=10000)
            count = sum(1 for p in predictions if p["risk_level"] == "high")
            return count, True
    except Exception:
        pass
    users = get_churn_risk_users(db, org_id, limit=10000)
    count = sum(1 for u in users if u["risk_level"] == "high")
    return count, False


def get_best_and_worst_channels(db: Session, org_id: int) -> tuple:
    """Return (best_channel_dict, worst_channel_dict) sorted by quality score.
    Worst is the lowest-quality channel with at least 5 signups."""
    stats = get_channel_stats(db, org_id)
    if not stats:
        return None, None
    best = stats[0]  # already sorted by quality score descending
    qualified = [s for s in stats if s["signups"] >= 5]
    if not qualified:
        return best, None
    worst = min(qualified, key=lambda x: x["channel_quality_score"])
    return best, worst


def get_biggest_funnel_drop(db: Session, org_id: int) -> Optional[Dict[str, Any]]:
    """Return the funnel step with the highest drop-off rate (first step excluded)."""
    drops = get_funnel_drop_details(get_funnel_steps(db, org_id))
    if not drops:
        return None
    return max(drops, key=lambda x: x["drop_off_rate"])


FUNNEL_EXPERIMENT_MAP: Dict[str, Dict[str, str]] = {
    "Signup Started": {
        "category": "landing_page",
        "experiment": (
            "Test landing-page messaging, CTA placement, or signup entry friction "
            "to move more visitors into signup."
        ),
    },
    "Signup Completed": {
        "category": "signup",
        "experiment": (
            "Simplify signup fields, improve trust copy, or reduce form friction "
            "to increase completed signups."
        ),
    },
    "Onboarding Completed": {
        "category": "onboarding",
        "experiment": (
            "Shorten onboarding, add progress indicators, or personalize first-run setup "
            "to improve onboarding completion."
        ),
    },
    "Key Action": {
        "category": "key_action",
        "experiment": (
            "Improve event recommendations, search, empty states, or post-onboarding "
            "prompts to increase first key actions."
        ),
    },
    "Retained": {
        "category": "retention_lifecycle",
        "experiment": (
            "Test Day 3 reminders, personalized event alerts, digest emails, push "
            "notifications, or re-engagement campaigns to drive returning users."
        ),
    },
}


def get_funnel_drop_details(steps: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    drops = []
    for idx in range(1, len(steps)):
        previous = steps[idx - 1]
        current = steps[idx]
        mapping = FUNNEL_EXPERIMENT_MAP.get(
            current["step"],
            {
                "category": "funnel",
                "experiment": "Test a clearer next step to improve conversion.",
            },
        )
        drops.append(
            {
                **current,
                "previous_step": previous["step"],
                "previous_users": previous["users"],
                "transition": f"{previous['step']} -> {current['step']}",
                "experiment_category": mapping["category"],
                "experiment_text": mapping["experiment"],
            }
        )
    return drops


def _append_unique(items: List[str], item: Optional[str]) -> None:
    if item and item not in items:
        items.append(item)


def get_weekly_insights(db: Session, org_id: int, org_name: str) -> Dict[str, Any]:
    total_users = get_total_users(db, org_id)
    activation_rate = get_activation_rate(db, org_id)
    retention_rate = get_retention_rate(db, org_id)
    funnel_steps = get_funnel_steps(db, org_id)
    funnel_drops = get_funnel_drop_details(funnel_steps)
    channel_stats = get_channel_stats(db, org_id)
    activated_users = get_activated_users_count(db, org_id)
    paid_users = get_paid_users_count(db, org_id)
    onboarding_rate = get_onboarding_completion_rate(db, org_id)
    avg_week1_retention = get_average_week_1_retention(db, org_id)
    high_risk_count, ml_used = get_high_risk_churn_count(db, org_id)
    best_channel, worst_channel = get_best_and_worst_channels(db, org_id)
    biggest_drop = max(funnel_drops, key=lambda x: x["drop_off_rate"], default=None)
    churn_alert_threshold = 0.35

    paid_pct = paid_users / total_users if total_users else 0.0
    paid_of_activated_pct = paid_users / activated_users if activated_users else 0.0
    referral_channel = next(
        (c for c in channel_stats if c["channel"].lower() == "referral"),
        None,
    )
    non_referral_retention = [
        c["retention_rate"]
        for c in channel_stats
        if c["channel"].lower() != "referral"
    ]
    avg_non_referral_retention = (
        sum(non_referral_retention) / len(non_referral_retention)
        if non_referral_retention
        else 0.0
    )
    paid_ads_channel = next(
        (c for c in channel_stats if c["channel"].lower() == "paid ads"),
        None,
    )
    high_drop_steps = sorted(
        [drop for drop in funnel_drops if drop["drop_off_rate"] > 0.35],
        key=lambda x: x["drop_off_rate"],
        reverse=True,
    )

    risks: List[str] = []
    if total_users and high_risk_count >= total_users * churn_alert_threshold:
        source = "ML model" if ml_used else "Risk analysis"
        risks.append(
            f"{source} flags {high_risk_count:,} users "
            f"({format_percent(high_risk_count / total_users)} of total) "
            "as high churn risk. Immediate re-engagement is recommended."
        )

    if retention_rate < 0.30:
        risks.append(
            f"Retention is {format_percent(retention_rate)}, below the 30.0% "
            "healthy threshold. Users are not returning after signup."
        )

    if biggest_drop and biggest_drop["drop_off_rate"] > 0.45:
        risks.append(
            f"{biggest_drop['transition']} has a "
            f"{format_percent(biggest_drop['drop_off_rate'])} drop-off. "
            "This is the largest funnel leak."
        )

    if activation_rate < 0.45:
        risks.append(
            f"Activation rate is {format_percent(activation_rate)}, below the "
            "45.0% target. More than half of signups are not reaching the key action."
        )

    low_quality_channels = [
        c for c in channel_stats if c["retention_rate"] < 0.15 and c["signups"] > 50
    ]
    if low_quality_channels:
        channel = min(low_quality_channels, key=lambda x: x["retention_rate"])
        risks.append(
            f"{channel['channel']} drives {channel['signups']:,} signups but only "
            f"{format_percent(channel['retention_rate'])} retention. "
            "This channel may be attracting low-quality users."
        )

    if total_users and paid_pct < 0.08:
        risks.append(
            f"Only {format_percent(paid_pct)} of users have converted to paid. "
            "Revenue conversion is below the 8.0% benchmark."
        )
    risks = risks[:6]

    opportunities: List[str] = []
    if best_channel:
        opportunities.append(
            f"{best_channel['channel']} is the highest-quality acquisition channel "
            f"(activation {format_percent(best_channel['activation_rate'])}, "
            f"retention {format_percent(best_channel['retention_rate'])}, "
            f"quality score {best_channel['channel_quality_score']:.2f}). "
            "Consider increasing investment here."
        )

    if (
        referral_channel
        and avg_non_referral_retention > 0
        and referral_channel["retention_rate"] > avg_non_referral_retention * 1.3
    ):
        lift = (
            referral_channel["retention_rate"] / avg_non_referral_retention - 1
        )
        opportunities.append(
            f"Referral retention is {format_percent(referral_channel['retention_rate'])}, "
            f"{format_percent(lift)} higher than the non-referral channel average. "
            "A referral incentive program could improve overall retention."
        )

    if paid_of_activated_pct > 0.15:
        opportunities.append(
            f"Activated users convert to paid at {format_percent(paid_of_activated_pct)}, "
            "which is a strong monetization signal. Scaling activation could directly "
            "improve revenue."
        )

    if activation_rate > 0.50:
        opportunities.append(
            f"Activation is strong at {format_percent(activation_rate)}. "
            "The next opportunity is converting activated users into retained or paid users."
        )
    opportunities = opportunities[:4]

    experiments: List[str] = []
    experiment_categories = set()
    if high_risk_count > 100:
        _append_unique(
            experiments,
            f"Run a reactivation campaign for {high_risk_count:,} high-risk users. "
            "Test feature highlights against personal check-ins.",
        )
        experiment_categories.add("churn_reactivation")

    for drop in high_drop_steps[:2]:
        category = drop["experiment_category"]
        if category in experiment_categories:
            continue
        _append_unique(
            experiments,
            f"{drop['transition']} has {format_percent(drop['drop_off_rate'])} "
            f"drop-off. {drop['experiment_text']}",
        )
        experiment_categories.add(category)
        funnel_categories = {
            "landing_page",
            "signup",
            "onboarding",
            "key_action",
            "retention_lifecycle",
        }
        if len([d for d in experiment_categories if d in funnel_categories]) >= 2:
            break

    if onboarding_rate < 0.55 and "onboarding" not in experiment_categories:
        _append_unique(
            experiments,
            f"Test a shorter onboarding flow. Only {format_percent(onboarding_rate)} "
            "of users complete onboarding, so reducing steps may improve activation.",
        )
        experiment_categories.add("onboarding")

    if best_channel and worst_channel and best_channel["channel"] != worst_channel["channel"]:
        if paid_ads_channel and paid_ads_channel["spend"] > 0:
            _append_unique(
                experiments,
                f"Reduce or cap Paid Ads spend and reallocate a test budget toward "
                f"{best_channel['channel']}-style acquisition. Paid Ads retention is "
                f"{format_percent(paid_ads_channel['retention_rate'])} versus "
                f"{format_percent(best_channel['retention_rate'])} for {best_channel['channel']}.",
            )
        else:
            _append_unique(
                experiments,
                f"Shift one acquisition test from {worst_channel['channel']} toward "
                f"{best_channel['channel']}, then compare retained-user CAC and quality score.",
            )
        experiment_categories.add("channel_allocation")

    if (
        (avg_week1_retention < 0.30 or retention_rate < 0.30)
        and "retention_lifecycle" not in experiment_categories
    ):
        _append_unique(
            experiments,
            f"Test a Day 3 lifecycle sequence with personalized event alerts or digest emails. "
            f"Weighted Week 1 retention is {format_percent(avg_week1_retention)}.",
        )
        experiment_categories.add("retention_lifecycle")

    experiments = experiments[:5]

    sentence_1 = (
        f"{org_name} has {total_users:,} users with "
        f"{format_percent(activation_rate)} activation and "
        f"{format_percent(retention_rate)} retention."
    )
    if total_users and high_risk_count >= total_users * churn_alert_threshold:
        source = "ML model" if ml_used else "Risk analysis"
        sentence_2 = (
            f"The main risk is churn: {source} flags {high_risk_count:,} users "
            f"({format_percent(high_risk_count / total_users)}) as high risk."
        )
    elif risks:
        sentence_2 = risks[0]
    else:
        sentence_2 = "No critical risk crossed the current alert threshold."

    if best_channel:
        sentence_3 = (
            f"The clearest opportunity is {best_channel['channel']}, with "
            f"{format_percent(best_channel['activation_rate'])} activation and "
            f"{format_percent(best_channel['retention_rate'])} retention."
        )
    else:
        sentence_3 = "The clearest opportunity is improving acquisition quality."

    if biggest_drop:
        sentence_4 = (
            f"This week, prioritize reactivation and the "
            f"{biggest_drop['transition']} funnel leak."
        )
    else:
        sentence_4 = "This week, prioritize reactivation and onboarding quality."

    return {
        "summary": f"{sentence_1} {sentence_2} {sentence_3} {sentence_4}",
        "risks": risks,
        "opportunities": opportunities,
        "recommended_experiments": experiments,
    }


def get_new_users_this_week(db: Session, org_id: int) -> int:
    latest = db.query(func.max(User.signup_date)).filter(User.org_id == org_id).scalar()
    if not latest:
        return 0
    week_start = latest - timedelta(days=6)
    return (
        db.query(func.count(User.id))
        .filter(User.org_id == org_id, User.signup_date >= week_start, User.signup_date <= latest)
        .scalar()
        or 0
    )


def get_retention_cohorts(db: Session, org_id: int) -> List[Dict[str, Any]]:
    users = db.query(User.id, User.signup_date).filter(User.org_id == org_id).all()
    if not users:
        return []

    user_id_list = [u[0] for u in users]

    # Fetch (user_id, date) for all meaningful activity; PostgreSQL date() strips timezone.
    event_rows = (
        db.query(Event.user_id, func.date(Event.event_time))
        .filter(
            Event.org_id == org_id,
            Event.user_id.in_(user_id_list),
            Event.event_name.in_(MEANINGFUL_EVENTS),
        )
        .all()
    )

    events_by_user: Dict[int, List] = {}
    for uid, edate in event_rows:
        events_by_user.setdefault(uid, []).append(edate)

    # Group users by ISO week start (Monday)
    cohorts: Dict[str, List] = {}
    for uid, signup_date in users:
        week_start = signup_date - timedelta(days=signup_date.weekday())
        week_key = week_start.strftime("%Y-%m-%d")
        cohorts.setdefault(week_key, []).append((uid, signup_date))

    result = []
    for week_key in sorted(cohorts.keys()):
        cohort_users = cohorts[week_key]
        cohort_size = len(cohort_users)
        cohort_start = cohort_users[0][1] - timedelta(
            days=cohort_users[0][1].weekday()
        )
        week_counts = {n: 0 for n in range(1, 5)}

        for uid, _signup_date in cohort_users:
            user_dates = events_by_user.get(uid, [])
            for week_num in range(1, 5):
                ws = cohort_start + timedelta(weeks=week_num)
                we = ws + timedelta(days=7)
                if any(ws <= ed < we for ed in user_dates):
                    week_counts[week_num] += 1

        result.append(
            {
                "cohort_week": week_key,
                "cohort_size": cohort_size,
                "week_0": 100.0,
                "week_1": round(week_counts[1] / cohort_size * 100, 1) if cohort_size > 0 else 0.0,
                "week_2": round(week_counts[2] / cohort_size * 100, 1) if cohort_size > 0 else 0.0,
                "week_3": round(week_counts[3] / cohort_size * 100, 1) if cohort_size > 0 else 0.0,
                "week_4": round(week_counts[4] / cohort_size * 100, 1) if cohort_size > 0 else 0.0,
            }
        )

    return result


def get_churn_risk_users(db: Session, org_id: int, limit: int = 50) -> List[Dict[str, Any]]:
    # Use the latest event date in the dataset as the reference "today"
    ref_date = (
        db.query(func.max(func.date(Event.event_time))).filter(Event.org_id == org_id).scalar()
    )
    if not ref_date:
        return []

    users = db.query(User).filter(User.org_id == org_id).all()
    user_ids = [u.id for u in users]

    # Last meaningful activity date per user (exclude inactive_14_days)
    last_active_rows = (
        db.query(Event.user_id, func.max(func.date(Event.event_time)).label("last_active"))
        .filter(
            Event.org_id == org_id,
            Event.user_id.in_(user_ids),
            Event.event_name != "inactive_14_days",
        )
        .group_by(Event.user_id)
        .all()
    )
    last_active_by_user: Dict[int, Any] = {uid: d for uid, d in last_active_rows}

    onboarded_ids = {
        row[0]
        for row in db.query(func.distinct(Event.user_id))
        .filter(
            Event.org_id == org_id,
            Event.event_name == "onboarding_completed",
            Event.user_id.isnot(None),
        )
        .all()
    }

    registered_ids = {
        row[0]
        for row in db.query(func.distinct(Event.user_id))
        .filter(
            Event.org_id == org_id,
            Event.event_name == "event_registered",
            Event.user_id.isnot(None),
        )
        .all()
    }

    paid_ids = {
        row[0]
        for row in db.query(func.distinct(RevenueEvent.user_id))
        .filter(RevenueEvent.org_id == org_id)
        .all()
    }

    total_events_by_user: Dict[int, int] = {
        uid: cnt
        for uid, cnt in db.query(Event.user_id, func.count(Event.id))
        .filter(Event.org_id == org_id, Event.user_id.in_(user_ids))
        .group_by(Event.user_id)
        .all()
    }

    results = []
    for user in users:
        last_active = last_active_by_user.get(user.id)
        if last_active is None:
            days_since = 999
            last_active_str = str(user.signup_date)
        else:
            days_since = (ref_date - last_active).days
            last_active_str = str(last_active)

        has_onboarding = user.id in onboarded_ids
        has_registration = user.id in registered_ids
        is_paid = user.id in paid_ids
        total_events = total_events_by_user.get(user.id, 0)

        # Rule-based risk classification
        if is_paid or days_since <= 4:
            risk_score = 0.20
            risk_level = "low"
            risk_reason = "Paid user" if is_paid else "Active within last 4 days"
            suggested_action = "Ask for referral or feedback"
        elif days_since > 10 and not has_onboarding:
            risk_score = 0.85
            risk_level = "high"
            risk_reason = "No onboarding completed and inactive for 10+ days"
            suggested_action = "Send onboarding reminder email"
        elif 5 <= days_since <= 9 or (has_onboarding and not has_registration):
            risk_score = 0.55
            risk_level = "medium"
            if has_onboarding and not has_registration:
                risk_reason = "Completed onboarding but never registered for an event"
            else:
                risk_reason = f"Inactive for {days_since} days"
            suggested_action = "Send re-engagement email with popular events"
        else:
            risk_score = 0.55
            risk_level = "medium"
            risk_reason = f"Inactive for {days_since} days"
            suggested_action = "Send re-engagement email with popular events"

        results.append(
            {
                "user_id": user.id,
                "external_user_id": user.external_user_id,
                "acquisition_channel": user.acquisition_channel,
                "signup_date": str(user.signup_date),
                "last_active_at": last_active_str,
                "days_since_last_active": days_since,
                "total_events": total_events,
                "risk_score": risk_score,
                "risk_level": risk_level,
                "risk_reason": risk_reason,
                "suggested_action": suggested_action,
            }
        )

    results.sort(key=lambda x: x["risk_score"], reverse=True)
    return results[:limit]
