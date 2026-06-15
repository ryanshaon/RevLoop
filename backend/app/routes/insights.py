from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.models import Insight
from app.routes.common import require_organization
from app.schemas.insights import InsightsSummary
from app.services import metrics

router = APIRouter(prefix="/insights", tags=["insights"])


@router.get("/weekly-summary", response_model=InsightsSummary)
def get_weekly_summary(org_id: int = 1, db: Session = Depends(get_db)):
    org = require_organization(db, org_id)
    total_users = metrics.get_total_visitors(db, org_id)
    new_users = metrics.get_new_users_this_week(db, org_id)
    activation_rate = metrics.get_activation_rate(db, org_id)
    retention_rate = metrics.get_retention_rate(db, org_id)
    best_channel = metrics.get_best_channel(db, org_id)
    worst_funnel_step = metrics.get_worst_funnel_step(db, org_id)
    weekly_growth = metrics.get_weekly_growth_percent(db, org_id)
    funnel_steps = metrics.get_funnel_steps(db, org_id)
    channel_stats = metrics.get_channel_stats(db, org_id)

    risks = []
    opportunities = []
    experiments = []

    if activation_rate < 0.50:
        risks.append(
            f"Activation rate is below 50% (currently {activation_rate * 100:.1f}%)."
        )

    if retention_rate < 0.35:
        risks.append(
            f"Retention rate is {retention_rate * 100:.1f}%, below the healthy 35% threshold."
        )

    if channel_stats:
        top = channel_stats[0]
        if len(channel_stats) > 1 and top["channel_quality_score"] > 0:
            second = channel_stats[1]
            score_gap = top["channel_quality_score"] - second["channel_quality_score"]
            if score_gap >= 0.05:
                opportunities.append(
                    f"'{top['channel']}' is the highest-quality acquisition channel "
                    f"(quality score {top['channel_quality_score']:.2f} vs "
                    f"{second['channel_quality_score']:.2f} for '{second['channel']}') — "
                    f"consider increasing spend here."
                )
            else:
                opportunities.append(
                    f"'{top['channel']}' leads on quality score ({top['channel_quality_score']:.2f}). "
                    f"Channels are relatively balanced — review ROI to decide where to scale."
                )

    for step in funnel_steps[1:]:
        if step["drop_off_rate"] > 0.40:
            experiments.append(
                f"A/B test improvements at '{step['step']}' — "
                f"drop-off rate is {step['drop_off_rate'] * 100:.1f}%."
            )

    db_insights = (
        db.query(Insight)
        .filter(Insight.org_id == org_id, Insight.severity.in_(["warning", "critical"]))
        .order_by(Insight.created_at.desc())
        .limit(5)
        .all()
    )
    for insight in db_insights:
        if insight.insight_type == "funnel_drop":
            experiments.append(insight.insight_text)
        elif insight.severity == "critical":
            risks.append(insight.insight_text)

    growth_sign = "+" if weekly_growth >= 0 else ""
    summary = (
        f"{org.name} has {total_users:,} total users with {new_users} new signups this week "
        f"({growth_sign}{weekly_growth:.1f}% week-over-week growth). "
        f"Activation rate is {activation_rate * 100:.1f}% and retention rate is "
        f"{retention_rate * 100:.1f}%. "
        f"Top acquisition channel is '{best_channel}'; "
        f"the biggest funnel drop-off is at '{worst_funnel_step}'."
    )

    return {
        "summary": summary,
        "risks": risks,
        "opportunities": opportunities,
        "recommended_experiments": experiments,
    }
