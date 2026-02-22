from pydantic import BaseModel
from typing import Optional
from enum import Enum


class UserRole(str, Enum):
    student = "student"
    teacher = "teacher"


class UserProfile(BaseModel):
    uid: str
    email: str
    displayName: str
    role: UserRole
    githubUsername: Optional[str] = None
    skills: list[str] = []
    createdAt: str
    avatarUrl: Optional[str] = None
