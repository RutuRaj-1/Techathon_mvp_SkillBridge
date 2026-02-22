"""
Gemini 2.5 Flash — AI Explanation Engine.
Generates natural language skill explanations, strengths, weaknesses, suggestions.
"""
import os
from app.models.report import SkillReport, SkillScore


def _build_prompt(scores: list[SkillScore], overall_score: float) -> str:
    score_lines = []
    for s in scores:
        m = s.metrics
        score_lines.append(f"""
Language: {s.language} (Level: {s.level}, Score: {m.totalScore}/100)
  - Question Accuracy: {m.questionAccuracy}%
  - Repo Strength: {m.repoStrength}/100
  - Behaviour Persistence: {m.behaviourPersistence}/100
  - Code Efficiency: {m.codeEfficiency}/100
  - Integrity Score: {m.integrityScore}/100
  - Time Taken: {m.timeTaken // 60} minutes
  - Tab Switches (violations): {s.behavior.get("tabSwitches", 0) if isinstance(s.behavior, dict) else s.behavior.tabSwitches}
  - Hints Used: {s.behavior.get("hintsUsed", 0) if isinstance(s.behavior, dict) else s.behavior.hintsUsed}
""")

    return f"""You are an expert technical skill evaluator. Analyse this developer's assessment results and generate a professional, encouraging, and specific skill evaluation report.

OVERALL SCORE: {overall_score}/100

SKILL BREAKDOWN:
{"".join(score_lines)}

SkillEngine Formula Used:
Score = (0.30 × Accuracy) + (0.20 × Repo Strength) + (0.20 × Behaviour Persistence) + (0.15 × Code Efficiency) + (0.15 × Integrity)

Generate EXACTLY this JSON structure (valid JSON only, no markdown):
{{
  "aiExplanation": "3-4 paragraph explanation referring to specific scores using **bold** for key metrics. Be specific, mention actual numbers, be encouraging but honest.",
  "strengths": ["4 specific strength statements based on above data"],
  "weaknesses": ["2-3 honest but constructive weakness statements"],
  "improvementSuggestions": ["4 specific, actionable improvement suggestions with resources or techniques"],
  "learningPath": [
    {{
      "week": 1,
      "topic": "Name of the specific advanced concept to master this week",
      "advancedKnowledge": "2-3 sentences explaining the advanced knowledge and why it matters for {scores[0].language if scores else 'the language'} developers",
      "actionableTask": "One very specific, hands-on coding task the developer should complete this week. Should be achievable in 4-6 hours."
    }},
    {{
      "week": 2,
      "topic": "...",
      "advancedKnowledge": "...",
      "actionableTask": "..."
    }},
    {{
      "week": 3,
      "topic": "...",
      "advancedKnowledge": "...",
      "actionableTask": "..."
    }},
    {{
      "week": 4,
      "topic": "...",
      "advancedKnowledge": "...",
      "actionableTask": "..."
    }}
  ]
}}"""


async def generate_skill_explanation(
    scores: list[SkillScore],
    overall_score: float,
) -> dict:
    """Call Gemini 2.5 Flash to generate AI explanation."""
    api_key = os.getenv("GEMINI_API_KEY", "")

    if not api_key or api_key == "your_gemini_api_key_here":
        return _fallback_explanation(scores, overall_score)

    try:
        import google.generativeai as genai
        import json

        genai.configure(api_key=api_key)
        model = genai.GenerativeModel("gemini-2.0-flash")

        prompt = _build_prompt(scores, overall_score)
        response = await model.generate_content_async(
            prompt,
            generation_config=genai.GenerationConfig(
                temperature=0.65,
                max_output_tokens=2500,
            ),
        )

        raw = response.text.strip()
        # Strip markdown code block if present
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]

        result = json.loads(raw)
        return result

    except Exception as e:
        print(f"[Gemini] Error: {e}. Falling back to template.")
        return _fallback_explanation(scores, overall_score)


