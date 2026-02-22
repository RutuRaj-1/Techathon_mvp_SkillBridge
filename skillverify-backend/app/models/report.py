from pydantic import BaseModel
from typing import Optional
from enum import Enum


class RepoAnalysis(BaseModel):
    repoUrl: str
    owner: str
    repoName: str
    description: str
    stars: int
    forks: int
    language: str
    languages: dict[str, float]
    frameworks: list[str]
    libraries: list[str]
    features: list[str]
    readmeLength: int
    hasTests: bool
    hasCI: bool
    lastUpdated: str
    repoStrengthScore: int


class SkillMetrics(BaseModel):
    questionAccuracy: float
    repoStrength: float
    behaviourPersistence: float
    codeEfficiency: float
    integrityScore: float
    timeTaken: int
    totalScore: float


class BehaviorData(BaseModel):
    totalTimeSpent: int
    totalAttempts: int
    hintsUsed: int
    idleTime: int
    tabSwitches: int
    averageTimePerQuestion: int


class SkillScore(BaseModel):
    language: str
    metrics: SkillMetrics
    behavior: BehaviorData
    dimensions: list[dict] = []
    level: str
    percentile: int


class SkillReport(BaseModel):
    reportId: str
    userId: str
    userName: str
    generatedAt: str
    repoAnalysis: Optional[RepoAnalysis] = None
    scores: list[SkillScore]
    overallScore: float
    aiExplanation: str
    improvementSuggestions: list[str]
    strengths: list[str]
    weaknesses: list[str]
