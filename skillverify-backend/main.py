import os
import asyncio
import sys

if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

from app.api import assessment, skill_engine, explanation

app = FastAPI(
    title="SkillVerify API",
    description="AI Skill Verification Platform — Backend API",
    version="1.0.0",
)

# CORS
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    "http://localhost:3000"
]
if os.getenv("ALLOWED_ORIGINS"):
    origins.extend(os.getenv("ALLOWED_ORIGINS").split(","))
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(assessment.router, prefix="/api/assessment", tags=["Assessment"])
app.include_router(skill_engine.router, prefix="/api", tags=["Skill Engine"])
app.include_router(explanation.router, prefix="/api/report", tags=["Report"])


@app.get("/")
def root():
    return {
        "service": "SkillVerify API",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs",
    }


@app.get("/health")
def health():
    return {"status": "ok"}