def _fallback_explanation(scores: list[SkillScore], overall_score: float) -> dict:
    """Template-based fallback when Gemini is unavailable."""
    if not scores:
        return {
            "aiExplanation": "Assessment complete. No scores available for analysis.",
            "strengths": ["Completed the assessment"],
            "weaknesses": ["No data available"],
            "improvementSuggestions": ["Complete more assessments for detailed analysis"],
        }

    s = scores[0]
    m = s.metrics
    level = s.level

    return {
        "aiExplanation": f"""Based on your {s.language} assessment, you achieved a score of **{m.totalScore}/100** — demonstrating **{level}** level proficiency.

Your **question accuracy of {m.questionAccuracy}%** reflects your conceptual understanding. The **repo strength score of {m.repoStrength}/100** evaluates your real-world coding portfolio, and the **behaviour persistence score of {m.behaviourPersistence}/100** shows your engagement and effort throughout the assessment.

Your **code efficiency score of {m.codeEfficiency}/100** and **integrity score of {m.integrityScore}/100** round out the SkillEngine formula, giving you a holistic overall score of **{overall_score}/100**.

This evaluation is powered by SkillVerify's 5-dimension SkillEngine. Configure your Gemini API key to receive personalised AI-generated insights and recommendations.""",
        "strengths": [
            f"Demonstrated {level}-level {s.language} proficiency",
            f"Strong question accuracy at {m.questionAccuracy}%",
            f"Repository strength score of {m.repoStrength}/100",
            "Completed the full proctored assessment",
        ],
        "weaknesses": [
            *([f"Code efficiency needs improvement (scored {m.codeEfficiency}/100)"] if m.codeEfficiency < 70 else []),
            *([f"Consider reducing hint usage and idle time for better persistence score"] if m.behaviourPersistence < 70 else []),
        ] or ["Continue practicing to identify specific improvement areas"],
        "improvementSuggestions": [
            f"Practice {s.language} fundamentals with LeetCode and HackerRank",
            "Build a portfolio project and contribute to open-source repositories",
            "Focus on data structures and algorithm time complexity",
            "Add automated tests and CI/CD to your projects",
        ],
        "learningPath": [
            {
                "week": 1,
                "topic": f"{s.language} Core Patterns & Idioms",
                "advancedKnowledge": f"Understanding the core design patterns and idiomatic style of {s.language} is key to writing professional, maintainable code. Mastering these patterns differentiates junior from senior developers.",
                "actionableTask": f"Pick one design pattern (e.g., Factory, Observer, or Singleton) and implement it from scratch in {s.language} with a real-world example. Write tests for it."
            },
            {
                "week": 2,
                "topic": "Performance Optimization & Profiling",
                "advancedKnowledge": f"Real-world {s.language} applications must be optimized for speed and memory. Learning to profile, identify bottlenecks, and apply targeted optimizations is an essential senior-level skill.",
                "actionableTask": f"Profile an existing project for memory and CPU hotspots using a profiling tool. Identify at least one bottleneck and implement a measurable optimization."
            },
            {
                "week": 3,
                "topic": "Advanced Testing Strategies",
                "advancedKnowledge": f"Beyond basic unit tests, advanced {s.language} developers write integration tests, use mocking effectively, and achieve high branch coverage. This ensures reliability of complex systems.",
                "actionableTask": "Write integration tests for a service layer or API endpoint in a project you own. Aim for >80% branch coverage using a coverage tool."
            },
            {
                "week": 4,
                "topic": "System Design & Architecture",
                "advancedKnowledge": f"Understanding how to architect {s.language} applications at scale—handling concurrency, caching, and separation of concerns—prepares you for senior and lead roles.",
                "actionableTask": "Design and implement a small microservice from scratch. It should have its own API, handle one well-defined business domain, and be independently deployable."
            }
        ]
    }
