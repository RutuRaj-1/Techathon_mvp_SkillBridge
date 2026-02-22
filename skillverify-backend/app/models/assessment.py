from pydantic import BaseModel
from typing import Optional, Literal
from enum import Enum


class DifficultyLevel(str, Enum):
    easy = "easy"
    medium = "medium"
    hard = "hard"


class MCQOption(BaseModel):
    id: str
    text: str


class MCQQuestion(BaseModel):
    id: str
    type: Literal["mcq"] = "mcq"
    language: str
    topic: str
    question: str
    options: list[MCQOption]
    correctAnswer: str
    difficulty: DifficultyLevel
    explanation: str
    points: int = 10


class TestCase(BaseModel):
    input: str
    expectedOutput: str
    description: str


class CodeQuestion(BaseModel):
    id: str
    type: Literal["code"] = "code"
    language: str
    topic: str
    title: str
    description: str
    starterCode: str
    testCases: list[TestCase]
    difficulty: DifficultyLevel
    hints: list[str]
    points: int = 20
    timeLimit: int = 600


class MCQSubmission(BaseModel):
    questionId: str
    type: Literal["mcq"]
    selectedAnswer: str
    timeTaken: int
    hintsUsed: int = 0


class CodeSubmission(BaseModel):
    questionId: str
    type: Literal["code"]
    code: str
    language: str
    timeTaken: int
    hintsUsed: int = 0
    attempts: int = 1


class BehaviorData(BaseModel):
    totalTimeSpent: int
    totalAttempts: int
    hintsUsed: int
    idleTime: int
    tabSwitches: int
    averageTimePerQuestion: int


class AssessmentSubmitRequest(BaseModel):
    sessionId: str
    submissions: list[MCQSubmission | CodeSubmission]
    behavior: BehaviorData
    violations: int = 0
    autoSubmitted: bool = False


class QuestionsRequest(BaseModel):
    languages: list[str]
