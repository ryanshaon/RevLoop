# RevLoop

AI-powered revenue and retention cockpit for early-stage startups.

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | Next.js 14 · TypeScript · Tailwind CSS · Shadcn UI · Recharts |
| Backend | FastAPI · SQLAlchemy · Pandas |
| Database | PostgreSQL (Supabase) |
| ML | Python · Scikit-learn |
| Deploy | Vercel (frontend) · Railway (backend) · Supabase (DB) |

## Folder Structure

```
revloop/
├── frontend/
│   ├── app/            # Next.js App Router pages
│   ├── components/     # Shared UI components
│   ├── lib/            # API clients, utilities
│   └── charts/         # Recharts wrappers
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── routes/     # FastAPI routers
│   │   ├── services/   # Business logic
│   │   └── models/     # SQLAlchemy models
│   ├── ml/             # Churn model training + inference
│   ├── scripts/
│   │   ├── seed_data.py
│   │   └── generated_data/   # CSVs + seed.sql (git-ignored)
│   └── schema.sql
└── docs/
    ├── product-brief.md
    └── event-taxonomy.md
```

## Current Build Stage

**Step 1 of 10 — Database schema + seed data**

- [x] Folder structure
- [x] `backend/schema.sql` — PostgreSQL schema (7 tables)
- [x] `backend/scripts/seed_data.py` — deterministic demo data generator
- [x] `docs/product-brief.md`
- [x] `docs/event-taxonomy.md`
- [ ] FastAPI backend (Step 2)
- [ ] Next.js dashboard UI (Step 3)
- [ ] Funnel analysis page (Step 4)
- [ ] Retention cohorts page (Step 5)
- [ ] Channel performance page (Step 6)
- [ ] Churn risk ML model (Step 7)
- [ ] AI insights engine (Step 8)
- [ ] Experiment tracker (Step 9)
- [ ] Deploy (Step 10)

## Running the Seed Script

**Requirements:** Python 3.10+, no external dependencies (stdlib only).

```bash
cd revloop
python backend/scripts/seed_data.py
```

Output lands in `backend/scripts/generated_data/`:

| File | Contents |
|---|---|
| `organizations.csv` | 1 org row |
| `users.csv` | 800 signed-up users |
| `events.csv` | ~20 000 product events |
| `campaigns.csv` | 6 channel campaigns |
| `revenue_events.csv` | 75 payment records |
| `experiments.csv` | 5 A/B tests |
| `insights.csv` | 6 AI insight rows |
| `seed.sql` | All of the above as INSERT statements |

To load into PostgreSQL:

```bash
psql $DATABASE_URL -f backend/schema.sql
psql $DATABASE_URL -f backend/scripts/generated_data/seed.sql
```

Both files are rerunnable: the schema drops tables in reverse dependency
order, and `seed.sql` truncates demo tables before inserting deterministic data.
