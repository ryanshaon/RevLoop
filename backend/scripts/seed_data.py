"""
RevLoop seed data generator.

Generates realistic demo data for "Campus Connect Demo" and writes:
  - generated_data/*.csv        (one file per table)
  - generated_data/seed.sql     (INSERT statements for all tables)

Run from repo root:
  python backend/scripts/seed_data.py
"""

import csv
import hashlib
import json
import random
import uuid
from datetime import date, datetime, timedelta, timezone
from pathlib import Path

# ── Config ────────────────────────────────────────────────────────────────────
RANDOM_SEED = 42
random.seed(RANDOM_SEED)

OUT_DIR = Path(__file__).parent / "generated_data"
OUT_DIR.mkdir(parents=True, exist_ok=True)

START_DATE = date(2026, 4, 20)   # week 0 Monday
WEEKS = 8
END_DATE = START_DATE + timedelta(days=WEEKS * 7 - 1)
START_TIME = datetime(
    START_DATE.year, START_DATE.month, START_DATE.day, tzinfo=timezone.utc
)
END_TIME = datetime(
    END_DATE.year, END_DATE.month, END_DATE.day, 23, 59, 59, tzinfo=timezone.utc
)

TOTAL_VISITORS     = 2_500
TOTAL_SIGNED_UP    = 800
TOTAL_ACTIVATED    = 420
TOTAL_RETAINED     = 210
TOTAL_PAID         = 75

ORG_ID = 1

# ── Channel distribution ──────────────────────────────────────────────────────
# Each entry: (channel, visitor_share, activation_rate, retention_rate, pay_rate)
CHANNEL_PROFILE = [
    ("Instagram",  0.35, 0.48, 0.38, 0.07),
    ("WhatsApp",   0.22, 0.62, 0.58, 0.11),
    ("Referral",   0.12, 0.75, 0.72, 0.16),
    ("LinkedIn",   0.08, 0.55, 0.50, 0.10),
    ("Organic",    0.15, 0.58, 0.52, 0.10),
    ("Paid Ads",   0.08, 0.40, 0.28, 0.06),
]

COUNTRIES = ["US", "NG", "IN", "GB", "CA", "AU", "GH", "KE"]
DEVICES   = ["mobile", "desktop", "tablet"]
DEVICE_W  = [0.62, 0.30, 0.08]

PAGES = [
    "/", "/events", "/signup", "/onboarding",
    "/dashboard", "/profile", "/search", "/settings",
]

# ── Helpers ───────────────────────────────────────────────────────────────────

def week_start(week: int) -> date:
    return START_DATE + timedelta(weeks=week)


def rand_ts(day: date, hour_min: int = 8, hour_max: int = 23) -> datetime:
    h = random.randint(hour_min, hour_max)
    m = random.randint(0, 59)
    s = random.randint(0, 59)
    return datetime(day.year, day.month, day.day, h, m, s, tzinfo=timezone.utc)


def rand_day_in_week(week: int) -> date:
    base = week_start(week)
    return base + timedelta(days=random.randint(0, 6))


def email_hash(uid: str) -> str:
    return hashlib.sha256(f"user_{uid}@campusconnect.demo".encode()).hexdigest()


def sql_val(v) -> str:
    if v is None:
        return "NULL"
    if isinstance(v, bool):
        return "TRUE" if v else "FALSE"
    if isinstance(v, (int, float)):
        return str(v)
    if isinstance(v, dict):
        escaped = json.dumps(v).replace("'", "''")
        return f"'{escaped}'"
    escaped = str(v).replace("'", "''")
    return f"'{escaped}'"


def write_csv(name: str, rows: list[dict], fieldnames: list[str]) -> None:
    path = OUT_DIR / f"{name}.csv"
    with open(path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)


# ── 1. Organization ───────────────────────────────────────────────────────────

org_rows = [{
    "id": ORG_ID,
    "name": "Campus Connect Demo",
    "website": "https://campusideaz.com",
    "industry": "College Events / Student Engagement",
    "created_at": START_TIME.isoformat(),
}]

# ── 2. Users ──────────────────────────────────────────────────────────────────

user_rows: list[dict] = []
user_id_counter = 1

# We'll track per-user metadata for event generation
# user_meta[user_id] = {channel, signup_week, activated, retained, paid, plan_type}
user_meta: dict[int, dict] = {}

