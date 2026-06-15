# RevLoop

**AI-powered product analytics cockpit for early-stage startups.**

RevLoop turns product event data into practical answers for founders, product
managers, and growth teams. It highlights funnel drop-offs, visualizes retention
cohorts, compares acquisition channel performance, surfaces churn risk, and
recommends where the team should investigate or experiment next.

![RevLoop Dashboard](docs/screenshots/dashboard.png)

| Funnel Analysis | Retention Cohorts |
|---|---|
| ![RevLoop Funnel](docs/screenshots/funnel.png) | ![RevLoop Retention](docs/screenshots/retention.png) |

| Channel Performance | Churn Risk |
|---|---|
| ![RevLoop Channels](docs/screenshots/channels.png) | ![RevLoop Churn Risk](docs/screenshots/churn-risk.png) |

## Why I Built This

I built RevLoop to connect engineering with product and business
decision-making. Most student projects stop once the features work; RevLoop
focuses on what happens after a product launches: where users drop off, which
channels retain valuable users, who may churn, and what the team should test
next.

The project demonstrates how a full-stack system can turn raw behavioral data
into a focused operating view for a startup team.

## Core Features

- Product health dashboard with activation, retention, growth, and acquisition metrics
- Multi-step funnel analysis with conversion and drop-off rates
- Weekly retention cohort heatmap
- Channel performance, CAC, revenue, ROI, and quality scoring
- Rule-based churn risk scoring with suggested actions
- Weekly risks, opportunities, and experiment recommendations
- Realistic seeded startup dataset with anonymous and identified activity
- FastAPI analytics backend backed by PostgreSQL
- Premium responsive Next.js dashboard UI

## Tech Stack

| Area | Technologies |
|---|---|
| Frontend | Next.js, TypeScript, Tailwind CSS, Recharts, Framer Motion, lucide-react |
| Backend | FastAPI, SQLAlchemy, PostgreSQL, Pydantic |
| Data | Python seed generator, PostgreSQL, generated CSV and SQL seed data |
| ML / Future | Scikit-learn planned for the later churn-model phase |

## Architecture

```text
Next.js Frontend
       ↓
FastAPI Backend
       ↓
PostgreSQL Database
       ↑
Python Seed Generator
```

- The frontend calls typed API functions and renders responsive analytical views.
- The backend calculates funnel, retention, channel, churn-risk, and summary metrics.
- PostgreSQL stores organizations, users, events, campaigns, revenue events, experiments, and insights.
- The deterministic seed generator creates the realistic **Campus Connect Demo** dataset.

## Demo Dataset

| Metric | Value |
|---|---:|
| Organization | Campus Connect Demo |
| Visitors | 2,500 |
| Signed-up users | 800 |
| Activated users | 420 |
| Retained users | 210 |
| Paid users | 75 |
| Product events | 20,478 |
| Activity window | 8 weeks |

The dataset models six acquisition channels with intentionally different
behavior:

`Instagram` · `WhatsApp` · `Referral` · `LinkedIn` · `Organic` · `Paid Ads`

Referral produces the strongest activation and retention, Instagram brings
high volume with weaker retention, and Paid Ads combines higher spend with the
weakest retention.

## API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/health` | API and database health check |
| GET | `/api/dashboard/summary` | Product health summary |
| GET | `/api/funnel` | Funnel conversion and drop-off metrics |
| GET | `/api/retention` | Weekly retention cohorts |
| GET | `/api/channels/performance` | Channel quality and economics |
| GET | `/api/churn-risk` | Rule-based user churn-risk ranking |
| GET | `/api/insights/weekly-summary` | Risks, opportunities, and experiment ideas |

FastAPI's interactive documentation is available locally at
<http://127.0.0.1:8000/docs>.

## Local Setup

### Prerequisites

- Python 3.10 or newer
- Node.js and npm
- PostgreSQL
- PostgreSQL command-line tools (`psql`)

### 1. Database

From the repository root, create the local database:

```powershell
createdb -U postgres revloop
```

Load the schema and generated demo data:

```powershell
psql -U postgres -d revloop -f backend/schema.sql
psql -U postgres -d revloop -f backend/scripts/generated_data/seed.sql
```

The schema and seed SQL are rerunnable. The schema recreates tables in safe
dependency order, and the seed SQL resets the demo tables before inserting
data.

To regenerate the deterministic CSV and SQL seed files:

```powershell
cd backend
python scripts/seed_data.py
cd ..
```

### 2. Backend

Create and activate a virtual environment:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

Create `backend/.env`:

```env
DATABASE_URL=postgresql+psycopg2://postgres:YOUR_PASSWORD@localhost:5432/revloop
ENV=development
```

Start FastAPI:

```powershell
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

### 3. Frontend

Open a second PowerShell terminal:

```powershell
cd frontend
Copy-Item .env.example .env.local
npm install
npm run dev
```

The frontend environment should contain:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Open <http://localhost:3000>. The root route redirects to the dashboard.

> Local `.env` and `.env.local` files may contain machine-specific
> configuration and should never be committed. Commit only the provided
> `.env.example` files.

## Screenshots

### Dashboard

![Dashboard](docs/screenshots/dashboard.png)

### Funnel Analysis

![Funnel](docs/screenshots/funnel.png)

### Retention Cohorts

![Retention](docs/screenshots/retention.png)

### Channel Performance

![Channels](docs/screenshots/channels.png)

### Churn Risk

![Churn Risk](docs/screenshots/churn-risk.png)

### Insights

![Insights](docs/screenshots/insights.png)

## Project Status

### Current

- PostgreSQL schema and realistic seed dataset complete
- FastAPI analytics backend complete
- Next.js dashboard frontend complete
- Local end-to-end development workflow working

### Next

- Scikit-learn churn model
- Experiment tracker
- Production deployment
- Public demo video
- Portfolio case study

## What This Project Demonstrates

- Full-stack engineering across data, API, and frontend layers
- Product analytics and metric design
- Funnel, retention, acquisition, and churn analysis
- Data-driven product decision-making
- Dashboard UI/UX and data visualization
- Startup and business understanding beyond feature implementation
