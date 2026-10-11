
from typing import Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class UserCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    email: EmailStr
    password: str = Field(min_length=8, max_length=72)
    role: Literal["student"] = "student"


class CompanyCreate(BaseModel):
    company_name: str = Field(min_length=1, max_length=150)
    email: EmailStr
    password: str = Field(min_length=8, max_length=72)
    location: str | None = None
    description: str | None = None


class InternshipCreate(BaseModel):
    company_id: int
    title: str = Field(min_length=1, max_length=200)
    description: str | None = None
    location: str | None = None
    duration: str | None = None
    stipend: str | None = None
    skills_required: str | None = None


class InternshipResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    internship_id: int
    company_id: int
    title: str
    description: str | None = None
    location: str | None = None
    duration: str | None = None
    stipend: str | None = None
    skills_required: str | None = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class ApplicationCreate(BaseModel):
    user_id: int
    internship_id: int


class ApplicationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    application_id: int
    user_id: int
    internship_id: int
    status: str


class ApplicationStatusUpdate(BaseModel):
    status: str


class SavedInternshipCreate(BaseModel):
    user_id: int
    internship_id: int


class SavedInternshipResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    saved_id: int
    user_id: int
    internship_id: int