# Distribute signed-up users across channels proportionally
channel_user_counts: dict[str, int] = {}
remaining = TOTAL_SIGNED_UP
for i, (ch, vis_share, act_rate, ret_rate, pay_rate) in enumerate(CHANNEL_PROFILE):
    if i == len(CHANNEL_PROFILE) - 1:
        channel_user_counts[ch] = remaining
    else:
        n = round(TOTAL_SIGNED_UP * vis_share)
        channel_user_counts[ch] = n
        remaining -= n

# Now assign activation / retention / paid flags respecting totals
# We'll do a two-pass: assign probabilistically, then clip to exact totals.
user_candidates: list[dict] = []
for ch, vis_share, act_rate, ret_rate, pay_rate in CHANNEL_PROFILE:
    n = channel_user_counts[ch]
    for _ in range(n):
        activated = random.random() < act_rate
        retained  = activated and (random.random() < ret_rate)
        paid      = retained and (random.random() < pay_rate)
        user_candidates.append({
            "channel": ch,
            "activated": activated,
            "retained": retained,
            "paid": paid,
        })

random.shuffle(user_candidates)

# Clip to exact funnel counts
activated_so_far = 0
retained_so_far  = 0
paid_so_far      = 0

for c in user_candidates:
    if c["activated"] and activated_so_far >= TOTAL_ACTIVATED:
        c["activated"] = False
    if c["activated"]:
        activated_so_far += 1

    if c["retained"] and (not c["activated"] or retained_so_far >= TOTAL_RETAINED):
        c["retained"] = False
    if c["retained"]:
        retained_so_far += 1

    if c["paid"] and (not c["retained"] or paid_so_far >= TOTAL_PAID):
        c["paid"] = False
    if c["paid"]:
        paid_so_far += 1

# Force exact counts if rounding left us short
def _force_flag(candidates, flag, prerequisite, target, current):
    if current >= target:
        return current
    pool = [c for c in candidates if c.get(prerequisite, True) and not c[flag]]
    random.shuffle(pool)
    for c in pool[:target - current]:
        c[flag] = True
    return target

activated_so_far = _force_flag(user_candidates, "activated", None, TOTAL_ACTIVATED, activated_so_far)
retained_so_far  = _force_flag(user_candidates, "retained", "activated", TOTAL_RETAINED, retained_so_far)
paid_so_far      = _force_flag(user_candidates, "paid", "retained", TOTAL_PAID, paid_so_far)

for c in user_candidates:
    uid    = user_id_counter
    ext_id = f"usr_{uuid.UUID(int=random.getrandbits(128)).hex[:12]}"
    # Retained users need at least one later week in the observation window.
    week = random.randint(0, WEEKS - 2 if c["retained"] else WEEKS - 1)
    if c["activated"] and week == WEEKS - 1:
        signup_day = week_start(week) + timedelta(days=random.randint(0, 4))
    else:
        signup_day = rand_day_in_week(week)
    plan   = "paid" if c["paid"] else "free"
    country = random.choices(COUNTRIES, weights=[30,20,15,10,8,6,6,5])[0]
    device  = random.choices(DEVICES, weights=DEVICE_W)[0]

    user_rows.append({
        "id": uid,
        "org_id": ORG_ID,
        "external_user_id": ext_id,
        "email_hash": email_hash(ext_id),
        "signup_date": signup_day.isoformat(),
        "acquisition_channel": c["channel"],
        "country": country,
        "device": device,
        "plan_type": plan,
        "created_at": rand_ts(signup_day, 0, 5).isoformat(),
    })

    user_meta[uid] = {
        "channel": c["channel"],
        "signup_week": week,
        "signup_day": signup_day,
        "activated": c["activated"],
        "retained": c["retained"],
        "paid": c["paid"],
        "device": device,
    }
    user_id_counter += 1

abandoned_checkout_ids = set(random.sample(
    [uid for uid, meta in user_meta.items() if meta["retained"] and not meta["paid"]],
    30,
))

# ── 3. Events ─────────────────────────────────────────────────────────────────

event_rows: list[dict] = []
event_id_counter = 1

def make_event(
    user_id,
    anon_id,
    event_name: str,
    event_time: datetime,
    session_id: str,
    source: str,
    page: str,
    props: dict | None = None,
) -> dict:
    global event_id_counter
    e = {
        "id": event_id_counter,
        "org_id": ORG_ID,
        "user_id": user_id,
        "anonymous_id": anon_id,
        "event_name": event_name,
        "event_time": event_time.isoformat(),
        "session_id": session_id,
        "source": source,
        "page": page,
        "properties_json": json.dumps(props or {}),
        "created_at": event_time.isoformat(),
    }
    event_id_counter += 1
    return e


