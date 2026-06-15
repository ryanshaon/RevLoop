-- RevLoop Database Schema
-- PostgreSQL-compatible
-- Run in order; DROP TABLE statements handle reruns safely.

-- ============================================================
-- DROP (reverse dependency order)
-- ============================================================
DROP TABLE IF EXISTS insights CASCADE;
DROP TABLE IF EXISTS experiments CASCADE;
DROP TABLE IF EXISTS revenue_events CASCADE;
DROP TABLE IF EXISTS campaigns CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS organizations CASCADE;

-- ============================================================
-- organizations
-- ============================================================
CREATE TABLE organizations (
    id              SERIAL PRIMARY KEY,
    name            TEXT        NOT NULL,
    website         TEXT,
    industry        TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- users
-- ============================================================
CREATE TABLE users (
    id                  SERIAL PRIMARY KEY,
    org_id              INTEGER     NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    external_user_id    TEXT        NOT NULL,
    email_hash          TEXT,
    signup_date         DATE        NOT NULL,
    acquisition_channel TEXT        NOT NULL,
    country             TEXT,
    device              TEXT,
    plan_type           TEXT        NOT NULL DEFAULT 'free',
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE (org_id, external_user_id)
);

CREATE INDEX idx_users_org_id              ON users(org_id);
CREATE INDEX idx_users_acquisition_channel ON users(acquisition_channel);
CREATE INDEX idx_users_signup_date         ON users(signup_date);

-- ============================================================
-- events
-- Supports both anonymous visitors (anonymous_id) and
-- signed-up users (user_id). At least one must be non-null.
-- ============================================================
CREATE TABLE events (
    id              BIGSERIAL   PRIMARY KEY,
    org_id          INTEGER     NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id         INTEGER     REFERENCES users(id) ON DELETE SET NULL,   -- nullable for anonymous
    anonymous_id    TEXT,                                                   -- nullable for known users
    event_name      TEXT        NOT NULL,
    event_time      TIMESTAMPTZ NOT NULL,
    session_id      TEXT,
    source          TEXT,
    page            TEXT,
    properties_json JSONB       NOT NULL DEFAULT '{}'::JSONB,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_events_identity CHECK (
        user_id IS NOT NULL OR anonymous_id IS NOT NULL
    )
);

CREATE INDEX idx_events_org_id     ON events(org_id);
CREATE INDEX idx_events_user_id    ON events(user_id);
CREATE INDEX idx_events_event_name ON events(event_name);
CREATE INDEX idx_events_event_time ON events(event_time);
CREATE INDEX idx_events_anon_id    ON events(anonymous_id);

-- ============================================================
-- campaigns
-- ============================================================
CREATE TABLE campaigns (
    id              SERIAL PRIMARY KEY,
    org_id          INTEGER     NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    campaign_name   TEXT        NOT NULL,
    channel         TEXT        NOT NULL,
    spend           NUMERIC(12, 2),
    start_date      DATE,
    end_date        DATE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_campaigns_org_id  ON campaigns(org_id);
CREATE INDEX idx_campaigns_channel ON campaigns(channel);

-- ============================================================
-- revenue_events
-- ============================================================
CREATE TABLE revenue_events (
    id              BIGSERIAL   PRIMARY KEY,
    org_id          INTEGER     NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id         INTEGER     NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    event_time      TIMESTAMPTZ NOT NULL,
    amount          NUMERIC(12, 2) NOT NULL,
    currency        TEXT        NOT NULL DEFAULT 'USD',
    revenue_type    TEXT        NOT NULL,   -- e.g. 'subscription', 'one_time', 'upgrade'
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_revenue_events_org_id    ON revenue_events(org_id);
CREATE INDEX idx_revenue_events_user_id   ON revenue_events(user_id);
CREATE INDEX idx_revenue_events_event_time ON revenue_events(event_time);

-- ============================================================
-- experiments
-- ============================================================
CREATE TABLE experiments (
    id                  SERIAL PRIMARY KEY,
    org_id              INTEGER NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    experiment_name     TEXT    NOT NULL,
    hypothesis          TEXT,
    target_metric       TEXT,
    status              TEXT    NOT NULL DEFAULT 'draft',   -- draft | running | completed | cancelled
    start_date          DATE,
    end_date            DATE,
    result_summary      TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_experiments_org_id ON experiments(org_id);
CREATE INDEX idx_experiments_status ON experiments(status);

-- ============================================================
-- insights
-- ============================================================
CREATE TABLE insights (
    id              SERIAL PRIMARY KEY,
    org_id          INTEGER NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    insight_type    TEXT    NOT NULL,   -- e.g. 'churn_risk', 'funnel_drop', 'channel_quality'
    insight_title   TEXT    NOT NULL,
    insight_text    TEXT    NOT NULL,
    severity        TEXT    NOT NULL DEFAULT 'info',   -- info | warning | critical
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_insights_org_id ON insights(org_id);
CREATE INDEX idx_insights_type   ON insights(insight_type);
