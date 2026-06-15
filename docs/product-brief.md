# RevLoop — Product Brief

## What RevLoop Is

RevLoop is an AI-powered revenue and retention cockpit built for early-stage startups. It ingests product event data and surfaces the decision-layer insights that founders and growth teams need — not just charts, but actionable answers.

Core questions RevLoop answers:
- Which acquisition channels produce users who actually stick around?
- Where do users drop out of the funnel, and why?
- Which users are at risk of churning, and how should we prioritize outreach?
- What should the team run as the next experiment?

---

## Target User

| Role | Primary Use |
|---|---|
| Startup founder | Weekly revenue and retention pulse |
| Growth lead | Channel ROI and CAC payback |
| Product manager | Funnel drop analysis and experiment design |
| Product analyst | Cohort exploration and churn modeling |

**User profile:** Data-literate but time-starved. Has product data scattered across Mixpanel, Stripe, and spreadsheets. Needs a single decision layer, not another tab of line charts.

---

## Problem Statement

Early-stage startups collect product events but lack the infrastructure and analyst bandwidth to turn data into weekly decisions. They churn through BI tools that require SQL fluency, or pay for enterprise analytics platforms designed for 50-person data teams.

RevLoop solves this by:
1. Providing a pre-built data model tuned for SaaS and consumer product funnels
2. Auto-generating funnel, cohort, and channel breakdowns without SQL
3. Running a lightweight ML churn model on existing event data
4. Using an AI layer to narrate findings in plain language and suggest next actions

---

## MVP Modules

Build order mirrors dependency chain:

| # | Module | What It Delivers |
|---|---|---|
| 1 | Database schema + seed data | Foundation for all other modules |
| 2 | FastAPI backend | Core data endpoints used by the UI |
| 3 | Dashboard UI | KPI summary cards and top-level health view |
| 4 | Funnel analysis | Step-by-step conversion with drop-off rates |
| 5 | Retention cohorts | Weekly cohort grid showing D7/D14/D30 retention |
| 6 | Channel performance | CAC, activation rate, retention, and LTV by channel |
| 7 | Churn risk model | Scikit-learn churn classifier with per-user risk scores |
| 8 | AI insights engine | Plain-language summaries of anomalies and opportunities |
| 9 | Experiment tracker | Lightweight A/B test log with hypothesis and results |
| 10 | Polish + deploy | Vercel + Railway + Supabase production deploy |

---

## Success Criteria

### Technical
- Seed script generates a complete, consistent demo dataset in under 30 seconds
- All API endpoints respond in under 500ms on a cold Supabase connection
- Churn model AUC ≥ 0.75 on holdout set of generated data
- Frontend loads dashboard in under 2 seconds on a 4G connection

### Product
- A founder with no SQL knowledge can answer "which channel has the best 30-day retention?" in under 60 seconds
- AI insights surface at least one non-obvious finding per week that a human analyst would flag
- Experiment tracker allows a team to log, monitor, and close out a test without leaving RevLoop