# 3a. Anonymous visitor events (pre-signup)
# 2500 total visitors; 800 sign up → 1700 anonymous-only visitors
anon_only_count = TOTAL_VISITORS - TOTAL_SIGNED_UP

for _ in range(anon_only_count):
    anon_id  = f"anon_{uuid.UUID(int=random.getrandbits(128)).hex[:16]}"
    channel  = random.choices(
        [c[0] for c in CHANNEL_PROFILE],
        weights=[c[1] for c in CHANNEL_PROFILE],
    )[0]
    week     = random.randint(0, WEEKS - 1)
    day      = rand_day_in_week(week)
    session  = f"s_{uuid.UUID(int=random.getrandbits(128)).hex[:12]}"

    n_page_views = random.randint(2, 7)
    for pv in range(n_page_views):
        ts = rand_ts(day)
        event_rows.append(make_event(
            None, anon_id, "page_viewed", ts, session, channel, random.choice(PAGES),
            {"channel": channel, "page_num": pv + 1},
        ))

    # Some anonymous visitors start signup but don't finish
    if random.random() < 0.30:
        ts = rand_ts(day)
        event_rows.append(make_event(
            None, anon_id, "signup_started", ts, session, channel, "/signup",
            {"channel": channel},
        ))

# 3b. Signed-up user events
for uid, meta in user_meta.items():
    week      = meta["signup_week"]
    day       = meta["signup_day"]
    channel   = meta["channel"]
    device    = meta["device"]
    session   = f"s_{uuid.UUID(int=random.getrandbits(128)).hex[:12]}"
    anon_id   = f"anon_{uuid.UUID(int=random.getrandbits(128)).hex[:16]}"

    # Pre-signup: page_view + signup_started (as anon)
    for pv in range(random.randint(2, 5)):
        ts = rand_ts(day, 8, 16)
        event_rows.append(make_event(
            None, anon_id, "page_viewed", ts, session, channel, "/",
            {"channel": channel, "device": device},
        ))

    ts = rand_ts(day, 17, 20)
    event_rows.append(make_event(
        None, anon_id, "signup_started", ts, session, channel, "/signup",
        {"channel": channel},
    ))

    # signup_completed — now user_id is known
    ts = rand_ts(day, 20, 22)
    event_rows.append(make_event(
        uid, anon_id, "signup_completed", ts, session, channel, "/signup",
        {"channel": channel, "device": device},
    ))

    if meta["activated"]:
        act_day = day + timedelta(days=random.randint(1, 2))
        act_session = f"s_{uuid.UUID(int=random.getrandbits(128)).hex[:12]}"

        for _ in range(random.randint(2, 4)):
            ts = rand_ts(act_day, 9, 12)
            event_rows.append(make_event(
                uid, None, "event_viewed", ts, act_session, channel, "/events",
                {"event_id": random.randint(1, 30)},
            ))

        ts = rand_ts(act_day, 12, 15)
        event_rows.append(make_event(
            uid, None, "event_registered", ts, act_session, channel, "/events",
            {"event_id": random.randint(1, 30)},
        ))

        ts = rand_ts(act_day, 15, 18)
        event_rows.append(make_event(
            uid, None, "onboarding_completed", ts, act_session, channel, "/onboarding",
            {},
        ))

        # Search events
        for _ in range(random.randint(2, 4)):
            ts = rand_ts(act_day, 10, 22)
            event_rows.append(make_event(
                uid, None, "search_performed", ts, act_session, channel, "/search",
                {"query": random.choice(["campus party", "hackathon", "study group", "sports", "music"])},
            ))

        # Invite
        if random.random() < 0.4:
            ts = rand_ts(act_day, 14, 20)
            event_rows.append(make_event(
                uid, None, "invite_sent", ts, act_session, channel, "/dashboard",
                {"invites_sent": random.randint(1, 5)},
            ))

    if meta["retained"]:
        # Return in a later week
        available_weeks = list(range(week + 1, WEEKS))
        return_weeks = sorted(random.sample(
            available_weeks,
            k=min(4, len(available_weeks)),
        ))
        for rw in return_weeks:
            r_day = rand_day_in_week(rw)
            r_session = f"s_{uuid.UUID(int=random.getrandbits(128)).hex[:12]}"
            ts = rand_ts(r_day)
            event_rows.append(make_event(
                uid, None, "user_returned", ts, r_session, channel, "/dashboard",
                {"days_since_signup": (r_day - day).days},
            ))
            for _ in range(random.randint(2, 5)):
                ts = rand_ts(r_day, 10, 22)
                event_rows.append(make_event(
                    uid, None, "event_viewed", ts, r_session, channel, "/events",
                    {"event_id": random.randint(1, 30)},
                ))
            for _ in range(random.randint(1, 2)):
                ts = rand_ts(r_day, 10, 22)
                event_rows.append(make_event(
                    uid, None, "search_performed", ts, r_session, channel, "/search",
                    {"query": random.choice(["campus party", "hackathon", "study group", "sports", "music"])},
                ))

    if meta["paid"] or uid in abandoned_checkout_ids:
        pay_week_min = min(week + 1, WEEKS - 1)
        pay_week = random.randint(pay_week_min, WEEKS - 1)
        pay_day = rand_day_in_week(pay_week)
        p_session = f"s_{uuid.UUID(int=random.getrandbits(128)).hex[:12]}"
        payment_started_at = rand_ts(pay_day, 10, 15)
        event_rows.append(make_event(
            uid, None, "payment_started", payment_started_at, p_session, channel, "/settings",
            {"plan": "pro"},
        ))

        if meta["paid"]:
            amount = random.choices(
                [4.99, 9.99, 19.99, 49.99],
                weights=[0.15, 0.50, 0.25, 0.10],
            )[0]
            revenue_type = random.choices(
                ["subscription", "one_time", "upgrade"],
                weights=[0.6, 0.25, 0.15],
            )[0]
            payment_completed_at = payment_started_at + timedelta(
                minutes=random.randint(2, 30)
            )
            event_rows.append(make_event(
                uid, None, "payment_completed", payment_completed_at, p_session, channel, "/settings",
                {"plan": "pro", "amount": amount},
            ))
            meta["payment"] = {
                "event_time": payment_completed_at,
                "amount": amount,
                "revenue_type": revenue_type,
            }

