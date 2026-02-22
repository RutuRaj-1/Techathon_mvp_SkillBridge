"""Assessment API routes — questions, start session, submit."""
import uuid
from datetime import datetime
from fastapi import APIRouter, HTTPException
from app.models.assessment import QuestionsRequest, AssessmentSubmitRequest
from app.services.question_generator import get_questions_for_languages

router = APIRouter()

# In-memory session store (replace with DB in production)
_sessions: dict = {}


@router.post("/questions")
async def get_questions(req: QuestionsRequest):
    """Return 5 MCQ + 2 code questions per requested language."""
    if not req.languages:
        raise HTTPException(status_code=400, detail="At least one language required.")

    questions = get_questions_for_languages(req.languages)
    return questions


@router.post("/start")
async def start_session(payload: dict):
    """Create an assessment session."""
    session_id = str(uuid.uuid4())
    languages = payload.get("languages", [])
    user_id = payload.get("userId", "anonymous")
    questions = get_questions_for_languages(languages)

    session = {
        "sessionId": session_id,
        "userId": user_id,
        "languages": languages,
        "questions": questions,
        "submissions": [],
        "startedAt": datetime.utcnow().isoformat(),
        "violations": 0,
        "autoSubmitted": False,
    }
    _sessions[session_id] = session

    return session


@router.post("/submit")
async def submit_assessment(req: AssessmentSubmitRequest):
    """Receive submissions and trigger scoring pipeline."""
    from app.services.scoring_engine import compute_full_skill_score
    from app.services.explanation_engine import generate_skill_explanation
    from app.models.report import SkillScore, BehaviorData as ReportBehaviorData

    report_id = str(uuid.uuid4())

    # Build answer key from session (or use default if not found)
    session = _sessions.get(req.sessionId, {})
    answer_key: dict[str, str] = {}
    for q in session.get("questions", []):
        if q.get("type") == "mcq":
            answer_key[q["id"]] = q.get("correctAnswer", "")

    # Group by language
    language_map: dict[str, list] = {}
    for sub in req.submissions:
        lang = getattr(sub, "language", session.get("languages", ["general"])[0])
        language_map.setdefault(lang, []).append(sub)

    if not language_map:
        lang = session.get("languages", ["general"])[0] if session else "general"
        language_map[lang] = list(req.submissions)

    scores_raw = []
    for lang, subs in language_map.items():
        score_dict = compute_full_skill_score(
            language=lang,
            submissions=subs,
            behavior=req.behavior,
            repo_strength=60.0,  # Default; use real value if repo was analysed
            violations=req.violations,
            question_correct_answers=answer_key,
        )
        scores_raw.append(score_dict)

    overall = round(
        sum(s["metrics"]["totalScore"] for s in scores_raw) / len(scores_raw), 2
    ) if scores_raw else 0.0

    # Gemini explanation
    skill_scores = [SkillScore(**s) for s in scores_raw]
    ai_data = await generate_skill_explanation(skill_scores, overall)

    report = {
        "reportId": report_id,
        "sessionId": req.sessionId,
        "overallScore": overall,
        "scores": scores_raw,
        "aiExplanation": ai_data.get("aiExplanation", ""),
        "strengths": ai_data.get("strengths", []),
        "weaknesses": ai_data.get("weaknesses", []),
        "improvementSuggestions": ai_data.get("improvementSuggestions", []),
        "learningPath": ai_data.get("learningPath", []),
        "generatedAt": datetime.utcnow().isoformat(),
    }

    # Cache report
    _sessions[f"report_{report_id}"] = report

    return {"sessionId": req.sessionId, "reportId": report_id}
