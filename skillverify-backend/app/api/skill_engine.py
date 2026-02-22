"""Skill Engine API — GitHub analysis and student score retrieval."""
import asyncio
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.github_service import analyze_repository

router = APIRouter()

# Shared sessions ref
from app.api import assessment as _assessment_module


class RepoRequest(BaseModel):
    repo_url: str


@router.post("/github/analyze")
async def analyze_github_repo(req: RepoRequest):
    """Scrape a GitHub repo with Playwright and return analysis."""
    if not req.repo_url or "github.com" not in req.repo_url:
        raise HTTPException(status_code=400, detail="Invalid GitHub repository URL.")
    try:
        result = await analyze_repository(req.repo_url)
        return result.model_dump()
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


@router.get("/skill/students")
async def get_all_students():
    """
    Returns a list of all student summaries.
    In production, this reads from Firestore.
    Returns demo data for preview.
    """
    return [
        {
            "uid": "demo_student_1",
            "displayName": "Alice Johnson",
            "email": "alice@example.com",
            "overallScore": 91,
            "skills": ["Python", "React", "TypeScript"],
            "level": "Expert",
            "assessmentCount": 5,
            "lastAssessment": "2025-02-18T14:00:00Z",
            "scores": [],
        },
        {
            "uid": "demo_student_2",
            "displayName": "Bob Chen",
            "email": "bob@example.com",
            "overallScore": 73,
            "skills": ["JavaScript", "Node.js"],
            "level": "Advanced",
            "assessmentCount": 3,
            "lastAssessment": "2025-02-19T10:30:00Z",
            "scores": [],
        },
    ]


@router.get("/skill/student/{user_id}/report")
async def get_student_report(user_id: str):
    """Get a specific student's latest report."""
    # Look up in session store or Firestore
    for key, val in _assessment_module._sessions.items():
        if key.startswith("report_") and val.get("userId") == user_id:
            return val
    raise HTTPException(status_code=404, detail="No report found for this student.")