# System churn markers are based on the latest actual user activity.
for uid, meta in user_meta.items():
    if meta["retained"]:
        continue
    user_times = [
        datetime.fromisoformat(event["event_time"])
        for event in event_rows
        if event["user_id"] == uid
    ]
    inactive_time = max(user_times) + timedelta(days=14)
    if inactive_time <= END_TIME:
        event_rows.append(make_event(
            uid, None, "inactive_14_days", inactive_time, "sys", "system", "/system",
            {},
        ))

# ── 4. Campaigns ──────────────────────────────────────────────────────────────

campaign_defs = [
    ("Instagram Spring Push",   "Instagram",  1_200.00),
    ("WhatsApp Broadcast Q2",   "WhatsApp",     800.00),
    ("Referral Bonus Program",  "Referral",     400.00),
    ("LinkedIn Campus Ads",     "LinkedIn",     600.00),
    ("Google Organic SEO",      "Organic",      200.00),
    ("Meta Paid Acquisition",   "Paid Ads",   1_800.00),
]

campaign_rows: list[dict] = []
for i, (name, channel, spend) in enumerate(campaign_defs, start=1):
    campaign_rows.append({
        "id": i,
        "org_id": ORG_ID,
        "campaign_name": name,
        "channel": channel,
        "spend": spend,
        "start_date": START_DATE.isoformat(),
        "end_date": END_DATE.isoformat(),
        "created_at": START_TIME.isoformat(),
    })

# ── 5. Revenue events ─────────────────────────────────────────────────────────

revenue_rows: list[dict] = []
rev_id_counter = 1

for uid, meta in user_meta.items():
    if not meta["paid"]:
        continue
    payment = meta["payment"]

    revenue_rows.append({
        "id": rev_id_counter,
        "org_id": ORG_ID,
        "user_id": uid,
        "event_time": payment["event_time"].isoformat(),
        "amount": payment["amount"],
        "currency": "USD",
        "revenue_type": payment["revenue_type"],
        "created_at": payment["event_time"].isoformat(),
    })
    rev_id_counter += 1

# ── 6. Experiments ────────────────────────────────────────────────────────────

