"""
SkillEngine Scoring — computes weighted skill scores.

Formula:
  Total = (0.30 × Accuracy) + (0.20 × RepoStrength) + (0.20 × BehaviourPersistence)
        + (0.15 × CodeEfficiency) + (0.15 × IntegrityScore) + TimeBonus
"""
from app.models.assessment import BehaviorData, MCQSubmission, CodeSubmission


def compute_question_accuracy(
    submissions: list[MCQSubmission | CodeSubmission],
    question_correct_answers: dict[str, str],
) -> float:
    """Returns 0-100 accuracy score for MCQ and code submissions."""
    if not submissions:
        return 0.0

    mcq_total, mcq_correct = 0, 0
    code_total, code_attempted = 0, 0

    for sub in submissions:
        if sub.type == "mcq":
            mcq_total += 1
            correct = question_correct_answers.get(sub.questionId, "")
            if sub.selectedAnswer == correct:
                mcq_correct += 1
        else:
            code_total += 1
            if sub.code and len(sub.code.strip()) > 20:
                code_attempted += 1

    mcq_score = (mcq_correct / mcq_total * 100) if mcq_total > 0 else 0
    code_score = (code_attempted / code_total * 80) if code_total > 0 else 0

    if mcq_total > 0 and code_total > 0:
        return round((mcq_score * 0.5) + (code_score * 0.5), 2)
    elif mcq_total > 0:
        return round(mcq_score, 2)
    else:
        return round(code_score, 2)


def compute_behaviour_persistence(behavior: BehaviorData) -> float:
    """Persistence: rewarded by attempts + time invested, penalised by idle ratio."""
    score = 0.0
    # Time spent (up to 3600s → 40 pts)
    score += min(40.0, (behavior.totalTimeSpent / 3600) * 40)
    # Attempts (up to 30 attempts → 30 pts)
    score += min(30.0, behavior.totalAttempts * 1.5)
    # Idle penalty
    idle_ratio = behavior.idleTime / max(behavior.totalTimeSpent, 1)
    score -= idle_ratio * 20
    return round(max(0, min(100, score)), 2)


def compute_code_efficiency(
    submissions: list[MCQSubmission | CodeSubmission],
    behavior: BehaviorData,
) -> float:
    """Efficiency: penalised by hints used and very slow responses."""
    score = 100.0
    hint_penalty = behavior.hintsUsed * 8.0
    time_penalty = 0.0
    if behavior.averageTimePerQuestion > 600:
        time_penalty = min(20.0, (behavior.averageTimePerQuestion - 600) / 60)
    score -= hint_penalty + time_penalty

    # Reward for submitted code (non-empty)
    code_subs = [s for s in submissions if s.type == "code"]
    empty_code = sum(1 for s in code_subs if not s.code or len(s.code.strip()) < 20)
    score -= empty_code * 15

    return round(max(0, min(100, score)), 2)


def compute_integrity_score(violations: int, tab_switches: int) -> float:
    """Integrity: starts at 100, deducted per violation and tab switch."""
    score = 100.0 - (violations * 20.0) - (tab_switches * 10.0)
    return round(max(0, score), 2)


def compute_time_bonus(total_time: int, question_count: int) -> float:
    """Small bonus for completing quickly without rushing."""
    expected_time = question_count * 300  # 5 min per question
    if total_time < expected_time * 0.5:
        return 0.0  # Too fast — suspicious
    if total_time < expected_time * 0.8:
        return 3.0
    return 0.0


def calculate_skill_level(score: float) -> str:
    if score >= 85: return "Expert"
    if score >= 70: return "Advanced"
    if score >= 50: return "Intermediate"
    return "Beginner"


def estimate_percentile(score: float) -> int:
    """Rough percentile estimate based on score."""
    if score >= 90: return 95
    if score >= 80: return 80
    if score >= 70: return 65
    if score >= 60: return 50
    if score >= 50: return 35
    return 20


def compute_full_skill_score(
    language: str,
    submissions: list[MCQSubmission | CodeSubmission],
    behavior: BehaviorData,
    repo_strength: float,
    violations: int,
    question_correct_answers: dict[str, str],
) -> dict:
    accuracy = compute_question_accuracy(submissions, question_correct_answers)
    persistence = compute_behaviour_persistence(behavior)
    code_eff = compute_code_efficiency(submissions, behavior)
    integrity = compute_integrity_score(violations, behavior.tabSwitches)
    time_bonus = compute_time_bonus(behavior.totalTimeSpent, len(submissions))

    total = (
        0.30 * accuracy
        + 0.20 * repo_strength
        + 0.20 * persistence
        + 0.15 * code_eff
        + 0.15 * integrity
        + time_bonus
    )
    total = round(min(100, max(0, total)), 2)

    return {
        "language": language,
        "metrics": {
            "questionAccuracy": accuracy,
            "repoStrength": repo_strength,
            "behaviourPersistence": persistence,
            "codeEfficiency": code_eff,
            "integrityScore": integrity,
            "timeTaken": behavior.totalTimeSpent,
            "totalScore": total,
        },
        "behavior": behavior.model_dump(),
        "dimensions": [],
        "level": calculate_skill_level(total),
        "percentile": estimate_percentile(total),
    }
