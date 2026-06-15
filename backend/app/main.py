import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError
from starlette.requests import Request

from app.database import SessionLocal
from app.routes import (
    channels,
    churn,
    dashboard,
    experiments,
    funnel,
    insights,
    retention,
)

logger = logging.getLogger(__name__)

app = FastAPI(title="RevLoop API", version="0.2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(dashboard.router, prefix="/api")
app.include_router(experiments.router, prefix="/api")
app.include_router(funnel.router, prefix="/api")
app.include_router(retention.router, prefix="/api")
app.include_router(channels.router, prefix="/api")
app.include_router(churn.router, prefix="/api")
app.include_router(insights.router, prefix="/api")


@app.exception_handler(SQLAlchemyError)
def handle_database_error(request: Request, exc: SQLAlchemyError):
    logger.error(
        "Database error while handling %s (%s)",
        request.url.path,
        type(exc).__name__,
    )
    return JSONResponse(
        status_code=500,
        content={"detail": "A database error occurred while processing the request."},
    )


@app.get("/health")
def health_check():
    db = SessionLocal()
    try:
        db.execute(text("SELECT 1"))
        return {"status": "ok", "database": "connected"}
    except SQLAlchemyError as exc:
        logger.error("Database health check failed (%s)", type(exc).__name__)
        return JSONResponse(
            status_code=503,
            content={"status": "error", "database": "unavailable"},
        )
    finally:
        db.close()