experiment_defs = [
    (
        "Onboarding Flow v2",
        "Replacing the 5-step wizard with a 2-step quick-start will increase onboarding_completed rate by 15%",
        "onboarding_completed_rate",
        "completed",
        0, 4,
        "v2 lifted completion by 18%. Shipping to 100%.",
    ),
    (
        "Referral Incentive Test",
        "Offering a $5 campus credit for each successful invite will increase invite_sent events by 30%",
        "invite_sent_count",
        "completed",
        2, 6,
        "invite_sent up 34%. CAC dropped 12%.",
    ),
    (
        "Push Notification Re-engagement",
        "Sending a push at 14 days inactive will recover 10% of churned users",
        "user_returned_rate",
        "running",
        5, None,
        None,
    ),
    (
        "Paid Plan Pricing Page",
        "Showing social proof above the CTA will increase payment_started rate",
        "payment_started_rate",
        "draft",
        None, None,
        None,
    ),
    (
        "Search UX Redesign",
        "Autosuggest on the search bar will increase search_performed depth",
        "search_events_per_session",
        "running",
        6, None,
        None,
    ),
]

experiment_rows: list[dict] = []
for i, (name, hypothesis, metric, status, sw, ew, result) in enumerate(experiment_defs, start=1):
    experiment_rows.append({
        "id": i,
        "org_id": ORG_ID,
        "experiment_name": name,
        "hypothesis": hypothesis,
        "target_metric": metric,
        "status": status,
        "start_date": (week_start(sw).isoformat() if sw is not None else None),
        "end_date":   (week_start(ew).isoformat() if ew is not None else None),
        "result_summary": result,
        "created_at": START_TIME.isoformat(),
    })

# ── 7. Insights ───────────────────────────────────────────────────────────────

channel_stats: dict[str, dict[str, int]] = {}
for channel, *_ in CHANNEL_PROFILE:
    members = [meta for meta in user_meta.values() if meta["channel"] == channel]
    channel_stats[channel] = {
        "users": len(members),
        "activated": sum(meta["activated"] for meta in members),
        "retained": sum(meta["retained"] for meta in members),
        "paid": sum(meta["paid"] for meta in members),
    }


def channel_rate(channel: str, flag: str) -> float:
    stats = channel_stats[channel]
    return stats[flag] / stats["users"]


instagram_retention = channel_rate("Instagram", "retained")
overall_retention = TOTAL_RETAINED / TOTAL_SIGNED_UP
referral_paid_rate = channel_rate("Referral", "paid")
paid_ads_paid_rate = channel_rate("Paid Ads", "paid")
linkedin_activation = channel_rate("LinkedIn", "activated")
organic_retention = channel_rate("Organic", "retained")
paid_ads_retention = channel_rate("Paid Ads", "retained")
checkout_abandonment = len(abandoned_checkout_ids) / (
    len(abandoned_checkout_ids) + TOTAL_PAID
)

insight_defs = [
    ("churn_risk",      "High Churn Risk Detected in Instagram Cohort",
     f"Instagram users have {instagram_retention:.1%} later-week retention, below the {overall_retention:.1%} overall rate. Consider a targeted re-engagement sequence.",
     "critical"),
    ("channel_quality", "Referral Channel Has Highest LTV",
     f"Referral users convert to paid at {referral_paid_rate / paid_ads_paid_rate:.1f}x the Paid Ads rate and show {channel_rate('Referral', 'retained'):.1%} later-week retention. Referral spend per signup is about $4.17.",
     "info"),
    ("funnel_drop",     "Signup to Onboarding Drop-off is 47.5%",
     f"Only {TOTAL_ACTIVATED / TOTAL_SIGNED_UP:.1%} of users who complete signup reach onboarding_completed. Review the onboarding flow for avoidable friction.",
     "warning"),
    ("funnel_drop",     f"Payment Started but Not Completed: {checkout_abandonment:.1%} Abandonment",
     f"{checkout_abandonment:.1%} of users who fire payment_started do not reach payment_completed in the demo window. Test checkout reminders or clearer pricing.",
     "warning"),
    ("channel_quality", "LinkedIn Volume is Low but Quality is High",
     f"LinkedIn represents 8% of signed-up users and {linkedin_activation:.1%} of them activate. Consider testing a modest spend increase.",
     "info"),
    ("churn_risk",      "Paid Ads Retention Trails Organic",
     f"Paid Ads later-week retention is {paid_ads_retention:.1%} versus {organic_retention:.1%} for Organic. Review targeting criteria and landing-page fit.",
     "critical"),
]

