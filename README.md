# RevLoop

AI-powered revenue and retention cockpit for early-stage startups.

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | Next.js 14 · TypeScript · Tailwind CSS · Framer Motion · Recharts |
| Backend | FastAPI · SQLAlchemy · Pydantic |
| Database | PostgreSQL (Supabase) |
| ML | Python · Scikit-learn |
| Deploy | Vercel (frontend) · Railway (backend) · Supabase (DB) |

## Folder Structure

```
revloop/
├── frontend/
│   ├── app/            # Next.js App Router pages
│   ├── components/     # Cards, charts, tables, layout, and UI primitives
│   └── lib/            # Typed API client, response types, utilities
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

**Step 3 of 10 — Next.js dashboard UI**

- [x] Folder structure
- [x] `backend/schema.sql` — PostgreSQL schema (7 tables)
- [x] `backend/scripts/seed_data.py` — deterministic demo data generator
- [x] `docs/product-brief.md`
- [x] `docs/event-taxonomy.md`
- [x] FastAPI backend (Step 2)
- [x] Next.js dashboard UI (Step 3)
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

---

## Running the FastAPI Backend

### 1. Create `backend/.env`

Create this file manually (never commit it):

```
DATABASE_URL=postgresql+psycopg2://your_user:your_password@localhost:5432/revloop
ENV=development
```

### 2. Install Python dependencies

```bash
cd revloop/backend
pip install -r requirements.txt
```

### 3. Start the server

```bash
cd revloop/backend
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

---

## API Endpoints

Base URL: `http://127.0.0.1:8000`

All endpoints accept `?org_id=1` (defaults to 1).

| Method | URL | Description |
|--------|-----|-------------|
| GET | `/health` | Database connectivity check |
| GET | `/api/dashboard/summary` | Key metrics: users, activation, retention, growth, best channel, worst funnel step |
| GET | `/api/funnel` | 6-step conversion funnel with per-step drop-off rates |
| GET | `/api/retention` | Weekly retention cohort table (week 0–4) |
| GET | `/api/channels/performance` | Per-channel CAC, ROI, activation, retention, quality score |
| GET | `/api/churn-risk` | Rule-based churn risk list sorted by risk score (`?limit=50`) |
| GET | `/api/insights/weekly-summary` | AI-style weekly summary with risks, opportunities, and experiment ideas |

### Example test URLs

```
http://127.0.0.1:8000/health
http://127.0.0.1:8000/api/dashboard/summary?org_id=1
http://127.0.0.1:8000/api/funnel?org_id=1
http://127.0.0.1:8000/api/retention?org_id=1
http://127.0.0.1:8000/api/channels/performance?org_id=1
http://127.0.0.1:8000/api/churn-risk?org_id=1&limit=50
http://127.0.0.1:8000/api/insights/weekly-summary?org_id=1
```

Interactive docs: `http://127.0.0.1:8000/docs`

---

## Running the Frontend

The dashboard is a **Next.js 14 (App Router)** app in `frontend/`, written in
TypeScript, styled with **Tailwind CSS**, animated with **Framer Motion**, and
charted with **Recharts**. It is a dark "mission control" cockpit that reads
live data from the FastAPI backend.

### 1. Install dependencies (first time only)

```bash
cd revloop/frontend
npm install
```

### 2. Configure the API base URL

Create a local env file from the tracked example:

```bash
cp .env.example .env.local
```

The expected value is:

```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Change it only if the backend runs elsewhere.

### 3. Start the dev server

```bash
cd revloop/frontend
npm run dev
```

Open <http://localhost:3000> — it redirects to `/dashboard`.

> The browser fetches data directly from the backend, so the backend **must be
> running on port 8000** (CORS is open in development).

### Pages

| Route | What it shows |
|---|---|
| `/dashboard` | Hero cockpit: 6 breathing metric cards, growth-trend area chart, churn-risk donut, top insights, critical-alert callout |
| `/funnel` | Animated visual funnel (bars narrow as users drop off) + step breakdown table |
| `/retention` | Weekly cohort retention heatmap with color-coded cells |
| `/channels` | Activation-vs-retention grouped bar chart + channel economics table (CAC, ROI, quality score) |
| `/churn` | High/Medium/Low risk stat cards, distribution donut, at-risk users table |
| `/insights` | AI weekly summary hero + Risks / Opportunities / Experiments columns |

### Run backend + frontend together

Two terminals:

```bash
# Terminal 1 — backend  → http://localhost:8000
cd revloop/backend
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000

# Terminal 2 — frontend → http://localhost:3000
cd revloop/frontend
npm run dev
```

### Production build

```bash
cd revloop/frontend
npm run build && npm start
```
