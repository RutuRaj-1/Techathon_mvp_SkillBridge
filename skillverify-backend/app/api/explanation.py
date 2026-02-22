"""Report/Explanation API — fetch skill report, generate AI report."""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.api import assessment as _assessment_module

router = APIRouter()


class GenerateReportRequest(BaseModel):
    session_id: str


@router.post("/generate")
async def generate_report(req: GenerateReportRequest):
    """Generate a full skill report for a given session."""
    # Check if already generated
    for key, val in _assessment_module._sessions.items():
        if key.startswith("report_") and val.get("sessionId") == req.session_id:
            return val

    raise HTTPException(
        status_code=404,
        detail="No session found. Please submit an assessment first.",
    )


@router.get("/{report_id}")
async def get_report(report_id: str):
    """Retrieve a previously generated skill report."""
    report = _assessment_module._sessions.get(f"report_{report_id}")
    if not report:
        raise HTTPException(status_code=404, detail="Report not found.")
    return report