insight_rows: list[dict] = []
for i, (itype, title, text, severity) in enumerate(insight_defs, start=1):
    insight_rows.append({
        "id": i,
        "org_id": ORG_ID,
        "insight_type": itype,
        "insight_title": title,
        "insight_text": text,
        "severity": severity,
        "created_at": END_TIME.isoformat(),
    })

# ── Write CSVs ────────────────────────────────────────────────────────────────

write_csv("organizations", org_rows,
          ["id", "name", "website", "industry", "created_at"])

write_csv("users", user_rows,
          ["id", "org_id", "external_user_id", "email_hash", "signup_date",
           "acquisition_channel", "country", "device", "plan_type", "created_at"])

write_csv("events", event_rows,
          ["id", "org_id", "user_id", "anonymous_id", "event_name", "event_time",
           "session_id", "source", "page", "properties_json", "created_at"])

write_csv("campaigns", campaign_rows,
          ["id", "org_id", "campaign_name", "channel", "spend",
           "start_date", "end_date", "created_at"])

write_csv("revenue_events", revenue_rows,
          ["id", "org_id", "user_id", "event_time", "amount",
           "currency", "revenue_type", "created_at"])

write_csv("experiments", experiment_rows,
          ["id", "org_id", "experiment_name", "hypothesis", "target_metric",
           "status", "start_date", "end_date", "result_summary", "created_at"])

write_csv("insights", insight_rows,
          ["id", "org_id", "insight_type", "insight_title", "insight_text",
           "severity", "created_at"])

# ── Write seed.sql ────────────────────────────────────────────────────────────

def rows_to_sql(table: str, rows: list[dict]) -> str:
    if not rows:
        return ""
    cols = list(rows[0].keys())
    col_str = ", ".join(cols)
    lines = [f"-- {table}"]
    for row in rows:
        vals = ", ".join(sql_val(row[c]) for c in cols)
        lines.append(f"INSERT INTO {table} ({col_str}) VALUES ({vals});")
    return "\n".join(lines) + "\n"


sql_path = OUT_DIR / "seed.sql"
with open(sql_path, "w", encoding="utf-8") as f:
    f.write("-- RevLoop demo seed data\n")
    f.write("-- Generated by backend/scripts/seed_data.py\n\n")
    f.write("BEGIN;\n")
    f.write(
        "TRUNCATE TABLE insights, experiments, revenue_events, campaigns, "
        "events, users, organizations RESTART IDENTITY CASCADE;\n\n"
    )
    f.write(rows_to_sql("organizations", org_rows))
    f.write("\n")
    f.write(rows_to_sql("users", user_rows))
    f.write("\n")
    f.write(rows_to_sql("campaigns", campaign_rows))
    f.write("\n")
    f.write(rows_to_sql("revenue_events", revenue_rows))
    f.write("\n")
    f.write(rows_to_sql("experiments", experiment_rows))
    f.write("\n")
    f.write(rows_to_sql("insights", insight_rows))
    f.write("\n")
    # Events last (largest table)
    f.write(rows_to_sql("events", event_rows))
    f.write("\n")
    for table in [
        "organizations", "users", "events", "campaigns",
        "revenue_events", "experiments", "insights",
    ]:
        f.write(
            f"SELECT setval(pg_get_serial_sequence('{table}', 'id'), "
            f"(SELECT MAX(id) FROM {table}));\n"
        )
    f.write("COMMIT;\n")

# ── Summary ───────────────────────────────────────────────────────────────────

print("\n" + "=" * 52)
print("  RevLoop Seed Data — Generation Complete")
print("=" * 52)
print(f"  Organizations  : {len(org_rows)}")
print(f"  Visitors       : {TOTAL_VISITORS}  ({TOTAL_VISITORS - TOTAL_SIGNED_UP} anon-only)")
print(f"  Signed-up users: {len(user_rows)}")
print(f"    Activated    : {sum(1 for m in user_meta.values() if m['activated'])}")
print(f"    Retained     : {sum(1 for m in user_meta.values() if m['retained'])}")
print(f"    Paid         : {sum(1 for m in user_meta.values() if m['paid'])}")
print(f"  Events         : {len(event_rows)}")
print(f"  Campaigns      : {len(campaign_rows)}")
print(f"  Revenue events : {len(revenue_rows)}")
print(f"  Experiments    : {len(experiment_rows)}")
print(f"  Insights       : {len(insight_rows)}")
print("=" * 52)
print(f"  Output dir     : {OUT_DIR}")
print("=" * 52 + "\n")
